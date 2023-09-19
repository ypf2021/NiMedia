import { Component } from "../../class/Component";
import { Player } from "../../page/player";
import { ComponentItem, DOMProps, Node, ComponentConstructor } from "../../types/Player";
import "./controller.less";
export declare class Controller extends Component implements ComponentItem {
    readonly id = "Controller";
    props: DOMProps;
    player: Player;
    subPlay: HTMLElement;
    settings: HTMLElement;
    leftControllers: ComponentConstructor[];
    rightController: ComponentConstructor[];
    constructor(player: Player, container: HTMLElement, desc?: string, props?: DOMProps, children?: Node[]);
    init(): void;
    initControllers(): void;
    initTemplate(): void;
    initComponent(): void;
}
