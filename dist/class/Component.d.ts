import { BaseEvent } from "./BaseEvent";
import { DOMProps, Node } from "../types/Player";
export declare class Component extends BaseEvent {
    el: HTMLElement;
    constructor(container: HTMLElement, desc?: string, props?: DOMProps, children?: string | Array<Node>);
}
