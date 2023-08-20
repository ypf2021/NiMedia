import { Component } from "../../../class/Component"
import { Player } from "../../../page/player";
import { ComponentItem, DOMProps, Node } from "../../../types/Player";
import { createSvg } from "../../../utils/domUtils";
import { pausePath, playPath } from "../path/defaultPath";
import { storeControlComponent } from "../../../utils/store";

export class PlayButton extends Component implements ComponentItem {
    readonly id = "PlayButton";
    props: DOMProps = {};
    player: Player;
    private pauseIcon: SVGSVGElement | string;
    private playIcon: SVGSVGElement | string;
    private button: SVGSVGElement;

    constructor(player: Player, container: HTMLElement, desc?: string, props?: DOMProps, children?: Node[]) {
        super(container, desc, props, children);
        this.player = player;
        this.init()
    }

    init() {
        this.initTemplate();
        this.initEvent();
    }

    initTemplate() {
        this.pauseIcon = createSvg(pausePath);
        this.playIcon = createSvg(playPath);
        this.button = this.playIcon as SVGSVGElement;
        this.el.appendChild(this.button);
    }

    initEvent() {
        //  让方法永远绑定到自己的实例
        this.onClick = this.onClick.bind(this);

        // 触发播放，暂停 以及图标变换
        this.player.on("play", (e: Event) => {
            this.el.removeChild(this.button);
            this.button = this.pauseIcon as SVGSVGElement;
            this.el.appendChild(this.button);
        })

        this.player.on("pause", (e: Event) => {
            this.el.removeChild(this.button);
            this.button = this.playIcon as SVGSVGElement;
            this.el.appendChild(this.button);
        })

        this.el.onclick = this.onClick.bind(this);
    }

    onClick(e: MouseEvent) {
        if (this.player.video.paused) {
            this.player.video.play();
        } else {
            this.player.video.pause();
        }
    }

}