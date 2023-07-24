import { styles } from "../../index";
import "./loading-mask.less";
export class LoadingMask {
    constructor() {
        this.init();
    }
    get template() {
        return this.template;
    }
    init() {
        let mask = document.createElement("div");
        mask.className = styles["loading-mask"];
        let loadingContainer = document.createElement("div");
        loadingContainer.className = styles["loading-container"];
        let loaadingItem = document.createElement("div");
        loaadingItem.className = styles["loading-item"];
        let loadingTitle = document.createElement("div");
        loadingTitle.className = styles["loading-title"];
        loadingTitle.innerText = "视频正在努力加载中...";
        loadingContainer.appendChild(loaadingItem);
        loadingContainer.appendChild(loadingTitle);
        mask.appendChild(loadingContainer);
        this.template_ = mask;
    }
}
//# sourceMappingURL=loading-mask.js.map