// 已在v1.0.0之后启用

// import { AxiosData, AxiosHeader, AxiosMethod, AxiosReturnType } from "../types/AxiosRequest";

// // 自己定义一个xhr请求
// export function sendRequest(
//     url: string,
//     method: AxiosMethod,
//     header: AxiosHeader = {},
//     responseType: XMLHttpRequestResponseType = "text",
//     data?: AxiosData
// ): Promise<AxiosReturnType> {
//     return new Promise((resolve, reject) => {
//         let xhr = new XMLHttpRequest();
//         xhr.open(method, url);
//         for (let index in header) {
//             xhr.setRequestHeader(index, header[index])
//         }

//         xhr.responseType = responseType;
//         xhr.onreadystatechange = function () {
//             if (xhr.readyState === 4) {
//                 if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
//                     resolve({
//                         status: "success",
//                         data: xhr.response,
//                     })
//                 } else {
//                     reject({
//                         status: "fail",
//                         data: xhr.response,
//                     })
//                 }
//             }
//         }
//         xhr.send(data)
//     })
// }

// // Axios类
// export class Axios {
//     constructor(
//         public url?: string,
//         public method?: AxiosMethod,
//         public header?: AxiosHeader,
//         public responseType?: XMLHttpRequestResponseType,
//         public data?: AxiosData
//     ) { }

//     get(url: string, header?: AxiosHeader, responseType?: XMLHttpRequestResponseType) {
//         console.log(url)
//         return sendRequest(url, "get", header, responseType);
//     }

//     post(url: string, header?: AxiosHeader, responseType?: XMLHttpRequestResponseType, data?: AxiosData) {
//         return sendRequest(url, "post", header, responseType, data);
//     }
// }
