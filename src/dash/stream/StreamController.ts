import { FactoryObject } from "../../types/dash/Factory";
import { AdaptationSet, Mpd } from "../../types/dash/MpdFile";
import { AdaptationSetAudioSegmentRequest, AdaptationSetVideoSegmentRequest, MpdSegmentRequest, PeriodSegmentRequest, PlayerBuffer } from "../../types/dash/Net";
import FactoryMaker from "../FactoryMaker";
import BaseURLParserFactory, { BaseURLParser, URLNode } from "../parser/BaseURLParser";
import URLUtilsFactory, { URLUtils } from "../utils/URLUtils";
import EventBusFactory, { EventBus } from "../event/EventBus";
import { EventConstants } from "../event/EventConstants";
import URLLoaderFactory, { URLLoader } from "../net/URLLoader";
import TimeRangeUtilsFactory, { TimeRangeUtils } from "../utils/TimeRangeUtils";
import { VideoBuffers } from "../../types/dash/Stream";

// StreamController  构建请求的结构体
class StreamController {
    private config: FactoryObject = {};
    private baseURLParser: BaseURLParser;
    private baseURLPath: URLNode;
    private URLUtils: URLUtils;
    // 视频分辨率 音频采样率
    private videoResolvePower: string = "1920*1080";
    // private videoResolvePower: string = "1280*720";

    private audioResolvePower: string = "48000";
    private eventBus: EventBus;
    private urlLoader: URLLoader;
    //整个MPD文件所需要发送请求的结构体对象
    private segmentRequestStruct: MpdSegmentRequest;
    private timeRangeUtils: TimeRangeUtils;
    // 
    private mediaId: number = 0;
    private streamId: number = 0;
    private firstRequestNumber: number;
    private Mpd: Mpd;

    constructor(ctx: FactoryObject, ...args: any[]) {
        this.config = ctx.context;
        this.firstRequestNumber = this.config.num || 23;
        this.setup();
        this.initialEvent();
    }

    setup() {
        this.baseURLParser = BaseURLParserFactory().getInstance();
        this.URLUtils = URLUtilsFactory().getInstance();
        this.eventBus = EventBusFactory().getInstance();
        this.urlLoader = URLLoaderFactory().getInstance();
        this.timeRangeUtils = TimeRangeUtilsFactory().getInstance();
    }

    initialEvent() {
        // 当 Mpd 文件解析完毕之后，回来调用这个函数
        this.eventBus.on(EventConstants.MANIFEST_PARSE_COMPLETED, this.onManifestParseCompleted, this);

        this.eventBus.on(EventConstants.SEGMENT_CONSUMED, this.onSegmentConsumed, this)

        // 当点击到没用加载的位置时触发请求
        this.eventBus.on(EventConstants.SEGMENT_REQUEST, this.onSegmentRequest, this);
    }

    /**
     * @description 根据处理好的 mainifest 构建出 请求的结构体, 并进行segment的请求
     * @param {Mpd} mainifest
     * @memberof StreamController
     */
    onManifestParseCompleted(mainifest: Mpd) {
        this.segmentRequestStruct = this.generateSegmentRequestStruct(mainifest);
        console.log("segmentRequestStruct", this.segmentRequestStruct);
        this.Mpd = mainifest
        this.startStream(mainifest)
    }

    generateBaseURLPath(Mpd: Mpd) {
        this.baseURLPath = this.baseURLParser.parseManifestForBaseURL(Mpd as Mpd)
        console.log("parseManifestForBaseURL 返回的 URLNode", this.baseURLPath)
    }

    /**
     * @description 根据处理好的 mainifest 构建出 请求的结构体， 返回 MpdSegmentRequest
     *
     * @param {Mpd} Mpd
     * @return {*}  {(MpdSegmentRequest | void)}
     * @memberof StreamController
     */
    generateSegmentRequestStruct(Mpd: Mpd): MpdSegmentRequest {
        this.generateBaseURLPath(Mpd);  // URLNode
        console.log("parseManifestForBaseURL后的MPD", Mpd)

        // 拿到之前 dashparse中 mpd上的baseURL
        let baseURL = Mpd["baseURL"] || "";

        let mpdSegmentRequest: MpdSegmentRequest = {
            type: "MpdSegmentRequest",
            request: []
        }

        for (let i = 0; i < Mpd["Period_asArray"].length; i++) {
            let Period = Mpd["Period_asArray"][i];
            let periodSegmentRequest: PeriodSegmentRequest = {
                VideoSegmentRequest: [],
                AudioSegmentRequest: []  // 根据语言区分
            };
            for (let j = 0; j < Period["AdaptationSet_asArray"].length; j++) {
                let AdaptationSet = Period["AdaptationSet_asArray"][j];
                // 拿到的这个res 是  AdaptationSet 下 所有Representation的 resolvePower:[initializationURL,mediaURL] 组成的 对象
                let res = this.generateAdaptationSetVideoOrAudioSegmentRequest(AdaptationSet, baseURL, i, j)
                // console.log("AdaptationSet.mimeType", AdaptationSet.mimeType)
                // 有的mpd文件的 AdaptationSet上面不存在 mimeType属性 而是在下层的 Representation 里面
                if (AdaptationSet.mimeType === "video/mp4" || AdaptationSet["Representation_asArray"][0].mimeType === "video/mp4") {
                    periodSegmentRequest.VideoSegmentRequest.push({
                        type: "video",
                        video: res
                    })
                } else if (AdaptationSet.mimeType === "audio/mp4" || AdaptationSet["Representation_asArray"][0].mimeType === "audio/mp4") {
                    periodSegmentRequest.AudioSegmentRequest.push({
                        lang: AdaptationSet.lang || "en",
                        audio: res
                    })
                }
            }
            mpdSegmentRequest.request.push(periodSegmentRequest);
        }
        return mpdSegmentRequest
    }

    /**
     *
     * @description 得到 AdaptationSet 下 所有Representation的 resolvePower:[initializationURL,mediaURL] 组成的 对象
     * @param {AdaptationSet} AdaptationSet
     * @return {*}  {(AdaptationSetVideoSegmentRequest | AdaptationSetAudioSegmentRequest)}
     * @memberof StreamController
     */
    generateAdaptationSetVideoOrAudioSegmentRequest(AdaptationSet: AdaptationSet, baseURL: string, i: number, j: number): AdaptationSetVideoSegmentRequest | AdaptationSetAudioSegmentRequest {
        // i j k 分别对应 Period AdaptionSet Representation 的索引
        let result = {}
        for (let k = 0; k < AdaptationSet["Representation_asArray"].length; k++) {
            let Representation = AdaptationSet["Representation_asArray"][k];
            // 合并这几个url

            let url = this.URLUtils.
                resolve(baseURL, this.baseURLParser.getBaseURLByPath([i, j, k], this.baseURLPath)); // this.baseURLPath 是那个全是null的遍历结构 
            console.log(url) // 目前这部分返回的就是 baseURL

            // 键名是对应的分辨率
            result[Representation.resolvePower] = [];
            // push 第一项就是 initailURL
            result[Representation.resolvePower].push(this.URLUtils.resolve(url, Representation.initializationURL))
            // 之后的会构成一个数组，存放的是 MediaURl
            result[Representation.resolvePower].push(Representation.mediaURL.map(item => {
                return this.URLUtils.resolve(url, item);
            }))

            // result[Representation.resolvePower] = [Representation.initializationURL, Representation.mediaURL];
        }
        return result;
    }

    // 获取到当前 streamId 中有的总共的 mediaUrl的数量
    getNumberOfMediaSegmentForPeriod() {
        return this.segmentRequestStruct.request[this.streamId].VideoSegmentRequest[0].video[this.videoResolvePower][1].length;
    }

    //初始化播放流，一次至多加载23个Segement过来
    async startStream(Mpd: Mpd) {
        let p = Mpd["Period_asArray"][this.streamId];
        let ires = await this.loadInitialSegment(this.streamId)

        this.eventBus.tigger(EventConstants.SEGMENT_LOADED, { data: ires, streamId: this.streamId })
        let number = this.getNumberOfMediaSegmentForPeriod();

        for (let i = 0; i < (number >= this.firstRequestNumber ? this.firstRequestNumber : number); i++) {
            let mres = await this.loadMediaSegment();
            this.mediaId++;
            this.eventBus.tigger(EventConstants.SEGMENT_LOADED, { data: mres, streamId: this.streamId, mediaId: this.mediaId });
        }
    }

    //此处的streamId标识具体的Period对象
    loadInitialSegment(streamId) {
        let stream = this.segmentRequestStruct.request[streamId]
        // 先默认选择音视频的第一个版本
        let audioRequest = stream.AudioSegmentRequest[0].audio;
        let videoRequest = stream.VideoSegmentRequest[0].video;
        // 这里不应该直接用 this中的值，应该先进行设置初值
        return this.loadSegment(videoRequest[this.videoResolvePower][0], audioRequest[this.audioResolvePower][0])
    }

    loadMediaSegment() {
        let stream = this.segmentRequestStruct.request[this.streamId];
        // 莫仍选择音视频的第一个版本
        let audioRequest = stream.AudioSegmentRequest[0].audio;
        let videoRequest = stream.VideoSegmentRequest[0].video;
        return this.loadSegment(videoRequest[this.videoResolvePower][1][this.mediaId], audioRequest[this.audioResolvePower][1][this.mediaId])
    }

    loadSegment(videoURL, audioURL) {
        let p1 = this.urlLoader.load({ url: videoURL, responseType: "arraybuffer" }, "Segment") as Promise<any>;
        let p2 = this.urlLoader.load({ url: audioURL, responseType: "arraybuffer" }, "Segment") as Promise<any>;
        return Promise.all([p1, p2]);
    }

    // 播放器消费一个Segment我就继续请求一个Segment
    async onSegmentConsumed() {
        if (!this.segmentRequestStruct.request[this.streamId]) return;
        let total = this.getNumberOfMediaSegmentForPeriod();
        // 如果当前Period全部请求完毕,就去请求另一个Peiod中的内容
        if (this.mediaId >= total) {
            this.mediaId = 0;
            this.streamId++;
        } else {
            this.mediaId++;
        }

        // 再接着往下走时，如果没了 就播放完了
        if (this.segmentRequestStruct.request[this.streamId] === undefined) {
            console.log("播放完毕")
            this.eventBus.tigger(EventConstants.MEDIA_PLAYBACK_FINISHED);
        } else {
            let mres = await this.loadMediaSegment();
            this.eventBus.tigger(EventConstants.SEGMENT_LOADED, { data: mres, streamId: this.streamId });
        }
    }

    /**
     * @description 只有在触发seek事件后,选到了没加载的地方才会触发此方法
     * @param tuple 
     */
    async onSegmentRequest(tuple: [number, number]) {
        this.abortAllXHR();
        let [streamId, mediaId] = tuple;
        this.streamId = streamId;
        this.mediaId = mediaId;
        let mres = await this.loadMediaSegment()
        this.eventBus.tigger(EventConstants.SEGMENT_LOADED, { data: mres, streamId: this.streamId, mediaId: mediaId })
    }

    abortAllXHR() {
        this.urlLoader.abortAllXHR();
    }

}

const factory = FactoryMaker.getClassFactory(StreamController);
export default factory;
export { StreamController };