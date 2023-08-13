import { FactoryObject } from "../../types/dash/Factory";
import FactoryMaker from "../FactoryMaker";
import { PlayerBuffer } from "../../types/dash/Net";
import EventBusFactory, { EventBus } from "../event/EventBus";
import { EventConstants } from "../event/EventConstants";
import MediaPlayerBufferFactory, { MediaPlayerBuffer } from "./MediaPlayerBuffer";

// 负责将请求到的资源放入到 buffer中，该文件主要进行资源后续处理
class MediaPlayerController {
    private config: FactoryObject = {}
    private video: HTMLVideoElement;
    private mediaSource: MediaSource;
    private videoSourceBuffer: SourceBuffer;
    private audioSourceBuffer: SourceBuffer;
    private buffer: MediaPlayerBuffer;
    private eventBus: EventBus;
    private isFirstRequestCompleted: boolean = false;

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
    }

    initEvent() {
        // 每加载一个 segment 并将数据 push到buffer中时触发
        this.eventBus.on(EventConstants.BUFFER_APPENDED, () => {
            // if (!this.videoSourceBuffer.updating && !this.audioSourceBuffer.updating) {
            console.log("BUFFER_APPENDED")
            this.appendSource();
            // }
        }, this)

        this.eventBus.on(EventConstants.FIRST_REQUEST_COMPLETED, () => {
            this.isFirstRequestCompleted = true;
        }, this)

        this.eventBus.on(EventConstants.MEDIA_PLAYBACK_FINISHED, this.onMediaPlaybackFinished, this)
    }

    initPlayer() {
        this.video.src = window.URL.createObjectURL(this.mediaSource)
        this.video.pause();
        this.mediaSource.addEventListener("sourceopen", this.onSourceopen.bind(this))
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
        // addSourceBuffer() 创建一个带有给定 MIME 类型的新的 SourceBuffer 并添加到 MediaSource 的 SourceBuffers 列表。
        this.videoSourceBuffer = this.mediaSource.addSourceBuffer('video/mp4; codecs="avc1.64001E"');
        this.audioSourceBuffer = this.mediaSource.addSourceBuffer('audio/mp4; codecs="mp4a.40.2"');
        console.log("this.videoSourceBuffer.mode", this.videoSourceBuffer.mode)

        // updateend 在 SourceBuffer.appendBuffer() 或 SourceBuffer.remove() 结束后触发。这个事件在 update 后触发。
        this.videoSourceBuffer.addEventListener("updateend", this.onUpdateend.bind(this));
        this.audioSourceBuffer.addEventListener("updateend", this.onUpdateend.bind(this));
    }

    onUpdateend() {
        //  SourceBuffer.updating 一个布尔值，表示 SourceBuffer 当前是否正在更新——即当前是否正在进行, 正常情况下 updateend 触发时为 updating 为 false
        if (!this.videoSourceBuffer.updating && !this.audioSourceBuffer.updating) {
            // 第一组请求完成之后， 触发 SEGMENT_CONSUMED
            if (this.isFirstRequestCompleted) {
                this.eventBus.tigger(EventConstants.SEGMENT_CONSUMED)
            }

            this.appendSource();
        }
    }

    onMediaPlaybackFinished() {
        this.mediaSource.endOfStream();
        window.URL.revokeObjectURL(this.video.src);
        console.log("播放流加载结束")
    }

}

const factory = FactoryMaker.getClassFactory(MediaPlayerController);
export default factory;
export { MediaPlayerController };