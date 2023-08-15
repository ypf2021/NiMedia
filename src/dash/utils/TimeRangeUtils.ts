import { FactoryFunction, FactoryObject } from "../../types/dash/Factory";
import { Mpd } from "../../types/dash/MpdFile";
import FactoryMaker from "../FactoryMaker";
import DashParserFactory, { DashParser } from "../parser/DashParser"
import { VideoBuffers } from "../../types/dash/Stream";


class TimeRangeUtils {
    private config: FactoryObject = {};
    private dashParse: DashParser;
    constructor(ctx) {
        this.config = ctx.context;
        this.setup()
    }

    setup() {
        this.dashParse = DashParserFactory().getInstance();
    }

    /**
     * @description 返回特定stream之前的所有stream的时间总和
     * @param streamId 
     * @param Mpd 
     * @returns {number} Number
     */
    getSummaryTimeBeforeStream(streamId: number, Mpd: Mpd): number {
        if (streamId === 0) return 0;
        let Period = Mpd["Period_asArray"];
        let sum = 0;
        for (let i = 0; i < streamId; i++) {
            sum += Period[i].duration;
        }
        return sum;
    }

    // 判断切换是否在 在特定的流范围内
    inSpecificStreamRange(streamId: number, currentTime: number, Mpd: Mpd): boolean {
        let totalTime = this.dashParse.getTotalDuration(Mpd);
        if (currentTime > totalTime) return false;
        // 拿到之前的所有时间作为 start
        let start = this.getSummaryTimeBeforeStream(streamId, Mpd);
        // 拿到当前streamId的时间+之前的 作为end
        let end = start + Mpd["Period_asArray"][streamId].duration;
        if (currentTime < start || currentTime > end) return false;
        return true;
    }

    getSegmentAndStreamIndexByTime(streamId: number, currentTime: number, Mpd: Mpd):
        [number, number] | never {
        if (this.inSpecificStreamRange(streamId, currentTime, Mpd)) {
            let segmentDuration = this.dashParse.getSegmentDuration(Mpd, streamId);
            let index = Math.floor(currentTime / segmentDuration);
            return [streamId, index];
        } else {
            let totalTime = this.dashParse.getTotalDuration(Mpd);
            if (currentTime > totalTime) {
                throw new Error("传入的当前时间大于媒体的总时长");
            }
            let sum = 0;
            for (let i = 0; i < Mpd["Period_asArray"].length; i++) {
                let Period = Mpd["Period_asArray"][i]
                sum += Period.duration;
                if (sum > currentTime) {
                    let segmentDuration = this.dashParse.getSegmentDuration(Mpd, i);
                    let index = Math.floor(currentTime / segmentDuration);
                    return [i, index];
                }
            }
        }
    }

    getOffestTimeOfMediaSegment(streamId: number, mediaId: number, Mpd: Mpd): number {
        let beforeTime = this.getSummaryTimeBeforeStream(streamId, Mpd);
        let segmentDuration = this.dashParse.getSegmentDuration(Mpd, streamId);
        return beforeTime + segmentDuration * (mediaId + 1);
    }

    // 判断 time 是否在 ranges 内部
    inVideoBuffered(time: number, ranges: VideoBuffers): boolean {
        for (let range of ranges) {
            if (time >= range.start && time <= range.end) return true;
        }
        return false;
    }
}

const factory = FactoryMaker.getSingleFactory(TimeRangeUtils);
export default factory;
export { TimeRangeUtils };