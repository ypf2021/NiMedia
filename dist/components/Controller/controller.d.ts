import { BaseEvent } from '../../index';
import "./controller.less";
export declare class Controller extends BaseEvent {
    private template_;
    private container;
    private videoPlayBtn;
    private currentTime;
    private summaryTime;
    private video;
    private fullScreen;
    private volumeBtn;
    private volumeSet;
    private volumeDot;
    private volumeProgress;
    private playRate;
    private resolvePower;
    private settings;
    private volumeCompleted;
    private playRateSet;
    private resolvePowerSet;
    constructor(container: HTMLElement);
    get template(): HTMLElement | string;
    init(): void;
    /**
     * @description 控制栏的事件 开始播放/关闭播放 ，全屏，设置
     */
    initControllerEvent(): void;
    initEvent(): void;
    handleMouseMove(e: MouseEvent, type: "volume" | "playrate" | "resolvepower"): void;
}
