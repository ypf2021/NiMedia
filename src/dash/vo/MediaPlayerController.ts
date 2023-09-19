import { FactoryObject } from "../../types/dash/Factory";
import FactoryMaker from "../FactoryMaker";
import { PlayerBuffer } from "../../types/dash/Net";
import { Mpd } from "../../types/dash/MpdFile";
import EventBusFactory, { EventBus } from "../event/EventBus";
import { EventConstants } from "../event/EventConstants";
import MediaPlayerBufferFactory, { MediaPlayerBuffer } from "./MediaPlayerBuffer";
import { VideoBuffers } from "../../types/dash/Stream";
import TimeRangeUtilsFactory, { TimeRangeUtils } from "../utils/TimeRangeUtils";

// 负责将请求到的资源放入到 buffer中，该文件主要进行资源后续处理 构造video的资源内容，资源容器，加载资源事件，seek事件
class MediaPlayerController {
    // 私有属性
    private config: FactoryObject = {}

    // 控制器
    private video: HTMLVideoElement;
    private mediaSource: MediaSource;
    private videoSourceBuffer: SourceBuffer;
    private audioSourceBuffer: SourceBuffer;
    private buffer: MediaPlayerBuffer;
    private eventBus: EventBus;
    private isFirstRequestCompleted: boolean = false;
    private mediaDuration: number = 0;
    private timeRangeUtils: TimeRangeUtils;
    private currentStreamId: number = 0;
    private Mpd: Mpd;

    constructor(ctx: FactoryObject, ...args: any[]) {
        this.config = ctx.context;
        if (this.config.video) {
            this.video = this.config.video;
        }
        this.setup();

        this.initEvent();

        this.initPlayer();
    }

    setup() {
        // MediaSource() 是 MediaSource 的构造函数，返回一个没有分配 source buffers 新的 MediaSource 对象。
        this.mediaSource = new MediaSource();
        this.buffer = MediaPlayerBufferFactory().getInstance();
        this.eventBus = EventBusFactory().getInstance();
        this.timeRangeUtils = TimeRangeUtilsFactory().getInstance();
    }

    initEvent() {
        // 每加载一个 segment 并将数据 push到buffer中时触发
        console.log("on BUFFER_APPENDED")
        this.eventBus.on(EventConstants.BUFFER_APPENDED, (id: number) => {
            if (!this.videoSourceBuffer.updating && !this.audioSourceBuffer.updating) {
                console.log("BUFFER_APPENDED")
                this.appendSource();
                this.currentStreamId = id
            }
        }, this)

        // console.log("on FIRST_REQUEST_COMPLETED")
        // this.eventBus.on(EventConstants.FIRST_REQUEST_COMPLETED, () => {
        //     this.isFirstRequestCompleted = true;
        // }, this)

        console.log("on MANIFEST_PARSE_COMPLETED")
        this.eventBus.on(EventConstants.MANIFEST_PARSE_COMPLETED, (manifest, duration, Mpd) => {
            this.mediaDuration = duration; // 目前的拿到的是全部的时间
            this.Mpd = Mpd
            // MediaSource.readyState 只读
            // 返回一个代表当前 MediaSource 状态的枚举值，即当前是否未连接到媒体元素（closed），是否已连接并准备好接收 SourceBuffer 对象（open），或者是否已连接但已通过 MediaSource.endOfStream() 结束媒体流（ended）。

            if (this.mediaSource.readyState === "open") {

                // MediaSource 接口的属性 duration 用来获取或者设置当前媒体展示的时长。
                // this.mediaSource.duration = duration
                this.setMediaSource()
            }
        }, this)

        console.log("on MEDIA_PLAYBACK_FINISHED")
        this.eventBus.on(EventConstants.MEDIA_PLAYBACK_FINISHED, this.onMediaPlaybackFinished, this)
    }

    initPlayer() {
        console.log("initPlayer")
        this.video.src = window.URL.createObjectURL(this.mediaSource)
        // this.video.pause();
        this.mediaSource.addEventListener("sourceopen", this.onSourceopen.bind(this))

        // 在视频播放中进行跳转（seek）
        this.video.addEventListener("seeking", this.onMediaSeeking.bind(this));
    }

    /**
     *  @description 配置MediaSource的相关选项和属性
     */
    setMediaSource() {
        // 直接给 mediaSource 设置 duration，video使用这个 mediaSource 就可以直接设置好总时间
        this.mediaSource.duration = this.mediaDuration;

        // mediaSource.setLiveSeekableRange 函数用于设置 MSE 中直播媒体的可寻址范围。直播流通常是不断更新的，因此可寻址范围允许您指定可以随时进行跳转的时间段。
        // 就是可以随时进行跳转的时间段。
        this.mediaSource.setLiveSeekableRange(0, this.mediaDuration);
    }

    /**
     * @description 当进度条发生跳转时触发
     * @param { EventTarget} e 
     */
    onMediaSeeking(e) {
        // 加载新的视频片段：如果视频使用分段（segment）的方式进行传输，seek 事件可能会触发加载新的视频片段。应用程序可以根据 seek 的时间点请求相应的视频片段，并进行加载和解码，以确保播放器能够无缝地切换到指定时间点。
        console.log("video seeking")
        let currentTime = this.video.currentTime;
        let [streamId, mediaId] = this.timeRangeUtils.
            getSegmentAndStreamIndexByTime(this.currentStreamId, currentTime, this.Mpd);
        console.log(streamId, mediaId);
        let ranges = this.getVideoBuffered(this.video);
        if (!this.timeRangeUtils.inVideoBuffered(currentTime, ranges)) {
            console.log("超出缓存范围")
            this.buffer.clear();

            // 当点击的位置超出范围是，就调用SEGMENT_REQUEST，去请求对应部分的内容
            this.eventBus.tigger(EventConstants.SEGMENT_REQUEST, [streamId, mediaId]);
        } else {
            console.log("在缓存范围之内")
        }
    }

    getVideoBuffered(video: HTMLVideoElement): VideoBuffers {
        let buffer = this.video.buffered;
        let res: VideoBuffers = [];
        for (let i = 0; i < buffer.length; i++) {
            let start = buffer.start(i);
            let end = buffer.end(i);
            res.push({ start, end })
        }
        return res;
    }

    appendSource() {
        let data = this.buffer.top();
        if (data) {
            this.buffer.delete(data);
            this.appendVideoSource(data.video)
            this.appendAudioSource(data.audio)
        }
    }

    appendVideoSource(data: ArrayBuffer) {
        // Uint8Array 数组类型表示一个 8 位无符号整型数组，创建时内容被初始化为 0。创建完后，可以以对象的方式或使用数组下标索引的方式引用数组中的元素。
        this.videoSourceBuffer.appendBuffer(new Uint8Array(data));
    }

    appendAudioSource(data: ArrayBuffer) {
        this.audioSourceBuffer.appendBuffer(new Uint8Array(data));
    }

    onSourceopen(e) {
        console.log("onSourceopen")
        // this.setMediaSource();
        // addSourceBuffer() 创建一个带有给定 MIME 类型的新的 SourceBuffer 并添加到 MediaSource 的 SourceBuffers 列表。
        this.videoSourceBuffer = this.mediaSource.addSourceBuffer('video/mp4; codecs="avc1.64001E"');
        this.audioSourceBuffer = this.mediaSource.addSourceBuffer('audio/mp4; codecs="mp4a.40.2"');

        // updateend 在 SourceBuffer.appendBuffer() 或 SourceBuffer.remove() 结束后触发。这个事件在 update 后触发。
        this.videoSourceBuffer.addEventListener("updateend", this.onUpdateend.bind(this));
        this.audioSourceBuffer.addEventListener("updateend", this.onUpdateend.bind(this));
    }

    onUpdateend() {
        //  SourceBuffer.updating 一个布尔值，表示 SourceBuffer 当前是否正在更新——即当前是否正在进行, 正常情况下 updateend 触发时为 updating 为 false
        if (!this.videoSourceBuffer.updating && !this.audioSourceBuffer.updating) {
            // 第一组请求完成之后， 触发 SEGMENT_CONSUMED
            if (this.isFirstRequestCompleted) {
                let ranges = this.getVideoBuffered(this.video)
                this.eventBus.tigger(EventConstants.SEGMENT_CONSUMED, ranges)
            }

            this.appendSource();
        }
    }

    onMediaPlaybackFinished() {
        // MediaSource 接口的 endOfStream() 方法意味着流的结束。
        // this.mediaSource.endOfStream();
        window.URL.revokeObjectURL(this.video.src);
        console.log("播放流加载结束")
    }



}

const factory = FactoryMaker.getClassFactory(MediaPlayerController);
export default factory;
export { MediaPlayerController };