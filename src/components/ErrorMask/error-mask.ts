import { $warn, styles, icon } from "../../index";
import "./error-mask.less";

export class ErrorMask {
    private template_!: string | HTMLElement;
    private container!: HTMLElement;

    constructor(container: HTMLElement) {
        this.container = container;
        this.init();
    }

    init() {
        this.template_ = this.generateErrorMask();
    }

    get template(): string | HTMLElement {
        return this.template_
    }

    generateErrorMask(): HTMLElement {
        let mask = document.createElement("div") as HTMLElement;
        mask.className = styles["error-mask"];
        let errorContainer = document.createElement('div') as HTMLElement;
        errorContainer.className = styles['error-container'];
        let errorItem = document.createElement("div") as HTMLElement;
        errorItem.className = styles["error-item"];
        let i = document.createElement("i") as HTMLElement;
        i.className = `${icon["iconfont"]} ${icon['icon-cuowutishi']}`
        errorItem.appendChild(i);
        let errorTitle = document.createElement("div") as HTMLElement;
        errorTitle.className = styles["error-title"];
        errorTitle.innerText = "视频加载发生错误";
        errorContainer.appendChild(errorItem);
        errorContainer.appendChild(errorTitle);
        mask.appendChild(errorContainer);

        return mask;
    }

    // 添加错误的mask
    addErrorMask() {
        // 没蒙层的情况下才展示
        if (![...this.container.children].includes(this.template as HTMLElement)) {
            this.container.appendChild(this.template as HTMLElement)
        }
    }

    // 移除错误mask
    removeErrorMask() {
        if ([...this.container.children].includes(this.template as HTMLElement)) {
            // ToDo
            this.container.removeChild(this.template as HTMLElement);
        }
    }
}