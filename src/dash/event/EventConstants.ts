// 事件常数
export const EventConstants = {
    MANIFEST_LOADED: "manifestLoaded", // mpd文件资源请求完毕之后的函数
    MANIFEST_PARSE_COMPLETED: "manifestParseCompleted", // mpd文件资源parse转换完成
    SOURCE_ATTACHED: "sourceAttached",
    SEGMENT_LOADED: "segmentLoaded",
    BUFFER_APPENDED: "bufferAppended",
    SEGMENT_CONSUMED: "segmentConsumed",
    MEDIA_PLAYBACK_FINISHED: "mediaPlaybackFinished",
    FIRST_REQUEST_COMPLETED: "firstRequestCompleted",
    SEGMENT_REQUEST: "segmentRequest"
}