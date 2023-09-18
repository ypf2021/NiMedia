import MP4Box, { MP4File, Log, MP4ArrayBuffer, MP4Info, MP4SourceBuffer, MP4MediaSource } from "mp4box"
import { MoovBoxInfo, MediaTrack } from "../types/mp4";
import { FactoryObject } from "../types/dash/Factory";
import { DownLoader } from "../net/DownLoader";

class MediaPlayer {
    url: string;
    video: HTMLVideoElement;
    mp4boxfile: MP4File;
    mediaSource: MediaSource;
    mediaInfo: MoovBoxInfo;
    downloader: DownLoader;
    lastSeekTime: number = 0;

    constructor(url: string, video: HTMLVideoElement) {
        this.url = url;
        this.video = video;
        this.init()
    }

    init() {
        this.mp4boxfile = MP4Box.createFile(); // 创建一个新的空白的 MP4 文件。
        this.downloader = new DownLoader(this.url);
        this.mediaSource = new MediaSource();
        console.log(111)
        this.video.src = window.URL.createObjectURL(this.mediaSource);
        this.initEvent();
        this.loadFile();
    }

    initEvent() {
        let ctx = this
        // "moov" box 开始处理时触发。 "moov" box 是 MP4 文件中包含了包括轨道信息、时间戳信息和其他元数据的主要盒子。
        this.mp4boxfile.onMoovStart = function () {
            Log.info("Application", "Starting to parse movie information")
        }

        // debugger阅读源码可知，当在(第一次得到总数)第二次请求内容被请求到(请求最后一段)，并被通过 mp4boxfile.appendBuffer 添加之后，就会触发 MP4Boxfile的 onready事件，拿到的info就是进过内部处理后的数据MoovBoxInfo
        // 并且只执行一次
        this.mp4boxfile.onReady = function (info: MoovBoxInfo) {
            debugger
            console.log("onready")
            Log.info("Application", "Movie information received");
            ctx.mediaInfo = info;
            // 计算总时间
            if (info.isFragmented) {
                // fragment_duration 每个片段（fragment）的时长，长度固定
                // timescale 用于定义时间的刻度（scale）或单位。 "timescale" 的值与媒体的帧率（fps）和采样率（sample rate）相关
                ctx.mediaSource.duration = info.fragment_duration / info.timescale;
            } else {
                ctx.mediaSource.duration = info.duration / info.timescale;
            }
            // 在这里去停掉 请求的定时器，结束请求，之后开始处理资源 
            ctx.stop()
            ctx.initializeAllSourceBuffers()
        }

        // appendBuffer之后，执行完onready -> processSamples(last) 时被触发 -> onSegment  is_last参数就是appendBuffer时传入的end
        this.mp4boxfile.onSegment = function (id, user, buffer, sampleNum, is_last) {
            // debugger
            console.log("onsegment")
            //sb = sourcebuffer
            var sb = user;
            // saveBuffer(buffer, 'track-'+id+'-segment-'+sb.segmentIndex+'.m4s');
            sb.segmentIndex++;
            // pendingAppends是数组，在onready时创建完毕，存放的是参数信息
            sb.pendingAppends.
                push({ id: id, buffer: buffer, sampleNum: sampleNum, is_last: is_last });

            // 添加完后调用 updateEnd
            ctx.onUpdateEnd.call(sb, true, false, ctx);
        }

        this.mp4boxfile.onItem = function (item) {
            debugger
        }

        this.video.onseeking = (e) => {
            var i, start, end;
            var seek_info;
            if (this.lastSeekTime !== this.video.currentTime) {
                for (i = 0; i < this.video.buffered.length; i++) {
                    start = this.video.buffered.start(i);
                    end = this.video.buffered.end(i);
                    // 如果在缓存的区域之间
                    if (this.video.currentTime >= start && this.video.currentTime <= end) {
                        return;
                    }
                }
                // 暂停当前的下载
                this.downloader.stop();
                // mp4boxfile.seek
                seek_info = this.mp4boxfile.seek(this.video.currentTime, true);
                this.downloader.setChunkStart(seek_info.offset);
                this.downloader.resume();
                this.lastSeekTime = this.video.currentTime;
            }
        }
    }

    start() {
        this.downloader.setChunkStart(this.mp4boxfile.seek(0, true).offset);
        this.mp4boxfile.start();
        this.downloader.resume();
    }


    reset() {

    }

    stop() {
        if (!this.downloader.isStopped()) {
            this.downloader.stop();
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
        let sb: MP4SourceBuffer
        if (MediaSource.isTypeSupported(mime)) {
            try {
                // 注册回调函数参数，给sb添加属性
                console.log("MSE - SourceBuffer #" + track_id, "Creation with type '" + mime + "'")
                Log.info("MSE - SourceBuffer #" + track_id, "Creation with type '" + mime + "'");
                // 根据moov box中解析出来的track去一一创建对应的sourcebuffer
                sb = this.mediaSource.addSourceBuffer(mime);
                sb.addEventListener("error", function (e) {
                    Log.error("MSE SourceBuffer #" + track_id, e);
                });
                // ms id 是自定义上去的属性
                sb.ms = this.mediaSource;
                sb.id = track_id;

                // setSegmentOptions 指示应使用给定选项（第三个参数options）对具有给定 track_id 的曲目进行分段。  当段准备就绪时，将使用user参数（第二个参数）调用回调 onSegment。 
                // Indicates that the track with the given track_id should be segmented, with the given options. When segments are ready, the callback onSegment is called with the user parameter. 
                this.mp4boxfile.setSegmentOptions(track_id, sb, { nbSamples: 1000 });
                sb.pendingAppends = [];

            } catch (error) {
                // MSE 是一个允许开发者控制媒体流的 API，通过它可以实现诸如动态流式传输、自定义缓冲区管理、字幕和音轨切换等功能
                Log.error("MSE - SourceBuffer #" + track_id, "Cannot create buffer with type '" + mime + "'" + error);
            }
        } else {
            throw new Error(`你的浏览器不支持${mime}媒体类型`)
        }

    }

    // 开始加载视频
    loadFile() {
        let ctx = this;
        if (this.mediaSource.readyState !== "open") {
            this.mediaSource.onsourceopen = this.loadFile.bind(ctx);
            return
        }

        // 先写死，之后再修改
        this.downloader.setInterval(500);
        this.downloader.setChunkSize(1000000);
        this.downloader.setUrl(this.url);
        this.downloader.setCallback(
            // end表示这一次的请求是否已经将整个视频文件加载过来
            function (response: MP4ArrayBuffer, end: boolean, error: FactoryObject) {
                var nextStart = 0;
                if (response) {
                    // 设置文件加载的进度条
                    nextStart = ctx.mp4boxfile.appendBuffer(response, end);
                }
                if (end) {
                    // 如果存在end的话则意味着所有的chunk已经加载完毕
                    ctx.mp4boxfile.flush();
                } else {
                    ctx.downloader.setChunkStart(nextStart);
                }
                if (error) {
                    ctx.reset();
                }
            }
        )
        this.downloader.start();
        this.video.play();
    }

    initializeAllSourceBuffers() {
        if (this.mediaInfo) {
            // 拿到资源track，挨个调用 this.addBuffer
            let info = this.mediaInfo;
            for (var i = 0; i < info.tracks.length; i++) {
                var track = info.tracks[i];
                this.addBuffer(track);
            }
            // addbuffer执行完成后
            this.initializeSourceBuffers();
        }
    }

    initializeSourceBuffers() {
        var initSegs = this.mp4boxfile.initializeSegmentation(); // initializeSegmentation内部 resetTables
        for (var i = 0; i < initSegs.length; i++) {
            var sb = initSegs[i].user;
            if (i === 0) {
                sb.ms.pendingInits = 0;
            }
            this.onInitAppended = this.onInitAppended.bind(this);
            sb.addEventListener("updateend", this.onInitAppended);
            Log.info("MSE - SourceBuffer #" + sb.id, "Appending initialization data");
            sb.appendBuffer(initSegs[i].buffer);
            sb.segmentIndex = 0;
            sb.ms.pendingInits++;
        }
    }

    onInitAppended(e: Event) {
        // debugger
        console.log(this);
        let ctx = this;
        var sb = e.target as MP4SourceBuffer;
        if (sb.ms.readyState === "open") {
            sb.sampleNum = 0;
            sb.removeEventListener('updateend', this.onInitAppended);
            sb.addEventListener('updateend', this.onUpdateEnd.bind(sb, true, true, ctx));
            /* In case there are already pending buffers we call onUpdateEnd to start appending them*/
            this.onUpdateEnd.call(sb, false, true, ctx);
            sb.ms.pendingInits--;
            if (sb.ms.pendingInits === 0) {
                this.start();
            }
        }
    }

    onUpdateEnd(isNotInit: boolean, isEndOfAppend: boolean, ctx: MediaPlayer) {
        if (isEndOfAppend === true) {
            if (isNotInit === true) {
                // updateBufferedString(this, "Update ended");
            }
            if ((this as unknown as MP4SourceBuffer).sampleNum) {
                ctx.mp4boxfile.releaseUsedSamples((this as unknown as MP4SourceBuffer).id, (this as unknown as MP4SourceBuffer).sampleNum);
                delete (this as unknown as MP4SourceBuffer).sampleNum;
            }
            // 如果 sb 的 is_last 属性为true，就可以结束了，但是现在这部分有bug
            if ((this as unknown as MP4SourceBuffer).is_last) {
                (this as unknown as MP4SourceBuffer).ms.endOfStream();
            }
        }
        if ((this as unknown as MP4SourceBuffer).ms.readyState === "open" && (this as unknown as MP4SourceBuffer).updating === false && (this as unknown as MP4SourceBuffer).pendingAppends.length > 0) {
            var obj = (this as unknown as MP4SourceBuffer).pendingAppends.shift();
            (this as unknown as MP4SourceBuffer).sampleNum = obj.sampleNum;
            (this as unknown as MP4SourceBuffer).is_last = obj.is_last;
            (this as unknown as MP4SourceBuffer).appendBuffer(obj.buffer);
        }
    }

}

export default MediaPlayer;