import { styles, Progress, Controller } from "../../index";
import "./toolbar.less";
// 音乐播放器的工具栏组件
export class ToolBar {
    constructor() {
        this.init();
    }
    get template() {
        return this.template_;
    }
    ;
    init() {
        let div = document.createElement("div");
        div.className = `${styles["video-controls"]} ${styles["video-controls-hidden"]}`;
        div.innerHTML += new Progress().template;
        div.innerHTML += new Controller().template;
        this.template_ = div;
    }
}
//# sourceMappingURL=toolbar.js.map