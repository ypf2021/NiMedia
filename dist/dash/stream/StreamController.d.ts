import { FactoryObject } from "../../types/dash/Factory";
import { AdaptationSet, Mpd } from "../../types/dash/MpdFile";
import { AdaptationSetAudioSegmentRequest, AdaptationSetVideoSegmentRequest, MpdSegmentRequest } from "../../types/dash/Net";
declare class StreamController {
    private config;
    private baseURLParser;
    private baseURLPath;
    private URLUtils;
    private videoResolvePower;
    private audioResolvePower;
    private eventBus;
    private urlLoader;
    private segmentRequestStruct;
    private timeRangeUtils;
    private mediaId;
    private streamId;
    private firstRequestNumber;
    private Mpd;
    constructor(ctx: FactoryObject, ...args: any[]);
    setup(): void;
    initialEvent(): void;
    /**
     * @description 根据处理好的 mainifest 构建出 请求的结构体, 并进行segment的请求
     * @param {Mpd} mainifest
     * @memberof StreamController
     */
    onManifestParseCompleted(mainifest: Mpd): void;
    generateBaseURLPath(Mpd: Mpd): void;
    /**
     * @description 根据处理好的 mainifest 构建出 请求的结构体， 返回 MpdSegmentRequest
     *
     * @param {Mpd} Mpd
     * @return {*}  {(MpdSegmentRequest | void)}
     * @memberof StreamController
     */
    generateSegmentRequestStruct(Mpd: Mpd): MpdSegmentRequest;
    /**
     *
     * @description 得到 AdaptationSet 下 所有Representation的 resolvePower:[initializationURL,mediaURL] 组成的 对象
     * @param {AdaptationSet} AdaptationSet
     * @return {*}  {(AdaptationSetVideoSegmentRequest | AdaptationSetAudioSegmentRequest)}
     * @memberof StreamController
     */
    generateAdaptationSetVideoOrAudioSegmentRequest(AdaptationSet: AdaptationSet, baseURL: string, i: number, j: number): AdaptationSetVideoSegmentRequest | AdaptationSetAudioSegmentRequest;
    getNumberOfMediaSegmentForPeriod(): any;
    startStream(Mpd: Mpd): Promise<void>;
    loadInitialSegment(streamId: any): Promise<[any, any]>;
    loadMediaSegment(): Promise<[any, any]>;
    loadSegment(videoURL: any, audioURL: any): Promise<[any, any]>;
    onSegmentConsumed(): Promise<void>;
    /**
     * @description  如果此时video发生缓存内容之外的跳转，则需要重新请求对应的segment，因此需要中断正在发送还没有收到结果的请求
     * @param tuple
     */
    onSegmentRequest(tuple: [number, number]): Promise<void>;
    abortAllXHR(): void;
}
declare const factory: import("../../types/dash/Factory").FactoryFunction<StreamController>;
export default factory;
export { StreamController };
