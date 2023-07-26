import { BaseEvent } from "../../index";
import "./progress.less";
export declare class Progress extends BaseEvent {
    private template_;
    private container;
    private progress;
    private bufferedProgress;
    private completedProgress;
    private pretime;
    private dot;
    private video;
    private mouseDown;
    constructor(container: HTMLElement);
    get template(): HTMLElement | string;
    init(): void;
    initEvent(): void;
    initProgressEvent(): void;
}
