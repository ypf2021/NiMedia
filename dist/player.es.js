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
// 将 Time 类型的时间转换为秒
function switchToSeconds(time) {
    if (!time) {
        return null;
    }
    let sum = 0;
    if (time.hours)
        sum += time.hours * 3600;
    if (time.minutes)
        sum += time.minutes * 60;
    if (time.seconds)
        sum += time.seconds;
    return sum;
}
// 解析MPD文件的时间字符串
// Period 的 start 和 duration 属性使用了 NPT 格式表示该期间的开始时间和持续时间，即 PT0S 和 PT60S
function parseDuration(pt) {
    // NPT 格式的字符串以 PT 开头，后面跟着一个时间段的表示，例如 PT60S 表示 60 秒的时间段。时间段可以包含以下几个部分：
    // H: 表示小时。
    // M: 表示分钟。
    // S: 表示秒。
    // F: 表示帧数。
    // T: 表示时间段的开始时间。
    if (!pt) {
        return null;
    }
    let hours, minutes, seconds;
    for (let i = pt.length - 1; i >= 0; i--) {
        if (pt[i] === "S") {
            let j = i;
            while (pt[i] !== "M" && pt[i] !== "H" && pt[i] !== "T") {
                i--;
            }
            i += 1;
            seconds = parseInt(pt.slice(i, j));
        }
        else if (pt[i] === "M") {
            let j = i;
            while (pt[i] !== "H" && pt[i] !== "T") {
                i--;
            }
            i += 1;
            minutes = parseInt(pt.slice(i, j));
        }
        else if (pt[i] === "H") {
            let j = i;
            while (pt[i] !== "T") {
                i--;
            }
            i += 1;
            hours = parseInt(pt.slice(i, j));
        }
    }
    return {
        hours,
        minutes,
        seconds,
    };
}

/**
 * @description 类型守卫函数
 */
function checkMediaType(s) {
    if (!s) {
        return true;
    }
    return (s === "video/mp4" ||
        s === "audio/mp4" ||
        s === "text/html" ||
        s === "text/xml" ||
        s === "text/plain" ||
        s === "image/png" ||
        s === "image/jpeg");
}
/**
 * @description 类型守卫函数 ---> 以下都是通过tag进行判断
 */
function checkBaseURL(s) {
    if (s.tag === "BaseURL" && typeof s.url === "string")
        return true;
    return false;
}
/**
 * @description 类型守卫函数
 */
function checkAdaptationSet(s) {
    if (s.tag === "AdaptationSet")
        return true;
    return false;
}
/**
 * @description 类型守卫函数
 */
function checkSegmentTemplate(s) {
    return s.tag === "SegmentTemplate";
}
/**
 * @description 类型守卫函数
 */
function checkRepresentation(s) {
    return s.tag === "Representation";
}
/**
 * @description 类型守卫函数
 */
function checkSegmentList(s) {
    return s.tag === "SegmentList";
}
function checkInitialization(s) {
    return s.tag === "Initialization";
}
function checkSegmentURL(s) {
    return s.tag === "SegmentURL";
}
function checkSegmentBase(s) {
    return s.tag === "SegmentBase";
}
// 检查工具
let checkUtils = {
    checkMediaType,
    checkBaseURL,
    checkAdaptationSet,
    checkSegmentTemplate,
    checkRepresentation,
    checkSegmentList,
    checkInitialization,
    checkSegmentURL,
    checkSegmentBase
};
// 如果是上面的类型的标签返回true，否则返回false
function findSpecificType(array, type) {
    array.forEach(item => {
        if (checkUtils[`check${type}`] && checkUtils[`check${type}`].call(this, item)) {
            return true;
        }
    });
    return false;
}

function string2boolean(s) {
    if (s === "true") {
        return true;
    }
    else if (s === "false") {
        return false;
    }
    else {
        return null;
    }
}
function string2number(s) {
    let n = Number(s);
    if (!isNaN(n))
        return n;
    else
        return null;
}

function initMpdFile(mpd) {
    return {
        tag: "File",
        root: initMpd(mpd.querySelector("MPD"))
    };
}
function initMpd(mpd) {
    let type = mpd.getAttribute("type");
    let availabilityStartTime = mpd.getAttribute("availabilityStartTime");
    let mediaPresentationDuration = mpd.getAttribute("mediaPresentationDuration");
    let minBufferTime = mpd.getAttribute("minBufferTime");
    let minimumUpdatePeriod = mpd.getAttribute("minimumUpdatePeriod");
    let maxSegmentDuration = mpd.getAttribute("maxSegmentDuration");
    let children = new Array();
    mpd.querySelectorAll("Period").forEach(item => {
        children.push(initPeriod(item));
    });
    return {
        tag: "MPD",
        type,
        children,
        availabilityStartTime,
        mediaPresentationDuration,
        minBufferTime,
        minimumUpdatePeriod,
        maxSegmentDuration
    };
}
function initPeriod(period) {
    let id = period.getAttribute("id");
    let duration = period.getAttribute("duration");
    let start = period.getAttribute("start");
    let children = new Array();
    period.querySelectorAll("AdaptationSet").forEach((item) => {
        children.push(initAdaptationSet(item));
    });
    return {
        tag: "Period",
        id,
        duration,
        start,
        children,
    };
}
function initAdaptationSet(adaptationSet) {
    let segmentAlignment = string2boolean(adaptationSet.getAttribute("segmentAlignment"));
    let mimeType = adaptationSet.getAttribute("mimeType");
    if (checkMediaType(mimeType)) {
        let startWithSAP = string2number(adaptationSet.getAttribute("startWithSAP"));
        let segmentTemplate = adaptationSet.querySelector("SegmentTemplate");
        let children = new Array();
        if (segmentTemplate) {
            children.push(initSegmentTemplate(segmentTemplate));
        }
        adaptationSet.querySelectorAll("Representation").forEach((item) => {
            children.push(initRepresentation(item));
        });
        return {
            tag: "AdaptationSet",
            children,
            segmentAlignment,
            mimeType,
            startWithSAP,
        };
    }
    else {
        $warn("传入的MPD文件中的AdaptationSet标签上的属性mimeType的值不合法，应该为MIME类型");
    }
}
function initRepresentation(representation) {
    let bandWidth = Number(representation.getAttribute("bandwidth"));
    let codecs = representation.getAttribute("codecs");
    let id = representation.getAttribute("id");
    let width = Number(representation.getAttribute("width"));
    let height = Number(representation.getAttribute("height"));
    let mimeType = representation.getAttribute("mimeType");
    let audioSamplingRate = representation.getAttribute("audioSamplingRate");
    let children = new Array();
    // if (!(bandWidth && codecs && id && width && height)) {
    //     console.log(bandWidth, codecs, id, representation.getAttribute("width"), representation.getAttribute("height"))
    //     $warn("传入的MPD文件中Representation标签上不存在属性xxx");
    // }
    if (mimeType && !checkMediaType(mimeType)) {
        $warn("类型错误");
    }
    else {
        //如果representation没有子节点
        if (representation.childNodes.length === 0) {
            return {
                tag: "Representation",
                bandWidth,
                codecs,
                audioSamplingRate,
                id,
                width,
                height,
                mimeType: mimeType,
            };
        }
        else {
            //对于Representation标签的children普遍认为有两种可能
            if (representation.querySelector("SegmentList")) {
                //1. (BaseURL)+SegmentList
                let list = initSegmentList(representation.querySelector("SegmentList"));
                if (representation.querySelector("BaseURL")) {
                    children.push(initBaseURL(representation.querySelector("BaseURL")), list);
                }
                else {
                    children.push(list);
                }
            }
            else if (representation.querySelector("SegmentBase")) {
                //2. BaseURL+SegmentBase 适用于每个rep只有一个Seg的情况
                let base = initSegmentBase(representation.querySelector("SegmentBase"));
                if (representation.querySelector("BaseURL")) {
                    children.push(initBaseURL(representation.querySelector("BaseURL")), base);
                }
                else {
                    $warn("传入的MPD文件中Representation中的子节点结构错误");
                }
            }
            return {
                tag: "Representation",
                bandWidth,
                codecs,
                id,
                audioSamplingRate,
                width,
                height,
                mimeType: mimeType,
                children,
            };
        }
    }
}
function initSegmentTemplate(segmentTemplate) {
    let initialization = segmentTemplate.getAttribute("initialization");
    let media = segmentTemplate.getAttribute("media");
    return {
        tag: "SegmentTemplate",
        initialization,
        media,
    };
}
function initSegmentBase(segmentBase) {
    let range = segmentBase.getAttribute("indexRange");
    if (!range) {
        $warn("传入的MPD文件中SegmentBase标签上不存在属性indexRange");
    }
    let initialization = initInitialization(segmentBase.querySelector("Initialization"));
    return {
        tag: "SegmentBase",
        indexRange: range,
        children: initialization,
    };
}
function initSegmentList(segmentList) {
    let duration = segmentList.getAttribute("duration");
    if (!duration) {
        $warn("传入的MPD文件中SegmentList标签上不存在属性duration");
    }
    duration = Number(duration);
    let children = [
        initInitialization(segmentList.querySelector("Initialization")),
    ];
    segmentList.querySelectorAll("SegmentURL").forEach((item) => {
        children.push(initSegmentURL(item));
    });
    return {
        tag: "SegmentList",
        duration: duration,
        children,
    };
}
function initInitialization(initialization) {
    return {
        tag: "Initialization",
        sourceURL: initialization.getAttribute("sourceURL"),
        range: initialization.getAttribute("range"),
    };
}
function initSegmentURL(segmentURL) {
    let media = segmentURL.getAttribute("media");
    if (!media) {
        $warn("传入的MPD文件中SegmentURL标签上不存在属性media");
    }
    return {
        tag: "SegmentURL",
        media,
    };
}
function initBaseURL(baseURL) {
    return {
        tag: "BaseURL",
        url: baseURL.innerHTML,
    };
}

// 解析出每段的请求地址
function parseMpd(mpd, BASE_URL = "") {
    let mpdModel = initMpdFile(mpd).root;
    let type = mpdModel.type;
    console.log("pt", mpdModel.mediaPresentationDuration);
    console.log("pt", mpdModel.maxSegmentDuration);
    // console.log(parseDuration(mpdModel.mediaPresentationDuration));
    let mediaPresentationDuration = switchToSeconds(parseDuration(mpdModel.mediaPresentationDuration));
    let maxSegmentDuration = switchToSeconds(parseDuration(mpdModel.maxSegmentDuration));
    let sumSegment = maxSegmentDuration ? Math.ceil(mediaPresentationDuration / maxSegmentDuration) : null;
    // 代表的是整个MPD文档中的需要发送的所有xhr请求地址，包括多个Period对应的视频和音频请求地址  
    let mpdRequest = [];
    // 遍历文档中的每一个Period，Period代表着一个完整的音视频，不同的Period具有不同内容的音视频，
    // 例如广告和正片就属于不同的Period
    mpdModel.children.forEach((period) => {
        let path = "" + BASE_URL; // baseUrl
        let videoRequest;
        let audioRequest;
        // 再处理 period 的子元素
        // 先拿到基础url
        for (let i = period.children.length - 1; i >= 0; i--) {
            let child = period.children[i];
            if (checkBaseURL(child)) {
                path += child.url;
                break;
            }
        }
        // 再将里面的 AdaptationSet进行处理
        period.children.forEach((child) => {
            if (checkAdaptationSet(child)) {
                // parseAdaptationSet(child, path, sumSegment);
                if (child.mimeType === "audio/mp4") {
                    audioRequest = parseAdaptationSet(child, path, sumSegment, child.mimeType);
                }
                else if (child.mimeType === "video/mp4") {
                    videoRequest = parseAdaptationSet(child, path, sumSegment, child.mimeType);
                }
            }
        });
        mpdRequest.push({ videoRequest, audioRequest });
    });
    return {
        mpdRequest,
        type,
        mediaPresentationDuration,
        maxSegmentDuration
    };
}
function parseAdaptationSet(adaptationSet, path = "", sumSegment, type) {
    let children = adaptationSet.children;
    let hasTemplate = false;
    // let generateInitializationUrl, // 初始化url
    //     initializationFormat,
    //     generateMediaUrl,
    //     mediaFormat;
    let template;
    for (let i = children.length - 1; i >= 0; i--) {
        let child = children[i];
        if (checkSegmentTemplate(child)) {
            hasTemplate = true;
            // [generateInitializationUrl, initializationFormat] = generateTemplateTuple(
            //     child.initialization!
            // );
            // [generateMediaUrl, mediaFormat] = generateTemplateTuple(child.media!);
            template = child;
            break;
        }
    }
    let mediaResolve = {};
    children.forEach((child) => {
        if (checkRepresentation(child)) {
            let generateInitializationUrl, initializationFormat, generateMediaUrl, mediaFormat;
            if (hasTemplate) {
                [generateInitializationUrl, initializationFormat] = generateTemplateTuple(template.initialization);
                [generateMediaUrl, mediaFormat] = generateTemplateTuple(template.media);
            }
            let obj = parseRepresentation(child, hasTemplate, path, sumSegment, type, [generateInitializationUrl, initializationFormat], [generateMediaUrl, mediaFormat]);
            Object.assign(mediaResolve, obj);
        }
    });
    return mediaResolve;
}
function parseRepresentation(representation, hasTemplate = false, path = "", sumSegment, type, initializationSegment, mediaSegment) {
    let resolve; // 计算分辨率
    if (type === "video/mp4") {
        resolve = `${representation.width}*${representation.height}`; //视频就是通过 w * h
    }
    else if (type === "audio/mp4") {
        resolve = `${representation.audioSamplingRate}`;
    }
    let obj = {};
    // 一. 如果该适应集 中具有标签SegmentTemplate，则接下来的Representation中请求的Initialization Segment和Media Segment的请求地址一律以SegmentTemplate中的属性为基准
    if (hasTemplate) {
        obj[resolve] = parseRepresentationWithSegmentTemplateOuter(representation, path, sumSegment, initializationSegment, mediaSegment);
    }
    else {
        //二. 如果没有SegmentTemplate标签，则根据Representation中的子结构具有三种情况,前提是Representation中必须具有子标签，否则报错
        //情况1.(BaseURL)+SegmentList
        if (findSpecificType(representation.children, "SegmentList")) ;
        else if (findSpecificType(representation.children, "SegmentBase")) ;
    }
    return obj;
}
/**
 * @description 应对Representation外部具有SegmentTemplate的结构这种情况
 */
function parseRepresentationWithSegmentTemplateOuter(representation, path = "", sumSegment, initializationSegment, mediaSegment) {
    let requestArray = new Array();
    let [generateInitializationUrl, initializationFormat] = initializationSegment;
    let [generateMediaUrl, mediaFormat] = mediaSegment;
    // 1.处理对于Initialization Segment的请求
    // initializationFormat.forEach((item) => {
    //     if (item === "RepresentationID") {
    //         item = representation.id;
    //     } else if (item === "Number") {
    //         item = "1";
    //     }
    // });
    for (let i in initializationFormat) {
        if (initializationFormat[i] === "RepresentationID") {
            initializationFormat[i] = representation.id;
        }
        else if (initializationFormat[i] === "Number") {
            initializationFormat[i] = "1";
        }
    }
    requestArray.push({
        type: "segement",
        url: path + generateInitializationUrl(...initializationFormat),
    });
    // 2.处理对于Media Segment的请求
    // mediaFormat.forEach((item) => {
    //     if (item === "RepresentationID") {
    //         item = representation.id;
    //     } else if (item === "Number") {
    //         item = "1";
    //     }
    // });
    for (let i in mediaFormat) {
        if (mediaFormat[i] === "RepresentationID") {
            mediaFormat[i] = representation.id;
        }
    }
    for (let index = 1; index <= sumSegment; index++) {
        // mediaFormat.forEach((item) => {
        //     if (item === "Number") item = String(index);
        // });
        for (let i in mediaFormat) {
            if (mediaFormat[i] === "Number") {
                mediaFormat[i] = `${index}`;
            }
        }
        requestArray.push({
            type: "segement",
            url: path + generateMediaUrl(...mediaFormat),
        });
    }
    return requestArray;
}
/**
 * @description 应对Representation内部具有(BaseURL)+SegmentList的结构这种情况
 */
function parseRepresentationWithSegmentList(representation, path) {
    let children = representation.children;
    let segmentList;
    let requestArray = new Array();
    for (let i = children.length - 1; i >= 0; i--) {
        let child = children[i];
        if (checkBaseURL(child)) {
            path += child;
            break;
        }
    }
    for (let i = children.length - 1; i >= 0; i--) {
        let child = children[i];
        if (checkSegmentList(child)) {
            segmentList = child;
            break;
        }
    }
    for (let i = segmentList.length - 1; i >= 0; i--) {
        let child = segmentList[i];
        if (checkInitialization(child)) {
            requestArray.push({
                type: "range",
                url: path + child.sourceURL,
            });
            break;
        }
    }
    segmentList.forEach((segment) => {
        if (checkSegmentURL(segment)) {
            if (segment.media) {
                requestArray.push({
                    type: "segement",
                    url: path + segment.media,
                });
            }
            else {
                requestArray.push({
                    type: "range",
                    url: path,
                    range: segment.mediaRange,
                });
            }
        }
    });
    return requestArray;
}
/**
 * @description 应对Representation内部具有(BaseURL)+SegmentBase的结构这种情况
 */
function parseRepresentationWithSegmentBase(representation, path) {
    let children = representation.children;
    let requestArray = new Array();
    for (let i = children.length - 1; i >= 0; i--) {
        let child = children[i];
        if (checkBaseURL(child)) {
            path += child.url;
            break;
        }
    }
    for (let i = children.length - 1; i >= 0; i--) {
        let child = children[i];
        if (checkSegmentBase(child)) {
            requestArray.push({
                type: "range",
                url: path,
                range: child.children.range,
            });
            requestArray.push({
                type: "range",
                url: path,
                range: child.indexRange,
            });
        }
    }
    return requestArray;
}
/**
 * @description 生成模板函数和占位符
 */
function generateTemplateTuple(s) {
    let splitStr = [];
    let format = [];
    for (let i = 0; i < s.length; i++) {
        let str = s.slice(0, i + 1);
        if (/\$.+?\$/.test(str)) {
            format.push(str.match(/\$(.+?)\$/)[1]);
            splitStr.push(str.replace(/\$.+?\$/, ""), "%format%");
            s = s.slice(i + 1);
            i = 0;
            continue;
        }
        if (i + 1 === s.length) {
            splitStr.push(s);
        }
    }
    return [
        (...args) => {
            let index = 0;
            let str = "";
            splitStr.forEach((item) => {
                if (item === "%format%") {
                    str += args[index];
                    index++;
                }
                else {
                    str += item;
                }
            });
            return str;
        },
        format,
    ];
}

// 自己定义一个xhr请求
function sendRequest(url, method, header = {}, responseType = "text", data) {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.open(method, url);
        for (let index in header) {
            xhr.setRequestHeader(index, header[index]);
        }
        xhr.responseType = responseType;
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
                    resolve({
                        status: "success",
                        data: xhr.response,
                    });
                }
                else {
                    reject({
                        status: "fail",
                        data: xhr.response,
                    });
                }
            }
        };
        if (data) {
            xhr.send(data);
        }
    });
}
// Axios类
function Axios(url, method, header, responseType, data) {
    this.url = url;
    this.method = method;
    this.header = header;
    this.responseType = responseType;
    this.data = data;
    if (this.url && this.method) {
        return sendRequest(url, method, header, responseType, data);
    }
}
// get post 方法
Axios.prototype.get = function (url, header, responseType) {
    return sendRequest(url, "get", header, responseType);
};
Axios.prototype.post = function (url, header, responseType, data) {
    return sendRequest(url, "post", header, responseType, data);
};

console.log('hello');

export { $warn, Axios, BaseEvent, Controller, ErrorMask, LoadingMask, Player, Progress, ToolBar, addZero, checkAdaptationSet, checkBaseURL, checkInitialization, checkMediaType, checkRepresentation, checkSegmentBase, checkSegmentList, checkSegmentTemplate, checkSegmentURL, checkUtils, findSpecificType, formatTime, generateTemplateTuple, icon, initAdaptationSet, initBaseURL, initInitialization, initMpd, initMpdFile, initPeriod, initRepresentation, initSegmentBase, initSegmentList, initSegmentTemplate, initSegmentURL, parseAdaptationSet, parseDuration, parseMpd, parseRepresentation, parseRepresentationWithSegmentBase, parseRepresentationWithSegmentList, parseRepresentationWithSegmentTemplateOuter, sendRequest, string2boolean, string2number, styles, switchToSeconds };
