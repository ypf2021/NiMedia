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
    constructor(container: HTMLElement);
    get template(): HTMLElement | string;
    init(): void;
    initControllerEvent(): void;
    initEvent(): void;
}
