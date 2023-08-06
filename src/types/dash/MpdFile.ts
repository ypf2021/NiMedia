/**
 * @description MIME类型
 */

export type MediaType =
    | "video/mp4"
    | "audio/mp4"
    | "text/html"
    | "text/xml"
    | "text/plain"
    | "image/png"
    | "image/jpeg";

/**
 * @description video类型媒体的分辨率
 */
export type MediaVideoResolve = {
    "320*180"?: Array<SegmentRequest | RangeRequest>;
    "512*288"?: Array<SegmentRequest | RangeRequest>;
    "640*360"?: Array<SegmentRequest | RangeRequest>;
    "768*432"?: Array<SegmentRequest | RangeRequest>;
    "1024*576"?: Array<SegmentRequest | RangeRequest>;
    "1280*720"?: Array<SegmentRequest | RangeRequest>;
    "1920*1080"?: Array<SegmentRequest | RangeRequest>;
}

export type MeidaAudioResolve = {
    [props: string]: Array<SegmentRequest | RangeRequest>;
}

export type PeriodRequest = {
    "videoRequest": MediaVideoResolve
    "audioRequest": MeidaAudioResolve

}

/**
 * @description 用于请求某一个资源的一部分,范围请求
 */
export type RangeRequest = {
    type: "range";
    url: string;
    range?: string;
}
/**
 * @description 请求整个媒体段
 */
export type SegmentRequest = {
    type: "segement";
    url: string;
}

export type MpdDocument = {
    tag: "Document";
    root: Mpd;
};

export type Mpd = {
    tag: "MPD";
    type?: "static" | "dynamic"; // 点播对应static  直播对应dynamic
    children?: Array<Period>; // Period代表某一个时间段
    availabilityStartTime?: string | null; // 如果是直播流的话,则必须提供,代表MPD中所有Seg从该时间开始可以request了 例如 019-05-22T22:16:57Z
    mediaPresentationDuration?: string | null; // 表示媒体文件的总时长
    minBufferTime?: string | null; // 至少需要缓冲的时间
    minimumUpdatePeriod?: string | null; // 至少每隔这么长时间,MPD就有可能更新一次,只用于直播流
    maxSegmentDuration?: string | null;
};

// Period代表某一个时间段
export type Period = {
    tag: "Period";
    id: string | null;
    duration: string | null; // Period的时长
    start: string | null; // Period的开始时间
    children: Array<AdaptationSet | BaseURL>; // AdaptationSet 自适应子集
}

export type BaseURL = {
    tag: "BaseURL";
    url: string;
}

// Adaptationset由一组可供切换的不同码率的码流（Representation)组成, 这些码流中可能包含一个（ISO profile)或者多个(TS profile)media content components
export type AdaptationSet = {
    tag: "AdaptationSet";
    children: Array<SegmentTemplate | Representation>;
    segmentAlignment: boolean | null; // 分段对齐 如果为true,则代表该AS中的segment互不重叠
    mimeType: MediaType | null; // AdaptationSet 的媒体类型
    startWithSAP: number | null; // 每个Segment的第一帧都是关键帧
}

/**
 * @description 用于描述对应的Representation下需要加载的initialSegment和mediaSegment的地址，具体的格式为:
 * @description initialization="$RepresentationID$-Header.m4s" media="$RepresentationID$-270146-i-$Number$.m4s"
 */
// 片段模板 组成下载 Representation 的URL 模板
export type SegmentTemplate = {
    tag: "SegmentTemplate";
    initialization?: string;
    media?: string; // 指定用来生成Segment列表的模板,可以包含的通配符有$RepresentaonID$，$Bandwidth$，$Number$, $Time$
    timescale?: number;
    duration?: number;
    [props: string]: any;

}


/**
 * @description 每个Adaptationset包含了一个或者多个Representations,一个Representation包含一个或者多个media streams，每个media对应一个media content component。
 * @description 为了适应不同的网络带宽，dash客户端可能会从一个Representation切换到另外一个Representation
 */
// 码流 -> 媒体文件描述
export type Representation = {
    tag: "Representation";
    bandWidth?: number; // bandwidth=3200000 需要带宽 3.2Mbps
    codecs?: string; // 表示该媒体流使用的编码格式
    id?: string;
    width?: number;
    height?: number; // width * height --> 视频的分辨率
    mimeType?: MediaType | null;
    audioSamplingRate?: string | null;
    children?: Array<BaseURL | SegmentBase | SegmentList>;
    [props: string]: any;
}

// 每个Representation由一个或者多个segment组成，每个segment由一个对应的URL指定，
// 也可能由相同的URL + 不同的byte range指定。dash 客户端可以通过HTTP协议来获取URL（+byte range）对应的分片数据。
// MPD中描述segment URL的形式有多种，如Segment list，Segment template，Single segment。

export type SegmentBase = {
    tag: "SegmentBase";
    indexRange: string;
    children: Initialization;
}

export type Initialization = {
    tag: "Initialization";
    range?: string | null;
    sourceURL?: string | null;
}

export type SegmentList = {
    tag: "SegmentList";
    duration: number | null;
    children: Array<Initialization | SegmentURL>;
}

export type SegmentURL = {
    tag: "SegmentURL";
    media?: string;
    mediaRange?: string
}

export type MpdFile = {
    tag: "File";
    root: Mpd
}

// MPD文件示例：
// <MPD xmlns="urn:mpeg:dash:schema:mpd:2011" profiles="urn:mpeg:dash:profile:isoff-live:2011" type="static" mediaPresentationDuration="PT3M34.55S" minBufferTime="PT1.5S">
//   <Period id="1" start="PT0S">
//     <AdaptationSet mimeType="video/mp4" codecs="avc1.4d401f" segmentAlignment="true">
//       <Representation id="1" bandwidth="600000" width="320" height="240" frameRate="30" audioSamplingRate="48000">
//         <SegmentTemplate media="video_$Number$.mp4" initialization="video_init.mp4" timescale="90000" duration="450000"/>
//       </Representation>
//       <Representation id="2" bandwidth="1200000" width="640" height="480" frameRate="30" audioSamplingRate="48000">
//         <SegmentTemplate media="video_$Number$.mp4" initialization="video_init.mp4" timescale="90000" duration="450000"/>
//       </Representation>
//     </AdaptationSet>
//     <AdaptationSet mimeType="audio/mp4" codecs="mp4a.40.2" segmentAlignment="true">
//       <Representation id="3" bandwidth="64000" audioSamplingRate="48000">
//         <SegmentTemplate media="audio_$Number$.mp4" initialization="audio_init.mp4" timescale="90000" duration="44100"/>
//       </Representation>
//     </AdaptationSet>
//   </Period>
// </MPD>