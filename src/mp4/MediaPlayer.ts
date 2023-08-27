import MP4Box, { MP4File } from "mp4box"

class MediaPlayer {
    url: string;
    video: HTMLVideoElement;
    mp4boxFile: MP4File;
    mediaSource: MediaSource;
    constructor(url: string, video: HTMLVideoElement) {
        this.url = url;
        this.video = video;
        this.init()
    }

    init() {
        this.mp4boxFile = MP4Box.createFile(); // 创建一个新的空白的 MP4 文件。
        this.initEvent();
    }


    initEvent() {

    }


}

export default MediaPlayer;