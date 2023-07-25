function $warn(msg) {
    throw new Error(msg);
}

const styles = {
    "video-container": "player_video-container__I9fU2",
    "video-wrapper": "player_video-wrapper__tN3j3",
    "video-controls": "toolbar_video-controls__wzQC1",
    "video-controls-hidden": "",
    "video-progress": "progress_video-progress__DMF70",
    "video-pretime": "progress_video-pretime__gDMzS",
    "video-buffered": "pregress_video-buffered__xlu1O",
    "video-completed": "pregress_video-completed__j0yvy",
    "video-dot": "pregress_video-dot__u2nX7",
    "video-dot-hidden": "pregress_video-dot-hidden__S-oLG",
    "video-play": "controller_video-play__aWE0Y",
    "video-subplay": "controller_video-subplay__ywUzK",
    "video-start-pause": "controller_video-start-pause__JnB3x",
    "video-duration": "controller_video-duration__8upHt",
    "video-duration-completed": "controller_video-duration-completed__PYm69",
    "video-settings": "controller_video-settings__SiNyl",
    "video-subsettings": "controller_video-subsettings__6Jtl7",
    "video-volume": "controller_video-volume__R8ory",
    "video-volume-progress": "controller_video-volume-progress__9FkAX",
    "video-volume-completed": "controller_video-volume-completed__zwRNX",
    "video-volume-dot": "pregress_video-dot__giuCI",
    "video-fullscreen": "controller_video-fullscreen__ZLYIr",
    "video-duration-all": "controller_video-duration-all__gGLip",
    "loading-mask": "",
    "loading-container": "",
    "loading-item": "",
    "loading-title": "",
    "error-mask": "",
    "error-container": "",
    "error-item": "",
    "error-title": ""
};

const icon = {
    "iconfont": "",
    "icon-bofang": "",
    "icon-shezhi": "",
    "icon-yinliang": "",
    "icon-quanping": "",
    "icon-cuowutishi": ""
};

class Controller {
    constructor() {
        this.init();
    }
    get template() {
        return this.template_;
    }
    init() {
        this.template_ = `
            <div class="${styles["video-play"]}">
                <div class="${styles["video-subplay"]}">
                    <div class="${styles["video-start-pause"]}">
                        <i class="${icon["iconfont"]} ${icon["icon-bofang"]}"></i>
                    </div>
                    <div class="${styles["video-duration"]}">
                        <span class="${styles["video-duration-completed"]}">00:00</span>&nbsp;/&nbsp;<span class="${styles["video-duration-all"]}">00:00</span>
                    </div>
                </div>
                <div class="${styles["video-settings"]}">
                    <div class="${styles["video-subsettings"]}">
                        <i class="${icon["iconfont"]} ${icon["icon-shezhi"]}"></i>
                    </div>
                    <div class="${styles["video-volume"]}">
                        <i class="${icon["iconfont"]} ${icon["icon-yinliang"]}"></i>
                        <div class="${styles["video-volume-progress"]}">
                            <div class="${styles["video-volume-completed"]}"></div>
                            <div class="${styles["video-volume-dot"]}"></div>
                        </div>
                    </div>
                    <div class="${styles["video-fullscreen"]}">
                        <i class="${icon["iconfont"]} ${icon["icon-quanping"]}"></i>
                    </div>
                </div>
            </div>
        `;
    }
}

class ErrorMask {
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

class LoadingMask {
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

// 进度条组件
class Progress {
    constructor() {
        this.init();
    }
    get template() {
        return this.template_;
    }
    init() {
        this.template_ = `
            <div class="${styles["video-progress"]}">
                <div class="${styles["video-pretime"]}">00:00</div>
                <div class="${styles["video-buffered"]}"></div>
                <div class="${styles["video-completed"]} "></div>
                <div class="${styles["video-dot"]} ${styles["video-dot-hidden"]}"></div>
            </div>
        `;
    }
}

// 音乐播放器的工具栏组件 ( progress + controller )
class ToolBar {
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

console.log('hello');

export { $warn, Controller, ErrorMask, LoadingMask, Player, Progress, ToolBar, icon, styles };
