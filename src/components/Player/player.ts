import { PlayerOptions, $warn, styles, ToolBar, LoadingMask, ErrorMask, BaseEvent } from "../../index";;

import "./player.less";
import "../../main.less";
class Player extends BaseEvent {
    private playerOptions = {
        url: "",
        autoplay: false,
        width: "100%",
        height: "100%",
    };

    private container!: HTMLElement;
    private toolbar!: ToolBar;
    private video!: HTMLVideoElement;
    private loadingMask!: LoadingMask;
    private errorMask!: ErrorMask;


    constructor(options: PlayerOptions) {
        super()
        this.playerOptions = Object.assign(this.playerOptions, options);
        this.init();
        this.initComponent();
        this.initContainer();
        this.initEvent()
    };

    init(): void {
        let container = (this.playerOptions as PlayerOptions).container;
        if (!this.isTagValidate(container)) {
            $warn("你传入的容器的元素类型不适合，建议传入块元素或者行内块元素，拒绝传入具有交互类型的元素例如input框等表单类型的元素");
        }
        this.container = container
    };

    initComponent(): void {
        this.toolbar = new ToolBar(this.container);
        this.loadingMask = new LoadingMask(this.container)
        this.errorMask = new ErrorMask(this.container)
    };

    initContainer(): void {
        this.container.style.width = this.playerOptions.width;
        this.container.style.height = this.playerOptions.height;
        this.container.className = styles['video-container'];
        this.container.innerHTML = `
            <div class="${styles["video-wrapper"]}">
            <video>
                <source src="${this.playerOptions.url}" type="video/mp4">
                你的浏览器暂不支持HTML5标签,非常抱歉
                </source>
            </video>
            </div>
        `;
        this.container.appendChild(this.toolbar.template);
        this.video = this.container.querySelector("video")!
        // 执行toolbar的mounted
        // this.toolbar.emit("mounted")
    };

    initEvent() {

        // 自动播放
        this.on("mounted", (ctx: this) => {
            ctx.playerOptions.autoplay && ctx.video.play();
        })

        // 初始化
        this.toolbar.emit("mounted");
        this.emit("mounted", this)

        this.container.onclick = (e: Event) => {
            if (e.target == this.video) {
                if (this.video.paused) {
                    this.video.play();
                } else if (this.video.played) {
                    this.video.pause();
                }
            }
        }

        //鼠标移入总体容器和移动时都会触发 showToolbar，判断是否隐藏。
        this.container.addEventListener("mouseenter", (e: MouseEvent) => {
            this.toolbar.emit("showToolbar", e);
        });

        this.container.addEventListener("mousemove", (e: MouseEvent) => {
            this.toolbar.emit("showtoolbar", e);
        });

        // 鼠标离开容器后进行隐藏
        this.container.addEventListener("mouseleave", (e: MouseEvent) => {
            this.toolbar.emit("hidetoolbar");
        });

        // 视频加载完成后触发     loadedmetadata事件在元数据（metadata）被加载完成后触发。
        this.video.addEventListener("loadedmetadata", (e: Event) => {
            // HTMLMediaElement.duration 属性以秒为单位给出媒体的长度
            console.log("元数据加载完毕", this.video.duration)
            this.toolbar.emit("loadedmetadata", this.video.duration)
        })

        // currentTime更新时触发  当currentTime更新时会触发timeupdate事件。
        // HTMLMediaElement.currentTime 属性会以秒为单位返回当前媒体元素的播放时间
        this.video.addEventListener("timeupdate", (e: Event) => {
            this.toolbar.emit("timeupdate", this.video.currentTime);
        })

        // 当视频可以再次播放的时候就移除loading和error的mask，
        // 通常是为了应对在播放的过程中出现需要缓冲或者播放错误这种情况从而需要展示对应的mask

        // 开始播放
        this.video.addEventListener("play", (e: Event) => {
            console.log("视频播放 play");
            this.loadingMask.removeLoadingMask();
            this.errorMask.removeErrorMask();
            this.toolbar.emit("play")
        })

        // 暂停
        this.video.addEventListener("pause", (e: Event) => {
            console.log("视频暂停 pause");
            this.toolbar.emit("pause");
        });

        // 等待     当回放因暂时缺少数据而停止时，将触发等待事件。
        this.video.addEventListener("waiting", (e: Event) => {
            console.log("视频缺少数据 waiting");
            this.loadingMask.removeLoadingMask();
            this.errorMask.removeErrorMask();
            this.loadingMask.addLoadingMask();
        });

        // 出错     当用户代理试图获取媒体数据，但数据意外地没有到来时，将触发stalled事件。
        this.video.addEventListener("stalled", (e) => {
            console.log("视频加载发生错误stalled");
            this.loadingMask.removeLoadingMask();
            this.errorMask.removeErrorMask();
            this.errorMask.addErrorMask();
        })

        // 出错    error 事件会在因为一些错误（如网络连接错误）导致无法加载资源的时候触发。
        this.video.addEventListener("error", (e) => {
            console.log("视频加载发生错误error");
            this.loadingMask.removeLoadingMask();
            this.errorMask.removeErrorMask();
            this.errorMask.addErrorMask();
        })

        // 没完全加载    资源没有被完全加载时就会触发 abort 事件，但错误不会触发该事件。
        this.video.addEventListener("abort", (e: Event) => {
            console.log("视频正在加载 abort");
            this.loadingMask.removeLoadingMask();
            this.errorMask.removeErrorMask();
            this.errorMask.addErrorMask();
        })
    }

    // 判定元素是否为合理的元素  不可以是行内元素和可交互的行内块级元素
    isTagValidate(ele: HTMLElement): boolean {
        //window.getComputedStyle 获取元素的css样式 只读
        if (window.getComputedStyle(ele).display === 'block') return true;
        if (window.getComputedStyle(ele).display === 'inline') return false;
        if (window.getComputedStyle(ele).display === 'inline-block') {
            if (ele instanceof HTMLImageElement ||
                ele instanceof HTMLAudioElement ||
                ele instanceof HTMLVideoElement ||
                ele instanceof HTMLInputElement ||
                ele instanceof HTMLCanvasElement ||
                ele instanceof HTMLButtonElement
            ) {
                return false
            }
            return true
        }
        return true
    }
}

export { Player }