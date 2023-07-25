import { $warn, styles, icon, EventObject, BaseEvent, formatTime } from '../../index'
import "./controller.less"

export class Controller extends BaseEvent {
    private template_!: HTMLElement | string; //模板
    private container!: HTMLElement; //容器
    private videoPlayBtn!: HTMLElement; // 播放按钮
    private currentTime!: HTMLElement; //当前时间
    private summaryTime!: HTMLElement; // 总体事件

    constructor(container: HTMLElement) {
        super()
        this.container = container;
        this.init()
        this.initEvent()
    }

    get template(): HTMLElement | string {
        return this.template_;
    }

    init(): void {
        this.template_ = `
            <div class="${styles["video-play"]}">
                <div class="${styles["video-subplay"]}">
                    <div class="${styles["video-start-pause"]}">
                        <i class="${icon["iconfont"]} ${icon["icon-bofang"]}"></i>
                    </div>
                    <div class="${styles["video-duration"]}">
                        <span class="${styles["video-duration-completed"]}">00:00</span>&nbsp;/&nbsp;<span class="${styles["video-duration-all"]}">00:00</span>
                    </div>
                </div>
                <div class="${styles["video-settings"]}">
                    <div class="${styles["video-subsettings"]}">
                        <i class="${icon["iconfont"]} ${icon["icon-shezhi"]}"></i>
                    </div>
                    <div class="${styles["video-volume"]}">
                        <i class="${icon["iconfont"]} ${icon["icon-yinliang"]}"></i>
                        <div class="${styles["video-volume-progress"]}">
                            <div class="${styles["video-volume-completed"]}"></div>
                            <div class="${styles["video-volume-dot"]}"></div>
                        </div>
                    </div>
                    <div class="${styles["video-fullscreen"]}">
                        <i class="${icon["iconfont"]} ${icon["icon-quanping"]}"></i>
                    </div>
                </div>
            </div>
        `;
    }

    initEvent(): void {

        // 启动视频
        this.on("play", () => {
            this.videoPlayBtn.className = `${icon["iconfont"]} ${icon["icon-zanting"]}`;
        })

        // 暂停视频
        this.on("pause", () => {
            this.videoPlayBtn.className = `${icon["iconfont"]} ${icon["icon-bofang"]}`;
        });

        // 加载视频数据
        this.on("loadedmetadata", (summary: number) => {
            this.summaryTime.innerHTML = formatTime(summary);
        });

        // 时间更新
        this.on("timeupdate", (current: number) => {
            this.currentTime.innerHTML = formatTime(current);
        });

        // 初始化时进行注册
        this.on("mounted", () => {
            this.videoPlayBtn = this.container.querySelector(
                `.${styles["video-start-pause"]} i`
            )!;
            this.currentTime = this.container.querySelector(
                `.${styles["video-duration-completed"]}`
            )!;
            this.summaryTime = this.container.querySelector(
                `.${styles["video-duration-all"]}`
            )!;
        });


    }


}