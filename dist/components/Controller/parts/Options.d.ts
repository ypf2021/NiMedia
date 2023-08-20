import { Component } from "../../../class/Component";
import { Player } from "../../../page/player";
import { ComponentItem, DOMProps, Node } from "../../../types/Player";
/**
 *
 * @description 分辨率和音量需要用到的 options列表，这个类做了初始化大小和隐藏显示的功能，是两个的通用部分
 * @export
 * @class Options
 * @extends {Component}
 * @implements {ComponentItem}
 */
export declare class Options extends Component implements ComponentItem {
    id: string;
    props: DOMProps;
    player: Player;
    hideWidth: number;
    hideHeight: number;
    hideBox: HTMLElement;
    iconBox: HTMLElement;
    constructor(player: Player, container: HTMLElement, hideWidth?: number, hideHeight?: number, desc?: string, props?: DOMProps, children?: Node[]);
    initBase(): void;
    initBaseTemplate(): void;
    initBaseEvent(): void;
    handleMouseMove(e: MouseEvent): void;
}
