import { FactoryObject } from "../../types/dash/Factory";
import FactoryMaker from "../FactoryMaker";

class MediaPlayerController {
    private config: FactoryObject = {}
    private video: HTMLVideoElement;
    private mediaSource: MediaSource;
    private sourceBuffers: SourceBuffer[];
    constructor(ctx: FactoryObject, ...args: any[]) {
        this.config = ctx.context;
        this.setup();
    }
    setup() {
        // MediaSource() 是 MediaSource 的构造函数，返回一个没有分配 source buffers 新的 MediaSource 对象。
        this.mediaSource = new MediaSource();
    }
}

const factory = FactoryMaker.getClassFactory(MediaPlayerController);
export default factory;
export { MediaPlayerController };