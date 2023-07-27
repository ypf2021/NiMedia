import { AxiosData, AxiosHeader, AxiosMethod } from "../types/AxiosRequest";
export declare function sendRequest(url: string, method: AxiosMethod, header?: AxiosHeader, responseType?: XMLHttpRequestResponseType, data?: AxiosData): Promise<JSON | ArrayBuffer | Blob | Document | string | {
    [props: string]: any;
}>;
export declare function Axios(url?: string, method?: AxiosMethod, header?: AxiosHeader, responseType?: XMLHttpRequestResponseType, data?: AxiosData): Promise<string | Blob | ArrayBuffer | JSON | Document | {
    [props: string]: any;
}>;
