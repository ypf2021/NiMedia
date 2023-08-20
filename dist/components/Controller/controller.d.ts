import { Component } from "../../class/Component";
import { Player } from "../../page/player";
import { ComponentItem, DOMProps, Node } from "../../types/Player";
import "./controller.less";
import { PlayButton } from "./parts/PlayButton";
export declare class Controller extends Component implements ComponentItem {
    readonly id = "Controller";
    props: DOMProps;
    player: Player;
    playButton: PlayButton;
    private subPlay;
    private settings;
    constructor(player: Player, container: HTMLElement, desc?: string, props?: DOMProps, children?: Node[]);
    init(): void;
    initTemplate(): void;
    initComponent(): void;
}
