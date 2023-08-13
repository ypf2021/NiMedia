import FactoryMaker from "../FactoryMaker";
import { FactoryObject, FactoryFunction } from "../../types/dash/Factory";

class URLUtils {
    private config: FactoryObject;
    constructor(ctx: FactoryObject, ...args: any[]) {
        this.config = ctx.contest;
    }

    setup() { }

    /**
     * @description url拼接功能
     *
     * @param {...string[]} urls
     * @return {*}  {string}
     * @memberof URLUtils
     */
    resolve(...urls: string[]): string {
        let index = 0;
        let str = "";
        while (index < urls.length) {
            let url = urls[index];

            // 如果url不以 / 或者 ./,../这种形式开头的话
            if (/^(?!(\.|\/))/.test(url)) {
                // 在末尾固定加 /
                if (str[str.length - 1] !== '/' && str !== "") {
                    str += '/';
                }
            } else if (/^\/.+/.test(url)) {
                // 如果以 / 开头 去掉开头的 /
                if (str[str.length - 1] === "/") {
                    url = url.slice(1);
                }
            } else if (/^(\.).+/.test(url)) {
                //TODO： 如果url以 ./,../,../../之类的形式开头
            }

            str += url
            index++;
        }
        return str
    }

    // 从前到后，找到最后一个 / 之前的url
    sliceLastURLPath(url: string): string {
        for (let i = url.length - 1; i >= 0; i--) {
            if (url[i] === "/") {
                return url.slice(0, i);
            }
        }
        return url
    }

}

const factory = FactoryMaker.getSingleFactory(URLUtils);
export default factory;
export { URLUtils }