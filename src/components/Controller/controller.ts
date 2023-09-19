import { Component } from "../../class/Component";
import { Player } from "../../page/player";
import { ComponentItem, DOMProps, Node, ComponentConstructor, PlayerOptions } from "../../types/Player";
import { $ } from "../../utils/domUtils";
import "./controller.less"
import { PlayButton } from "./parts/PlayButton";
import { Volume } from "./parts/Volume";
import { FullScreen } from "./parts/FullScreen";
import { Playrate } from "./parts/PlayerRate";
import { storeControlComponent, controllersMapping } from "../../utils/store";
export class Controller extends Component implements ComponentItem {
    readonly id = "Controller";
    props: DOMProps = {};
    player: Player;
    subPlay: HTMLElement;
    settings: HTMLElement;
    leftControllers: ComponentConstructor[] = [PlayButton];
    rightController: ComponentConstructor[] = [Playrate, Volume, FullScreen]

    constructor(player: Player, container: HTMLElement, desc?: string, props?: DOMProps, children?: Node[]) {
        super(container, desc, props, children);
        this.player = player;
        this.init();
    }

    init() {
        this.initControllers()
        this.initTemplate();
        this.initComponent();
        storeControlComponent(this);
    }

    initControllers() {
        let leftControllers = (this.player.playerOptions as PlayerOptions).leftControllers;
        let rightControllers = (this.player.playerOptions as PlayerOptions).rightControllers;
        if (leftControllers) {
            this.leftControllers = leftControllers.map(item => {
                if (typeof item === "string") {
                    if (!controllersMapping[item]) {
                        throw new Error(`传入的组件名${item}错误`)
                    }
                    return controllersMapping[item]
                } else {
                    return item
                }
            })
        }

        if (rightControllers) {
            this.rightController = rightControllers.map(item => {
                if (typeof item === 'string') {
                    if (!controllersMapping[item]) {
                        throw new Error(`传入的组件名${item}错误`);
                    }
                    return controllersMapping[item];
                } else {
                    return item;
                }
            })
        }

        console.log("leftControllers rightController", this.leftControllers, this.rightController)
    }

    initTemplate() {
        this.subPlay = $("div.video-subplay");
        this.settings = $("div.video-settings");
        this.el.appendChild(this.subPlay);
        this.el.appendChild(this.settings);
    }

    initComponent() {
        // 按钮挂在到了 sub-play下面
        // this.playButton = new PlayButton(this.player, this.subPlay);
        // // 按钮挂在到了 setting 下面
        // this.volume = new Volume(this.player, this.settings, "div");
        // this.playrate = new Playrate(this.player, this.settings, "div")
        // this.fullscreen = new FullScreen(this.player, this.settings, "div");
        this.leftControllers.forEach(ControlConstructor => {
            let instance = new ControlConstructor(this.player, this.subPlay, "div");
            this[instance.id] = instance;
        })

        this.rightController.forEach(ControlConstructor => {
            let instance = new ControlConstructor(this.player, this.settings, "div");
            this[instance.id] = instance;
        })
    }
}