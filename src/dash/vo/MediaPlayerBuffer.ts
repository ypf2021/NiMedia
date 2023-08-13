import { FactoryObject } from "../../types/dash/Factory";
import { PlayerBuffer } from "../../types/dash/Net";
import FactoryMaker from "../FactoryMaker";


/**
 * @description MediaPlayerBuffer.arrayBuffer 用来存放 playerBuffer 的数组
 * @class MediaPlayerBuffer
 */
class MediaPlayerBuffer {
    private config: FactoryObject = {};
    private arrayBuffer: Array<PlayerBuffer> = new Array<PlayerBuffer>() // new一个数组
    constructor(ctx: FactoryObject, ...args: any[]) {
        this.config = ctx.context
    };

    push(buffer: PlayerBuffer) {
        this.arrayBuffer.push(buffer);
    }

    clear() {
        this.arrayBuffer = []
    }

    isEmpty() {
        return this.arrayBuffer.length === 0;
    }

    delete(buffer: PlayerBuffer) {
        if (this.arrayBuffer.includes(buffer)) {
            let index = this.arrayBuffer.indexOf(buffer);
            this.arrayBuffer.splice(index, 1);
        }
    }

    top() {
        return this.arrayBuffer[0] || null;
    }

    pop() {
        this.arrayBuffer.length && this.arrayBuffer.pop();
    }
}

const factory = FactoryMaker.getSingleFactory(MediaPlayerBuffer);
export default factory;
export { MediaPlayerBuffer };