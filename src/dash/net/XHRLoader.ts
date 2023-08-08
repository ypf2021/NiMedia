import { FactoryFunction, FactoryObject } from "../../types/dash/Factory";
import { XHRConfig } from "../../types/dash/Net";
import FactoryMaker from "../FactoryMaker"

// 让外界调用 loadManifest 方法 发起请求
class XHRLoader {
    private config: FactoryObject = {};
    constructor(ctx: FactoryObject, ...args: any[]) {
        this.config = ctx.context;
        this.setup();
    }

    setup() {

    }

    // 调用这个方法发起 xml请求
    load(config: XHRConfig) {
        // 传入一个 config， config包括请求的结果处理函数，以及请求request参数，间接的传给xhr，增加代码的灵活度
        let request = config.request;
        let xhr = new XMLHttpRequest();
        if (request.header) {
            for (let key in request.header) {
                xhr.setRequestHeader(key, request.header[key]);
            }
        }
        xhr.open(request.method || "get", request.url);
        xhr.responseType = request.responseType || "arraybuffer";
        xhr.onreadystatechange = (e) => {
            if (xhr.readyState === 4) {
                if ((xhr.status >= 200 && xhr.status < 300) || (xhr.status === 304)) {
                    config.success && config.success.call(xhr, xhr.response);
                } else {
                    config.error && config.error.call(xhr, e);
                }
            }
        }

        xhr.onabort = (e) => {
            config.abort && config.abort.call(xhr, e);
        }

        xhr.onerror = (e) => {
            config.error && config.error.call(xhr, e);
        }

        xhr.onprogress = (e) => {
            config.progress && config.progress.call(xhr, e);
        }
        xhr.send();
    }
}

const XHRLoaderFactory = FactoryMaker.getSingleFactory(XHRLoader)

export default XHRLoaderFactory;
export { XHRLoader };