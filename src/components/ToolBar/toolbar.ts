import { Component } from "../../class/Component";
import { Node, ComponentItem, DOMProps, Player } from "../../index";
import { addClass, includeClass, removeClass } from "../../utils/domUtils";
import "./toolbar.less";

// 音乐播放器的工具栏组件 ( progress + controller )

// export class ToolBar extends Component implements ComponentItem {
//     private template_!: HTMLElement;
//     private progress!: Progress;
//     private controller!: Controller;
//     private container!: HTMLElement;
//     private video!: HTMLVideoElement;
//     private timer!: null | number

//     constructor(container: HTMLElement) {
//         super()
//         this.container = container
//         this.init();
//         this.initComponent();
//         this.initTemplate();
//         this.initEvent();
//     }

//     get template(): HTMLElement {
//         return this.template_
//     };

//     init(): void { }

//     // 注册 进度条 和 控制器
//     initComponent() {
//         this.progress = new Progress(this.container) // 进度条
//         this.controller = new Controller(this.container) //下面的控制器
//     }

//     // 组合 进度条 和 控制器的template
//     initTemplate() {
//         let div = document.createElement("div")
//         div.className = `${styles["video-controls"]} ${styles["video-controls-hidden"]}`;
//         div.innerHTML += this.progress.template as string;
//         div.innerHTML += this.controller.template as string;
//         this.template_ = div
//     }

//     // 显示和隐藏toolbar

//     showToolBar(e: MouseEvent) {
//         //工具栏的总容器
//         this.container.querySelector(
//             `.${styles["video-controls"]}`
//         )!.className = `${styles["video-controls"]}`;
//         if (e.target !== this.video) {
//             // do nothing
//         } else {
//             // 一个防抖
//             this.timer = window.setTimeout(() => {
//                 this.hideToolBar()
//             }, 3000)
//         }
//     }

//     hideToolBar() {
//         this.container.querySelector(
//             `.${styles["video-controls"]}`
//         )!.className = `${styles["video-controls"]} ${styles["video-controls-hidden"]}`;
//     }

//     initEvent() {

//         this.on("showtoolbar", (e: MouseEvent) => {
//             // 防抖
//             if (this.timer) {
//                 clearTimeout(this.timer);
//                 this.timer = null
//             }
//             this.showToolBar(e)
//         });

//         this.on("hidetoolbar", () => {
//             this.hideToolBar()
//         });

//         this.on("loadedmetadata", (summary: number) => {
//             this.controller.emit("loadedmetadata", summary);
//             this.progress.emit("loadedmetadata", summary);
//         });

//         this.on("timeupdate", (current: number) => {
//             this.controller.emit("timeupdate", current);
//             this.progress.emit("timeupdate", current);
//         });

//         this.on("mounted", () => {
//             this.video = this.container.querySelector("video")!;
//             this.controller.emit("mounted");
//             this.progress.emit("mounted")
//         });

//         this.on("play", () => {
//             this.controller.emit("play")
//         })

//         this.on("pause", () => {
//             this.controller.emit("pause")
//         })
//     }


// }

export class ToolBar extends Component implements ComponentItem {
    readonly id: string = "Toolbar";
    props: DOMProps;
    player: Player;
    private timer: number = 0;
    // 先初始化播放器的默认样式，暂时不考虑用户的自定义样式

    constructor(player: Player, container: HTMLElement, desc?: string, props?: DOMProps, children?: Node[]) {
        super(container, desc, props, children);
        this.player = player;
        this.props = props;
        this.init();
    }

    init() {
        this.initTemplate();
        this.initEvent();
    }

    /**
    * @description 需要注意的是此处元素的class名字是官方用于控制整体toolbar一栏的显示和隐藏
    */
    initTemplate() {
        addClass(this.el, ["video-controls", "video-controls-hidden"]);
    }

    initEvent() {
        this.player.on("showtoolbar", (e) => {
            this.onShowToolBar(e);
        })

        this.player.on("hidetoolbar", (e) => {
            this.onHideToolBar(e);
        })
    }

    private hideToolBar() {
        if (!includeClass(this.el, "video-controls-hidden")) {
            addClass(this.el, ["video-controls-hidden"]);
        }
    }

    private showToolBar(e: MouseEvent) {
        if (includeClass(this.el, "video-controls-hidden")) {
            removeClass(this.el, ["video-controls-hidden"]);
        }
        if (e.target === this.player.video) {
            this.timer = window.setTimeout(() => {
                this.hideToolBar();
            }, 3000)
        }
    }

    onShowToolBar(e: MouseEvent) {
        if (this.timer) {
            window.clearTimeout(this.timer);
            this.timer = null;
        }
        this.showToolBar(e);
    }

    onHideToolBar(e: MouseEvent) {
        this.hideToolBar();
    }
}

