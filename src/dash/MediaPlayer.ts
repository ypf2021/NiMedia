import { FactoryObject } from "../types/dash/Factory";
import FactoryMaker from "./FactoryMaker";
import URLLoaderFactory, { URLLoader } from "./net/URLLoader";
import DashParserFactory, { DashParser } from "./parser/DashParser";
import EventBusFactory, { EventBus } from "./event/EventBus";
import { EventConstants } from "./event/EventConstants";
import { ConsumedSegment } from "../types/dash/Stream";
import { Mpd } from "../types/dash/MpdFile";
import BaseURLParserFactory, { BaseURLParser, URLNode } from "./parser/BaseURLParser";
import StreamControllerFactory, { StreamController } from "./stream/StreamController";
import MediaPlayerControllerFactory, { MediaPlayerController } from "./vo/MediaPlayerController";
import MediaPlayerBufferFactory, { MediaPlayerBuffer } from "./vo/MediaPlayerBuffer";

/**
 * @description 整个dash处理流程的入口类MediaPlayer, 类似于项目的中转中心，用于接收任务并且将任务分配给不同的解析器去完成
 */

class MediaPlayer {
    private config: FactoryObject = {};
    private urlLoader: URLLoader;
    private eventBus: EventBus;
    private dashParser: DashParser
    private mediaPlayerController: MediaPlayerController;
    private streamController: StreamController;
    private video: HTMLVideoElement;
    private buffer: MediaPlayerBuffer;
    private firstCurrentRequest: number = 0;

    constructor(ctx: FactoryObject, ...args: any[]) {
        this.config = ctx.context;
        this.setup()
        this.initializeEvent()
    }

    // 初始化类
    setup() {
        this.urlLoader = URLLoaderFactory().getInstance();
        this.eventBus = EventBusFactory().getInstance();
        // ignoreRoot -> 忽略Document节点，从MPD开始作为根节点
        this.dashParser = DashParserFactory({ ignoreRoot: true }).getInstance()
        this.streamController = StreamControllerFactory({ num: 23 }).create();
        this.buffer = MediaPlayerBufferFactory().getInstance(); // 在这里呗初次创建， 其他时候都是直接引用
    }

    initializeEvent() {
        this.eventBus.on(EventConstants.MANIFEST_LOADED, this.onManifestLoaded, this)
        this.eventBus.on(EventConstants.SEGEMTN_LOADED, this.onSegmentLoaded, this);
    }

    resetEvent() {
        this.eventBus.off(EventConstants.MANIFEST_LOADED, this.onManifestLoaded, this);
        this.eventBus.off(EventConstants.SEGEMTN_LOADED, this.onSegmentLoaded, this);
    }

    //MPD文件请求成功获得对应的data数据
    onManifestLoaded(data) {
        console.log("请求得到的manifest数据", data) //这里的data是字符串
        let manifest = this.dashParser.parse(data) // 在这里已经将 data已经将数据都处理好了

        // let res = this.streamController.generateSegmentRequestStruct(manifest as Mpd);
        // console.log("generateSegmentRequestStruct的返回结果 SegmentRequestStruct", res);
        this.eventBus.tigger(EventConstants.MANIFEST_PARSE_COMPLETED, manifest)
    }

    /**
     * @description 发送MPD文件的网络请求，我要做的事情很纯粹，具体实现细节由各个Loader去具体实现
     * @param url 
     */
    public attachSource(url: string) {
        this.eventBus.tigger(EventConstants.SOURCE_ATTACHED, url) // 再 dashParse中为 Mpd添加BaseUrl
        this.urlLoader.load({ url, responseType: 'text' }, "Manifest");
    }

    // segment加载完成的回调
    onSegmentLoaded(res: ConsumedSegment) {
        this.firstCurrentRequest++;

        // 第一组加载完毕 
        if (this.firstCurrentRequest === 23) {
            this.eventBus.tigger(EventConstants.FIRST_REQUEST_COMPLETED);
        }

        let data = res.data;
        let videoBuffer = data[0];
        let audioBuffer = data[1];
        console.log("加载Segment成功", videoBuffer, audioBuffer);
        this.buffer.push({
            video: videoBuffer,
            audio: audioBuffer,
            streamId: res.streamId
        })
        this.eventBus.tigger(EventConstants.BUFFER_APPENDED)
    }

    public attachVideo(video: HTMLVideoElement) {
        console.log("MediaPlayer attachVideo", video)
        this.video = video;
        this.mediaPlayerController = MediaPlayerControllerFactory({ video: video }).create();
    }

}

const factory = FactoryMaker.getClassFactory(MediaPlayer)

export default factory;