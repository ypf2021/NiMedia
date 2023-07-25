import { $warn, styles, Progress, Controller, EventObject, BaseEvent } from "../../index";
import "./toolbar.less";

// 音乐播放器的工具栏组件 ( progress + controller )

export class ToolBar extends BaseEvent {
    private template_!: HTMLElement;
    private progress!: Progress;
    private controller!: Controller;
    private container!: HTMLElement;
    private video!: HTMLVideoElement;
    private timer!: null | number

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
        this.progress = new Progress(this.container) // 进度条
        this.controller = new Controller(this.container) //下面的控制器
    }

    // 组合 进度条 和 控制器的template
    initTemplate() {
        let div = document.createElement("div")
        div.className = `${styles["video-controls"]} ${styles["video-controls-hidden"]}`;
        div.innerHTML += this.progress.template as string;
        div.innerHTML += this.controller.template as string;
        this.template_ = div
    }

    // 显示和隐藏toolbar

    showToolBar(e: MouseEvent) {
        //工具栏的总容器
        this.container.querySelector(
            `.${styles["video-controls"]}`
        )!.className = `${styles["video-controls"]}`;
        if (e.target !== this.video) {
            // do nothing
        } else {
            // 一个防抖
            this.timer = window.setTimeout(() => {
                this.hideToolBar()
            }, 3000)
        }
    }

    hideToolBar() {
        this.container.querySelector(
            `.${styles["video-controls"]}`
        )!.className = `${styles["video-controls"]} ${styles["video-controls-hidden"]}`;
    }

    initEvent() {

        this.on("showtoolbar", (e: MouseEvent) => {
            // 防抖
            if (this.timer) {
                clearTimeout(this.timer);
                this.timer = null
            }
            this.showToolBar(e)
        });

        this.on("hidetoolbar", () => {
            this.hideToolBar()
        });

        this.on("loadedmetadata", (summary: number) => {
            this.controller.emit("loadedmetadata", summary);
        });

        this.on("timeupdate", (current: number) => {
            this.controller.emit("timeupdate", current);
        });

        this.on("mounted", () => {
            this.video = this.container.querySelector("video")!;
            this.controller.emit("mounted");
            this.progress.emit("mounted")
        });


        this.on("play", () => {
            this.controller.emit("play")
        })

        this.on("pause", () => {
            this.controller.emit("pause")
        })
    }


}