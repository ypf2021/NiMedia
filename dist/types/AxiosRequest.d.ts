export type AxiosMethod = "get" | "post" | "put" | "delete" | "patch" | "option";
export type AxiosQuery = {
    [props: string]: string | number | boolean;
};
export type AxiosContentType = "application/x-www-form-urlencoded" | "multipart/form-data" | "application/json" | "text/xml";
export type AxiosData = XMLHttpRequestBodyInit;
export type AxiosHeader = {
    "Content-type"?: AxiosContentType;
    Range?: string;
    Authroization?: string;
};
export type AxiosReturnType = {
    status: "success" | "fail";
    data: JSON | ArrayBuffer | Blob | Document | string | {
        [props: string]: any;
    };
};
