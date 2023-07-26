import { $warn, styles, BaseEvent, formatTime } from "../../index";
import "./progress.less";

// 进度条组件
export class Progress extends BaseEvent {
    private template_!: HTMLElement | string;
    private container!: HTMLElement;
    private progress!: HTMLElement;
    private bufferedProgress!: HTMLElement; // 缓冲好的进度条
    private completedProgress!: HTMLElement; // 走过的进度条
    private pretime!: HTMLElement;
    private dot!: HTMLElement;
    private video!: HTMLVideoElement;
    private mouseDown: boolean = false;


    constructor(container: HTMLElement) {
        super()
        this.container = container
        this.init();
        this.initEvent()
    }

    get template(): HTMLElement | string {
        return this.template_;
    }

    init() {
        this.template_ = `
            <div class="${styles["video-progress"]}">
                <div class="${styles["video-pretime"]}">00:00</div>
                <div class="${styles["video-buffered"]}"></div>
                <div class="${styles["video-completed"]} "></div>
                <div class="${styles["video-dot"]} ${styles["video-dot-hidden"]}"></div>
            </div>
        `
    }

    initEvent() {
        // 初始化注册变量
        this.on("mounted", () => {
            this.progress = this.container.querySelector(
                `.${styles["video-controls"]} .${styles["video-progress"]}`
            )!
            this.pretime = this.progress.children[0] as HTMLElement;
            this.bufferedProgress = this.progress.children[1] as HTMLElement;
            this.completedProgress = this.progress.children[2] as HTMLElement;
            this.dot = this.progress.children[3] as HTMLElement;
            this.video = this.container.querySelector("video")!;
            this.initProgressEvent();
        })

        this.on("timeupdate", (current: number) => {
            let scaleCurr = (this.video.currentTime / this.video.duration) * 100;
            let scaleBuffer =
                ((this.video.buffered.end(0) + this.video.currentTime) / this.video.duration) * 100;
            this.completedProgress.style.width = scaleCurr + "%";
            this.dot.style.left = this.progress.offsetWidth * (scaleCurr / 100) - 5 + "px";
            this.bufferedProgress.style.width = scaleBuffer + "%";
        });

        this.on("loadedmetadata", (summary: number) => { });
    }

    initProgressEvent() {
        this.progress.onmouseenter = () => {
            console.log("progress onmouseenter");
            this.dot.className = `${styles["video-dot"]}`;
        };

        this.progress.onmouseleave = () => {
            // 如果没有一直按着，离开的时候就隐藏
            if (!this.mouseDown) {
                this.dot.className = `${styles["video-dot"]} ${styles["video-dot-hidden"]}`;
            };
        };

        // 点击进度条 切换播放位置，点的位置，进度条的位置
        this.progress.onclick = (e: MouseEvent) => {

            // 防止dot在progress上移动并放开的时候触发 process.onclick
            if (e.target == this.dot) {
                return
            }

            // 算出位置的百分比
            // 此处有遗留bug
            let scale = e.offsetX / this.progress.offsetWidth;
            console.log("scale", e, scale, e.offsetX, this.progress.offsetWidth)
            if (scale < 0) {
                console.log("scale == 0")

                scale = 0;
            } else if (scale > 1) {
                console.log("scale == 1")

                scale = 1;
            }
            this.dot.style.left = this.progress.offsetWidth * scale - 5 + "px"
            this.bufferedProgress.style.width = scale * 100 + "%"
            this.completedProgress.style.width = scale * 100 + "%";
            // 设置播放位置
            this.video.currentTime = Math.floor(scale * this.video.duration)
            if (this.video.paused) this.video.play()
        };

        // progress上面移动  时展示当前的时间
        this.progress.onmousemove = (e: MouseEvent) => {
            let scale = e.offsetX / this.progress.offsetWidth;
            if (scale < 0) {
                scale = 0;
            } else if (scale > 1) {
                scale = 1;
            }

            let pretime = formatTime(scale * this.video.duration);
            this.pretime.style.display = "block";
            this.pretime.innerHTML = pretime;
            this.pretime.style.left = e.offsetX - 17 + "px";
            e.preventDefault();
        };

        this.progress.onmouseleave = (e: MouseEvent) => {
            this.pretime.style.display = "none";
        };

        // 点击dot的事件
        this.dot.addEventListener("mousedown", (e: MouseEvent) => {
            let left = this.completedProgress.offsetWidth; //点击时，相对于进度条的位置
            let mouseX = e.pageX; // 点击时相对于页面的位置
            this.mouseDown = true;
            document.onmousemove = (e: MouseEvent) => {
                // e.pageX - mouseX + left   移动过的距离 + 原本的距离
                let scale = (e.pageX - mouseX + left) / this.progress.offsetWidth

                if (scale < 0) {
                    scale = 0;
                } else if (scale > 1) {
                    scale = 1;
                }

                this.dot.style.left = this.progress.offsetWidth * scale - 5 + "px";
                this.bufferedProgress.style.width = scale * 100 + "%";
                this.completedProgress.style.width = scale * 100 + "%";

                this.video.currentTime = Math.floor(scale * this.video.duration);
                if (this.video.paused) this.video.play();
                e.preventDefault();
            }

            document.onmouseup = (e: MouseEvent) => {
                document.onmousemove = document.onmouseup = null;
                this.mouseDown = false;
                e.preventDefault();

            };
            e.preventDefault();
        });


    }
}
