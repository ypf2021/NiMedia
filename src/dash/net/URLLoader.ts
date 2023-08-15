import { FactoryObject } from "../../types/dash/Factory";
import { URLConfig, XHRConfig, RequestType } from "../../types/dash/Net";
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
    private xhrArray: HTTPRequest[] = []
    constructor(ctx: FactoryObject, ...args: any[]) {
        this.config = ctx.context;
        this.setup();
    }

    // 这个函数调用 xhrLoader.loadManifest 发起请求
    private _loadManifest(config: XHRConfig) {
        this.xhrLoader.load(config);
    }

    private _loadSegment(config: XHRConfig) {
        this.xhrLoader.load(config);
    }

    setup() {
        // 拿到的instance就是 xhrloader 的实例
        this.xhrLoader = XHRLoaderFactory({}).getInstance();

        this.eventBus = EventBusFactory({}).getInstance()
    }

    // 每调用一次load函数就发送一次请求
    load(config: URLConfig, type: RequestType): void | Promise<any> {
        //一个HTTPRequest对象才对应一个请求
        let request = new HTTPRequest(config)
        let ctx = this
        this.xhrArray.push(request);

        if (type === "Manifest") {
            ctx._loadManifest({
                request: request,
                success: function (data) {
                    request.getResponseTime = new Date().getTime();
                    console.log(this, data);
                    // 在请求完成之后，触发 MANIFEST_LOADED 的事件
                    ctx.eventBus.tigger(EventConstants.MANIFEST_LOADED, data)
                },
                error: function (error) {
                    console.log(error)
                },
                load: function () {
                    ctx.deleteRequestFromArray(request, ctx.xhrArray);
                },
                abort: function () {
                    ctx.deleteRequestFromArray(request, ctx.xhrArray);
                }
            })
        } else if (type === "Segment") {
            return new Promise((resolve, reject) => {
                ctx._loadSegment({
                    request: request,
                    success: function (data) {
                        resolve(data);
                    },
                    error: function (error) {
                        reject(error);
                    },
                    load: function () {
                        ctx.deleteRequestFromArray(request, ctx.xhrArray);
                    },
                    abort: function () {
                        ctx.deleteRequestFromArray(request, ctx.xhrArray);
                    }
                })
            })
        }
    }

    // abort全部请求
    abortAllXHR() {
        this.xhrArray.forEach(request => {
            if (request.xhr) {
                request.xhr.abort();
            }
        })
    }

    // 删掉某个请求
    deleteRequestFromArray(request: HTTPRequest, xhrArray: HTTPRequest[]) {
        let index = xhrArray.indexOf(request);
        if (index !== -1) {
            xhrArray.splice(index, 1);
        }
    }

}

const URLLoaderFactory = FactoryMaker.getSingleFactory(URLLoader);
export default URLLoaderFactory;
export { URLLoader };