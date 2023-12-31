import { $warn, styles, ToolBar } from "../../index";
;
import "./player.less";
class Player {
    constructor(options) {
        this.playerOptions = {
            url: "",
            autoplay: false,
            width: "100%",
            height: "100%",
        };
        this.playerOptions = Object.assign(this.playerOptions, options);
        this.init();
        this.initComponent();
        this.initContainer();
    }
    init() {
        let container = this.playerOptions.container;
        if (!this.isTagValidate(container)) {
            $warn("你传入的容器的元素类型不适合，建议传入块元素或者行内块元素，拒绝传入具有交互类型的元素例如input框等表单类型的元素");
        }
        this.container = container;
    }
    initComponent() {
        let toolbar = new ToolBar();
        this.toolbar = toolbar;
    }
    initContainer() {
        this.container.style.width = this.playerOptions.width;
        this.container.style.height = this.playerOptions.height;
        this.container.className = styles['video-container'];
        this.container.innerHTML = `
            <div class="${styles["video-wrapper"]}">
            <video>
                <source src="${this.playerOptions.url}" type="video/mp4">
                你的浏览器暂不支持HTML5标签,非常抱歉
                </source>
            </video>
            </div>
        `;
        this.container.appendChild(this.toolbar.template);
    }
    // 判定元素是否为合理的元素  不可以是行内元素和可交互的行内块级元素
    isTagValidate(ele) {
        //window.getComputedStyle 获取元素的css样式 只读
        if (window.getComputedStyle(ele).display === 'block')
            return true;
        if (window.getComputedStyle(ele).display === 'inline')
            return false;
        if (window.getComputedStyle(ele).display === 'inline-block') {
            if (ele instanceof HTMLImageElement ||
                ele instanceof HTMLAudioElement ||
                ele instanceof HTMLVideoElement ||
                ele instanceof HTMLInputElement ||
                ele instanceof HTMLCanvasElement ||
                ele instanceof HTMLButtonElement) {
                return false;
            }
            return true;
        }
        return true;
    }
}
export { Player };
//# sourceMappingURL=player.js.map