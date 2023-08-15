import { FactoryObject } from "../../types/dash/Factory";
import { URLConfig, RequestType } from "../../types/dash/Net";
import HTTPRequest from "./HTTPRequest";
declare class URLLoader {
    private config;
    private xhrLoader;
    private eventBus;
    private xhrArray;
    constructor(ctx: FactoryObject, ...args: any[]);
    private _loadManifest;
    private _loadSegment;
    setup(): void;
    load(config: URLConfig, type: RequestType): void | Promise<any>;
    abortAllXHR(): void;
    deleteRequestFromArray(request: HTTPRequest, xhrArray: HTTPRequest[]): void;
}
declare const URLLoaderFactory: import("../../types/dash/Factory").FactoryFunction<URLLoader>;
export default URLLoaderFactory;
export { URLLoader };
