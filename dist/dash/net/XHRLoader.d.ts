import { FactoryFunction, FactoryObject } from "../../types/dash/Factory";
import { XHRConfig } from "../../types/dash/Net";
declare class XHRLoader {
    private config;
    constructor(ctx: FactoryObject, ...args: any[]);
    setup(): void;
    loadManifest(config: XHRConfig): void;
}
declare const XHRLoaderFactory: FactoryFunction<XHRLoader>;
export default XHRLoaderFactory;
export { XHRLoader };
