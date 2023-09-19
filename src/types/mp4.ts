export type MoovBoxInfo = {
    duration?: number;
    timescale?: number
    isFramented?: boolean; // 是否碎片形式
    isProgressive?: boolean; // 
    hasIOD?: boolean;
    created?: Date;
    modified?: Date; // 修改日期
    track?: MediaTrack[];
    [props: string]: any
}

// 媒体轨道
export type MediaTrack = {
    id: number;
    created?: Date;
    modified?: Date;
    volume?: number;
    track_width?: number;
    track_height?: number;
    timescale?: number; // 时标
    duration?: number;
    bitrate?: number;
    // 每个轨道（track）都有一个对应的编解码器（codec）来对音频或视频数据进行压缩和解压缩。轨道的编解码器定义了数据的格式和压缩算法。
    codec?: string;
    language?: string;
    [props: string]: any;
}
