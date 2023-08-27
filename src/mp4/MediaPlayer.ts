import MP4Box, { MP4File, Log } from "mp4box"
import { MoovBoxInfo, MediaTrack } from "../types/mp4";

class MediaPlayer {
    url: string;
    video: HTMLVideoElement;
    mp4boxfile: MP4File;
    mediaSource: MediaSource;
    constructor(url: string, video: HTMLVideoElement) {
        this.url = url;
        this.video = video;
        this.init()
    }

    init() {
        this.mp4boxfile = MP4Box.createFile(); // 创建一个新的空白的 MP4 文件。
        this.initEvent();
    }

    initEvent() {
        // "moov" box 开始处理时触发。 "moov" box 是 MP4 文件中包含了包括轨道信息、时间戳信息和其他元数据的主要盒子。
        this.mp4boxfile.onMoovStart = function () {
            Log.info("Application", "Starting to parse movie information")
        }

        this.mp4boxfile.onReady = function (info: MoovBoxInfo) {
            Log.info("Application", "Movie information received");
            // 计算总时间
            if (info.isFragmented) {
                // fragment_duration 每个片段（fragment）的时长，长度固定
                // timescale 用于定义时间的刻度（scale）或单位。 "timescale" 的值与媒体的帧率（fps）和采样率（sample rate）相关
                this.mediaSource.duration = info.fragment_duration / info.timescale;
            } else {
                this.mediaSource.duration = info.duration / info.timescale;
            }
            this.addSourceBufferListener(info);
            stop()
        }
    }

    /**
     * @description 根据传入的媒体轨道的类型构建对应的SourceBuffer
     * @param mp4track 
     */
    addBuffer(mp4track: MediaTrack) {
        let track_id = mp4track.id;
        // 每个轨道（track）都有一个对应的编解码器（codec）来对音频或视频数据进行压缩和解压缩。轨道的编解码器定义了数据的格式和压缩算法。
        let codec = mp4track.codec;
        let mime = 'video/mp4; codecs=\"' + codec + '\"';
        let sb: SourceBuffer & { [props: string]: any };
        if (MediaSource.isTypeSupported(mime)) {
            try {
                Log.info("MSE - SourceBuffer #" + track_id, "Creation with type '" + mime + "'");
                // 根据moov box中解析出来的track去一一创建对应的sourcebuffer
                sb = this.mediaSource.addSourceBuffer(mime);
                sb.addEventListener("error", function (e) {
                    Log.error("MSE SourceBuffer #" + track_id, e);
                });
                // ms id 是自定义上去的属性
                sb.ms = this.mediaSource;
                sb.id = track_id;

                // setSegmentOptions 指示应使用给定选项（第三个参数options）对具有给定 track_id 的曲目进行分段。  当段准备就绪时，将使用用户参数（第二个参数）调用回调 onSegment。 
                // Indicates that the track with the given track_id should be segmented, with the given options. When segments are ready, the callback onSegment is called with the user parameter. 
                this.mp4boxfile.setSegmentOptions(track_id, sb);
                sb.pendingAppends = [];

            } catch (error) {
                // MSE 是一个允许开发者控制媒体流的 API，通过它可以实现诸如动态流式传输、自定义缓冲区管理、字幕和音轨切换等功能
                Log.error("MSE - SourceBuffer #" + track_id, "Cannot create buffer with type '" + mime + "'" + error);
            }
        }

    }

    addSourceBufferListener(info: MoovBoxInfo) {
        // "track" 属性表示一个轨道（track）。一个 MP4 文件可以包含多个轨道，例如音频轨道、视频轨道等。
        // 通过访问 "MoovBoxInfo" 对象的 "track" 属性，您可以获取轨道的详细信息，如轨道类型、编解码器信息、时长、帧率等。
        for (var i = 0; i < info.tracks.length; i++) {
            var track = info.tracks[i];
            //  将获取到的track信息，通过addbuffer 纯递给MediaSource
            this.addBuffer(track);
        }
    }

}

export default MediaPlayer;