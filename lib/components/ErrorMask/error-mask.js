import { styles, icon } from "../../index";
import "./error-mask.less";
export class ErrorMask {
    constructor() {
        this.init();
    }
    init() {
        this.template_ = this.generateErrorMask();
    }
    generateErrorMask() {
        let mask = document.createElement("div");
        mask.className = styles["error-mask"];
        let errorContainer = document.createElement('div');
        errorContainer.className = styles['error-container'];
        let errorItem = document.createElement("div");
        errorItem.className = styles["error-item"];
        let i = document.createElement("i");
        i.className = `${icon["iconfont"]} ${icon['icon-cuowutishi']}`;
        errorItem.appendChild(i);
        let errorTitle = document.createElement("div");
        errorTitle.className = styles["error-title"];
        errorTitle.innerText = "视频加载发生错误";
        errorContainer.appendChild(errorItem);
        errorContainer.appendChild(errorTitle);
        mask.appendChild(errorContainer);
        return mask;
    }
}
//# sourceMappingURL=error-mask.js.map