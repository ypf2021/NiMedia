(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Player = {}));
})(this, (function (exports) { 'use strict';

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

    // 获取文件后缀名
    function getFileExtension(file) {
        let name;
        if (typeof file === "string") {
            name = file;
        }
        else {
            name = file.name;
        }
        for (let i = name.length - 1; i >= 0; i--) {
            if (name[i] === ".") {
                return name.slice(i + 1, name.length);
            }
        }
        return null;
    }

    class Mp4Player {
        constructor(player) {
            this.player = player;
            this.player.video.src = this.player.playerOptions.url;
            this.initEvent();
        }
        initEvent() {
            this.player.toolbar.emit("mounted");
            this.player.emit("mounted", this);
            this.player.container.onclick = (e) => {
                if (e.target == this.player.video) {
                    if (this.player.video.paused) {
                        this.player.video.play();
                    }
                    else if (this.player.video.played) {
                        this.player.video.pause();
                    }
                }
            };
            this.player.container.addEventListener("mouseenter", (e) => {
                this.player.toolbar.emit("showtoolbar", e);
            });
            this.player.container.addEventListener("mousemove", (e) => {
                this.player.toolbar.emit("showtoolbar", e);
            });
            this.player.container.addEventListener("mouseleave", (e) => {
                this.player.toolbar.emit("hidetoolbar");
            });
            this.player.video.addEventListener("loadedmetadata", (e) => {
                this.player.playerOptions.autoplay && this.player.video.play();
                this.player.toolbar.emit("loadedmetadata", this.player.video.duration);
            });
            this.player.video.addEventListener("timeupdate", (e) => {
                this.player.toolbar.emit("timeupdate", this.player.video.currentTime);
            });
            // 当视频可以再次播放的时候就移除loading和error的mask，通常是为了应对在播放的过程中出现需要缓冲或者播放错误这种情况从而需要展示对应的mask
            this.player.video.addEventListener("play", (e) => {
                this.player.loadingMask.removeLoadingMask();
                this.player.errorMask.removeErrorMask();
                this.player.toolbar.emit("play");
            });
            this.player.video.addEventListener("pause", (e) => {
                this.player.toolbar.emit("pause");
            });
            this.player.video.addEventListener("waiting", (e) => {
                this.player.loadingMask.removeLoadingMask();
                this.player.errorMask.removeErrorMask();
                this.player.loadingMask.addLoadingMask();
            });
            //当浏览器请求视频发生错误的时候
            this.player.video.addEventListener("stalled", (e) => {
                console.log("视频加载发生错误");
                this.player.loadingMask.removeLoadingMask();
                this.player.errorMask.removeErrorMask();
                this.player.errorMask.addErrorMask();
            });
            this.player.video.addEventListener("error", (e) => {
                this.player.loadingMask.removeLoadingMask();
                this.player.errorMask.removeErrorMask();
                this.player.errorMask.addErrorMask();
            });
            this.player.video.addEventListener("abort", (e) => {
                this.player.loadingMask.removeLoadingMask();
                this.player.errorMask.removeErrorMask();
                this.player.errorMask.addErrorMask();
            });
        }
    }

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
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
        let mpdRequest = new Array();
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
            maxSegmentDuration,
            mpdModel
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
            // console.log('mediaFormat', mediaFormat)  这里用mediaFormat 会出现问题
            let copy = [...mediaFormat];
            for (let i in mediaFormat) {
                if (copy[i] === "Number") {
                    copy[i] = `${index}`;
                }
            }
            requestArray.push({
                type: "segement",
                url: path + generateMediaUrl(...copy),
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
            xhr.send(data);
        });
    }
    // Axios类
    class Axios {
        constructor(url, method, header, responseType, data) {
            this.url = url;
            this.method = method;
            this.header = header;
            this.responseType = responseType;
            this.data = data;
        }
        get(url, header, responseType) {
            console.log(url);
            return sendRequest(url, "get", header, responseType);
        }
        post(url, header, responseType, data) {
            return sendRequest(url, "post", header, responseType, data);
        }
    }

    class MpdPlayer {
        constructor(player) {
            this.player = player;
            this.axios = new Axios();
            this.mpdUrl = this.player.playerOptions.url;
            this.init();
        }
        // 
        init() {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.getMpdFile(this.mpdUrl);
                this.RequestInfo.mpdRequest.forEach((child) => __awaiter(this, void 0, void 0, function* () {
                    //每一个 child 都是 PeriodRequest 类型的 
                    yield this.handlePeriod(child);
                }));
            });
        }
        /**
         * @description 获取并且解析MPD文件
         */
        getMpdFile(url) {
            return __awaiter(this, void 0, void 0, function* () {
                let val = yield this.axios.get(url, {}, "text");
                let parser = new DOMParser(); // DOMParser 是一个 JavaScript API，用于将 XML 或 HTML 字符串解析为 DOM（Document Object Model）文档。
                let document = parser.parseFromString(val.data, "text/xml");
                let result = parseMpd(document, "https://dash.akamaized.net/envivio/EnvivioDash3/");
                this.mpd = document;
                this.RequestInfo = result;
                console.log("mpd文件资源", document, ".  请求资源", result);
            });
        }
        handlePeriod(child) {
            return __awaiter(this, void 0, void 0, function* () {
                let videoResolve = child.videoRequest["1920*1080"];
                let audioResolve = child.audioRequest["48000"];
                yield this.handleInitializationSegment(videoResolve[0].url, audioResolve[0].url);
                yield this.handleMediaSegment(videoResolve.slice(1), audioResolve.slice(1));
            });
        }
        handleInitializationSegment(videoUrl, audioUrl) {
            return __awaiter(this, void 0, void 0, function* () {
                yield Promise.all([
                    this.getSegment(videoUrl),
                    this.getSegment(audioUrl)
                ]);
            });
        }
        /**
         * @description @description 根据解析到的MPD文件的段（Initialization Segment 和 Media Segment）
         * 发起请求
         */
        getSegment(url) {
            return this.axios.get(url, {}, "arraybuffer");
        }
        // 处理第一个之后的全部
        handleMediaSegment(videoRequest, audioRequest) {
            return __awaiter(this, void 0, void 0, function* () {
                for (let i = 0; i < Math.min(videoRequest.length, audioRequest.length); i++) {
                    let val = yield Promise.all([
                        this.getSegment(videoRequest[i].url),
                        this.getSegment(audioRequest[i].url),
                    ]);
                    console.log(i + 1, val);
                }
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
            // this.initEvent()
            if (getFileExtension(this.playerOptions.url) === "mp4") {
                new Mp4Player(this);
            }
            else if (getFileExtension(this.playerOptions.url) === "mpd") {
                new MpdPlayer(this);
            }
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
        /**
         * @description 初始化播放器上的各种组件实例
         */
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
                <video></video>
            </div>
        `;
            this.container.appendChild(this.toolbar.template);
            this.video = this.container.querySelector("video");
            // 执行toolbar的mounted
            // this.toolbar.emit("mounted")
        }
        ;
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

    exports.$warn = $warn;
    exports.Axios = Axios;
    exports.BaseEvent = BaseEvent;
    exports.Controller = Controller;
    exports.ErrorMask = ErrorMask;
    exports.LoadingMask = LoadingMask;
    exports.Player = Player;
    exports.Progress = Progress;
    exports.ToolBar = ToolBar;
    exports.addZero = addZero;
    exports.checkAdaptationSet = checkAdaptationSet;
    exports.checkBaseURL = checkBaseURL;
    exports.checkInitialization = checkInitialization;
    exports.checkMediaType = checkMediaType;
    exports.checkRepresentation = checkRepresentation;
    exports.checkSegmentBase = checkSegmentBase;
    exports.checkSegmentList = checkSegmentList;
    exports.checkSegmentTemplate = checkSegmentTemplate;
    exports.checkSegmentURL = checkSegmentURL;
    exports.checkUtils = checkUtils;
    exports.findSpecificType = findSpecificType;
    exports.formatTime = formatTime;
    exports.generateTemplateTuple = generateTemplateTuple;
    exports.icon = icon;
    exports.initAdaptationSet = initAdaptationSet;
    exports.initBaseURL = initBaseURL;
    exports.initInitialization = initInitialization;
    exports.initMpd = initMpd;
    exports.initMpdFile = initMpdFile;
    exports.initPeriod = initPeriod;
    exports.initRepresentation = initRepresentation;
    exports.initSegmentBase = initSegmentBase;
    exports.initSegmentList = initSegmentList;
    exports.initSegmentTemplate = initSegmentTemplate;
    exports.initSegmentURL = initSegmentURL;
    exports.parseAdaptationSet = parseAdaptationSet;
    exports.parseDuration = parseDuration;
    exports.parseMpd = parseMpd;
    exports.parseRepresentation = parseRepresentation;
    exports.parseRepresentationWithSegmentBase = parseRepresentationWithSegmentBase;
    exports.parseRepresentationWithSegmentList = parseRepresentationWithSegmentList;
    exports.parseRepresentationWithSegmentTemplateOuter = parseRepresentationWithSegmentTemplateOuter;
    exports.sendRequest = sendRequest;
    exports.string2boolean = string2boolean;
    exports.string2number = string2number;
    exports.styles = styles;
    exports.switchToSeconds = switchToSeconds;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
