import { FactoryObject } from "../../types/dash/Factory";
import { ContentType, RequestHeader, RequestMethod, ResponseType } from "../../types/dash/Net";

export default class HTTPRequest {
    sendRequestTime: number | null;
    getResponseTime: number | null;
    header: RequestHeader | null;
    method: RequestMethod | null;
    url: string = "";
    responseType: ResponseType | null;
    constructor(config: FactoryObject) {
        this.sendRequestTime = new Date().getTime();
        this.url = config.url;
        this.header = config.header;
        this.method = config.method;
        this.responseType = config.responseType;
    }
}