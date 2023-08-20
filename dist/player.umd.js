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

    // 用于匹配 HTML/CSS 类选择器的模式 匹配 element #id .class element#id element.class element#id.class
    const SELECTOR_REG = /([\w-]+)?(?:#([\w-]+))?(?:\.([\w-]+))?/;
    /**
     * @description 根据desc的标签描述和props的属性描述来创建一个DOM对象，并且在实例上挂载各种属性
     * @param {string} desc
     * @param {DOMProps} props
     * @param {Node[]} children
     * @returns
     */
    function $(desc, props, children) {
        let match = [];
        let regArray = SELECTOR_REG.exec(desc);
        match[0] = regArray[1] || undefined; // element
        match[1] = regArray[2] || undefined; // #
        match[2] = regArray[3] || undefined; // .
        let el = match[0] ? document.createElement(match[0]) : document.createElement("div");
        if (match[1]) {
            el.id = match[1];
        }
        match[2] && addClass(el, [match[2]]);
        // 添加属性， 对象先考虑是 style的情况
        for (let key in props) {
            if (typeof props[key] === "object") {
                if (key === "style") {
                    let str = "";
                    let styles = props[key];
                    for (let k in styles) {
                        str += `${k}: ${styles[k]};`;
                    }
                    el.setAttribute("style", str);
                }
            }
            else {
                el.setAttribute(key, String(props[key]));
            }
        }
        // 如果child是 string 一般是文本节点 
        if (typeof children === "string") {
            el.innerHTML += children;
        }
        else if (children) {
            for (let child of children) {
                el.appendChild(child.el);
            }
        }
        return el;
    }
    function addClass(dom, classNames) {
        let classList = dom.classList;
        for (let name of classNames) {
            if (!includeClass(dom, name)) {
                classList.add(name);
            }
        }
    }
    function includeClass(dom, className) {
        let classList = dom.classList;
        for (let key in classList) {
            if (classList[key] === className)
                return true;
        }
        return false;
    }
    function removeClass(dom, classNames) {
        let classList = dom.classList;
        classList.remove(...classNames);
    }
    function getElementSize(dom) {
        // 深度克隆，连带子节点
        const clone = dom.cloneNode(true);
        clone.style.position = 'absolute';
        clone.style.opacity = '0';
        clone.removeAttribute('hidden');
        const parent = dom.parentNode || document.body;
        parent.appendChild(clone);
        // 用于获取指定元素相对于视口（viewport）的位置信息。它返回一个 DOMRect 对象，其中包含了元素的位置、尺寸和其他相关信息。 rect.x, y , width. height ,right , bottom
        const rect = clone.getBoundingClientRect();
        parent.removeChild(clone);
        return rect;
    }
    // SVG相关
    const svgNS = 'http://www.w3.org/2000/svg';
    function createSvg(d, viewBox = '0 0 1024 1024') {
        const svg = document.createElementNS(svgNS, 'svg');
        svg.setAttribute('viewBox', viewBox);
        if (d) {
            const path = document.createElementNS(svgNS, 'path');
            path.setAttributeNS(null, 'd', d);
            svg.appendChild(path);
        }
        return svg;
    }

    class Component extends BaseEvent {
        constructor(container, desc, props, children) {
            super();
            let dom = $(desc, props, children);
            this.el = dom;
            // 用于向指定元素的子节点列表末尾添加一个或多个节点对象或文本节点。
            container.append(dom);
        }
    }

    // 音乐播放器的工具栏组件 ( progress + controller )
    // export class ToolBar extends Component implements ComponentItem {
    //     private template_!: HTMLElement;
    //     private progress!: Progress;
    //     private controller!: Controller;
    //     private container!: HTMLElement;
    //     private video!: HTMLVideoElement;
    //     private timer!: null | number
    //     constructor(container: HTMLElement) {
    //         super()
    //         this.container = container
    //         this.init();
    //         this.initComponent();
    //         this.initTemplate();
    //         this.initEvent();
    //     }
    //     get template(): HTMLElement {
    //         return this.template_
    //     };
    //     init(): void { }
    //     // 注册 进度条 和 控制器
    //     initComponent() {
    //         this.progress = new Progress(this.container) // 进度条
    //         this.controller = new Controller(this.container) //下面的控制器
    //     }
    //     // 组合 进度条 和 控制器的template
    //     initTemplate() {
    //         let div = document.createElement("div")
    //         div.className = `${styles["video-controls"]} ${styles["video-controls-hidden"]}`;
    //         div.innerHTML += this.progress.template as string;
    //         div.innerHTML += this.controller.template as string;
    //         this.template_ = div
    //     }
    //     // 显示和隐藏toolbar
    //     showToolBar(e: MouseEvent) {
    //         //工具栏的总容器
    //         this.container.querySelector(
    //             `.${styles["video-controls"]}`
    //         )!.className = `${styles["video-controls"]}`;
    //         if (e.target !== this.video) {
    //             // do nothing
    //         } else {
    //             // 一个防抖
    //             this.timer = window.setTimeout(() => {
    //                 this.hideToolBar()
    //             }, 3000)
    //         }
    //     }
    //     hideToolBar() {
    //         this.container.querySelector(
    //             `.${styles["video-controls"]}`
    //         )!.className = `${styles["video-controls"]} ${styles["video-controls-hidden"]}`;
    //     }
    //     initEvent() {
    //         this.on("showtoolbar", (e: MouseEvent) => {
    //             // 防抖
    //             if (this.timer) {
    //                 clearTimeout(this.timer);
    //                 this.timer = null
    //             }
    //             this.showToolBar(e)
    //         });
    //         this.on("hidetoolbar", () => {
    //             this.hideToolBar()
    //         });
    //         this.on("loadedmetadata", (summary: number) => {
    //             this.controller.emit("loadedmetadata", summary);
    //             this.progress.emit("loadedmetadata", summary);
    //         });
    //         this.on("timeupdate", (current: number) => {
    //             this.controller.emit("timeupdate", current);
    //             this.progress.emit("timeupdate", current);
    //         });
    //         this.on("mounted", () => {
    //             this.video = this.container.querySelector("video")!;
    //             this.controller.emit("mounted");
    //             this.progress.emit("mounted")
    //         });
    //         this.on("play", () => {
    //             this.controller.emit("play")
    //         })
    //         this.on("pause", () => {
    //             this.controller.emit("pause")
    //         })
    //     }
    // }
    class ToolBar extends Component {
        // 先初始化播放器的默认样式，暂时不考虑用户的自定义样式
        constructor(player, container, desc, props, children) {
            super(container, desc, props, children);
            this.id = "Toolbar";
            this.timer = 0;
            this.player = player;
            this.props = props;
            this.init();
        }
        init() {
            this.initTemplate();
            this.initComponent();
            this.initEvent();
        }
        /**
        * @description 需要注意的是此处元素的class名字是官方用于控制整体toolbar一栏的显示和隐藏
        */
        initTemplate() {
            addClass(this.el, ["video-controls", "video-controls-hidden"]);
        }
        initEvent() {
            this.player.on("showtoolbar", (e) => {
                this.onShowToolBar(e);
            });
            this.player.on("hidetoolbar", (e) => {
                this.onHideToolBar(e);
            });
        }
        initComponent() {
            this.progress = new Progress(this.player, this.el, "div.video-progress");
            this.controller = new Controller(this.player, this.el, "div.video-play");
        }
        hideToolBar() {
            if (!includeClass(this.el, "video-controls-hidden")) {
                addClass(this.el, ["video-controls-hidden"]);
            }
        }
        showToolBar(e) {
            if (includeClass(this.el, "video-controls-hidden")) {
                removeClass(this.el, ["video-controls-hidden"]);
            }
            if (e.target === this.player.video) {
                this.timer = window.setTimeout(() => {
                    this.hideToolBar();
                }, 3000);
            }
        }
        onShowToolBar(e) {
            if (this.timer) {
                window.clearTimeout(this.timer);
                this.timer = null;
            }
            this.showToolBar(e);
        }
        onHideToolBar(e) {
            this.hideToolBar();
        }
    }

    class Dot extends Component {
        constructor(player, container, desc, props, children) {
            super(container, desc, props, children);
            this.id = "Dot";
            this.props = props;
            this.player = player;
            this.init();
        }
        init() {
            addClass(this.el, ["video-dot", "video-dot-hidden"]);
            this.initEvent();
        }
        initEvent() {
            this.player.on("progress-mouseenter", (e) => {
                this.onShowDot(e);
            });
            this.player.on("progress-mouseleave", (e) => {
                this.onHideDot(e);
            });
            this.player.on("progress-click", (e, ctx) => {
                this.onChangePos(e, ctx);
            });
        }
        onShowDot(e) {
            if (includeClass(this.el, "video-dot-hidden")) {
                removeClass(this.el, ["video-dot-hidden"]);
            }
        }
        onHideDot(e) {
            if (!includeClass(this.el, "video-dot-hidden")) {
                addClass(this.el, ["video-dot-hidden"]);
            }
        }
        onChangePos(e, ctx) {
            e.offsetX / ctx.el.offsetWidth;
            this.el.style.left = e.offsetX - getElementSize(this.el).width / 2 + 'px';
        }
    }

    class CompletedProgress extends Component {
        constructor(player, container, desc, props, children) {
            super(container, desc, props, children);
            this.id = "CompletedProgress";
            this.props = props;
            this.player = player;
            this.init();
        }
        init() {
            this.initEvent();
        }
        initEvent() {
            this.player.on("progress-click", (e, ctx) => {
                this.onChangeWidth(e, ctx);
            });
        }
        onChangeWidth(e, ctx) {
            let scale = e.offsetX / ctx.el.offsetWidth;
            if (scale < 0) {
                scale = 0;
            }
            else if (scale > 1) {
                scale = 1;
            }
            this.el.style.width = scale * 100 + "%";
        }
    }

    class BufferedProgress extends Component {
        constructor(player, container, desc, props, children) {
            super(container, desc, props, children);
            this.id = "BufferedProgress";
            this.props = props;
            this.player = player;
            this.init();
        }
        init() {
            this.initEvent();
        }
        initEvent() {
            this.player.on("progress-click", (e, ctx) => {
                this.onChangeWidth(e, ctx);
            });
        }
        onChangeWidth(e, ctx) {
            let scale = e.offsetX / ctx.el.offsetWidth;
            if (scale < 0) {
                scale = 0;
            }
            else if (scale > 1) {
                scale = 1;
            }
            this.el.style.width = scale * 100 + "%";
        }
    }

    // id 和 el是必须的元素
    class Progress extends Component {
        constructor(player, container, desc, props, children) {
            super(container, desc, props, children);
            this.id = "Progress";
            this.mouseDown = false;
            this.player = player;
            this.init();
        }
        init() {
            this.initComponent();
            this.initEvent();
        }
        initComponent() {
            this.dot = new Dot(this.player, this.el, "div");
            this.completedProgress = new CompletedProgress(this.player, this.el, "div.video-completed");
            this.bufferedProgress = new BufferedProgress(this.player, this.el, "div.video-buffered");
        }
        initEvent() {
            this.el.onmouseenter = (e) => {
                this.player.emit("progress-mouseenter", e, this);
            };
            this.el.onmouseleave = (e) => {
                this.player.emit("progress-mouseleave", e, this);
            };
            this.el.onclick = (e) => {
                this.player.emit("progress-click", e, this);
            };
        }
    }

    class Player extends Component {
        constructor(options) {
            super(options.container, "div.video-wrapper");
            this.id = "Player";
            this.playerOptions = {
                url: "",
                autoplay: false,
                width: "100%",
                height: "100%",
            };
            this.playerOptions = Object.assign(this.playerOptions, options);
            console.log("playerOptions", this.playerOptions);
            options.container.className = "video-container";
            options.container.style.width = this.playerOptions.width + "px";
            options.container.style.height = this.playerOptions.height + "px";
            this.init();
        }
        init() {
            this.video = $("video");
            this.video.src = this.playerOptions.url || "";
            this.el.appendChild(this.video);
            this.toolBar = new ToolBar(this, this.el, "div");
            this.initEvent();
        }
        initEvent() {
            this.el.onmousemove = (e) => {
                this.emit("showtoolbar", e);
            };
            this.el.onmouseenter = (e) => {
                this.emit("showtoolbar", e);
            };
            this.el.onmouseleave = (e) => {
                this.emit("hidetoolbar", e);
            };
            this.video.onloadedmetadata = (e) => {
                this.emit("loadedmetadata", e);
            };
            this.video.ontimeupdate = (e) => {
                this.emit("timeupdate", e);
            };
            this.video.onplay = (e) => {
                this.emit("play", e);
            };
            this.video.onpause = (e) => {
                this.emit("pause", e);
            };
            this.on("progress-click", (e, ctx) => {
                let scale = e.offsetX / ctx.el.offsetWidth;
                if (scale < 0) {
                    scale = 0;
                }
                else if (scale > 1) {
                    scale = 1;
                }
                this.video.currentTime = Math.floor(scale * this.video.duration);
                this.video.paused && this.video.play();
            });
        }
        attendSource(url) {
            this.video.src = url;
        }
    }

    // SVG相关path
    const playPath = "M254.132978 880.390231c-6.079462 0-12.155854-1.511423-17.643845-4.497431-11.828396-6.482645-19.195178-18.85851-19.195178-32.341592L217.293955 180.465165c0-13.483082 7.366781-25.898857 19.195178-32.346709 11.787464-6.483668 26.226315-5.928013 37.57478 1.363044L789.797957 481.028615c10.536984 6.77531 16.908088 18.456351 16.908088 30.979572 0 12.523221-6.371104 24.203238-16.908088 30.982642L274.063913 874.53385C267.983427 878.403994 261.060761 880.390231 254.132978 880.390231L254.132978 880.390231zM254.132978 880.390231";
    const pausePath = "M304 176h80v672h-80zM712 176h-64c-4.4 0-8 3.6-8 8v656c0 4.4 3.6 8 8 8h64c4.4 0 8-3.6 8-8V184c0-4.4-3.6-8-8-8z";

    class PlayButton extends Component {
        constructor(player, container, desc, props, children) {
            super(container, desc, props, children);
            this.id = "PlayButton";
            this.player = player;
            this.init();
        }
        init() {
            this.initTemplate();
            this.initEvent();
        }
        initTemplate() {
            this.pauseIcon = createSvg(pausePath);
            this.playIcon = createSvg(playPath);
            this.button = this.playIcon;
            this.el.appendChild(this.button);
        }
        initEvent() {
            // 触发播放，暂停 以及图标变换
            this.player.on("play", (e) => {
                this.el.removeChild(this.button);
                this.button = this.pauseIcon;
                this.el.appendChild(this.button);
            });
            this.player.on("pause", (e) => {
                this.el.removeChild(this.button);
                this.button = this.playIcon;
                this.el.appendChild(this.button);
            });
            this.el.onclick = (e) => {
                if (this.player.video.paused) {
                    this.player.video.play();
                }
                else {
                    this.player.video.pause();
                }
            };
        }
    }

    class Controller extends Component {
        constructor(player, container, desc, props, children) {
            super(container, desc, props, children);
            this.id = "Controller";
            this.player = player;
            this.init();
        }
        init() {
            this.initTemplate();
            this.initComponent();
        }
        initTemplate() {
            this.subPlay = $("div.video-subplay");
            this.settings = $("div.video-settings");
            this.el.appendChild(this.subPlay);
            this.el.appendChild(this.settings);
        }
        initComponent() {
            // 按钮挂在到了 sub-play下面
            this.playButton = new PlayButton(this.player, this.subPlay, "div.video-start-pause");
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
        console.log(pt);
        let hours = 0, minutes = 0, seconds = 0;
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
    function checkMpd(s) {
        if (s.tag === "MPD")
            return true;
        return false;
    }
    function checkPeriod(s) {
        return s.tag === "Period";
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
    // export let checkUtils = {
    //     checkMediaType,
    //     checkBaseURL,
    //     checkAdaptationSet,
    //     checkSegmentTemplate,
    //     checkRepresentation,
    //     checkSegmentList,
    //     checkInitialization,
    //     checkSegmentURL,
    //     checkSegmentBase
    // }
    // // 如果是上面的类型的标签返回true，否则返回false
    // export function findSpecificType(array: Array<unknown>, type: string): boolean {
    //     array.forEach(item => {
    //         if (checkUtils[`check${type}`] && checkUtils[`check${type}`].call(this, item)) {
    //             return true
    //         }
    //     })
    //     return false
    // }

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

    console.log('hello');

    exports.$warn = $warn;
    exports.BaseEvent = BaseEvent;
    exports.Controller = Controller;
    exports.Player = Player;
    exports.Progress = Progress;
    exports.ToolBar = ToolBar;
    exports.addZero = addZero;
    exports.checkAdaptationSet = checkAdaptationSet;
    exports.checkBaseURL = checkBaseURL;
    exports.checkInitialization = checkInitialization;
    exports.checkMediaType = checkMediaType;
    exports.checkMpd = checkMpd;
    exports.checkPeriod = checkPeriod;
    exports.checkRepresentation = checkRepresentation;
    exports.checkSegmentBase = checkSegmentBase;
    exports.checkSegmentList = checkSegmentList;
    exports.checkSegmentTemplate = checkSegmentTemplate;
    exports.checkSegmentURL = checkSegmentURL;
    exports.formatTime = formatTime;
    exports.parseDuration = parseDuration;
    exports.string2boolean = string2boolean;
    exports.string2number = string2number;
    exports.switchToSeconds = switchToSeconds;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
