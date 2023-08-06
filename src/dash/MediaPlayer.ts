import { FactoryObject } from "../types/dash/Factory";
import FactoryMaker from "./FactoryMaker";
import URLLoaderFactory, { URLLoader } from "./net/URLLoader";
import DashParserFactory, { DashParser } from "./parser/DashParser";
import EventBusFactory, { EventBus } from "./event/EventBus";
import { EventConstants } from "./event/EventConstants";
import { Mpd } from "../types/dash/MpdFile";
import BaseURLParserFactory, { BaseURLParser, URLNode } from "./parser/BaseURLParser";

/**
 * @description 整个dash处理流程的入口类MediaPlayer
 */

class MediaPlayer {
    private config: FactoryObject = {};
    private urlLoader: URLLoader;
    private eventBus: EventBus;
    private dashParser: DashParser
    private baseURLParser: BaseURLParser;
    private baseURLPath: URLNode;

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
        this.baseURLParser = BaseURLParserFactory().getInstance()
    }

    initializeEvent() {
        this.eventBus.on(EventConstants.MANIFEST_LOADED, this.onManifestLoaded, this)
    }

    //MPD文件请求成功获得对应的data数据
    onManifestLoaded(data) {
        console.log("请求得到的manifest数据", data)
        let manifest = this.dashParser.parse(data) // 在这里已经将 initURL和 MediaUrl弄来了
        this.baseURLPath = this.baseURLParser.parseManifestForBaseURL(manifest as Mpd);
        console.log(this.baseURLPath);
    }

    /**
     * @description 发送MPD文件的网络请求，我要做的事情很纯粹，具体实现细节由各个Loader去具体实现
     * @param url 
     */
    public attachSource(url: string) {
        this.urlLoader.load({ url, responseType: 'text' });
    }
}

const factory = FactoryMaker.getClassFactory(MediaPlayer)

export default factory;