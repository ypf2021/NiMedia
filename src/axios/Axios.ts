import { AxiosData, AxiosHeader, AxiosMethod } from "../types/AxiosRequest";

// 自己定义一个xhr请求
export function sendRequest(
    url: string,
    method: AxiosMethod,
    header: AxiosHeader = {},
    responseType: XMLHttpRequestResponseType = "text",
    data?: AxiosData
): Promise<
    JSON | ArrayBuffer | Blob | Document | string | { [props: string]: any }
> {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.open(method, url);
        for (let index in header) {
            xhr.setRequestHeader(index, header[index])
        }

        xhr.responseType = responseType;
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
                    resolve({
                        status: "success",
                        data: xhr.response,
                    })
                } else {
                    reject({
                        status: "fail",
                        data: xhr.response,
                    })
                }
            }
        }
        if (data) {
            xhr.send(data)
        }
    })
}

// Axios类
export function Axios(
    url?: string,
    method?: AxiosMethod,
    header?: AxiosHeader,
    responseType?: XMLHttpRequestResponseType,
    data?: AxiosData
) {
    this.url = url;
    this.method = method;
    this.header = header;
    this.responseType = responseType;
    this.data = data;

    if (this.url && this.method) {
        return sendRequest(url, method, header, responseType, data);
    }
}

// get post 方法
Axios.prototype.get = function (url, header, responseType) {
    return sendRequest(url, "get", header, responseType);
};

Axios.prototype.post = function (url, header, responseType, data) {
    return sendRequest(url, "post", header, responseType, data);
};