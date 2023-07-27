import { PlayerOptions, ToolBar, LoadingMask, ErrorMask, BaseEvent } from "../../index";
import "./player.less";
import "../../components/main.less";
declare class Player extends BaseEvent {
    playerOptions: {
        url: string;
        autoplay: boolean;
        width: string;
        height: string;
    };
    container: HTMLElement;
    toolbar: ToolBar;
    video: HTMLVideoElement;
    loadingMask: LoadingMask;
    errorMask: ErrorMask;
    constructor(options: PlayerOptions);
    init(): void;
    /**
     * @description 初始化播放器上的各种组件实例
     */
    initComponent(): void;
    initContainer(): void;
    isTagValidate(ele: HTMLElement): boolean;
}
export { Player };
