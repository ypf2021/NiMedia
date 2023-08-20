export type PlayerOptions = {
    url: string;
    container: HTMLElement;
    autoPlaye?: boolean;
    width?: string;
    height?: string;
};
export type DOMProps = {
    className?: string[] | {
        [key: string]: boolean;
    };
    id?: string;
    style?: Partial<CSSStyleDeclaration>;
    [props: string]: any;
};
export interface ComponentItem {
    id: string;
    el: HTMLElement;
    props?: DOMProps;
    [props: string]: any;
}
export interface Node {
    id: string;
    el: HTMLElement;
}
