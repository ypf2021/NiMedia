import { Player } from "../page/player";

export type PlayerOptions = {
    url: string;
    container: HTMLElement;
    autoPlaye?: boolean;
    width?: string;
    height?: string;
}

export type DOMProps = {
    className?: string[];
    id?: string;
    style?: Partial<CSSStyleDeclaration>;
    [props: string]: any
}

// ComponentItem用于描述一个组件
export interface ComponentItem {
    id: string;
    el: HTMLElement;
    props: DOMProps;
    [props: string]: any
}



export interface Node {
    id: string;
    el: HTMLElement;
}

export type Plugin = {
    install: (player: Player) => any;
}

export type registerOptions = {
    replaceElementType?: "replaceOuterHTMLOfComponent" | "replaceInnerHTMLOfComponent"
}

// getFunctionParametersType，它用于从函数类型 T 中提取参数的类型。
// 接收一个 泛型T T只能为函数类型
export type getFunctionParametersType<T extends (...args: any[]) => any> = T extends (...args: (infer T)[]) => infer U ? T : never;