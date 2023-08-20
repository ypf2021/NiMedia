import { BaseEvent } from "./BaseEvent";
import { DOMProps, Node } from "../types/Player";
/**
 *
 * @description 创建dom并挂载到container
 * @export
 * @class Component
 * @extends {BaseEvent}
 */
export declare class Component extends BaseEvent {
    el: HTMLElement;
    constructor(container: HTMLElement, desc?: string, props?: DOMProps, children?: string | Array<Node>);
    init(): void;
    initEvent(): void;
    initTemplate(): void;
    initComponent(): void;
    resetEvent(): void;
}
