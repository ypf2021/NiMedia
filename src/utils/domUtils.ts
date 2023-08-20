import { DOMProps, Node } from "../types/Player";

export function getDOMPoint(dom: HTMLElement): { x: number, y: number } {
    var t = 0;
    var l = 0;
    //判断是否有父容器，如果存在则累加其边距
    while (dom !== document.body) {
        t += dom.offsetTop; //叠加父容器的上边距
        l += dom.offsetLeft; //叠加父容器的左边距
        //if(dom.style.borderLeftWidth) l += Number(dom.style.borderLeftWidth);
        //if(dom.style.borderTopWidth) t += Number(dom.style.borderTopWidth);
        dom = dom.parentNode as HTMLElement;
    }
    return { x: l, y: t };
}

/**
 * @description 查看当前的鼠标位置是否在父元素和绝对定位的子元素的组合范围内，如果超出则返回false
 * @param parent 
 * @param topChild 
 * @param pageX 
 * @param pageY 
 * @returns {boolean}
 */


export function checkIsMouseInRange(parent: HTMLElement, topChild: HTMLElement, pageX: number, pageY: number) {
    let { x, y } = getDOMPoint(parent);
    let allTop = y - parseInt(topChild.style.bottom) - topChild.clientHeight;
    let allBottom = y + parent.clientHeight;
    let allLeft = x + Math.round(parent.clientWidth / 2) - Math.round(topChild.clientWidth / 2);
    let allRight = x + Math.round(parent.clientWidth / 2) + Math.round(topChild.clientWidth / 2);
    let parentLeft = x;
    let parentRight = x + parent.clientWidth;
    if (pageX >= allLeft && pageX <= allRight && pageY <= y && pageY >= allTop) return true;
    if (pageX >= parentLeft - 5 && pageX <= parentRight + 5 && pageY >= y && pageY <= allBottom) return true;
    return false;
}

// 用于匹配 HTML/CSS 类选择器的模式 匹配 element #id .class element#id element.class element#id.class
const SELECTOR_REG = /([\w-]+)?(?:#([\w-]+))?(?:\.([\w-]+))?/;

/**
 * @description 根据desc的标签描述和props的属性描述来创建一个DOM对象，并且在实例上挂载各种属性
 * @param {string} desc 
 * @param {DOMProps} props 
 * @param {Node[]} children 
 * @returns 
 */

export function $<T extends HTMLElement>(desc?: string, props?: DOMProps, children?: string | Array<Node>): T {
    let match = [];
    let regArray = SELECTOR_REG.exec(desc)
    match[0] = regArray[1] || undefined; // element
    match[1] = regArray[2] || undefined; // #
    match[2] = regArray[3] || undefined; // .

    let el: HTMLElement = match[0] ? document.createElement(match[0]) : document.createElement("div");
    if (match[1]) {
        el.id = match[1];
    }
    match[2] && addClass(el, [match[2]]);

    // 添加属性， 对象先考虑是 style的情况
    for (let key in props) {
        if (typeof props[key] === "object") {
            if (key === "style") {
                let str = ""
                let styles = props[key];
                for (let k in styles) {
                    str += `${k}: ${styles[k]};`
                }
                el.setAttribute("style", str);
            } else { }
        } else {
            el.setAttribute(key, String(props[key]));
        }
    }

    // 如果child是 string 一般是文本节点 
    if (typeof children === "string") {
        el.innerHTML += children;
    } else if (children) {
        for (let child of children) {
            el.appendChild(child.el);
        }
    }

    return el as T;
}

export function addClass(dom: HTMLElement, classNames: Array<string>) {
    let classList = dom.classList;
    for (let name of classNames) {
        if (!includeClass(dom, name)) {
            classList.add(name);
        }
    }
}

export function includeClass(dom: HTMLElement, className: string): boolean {
    let classList = dom.classList;
    for (let key in classList) {
        if (classList[key] === className) return true;
    }
    return false
}

/**
 * @description 根据传入的字符串(querySelector)获取对应的DOM元素
 * @param dom 
 * @returns {HTMLElement | null}
 */
export function getEl(dom: HTMLElement | string): HTMLElement | null {
    if (dom instanceof HTMLElement) return dom;
    if (typeof dom === "string") {
        return document.querySelector(dom);
    }
}


export function removeClass(dom: HTMLElement, classNames: Array<string>) {
    let classList = dom.classList;
    classList.remove(...classNames);
}

export function changeClass(dom: HTMLElement, className) {
    dom.className = className;
}

export function getElementSize(
    dom: HTMLElement,
): { width: number; height: number } {
    // 深度克隆，连带子节点
    const clone = dom.cloneNode(true) as HTMLElement;
    clone.style.position = 'absolute';
    clone.style.opacity = '0';
    clone.removeAttribute('hidden');

    const parent = dom.parentNode || document.body;

    parent.appendChild(clone);

    // 用于获取指定元素相对于视口（viewport）的位置信息。它返回一个 DOMRect 对象，其中包含了元素的位置、尺寸和其他相关信息。 rect.x, y , width. height ,right , bottom
    const rect = clone.getBoundingClientRect();

    parent.removeChild(clone);

    return rect;
}

// SVG相关
const svgNS = 'http://www.w3.org/2000/svg';

export function createSvg(d?: string, viewBox = '0 0 1024 1024'): SVGSVGElement {
    // NS代表XML结构的 命名空间 xmlns="http://www.w3.org/2000/svg"
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', viewBox);
    if (d) {
        const path = document.createElementNS(svgNS, 'path');
        path.setAttributeNS(null, 'd', d);
        svg.appendChild(path);
    }
    return svg;
}

export function setSvgPath(svg: SVGSVGElement, d: string) {
    const path = svg.getElementsByTagNameNS(svgNS, "path")[0];
    path.setAttributeNS(null, "d", d);
}

export function createSvgs(d: string[], viewBox = '0 0 1024 1024'): SVGSVGElement {
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', viewBox);
    for (let str of d) {
        const path = document.createElementNS(svgNS, 'path');
        path.setAttributeNS(null, 'd', str);
        svg.appendChild(path);
    }
    return svg;
}