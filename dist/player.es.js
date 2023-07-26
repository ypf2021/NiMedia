// 写一个发布订阅模式的类，供其他类继承
class BaseEvent {
    constructor() {
        this.$events = {};
    }
    // 事件触发
    emit(event, ...args) {
        if (this.$events[event]) {
            this.$events[event].forEach((cb, index) => {
                cb.call(this, ...args);
            });
        }
    }
    // 事件监听/注册
    on(event, cb) {
        this.$events[event] = this.$events[event] || [];
        this.$events[event].push(cb);
    }
}

function $warn(msg) {
    throw new Error(msg);
}

const styles = {
    "video-container": "player_video-container__I9fU2",
    "video-wrapper": "player_video-wrapper__tN3j3",
    "video-controls": "toolbar_video-controls__wzQC1",
    "video-controls-hidden": "toolbar_video-controls-hidden__PscSU",
    "video-progress": "progress_video-progress__DMF70",
    "video-pretime": "progress_video-pretime__gDMzS",
    "video-buffered": "progress_video-buffered__xlu1O",
    "video-completed": "progress_video-completed__j0yvy",
    "video-dot": "progress_video-dot__u2nX7",
    "video-dot-hidden": "progress_video-dot-hidden__S-oLG",
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
    iconfont: "main_iconfont__rq6b0",
    "icon-bofang": "main_icon-bofang__jDO5s",
    "icon-shezhi": "main_icon-shezhi__jiDcS",
    "icon-yinliang": "main_icon-yinliang__dvwc6",
    "icon-quanping": "main_icon-quanping__P8j59",
    "icon-cuowutishi": "main_icon-cuowutishi__Pp9HP",
    "icon-zanting": "main_icon-zanting__y4zTz",
};

class Controller extends BaseEvent {
    constructor(container) {
        super();
        this.container = container;
        this.init();
        this.initEvent();
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
    // 控制栏的事件 开始播放/关闭播放 ，全屏，设置
    initControllerEvent() {
        this.videoPlayBtn.onclick = (e) => {
            if (this.video.paused) {
                this.video.play();
            }
            else if (this.video.played) {
                this.video.pause();
            }
        };
        // 开启和关闭全屏
        this.fullScreen.onclick = () => {
            if (this.container.requestFullscreen && !document.fullscreenElement) {
                // Element.requestFullscreen() 方法用于发出异步请求使元素进入全屏模式。(返回一个promise)
                this.container.requestFullscreen();
            }
            else if (document.fullscreenElement) {
                document.exitFullscreen(); // 退出全屏函数仅仅绑定在document对象上，该点需要切记！！！
            }
        };
    }
    initEvent() {
        // 启动视频
        this.on("play", () => {
            this.videoPlayBtn.className = `${icon["iconfont"]} ${icon["icon-zanting"]}`;
        });
        // 暂停视频
        this.on("pause", () => {
            this.videoPlayBtn.className = `${icon["iconfont"]} ${icon["icon-bofang"]}`;
        });
        // 加载视频数据
        this.on("loadedmetadata", (summary) => {
            this.summaryTime.innerHTML = formatTime(summary);
        });
        // 时间更新
        this.on("timeupdate", (current) => {
            this.currentTime.innerHTML = formatTime(current);
        });
        // 初始化时进行变量注册
        this.on("mounted", () => {
            this.videoPlayBtn = this.container.querySelector(`.${styles["video-start-pause"]} i`);
            this.currentTime = this.container.querySelector(`.${styles["video-duration-completed"]}`);
            this.summaryTime = this.container.querySelector(`.${styles["video-duration-all"]}`);
            this.video = this.container.querySelector("video");
            this.fullScreen = this.container.querySelector(`.${styles["video-fullscreen"]} i`);
            this.initControllerEvent();
        });
    }
}

class ErrorMask {
    constructor(container) {
        this.container = container;
        this.init();
    }
    init() {
        this.template_ = this.generateErrorMask();
    }
    get template() {
        return this.template_;
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
    // 添加错误的mask
    addErrorMask() {
        // 没蒙层的情况下才展示
        if (![...this.container.children].includes(this.template)) {
            this.container.appendChild(this.template);
        }
    }
    // 移除错误mask
    removeErrorMask() {
        if ([...this.container.children].includes(this.template)) {
            // ToDo
            this.container.removeChild(this.template);
        }
    }
}

class LoadingMask {
    constructor(container) {
        this.container = container;
        this.init();
    }
    get template() {
        return this.template_;
    }
    init() {
        this.template_ = this.generateLoadingMask();
    }
    generateLoadingMask() {
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
        return mask;
    }
    addLoadingMask() {
        if (![...this.container.children].includes(this.template)) {
            this.container.appendChild(this.template);
        }
    }
    removeLoadingMask() {
        if ([...this.container.children].includes(this.template)) {
            this.container.removeChild(this.template);
        }
    }
}

// 进度条组件
class Progress extends BaseEvent {
    constructor(container) {
        super();
        this.mouseDown = false;
        this.container = container;
        this.init();
        this.initEvent();
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
    initEvent() {
        // 初始化注册变量
        this.on("mounted", () => {
            this.progress = this.container.querySelector(`.${styles["video-controls"]} .${styles["video-progress"]}`);
            this.pretime = this.progress.children[0];
            this.bufferedProgress = this.progress.children[1];
            this.completedProgress = this.progress.children[2];
            this.dot = this.progress.children[3];
            this.video = this.container.querySelector("video");
            this.initProgressEvent();
        });
        this.on("timeupdate", (current) => {
            let scaleCurr = (this.video.currentTime / this.video.duration) * 100;
            let scaleBuffer = ((this.video.buffered.end(0) + this.video.currentTime) / this.video.duration) * 100;
            this.completedProgress.style.width = scaleCurr + "%";
            this.dot.style.left = this.progress.offsetWidth * (scaleCurr / 100) - 5 + "px";
            this.bufferedProgress.style.width = scaleBuffer + "%";
        });
        this.on("loadedmetadata", (summary) => { });
    }
    initProgressEvent() {
        this.progress.onmouseenter = () => {
            console.log("progress onmouseenter");
            this.dot.className = `${styles["video-dot"]}`;
        };
        this.progress.onmouseleave = () => {
            // 如果没有一直按着，离开的时候就隐藏
            if (!this.mouseDown) {
                this.dot.className = `${styles["video-dot"]} ${styles["video-dot-hidden"]}`;
            }
        };
        // 点击进度条 切换播放位置，点的位置，进度条的位置
        this.progress.onclick = (e) => {
            // 防止dot在progress上移动并放开的时候触发 process.onclick
            if (e.target == this.dot) {
                return;
            }
            // 算出位置的百分比
            // 此处有遗留bug
            let scale = e.offsetX / this.progress.offsetWidth;
            console.log("scale", e, scale, e.offsetX, this.progress.offsetWidth);
            if (scale < 0) {
                console.log("scale == 0");
                scale = 0;
            }
            else if (scale > 1) {
                console.log("scale == 1");
                scale = 1;
            }
            this.dot.style.left = this.progress.offsetWidth * scale - 5 + "px";
            this.bufferedProgress.style.width = scale * 100 + "%";
            this.completedProgress.style.width = scale * 100 + "%";
            // 设置播放位置
            this.video.currentTime = Math.floor(scale * this.video.duration);
            if (this.video.paused)
                this.video.play();
        };
        // progress上面移动  时展示当前的时间
        this.progress.onmousemove = (e) => {
            let scale = e.offsetX / this.progress.offsetWidth;
            if (scale < 0) {
                scale = 0;
            }
            else if (scale > 1) {
                scale = 1;
            }
            let pretime = formatTime(scale * this.video.duration);
            this.pretime.style.display = "block";
            this.pretime.innerHTML = pretime;
            this.pretime.style.left = e.offsetX - 17 + "px";
            e.preventDefault();
        };
        this.progress.onmouseleave = (e) => {
            this.pretime.style.display = "none";
        };
        // 点击dot的事件
        this.dot.addEventListener("mousedown", (e) => {
            let left = this.completedProgress.offsetWidth; //点击时，相对于进度条的位置
            let mouseX = e.pageX; // 点击时相对于页面的位置
            this.mouseDown = true;
            document.onmousemove = (e) => {
                // e.pageX - mouseX + left   移动过的距离 + 原本的距离
                let scale = (e.pageX - mouseX + left) / this.progress.offsetWidth;
                if (scale < 0) {
                    scale = 0;
                }
                else if (scale > 1) {
                    scale = 1;
                }
                this.dot.style.left = this.progress.offsetWidth * scale - 5 + "px";
                this.bufferedProgress.style.width = scale * 100 + "%";
                this.completedProgress.style.width = scale * 100 + "%";
                this.video.currentTime = Math.floor(scale * this.video.duration);
                if (this.video.paused)
                    this.video.play();
                e.preventDefault();
            };
            document.onmouseup = (e) => {
                document.onmousemove = document.onmouseup = null;
                this.mouseDown = false;
                e.preventDefault();
            };
            e.preventDefault();
        });
    }
}

// 音乐播放器的工具栏组件 ( progress + controller )
class ToolBar extends BaseEvent {
    constructor(container) {
        super();
        this.container = container;
        this.init();
        this.initComponent();
        this.initTemplate();
        this.initEvent();
    }
    get template() {
        return this.template_;
    }
    ;
    init() { }
    // 注册 进度条 和 控制器
    initComponent() {
        this.progress = new Progress(this.container); // 进度条
        this.controller = new Controller(this.container); //下面的控制器
    }
    // 组合 进度条 和 控制器的template
    initTemplate() {
        let div = document.createElement("div");
        div.className = `${styles["video-controls"]} ${styles["video-controls-hidden"]}`;
        div.innerHTML += this.progress.template;
        div.innerHTML += this.controller.template;
        this.template_ = div;
    }
    // 显示和隐藏toolbar
    showToolBar(e) {
        //工具栏的总容器
        this.container.querySelector(`.${styles["video-controls"]}`).className = `${styles["video-controls"]}`;
        if (e.target !== this.video) ;
        else {
            // 一个防抖
            this.timer = window.setTimeout(() => {
                this.hideToolBar();
            }, 3000);
        }
    }
    hideToolBar() {
        this.container.querySelector(`.${styles["video-controls"]}`).className = `${styles["video-controls"]} ${styles["video-controls-hidden"]}`;
    }
    initEvent() {
        this.on("showtoolbar", (e) => {
            // 防抖
            if (this.timer) {
                clearTimeout(this.timer);
                this.timer = null;
            }
            this.showToolBar(e);
        });
        this.on("hidetoolbar", () => {
            this.hideToolBar();
        });
        this.on("loadedmetadata", (summary) => {
            this.controller.emit("loadedmetadata", summary);
            this.progress.emit("loadedmetadata", summary);
        });
        this.on("timeupdate", (current) => {
            this.controller.emit("timeupdate", current);
            this.progress.emit("timeupdate", current);
        });
        this.on("mounted", () => {
            this.video = this.container.querySelector("video");
            this.controller.emit("mounted");
            this.progress.emit("mounted");
        });
        this.on("play", () => {
            this.controller.emit("play");
        });
        this.on("pause", () => {
            this.controller.emit("pause");
        });
    }
}

class Player extends BaseEvent {
    constructor(options) {
        super();
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
        this.initEvent();
    }
    ;
    init() {
        let container = this.playerOptions.container;
        if (!this.isTagValidate(container)) {
            $warn("你传入的容器的元素类型不适合，建议传入块元素或者行内块元素，拒绝传入具有交互类型的元素例如input框等表单类型的元素");
        }
        this.container = container;
    }
    ;
    initComponent() {
        this.toolbar = new ToolBar(this.container);
        this.loadingMask = new LoadingMask(this.container);
        this.errorMask = new ErrorMask(this.container);
    }
    ;
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
        this.video = this.container.querySelector("video");
        // 执行toolbar的mounted
        // this.toolbar.emit("mounted")
    }
    ;
    initEvent() {
        // 自动播放
        this.on("mounted", (ctx) => {
            ctx.playerOptions.autoplay && ctx.video.play();
        });
        // 初始化
        this.toolbar.emit("mounted");
        this.emit("mounted", this);
        this.container.onclick = (e) => {
            if (e.target == this.video) {
                if (this.video.paused) {
                    this.video.play();
                }
                else if (this.video.played) {
                    this.video.pause();
                }
            }
        };
        //鼠标移入总体容器和移动时都会触发 showToolbar，判断是否隐藏。
        this.container.addEventListener("mouseenter", (e) => {
            this.toolbar.emit("showToolbar", e);
        });
        this.container.addEventListener("mousemove", (e) => {
            this.toolbar.emit("showtoolbar", e);
        });
        // 鼠标离开容器后进行隐藏
        this.container.addEventListener("mouseleave", (e) => {
            this.toolbar.emit("hidetoolbar");
        });
        // 视频加载完成后触发     loadedmetadata事件在元数据（metadata）被加载完成后触发。
        this.video.addEventListener("loadedmetadata", (e) => {
            // HTMLMediaElement.duration 属性以秒为单位给出媒体的长度
            console.log("元数据加载完毕", this.video.duration);
            this.toolbar.emit("loadedmetadata", this.video.duration);
        });
        // currentTime更新时触发  当currentTime更新时会触发timeupdate事件。
        // HTMLMediaElement.currentTime 属性会以秒为单位返回当前媒体元素的播放时间
        this.video.addEventListener("timeupdate", (e) => {
            this.toolbar.emit("timeupdate", this.video.currentTime);
        });
        // 当视频可以再次播放的时候就移除loading和error的mask，
        // 通常是为了应对在播放的过程中出现需要缓冲或者播放错误这种情况从而需要展示对应的mask
        // 开始播放
        this.video.addEventListener("play", (e) => {
            console.log("视频播放 play");
            this.loadingMask.removeLoadingMask();
            this.errorMask.removeErrorMask();
            this.toolbar.emit("play");
        });
        // 暂停
        this.video.addEventListener("pause", (e) => {
            console.log("视频暂停 pause");
            this.toolbar.emit("pause");
        });
        // 等待     当回放因暂时缺少数据而停止时，将触发等待事件。
        this.video.addEventListener("waiting", (e) => {
            console.log("视频缺少数据 waiting");
            this.loadingMask.removeLoadingMask();
            this.errorMask.removeErrorMask();
            this.loadingMask.addLoadingMask();
        });
        // 出错     当用户代理试图获取媒体数据，但数据意外地没有到来时，将触发stalled事件。
        this.video.addEventListener("stalled", (e) => {
            console.log("视频加载发生错误stalled");
            this.loadingMask.removeLoadingMask();
            this.errorMask.removeErrorMask();
            this.errorMask.addErrorMask();
        });
        // 出错    error 事件会在因为一些错误（如网络连接错误）导致无法加载资源的时候触发。
        this.video.addEventListener("error", (e) => {
            console.log("视频加载发生错误error");
            this.loadingMask.removeLoadingMask();
            this.errorMask.removeErrorMask();
            this.errorMask.addErrorMask();
        });
        // 没完全加载    资源没有被完全加载时就会触发 abort 事件，但错误不会触发该事件。
        this.video.addEventListener("abort", (e) => {
            console.log("视频正在加载 abort");
            this.loadingMask.removeLoadingMask();
            this.errorMask.removeErrorMask();
            this.errorMask.addErrorMask();
        });
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

//  格式化播放时间工具
function addZero(num) {
    return num > 9 ? "" + num : "0" + num;
}
function formatTime(seconds) {
    seconds = Math.floor(seconds);
    let minute = Math.floor(seconds / 60);
    let second = seconds % 60;
    return addZero(minute) + ":" + addZero(second);
}

let LOADING_MASK_MAP = new Array();
let ERROR_MASK = new Array();

console.log('hello');

export { $warn, BaseEvent, Controller, ERROR_MASK, ErrorMask, LOADING_MASK_MAP, LoadingMask, Player, Progress, ToolBar, formatTime, icon, styles };
