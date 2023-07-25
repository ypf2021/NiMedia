import "./error-mask.less";
export declare class ErrorMask {
    private template_;
    private container;
    constructor(container: HTMLElement);
    init(): void;
    get template(): string | HTMLElement;
    generateErrorMask(): HTMLElement;
    addErrorMask(): void;
    removeErrorMask(): void;
}
