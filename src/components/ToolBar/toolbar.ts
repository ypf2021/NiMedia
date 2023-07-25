import { $warn, styles, Progress, Controller, EventObject, BaseEvent } from "../../index";
import "./toolbar.less";

// 音乐播放器的工具栏组件 ( progress + controller )

export class ToolBar extends BaseEvent {
    private template_!: HTMLElement;
    private progress!: Progress;
    private controller!: Controller;
    private container!: HTMLElement;

    constructor(container: HTMLElement) {
        super()
        this.container = container
        this.init();
        this.initComponent();
        this.initTemplate();
        this.initEvent();
    }

    get template(): HTMLElement {
        return this.template_
    };

    init(): void { }

    // 注册 进度条 和 控制器
    initComponent() {
        this.progress = new Progress() // 进度条
        this.controller = new Controller(this.container) //下面的控制器
    }

    // 组合template
    initTemplate() {
        let div = document.createElement("div")
        div.className = `${styles["video-controls"]} ${styles["video-controls-hidden"]}`;
        div.innerHTML += this.progress.template as string;
        div.innerHTML += this.controller.template as string;
        this.template_ = div
    }

    initEvent() {
        this.on("play", () => {
            this.controller.emit("play")
        })

        this.on("pause", () => {
            this.controller.emit("pause")
        })
    }


}