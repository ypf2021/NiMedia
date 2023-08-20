import { Options } from "./Options";
import { Player } from "../../../page/player";
import { DOMProps, Node } from "../../../types/Player";
import { $, addClass } from "../../../utils/domUtils";
import { CompletedProgress } from "../../Progress/parts/CompletedProgress";

export class Volume extends Options {
    readonly id = "Volume";
    volumeProgress: HTMLElement;
    volumeShow: HTMLElement;
    volumeCompleted: CompletedProgress
    constructor(player: Player, container: HTMLElement, desc?: string, props?: DOMProps, children?: Node[]) {
        super(player, container, 0, 0, desc);
        this.init();
    }

    init() {
        this.initTemplate();
        this.initEvent();
    }

    initTemplate() {
        this.el["aria-label"] = "音量"
        this.hideBox.style.bottom = "41px";
        addClass(this.hideBox, ["video-volume-set"]);
        // 进度条
        this.volumeProgress = $("div.video-volume-progress", { style: { height: "70px" } });
        this.volumeShow = $("div.video-volume-show");
        // 音量高度
        this.volumeShow.innerText = "50";
        this.volumeCompleted = new CompletedProgress(this.player, this.volumeProgress, "div.video-volume-completed");
        this.hideBox.appendChild(this.volumeShow);
        this.hideBox.appendChild(this.volumeProgress);
    }

    initEvent() {
        this.player.on("volume-progress-click", (e: MouseEvent, ctx: Volume) => {
            let offsetY = this.volumeProgress.clientHeight - e.offsetY;
            let scale = offsetY / this.volumeProgress.clientHeight;
            if (scale < 0) {
                scale = 0;
            } else if (scale > 1) {
                scale = 1;
            }
            this.volumeCompleted.el.style.height = scale * 100 + "%"
        })

        this.volumeProgress.onclick = (e) => {
            this.player.emit("volume-progress-click", e, this);
        }
    }
}