import { $ } from "../utils/domUtils";
import { BaseEvent } from "./BaseEvent";
import { DOMProps, Node } from "../types/Player";

export class Component extends BaseEvent {
    el: HTMLElement; // el代表着该组件对应的整个HTML元素

    constructor(container: HTMLElement, desc?: string, props?: DOMProps, children?: string | Array<Node>) {
        super()
        let dom = $(desc, props, children);
        this.el = dom;
        // 用于向指定元素的子节点列表末尾添加一个或多个节点对象或文本节点。
        container.append(dom);
    }
}