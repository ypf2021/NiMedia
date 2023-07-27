import { AxiosData, AxiosHeader, AxiosMethod, AxiosReturnType } from "../types/AxiosRequest";
export declare function sendRequest(url: string, method: AxiosMethod, header?: AxiosHeader, responseType?: XMLHttpRequestResponseType, data?: AxiosData): Promise<AxiosReturnType>;
export declare class Axios {
    url?: string;
    method?: AxiosMethod;
    header?: AxiosHeader;
    responseType?: XMLHttpRequestResponseType;
    data?: AxiosData;
    constructor(url?: string, method?: AxiosMethod, header?: AxiosHeader, responseType?: XMLHttpRequestResponseType, data?: AxiosData);
    get(url: string, header?: AxiosHeader, responseType?: XMLHttpRequestResponseType): Promise<AxiosReturnType>;
    post(url: string, header?: AxiosHeader, responseType?: XMLHttpRequestResponseType, data?: AxiosData): Promise<AxiosReturnType>;
}
