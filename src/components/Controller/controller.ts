import { Component } from "../../class/Component";
import { Player } from "../../page/player";
import { ComponentItem, DOMProps, Node } from "../../types/Player";
import { $ } from "../../utils/domUtils";
import "./controller.less"
import { PlayButton } from "./parts/PlayButton";

export class Controller extends Component implements ComponentItem {
    readonly id = "Controller";
    props: DOMProps;
    player: Player;
    playButton: PlayButton;
    private subPlay: HTMLElement;
    private settings: HTMLElement;

    constructor(player: Player, container: HTMLElement, desc?: string, props?: DOMProps, children?: Node[]) {
        super(container, desc, props, children);
        this.player = player;
        this.init();
    }

    init() {
        this.initTemplate();
        this.initComponent();
    }

    initTemplate() {
        this.subPlay = $("div.video-subplay");
        this.settings = $("div.video-settings");
        this.el.appendChild(this.subPlay);
        this.el.appendChild(this.settings);
    }

    initComponent() {
        // 按钮挂在到了 sub-play下面
        this.playButton = new PlayButton(this.player, this.subPlay, "div.video-start-pause");
    }
}