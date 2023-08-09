/**
 * @description MIME类型
 */
export type MediaType = "video/mp4" | "audio/mp4" | "text/html" | "text/xml" | "text/plain" | "image/png" | "image/jpeg";
/**
 * @description video类型媒体的分辨率
 */
/**
 * @description 用于请求某一个资源的一部分,范围请求
 */
/**
 * @description 请求整个媒体段
 */
export type MpdDocument = {
    tag: "Document";
    root: Mpd;
};
export type Mpd = {
    tag: "MPD";
    type?: "static" | "dynamic";
    children?: Array<Period>;
    availabilityStartTime?: string | null;
    mediaPresentationDuration?: string | null;
    minBufferTime?: string | null;
    minimumUpdatePeriod?: string | null;
    maxSegmentDuration?: string | null;
    baseURL?: string;
};
export type Period = {
    tag: "Period";
    id: string | null;
    duration: string | null;
    start: string | null;
    children: Array<AdaptationSet | BaseURL>;
};
export type BaseURL = {
    tag: "BaseURL";
    url: string;
};
export type AdaptationSet = {
    tag: "AdaptationSet";
    children: Array<SegmentTemplate | Representation>;
    segmentAlignment: boolean | null;
    mimeType: MediaType | null;
    startWithSAP: number | null;
};
/**
 * @description 用于描述对应的Representation下需要加载的initialSegment和mediaSegment的地址，具体的格式为:
 * @description initialization="$RepresentationID$-Header.m4s" media="$RepresentationID$-270146-i-$Number$.m4s"
 */
export type SegmentTemplate = {
    tag: "SegmentTemplate";
    initialization?: string;
    media?: string;
    timescale?: number;
    duration?: number;
    [props: string]: any;
};
/**
 * @description 每个Adaptationset包含了一个或者多个Representations,一个Representation包含一个或者多个media streams，每个media对应一个media content component。
 * @description 为了适应不同的网络带宽，dash客户端可能会从一个Representation切换到另外一个Representation
 */
export type Representation = {
    tag: "Representation";
    bandWidth?: number;
    codecs?: string;
    id?: string;
    width?: number;
    height?: number;
    mimeType?: MediaType | null;
    audioSamplingRate?: string | null;
    children?: Array<BaseURL | SegmentBase | SegmentList>;
    [props: string]: any;
};
export type SegmentBase = {
    tag: "SegmentBase";
    indexRange: string;
    children: Initialization;
};
export type Initialization = {
    tag: "Initialization";
    range?: string | null;
    sourceURL?: string | null;
};
export type SegmentList = {
    tag: "SegmentList";
    duration: number | null;
    children: Array<Initialization | SegmentURL>;
};
export type SegmentURL = {
    tag: "SegmentURL";
    media?: string;
    mediaRange?: string;
};
export type MpdFile = {
    tag: "File";
    root: Mpd;
};
