import { ComponentItem, PlayerOptions, ToolBar, DOMProps, registerOptions } from "../index";
import "./player.less";
import { Component } from "../class/Component";
import { Plugin } from "../index";
declare class Player extends Component implements ComponentItem {
    readonly id = "Player";
    readonly playerOptions: PlayerOptions;
    props: DOMProps;
    container: HTMLElement;
    video: HTMLVideoElement;
    toolBar: ToolBar;
    constructor(options: PlayerOptions);
    init(): void;
    initEvent(): void;
    initPlugin(): void;
    initMp4Player(url: string): void;
    initMpdPlayer(url: string): void;
    attachSource(url: string): void;
    registerControls(id: string, component: Partial<ComponentItem> & registerOptions): void;
    /**
     * @description 注册对应的组件
     * @param plugin
     */
    use(plugin: Plugin): void;
}
export { Player };
