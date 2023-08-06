import { FactoryObject } from "../../types/dash/Factory";
import { URLConfig, XHRConfig } from "../../types/dash/Net";
import FactoryMaker from "../FactoryMaker";
import HTTPRequest from "./HTTPRequest";
import XHRLoaderFactory, { XHRLoader } from "./XHRLoader";
import EventBusFactory, { EventBus } from "../event/EventBus";
import { EventConstants } from "../event/EventConstants";

// urlLoader 在发起xhr请求之前配置相关参数
class URLLoader {
    private config: FactoryObject = {};
    private xhrLoader: XHRLoader;
    private eventBus: EventBus
    constructor(ctx: FactoryObject, ...args: any[]) {
        this.config = ctx.context;
        this.setup();
    }

    // 这个函数调用 xhrLoader.loadManifest 发起请求
    private _loadManifest(config: XHRConfig) {
        this.xhrLoader.loadManifest(config);
    }

    setup() {
        // 拿到的instance就是 xhrloader 的实例
        this.xhrLoader = XHRLoaderFactory({}).getInstance();

        this.eventBus = EventBusFactory({}).getInstance()
    }

    // 每调用一次load函数就发送一次请求
    load(config: URLConfig) {
        //一个HTTPRequest对象才对应一个请求
        let request = new HTTPRequest(config)
        let ctx = this
        this._loadManifest({
            request: request,
            success: function (data) {
                request.getResponseTime = new Date().getTime();
                console.log(this, data);
                // 在请求完成之后，触发 MANIFEST_LOADED 的事件
                ctx.eventBus.tigger(EventConstants.MANIFEST_LOADED, data)
            },
            error: function (error) {
                console.log(this, error)
            }
        })
    }
}

const URLLoaderFactory = FactoryMaker.getSingleFactory(URLLoader);
export default URLLoaderFactory;
export { URLLoader };