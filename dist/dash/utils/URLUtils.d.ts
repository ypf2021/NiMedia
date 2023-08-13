import { FactoryObject, FactoryFunction } from "../../types/dash/Factory";
declare class URLUtils {
    private config;
    constructor(ctx: FactoryObject, ...args: any[]);
    setup(): void;
    /**
     * @description url拼接功能
     *
     * @param {...string[]} urls
     * @return {*}  {string}
     * @memberof URLUtils
     */
    resolve(...urls: string[]): string;
    sliceLastURLPath(url: string): string;
}
declare const factory: FactoryFunction<URLUtils>;
export default factory;
export { URLUtils };
