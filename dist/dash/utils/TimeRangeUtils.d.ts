import { FactoryFunction } from "../../types/dash/Factory";
import { Mpd } from "../../types/dash/MpdFile";
import { VideoBuffers } from "../../types/dash/Stream";
declare class TimeRangeUtils {
    private config;
    private dashParse;
    constructor(ctx: any);
    setup(): void;
    /**
     * @description 返回特定stream之前的所有stream的时间总和
     * @param streamId
     * @param Mpd
     * @returns {number} Number
     */
    getSummaryTimeBeforeStream(streamId: number, Mpd: Mpd): number;
    inSpecificStreamRange(streamId: number, currentTime: number, Mpd: Mpd): boolean;
    getSegmentAndStreamIndexByTime(streamId: number, currentTime: number, Mpd: Mpd): [
        number,
        number
    ] | never;
    getOffestTimeOfMediaSegment(streamId: number, mediaId: number, Mpd: Mpd): number;
    inVideoBuffered(time: number, ranges: VideoBuffers): boolean;
}
declare const factory: FactoryFunction<TimeRangeUtils>;
export default factory;
export { TimeRangeUtils };
