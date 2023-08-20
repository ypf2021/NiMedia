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

    function getDOMPoint(dom) {
        var t = 0;
        var l = 0;
        //判断是否有父容器，如果存在则累加其边距
        while (dom !== document.body) {
            t += dom.offsetTop; //叠加父容器的上边距
            l += dom.offsetLeft; //叠加父容器的左边距
            //if(dom.style.borderLeftWidth) l += Number(dom.style.borderLeftWidth);
            //if(dom.style.borderTopWidth) t += Number(dom.style.borderTopWidth);
            dom = dom.parentNode;
        }
        return { x: l, y: t };
    }
    /**
     * @description 查看当前的鼠标位置是否在父元素和绝对定位的子元素的组合范围内，如果超出则返回false
     * @param parent
     * @param topChild
     * @param pageX
     * @param pageY
     * @returns {boolean}
     */
    function checkIsMouseInRange(parent, topChild, pageX, pageY) {
        let { x, y } = getDOMPoint(parent);
        let allTop = y - parseInt(topChild.style.bottom) - topChild.clientHeight;
        let allBottom = y + parent.clientHeight;
        let allLeft = x + Math.round(parent.clientWidth / 2) - Math.round(topChild.clientWidth / 2);
        let allRight = x + Math.round(parent.clientWidth / 2) + Math.round(topChild.clientWidth / 2);
        let parentLeft = x;
        let parentRight = x + parent.clientWidth;
        if (pageX >= allLeft && pageX <= allRight && pageY <= y && pageY >= allTop)
            return true;
        if (pageX >= parentLeft - 5 && pageX <= parentRight + 5 && pageY >= y && pageY <= allBottom)
            return true;
        return false;
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

    // import { $warn, styles, BaseEvent, formatTime } from "../../index";
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
            this.dot = new Dot(this.player, this.el, "div.video-progress");
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
            this.video.onmousemove = (e) => {
                this.emit("showtoolbar", e);
            };
            this.video.onmouseenter = (e) => {
                this.emit("showtoolbar", e);
            };
            this.video.onmouseleave = (e) => {
                this.emit("hidetoolbar", e);
            };
            this.video.onloadedmetadata = (e) => {
                this.emit("loadedmetadata", e);
            };
            this.video.ontimeupdate = (e) => {
                this.emit("timeupdate", e);
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
        "video-playrate-set": "controller_video-playrate-set__VwnVz",
        "video-resolvepower-set": "controller_video-resolvepower-set__JqEYD",
        "video-volume": "controller_video-volume__R8ory",
        "video-volume-progress": "controller_video-voulme-progress__VyO8-",
        "video-volume-completed": "controller_video-volume-completed__zwRNX",
        "video-volume-dot": "controller_video-volume-dot__5dlAl",
        "video-fullscreen": "controller_video-fullscreen__ZLYIr",
        "video-duration-all": "controller_video-duration-all__gGLip",
        "video-controller": "controller_video-controller__SO9PL",
        "video-playrate": "controller_video-playrate__lj-mz",
        "video-resolvepower": "controller_video-resolvepower__OuokG",
        "video-volume-set": "controller_video-volume-set__wurEP",
        "video-volume-show": "controller_video-volume-show__bb2Jm",
        "video-icon": "",
        "loading-mask": "",
        "loading-container": "",
        "loading-item": "",
        "loading-title": "",
        "error-mask": "",
        "error-container": "",
        "error-item": "",
        "error-title": "",
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

    const volumeSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 88 88" width="88" height="88" preserveAspectRatio="xMidYMid meet" style="width: 100%; height: 100%; transform: translate3d(0px, 0px, 0px);">
    <defs>
        <clipPath id="__lottie_element_94">
            <rect width="88" height="88" x="0" y="0"></rect>
        </clipPath>
        <clipPath id="__lottie_element_96">
            <path d="M0,0 L88,0 L88,88 L0,88z"></path>
        </clipPath>
    </defs>
    <g clip-path="url(#__lottie_element_94)">
        <g clip-path="url(#__lottie_element_96)" transform="matrix(1,0,0,1,0,0)" opacity="1" style="display: block;">
            <g transform="matrix(1,0,0,1,28,44)" opacity="1" style="display: block;">
                <g opacity="1" transform="matrix(1,0,0,1,0,0)">
                    <path fill="rgb(255,255,255)" fill-opacity="1" d=" M15.5600004196167,-25.089000701904297 C15.850000381469727,-24.729000091552734 16,-24.288999557495117 16,-23.839000701904297 C16,-23.839000701904297 16,23.840999603271484 16,23.840999603271484 C16,24.94099998474121 15.100000381469727,25.840999603271484 14,25.840999603271484 C13.550000190734863,25.840999603271484 13.109999656677246,25.680999755859375 12.75,25.400999069213867 C12.75,25.400999069213867 -4,12.00100040435791 -4,12.00100040435791 C-4,12.00100040435791 -8,12.00100040435791 -8,12.00100040435791 C-12.420000076293945,12.00100040435791 -16,8.420999526977539 -16,4.000999927520752 C-16,4.000999927520752 -16,-3.999000072479248 -16,-3.999000072479248 C-16,-8.418999671936035 -12.420000076293945,-11.99899959564209 -8,-11.99899959564209 C-8,-11.99899959564209 -4,-11.99899959564209 -4,-11.99899959564209 C-4,-11.99899959564209 12.75,-25.39900016784668 12.75,-25.39900016784668 C13.609999656677246,-26.089000701904297 14.869999885559082,-25.948999404907227 15.5600004196167,-25.089000701904297z">
                    </path>
                </g>
            </g>
            <g style="display: none;" transform="matrix(1.0111862421035767,0,0,1.0111862421035767,56.07423400878906,44.00048828125)" opacity="0.003817207883531637">
                <g opacity="1" transform="matrix(1,0,0,1,0,0)">
                    <path fill="rgb(255,255,255)" fill-opacity="1" d=" M-4,-13.859000205993652 C0.7799999713897705,-11.08899974822998 4,-5.919000148773193 4,0.0010000000474974513 C4,5.921000003814697 0.7799999713897705,11.090999603271484 -4,13.861000061035156 C-4,13.861000061035156 -4,-13.859000205993652 -4,-13.859000205993652z"></path>
                </g>
            </g>
            <g style="display: none;" transform="matrix(1.0126574039459229,0,0,1.0126574039459229,64.37825012207031,44.0057487487793)" opacity="0.05925115693762535">
                <g opacity="1" transform="matrix(1,0,0,1,0,0)">
                    <path fill="rgb(255,255,255)" fill-opacity="1" d=" M-6.236000061035156,-28.895999908447266 C4.803999900817871,-23.615999221801758 11.984000205993652,-12.456000328063965 11.984000205993652,-0.006000000052154064 C11.984000205993652,12.454000473022461 4.794000148773193,23.624000549316406 -6.265999794006348,28.893999099731445 C-8.255999565124512,29.8439998626709 -10.645999908447266,29.003999710083008 -11.595999717712402,27.003999710083008 C-12.545999526977539,25.013999938964844 -11.696000099182129,22.624000549316406 -9.706000328063965,21.673999786376953 C-1.406000018119812,17.724000930786133 3.9839999675750732,9.343999862670898 3.9839999675750732,-0.006000000052154064 C3.9839999675750732,-9.345999717712402 -1.3960000276565552,-17.715999603271484 -9.675999641418457,-21.676000595092773 C-11.675999641418457,-22.625999450683594 -12.515999794006348,-25.016000747680664 -11.565999984741211,-27.006000518798828 C-10.616000175476074,-29.006000518798828 -8.22599983215332,-29.84600067138672 -6.236000061035156,-28.895999908447266z">
                    </path>
                </g>
            </g>
            <g style="display: none;" transform="matrix(1.000218152999878,0,0,1.000218152999878,56.002994537353516,44)" opacity="1">
                <g opacity="1" transform="matrix(1,0,0,1,0,0)">
                    <path fill="rgb(255,255,255)" fill-opacity="1" d=" M-4,-13.859000205993652 C0.7799999713897705,-11.08899974822998 4,-5.919000148773193 4,0.0010000000474974513 C4,5.921000003814697 0.7799999713897705,11.090999603271484 -4,13.861000061035156 C-4,13.861000061035156 -4,-13.859000205993652 -4,-13.859000205993652z">
                    </path>
                </g>
            </g>
            <g style="display: none;" transform="matrix(1.0002059936523438,0,0,1.0002059936523438,64.00399780273438,44.00699996948242)" opacity="1">
                <g opacity="1" transform="matrix(1,0,0,1,0,0)">
                    <path fill="rgb(255,255,255)" fill-opacity="1" d=" M-6.236000061035156,-28.895999908447266 C4.803999900817871,-23.615999221801758 11.984000205993652,-12.456000328063965 11.984000205993652,-0.006000000052154064 C11.984000205993652,12.454000473022461 4.794000148773193,23.624000549316406 -6.265999794006348,28.893999099731445 C-8.255999565124512,29.8439998626709 -10.645999908447266,29.003999710083008 -11.595999717712402,27.003999710083008 C-12.545999526977539,25.013999938964844 -11.696000099182129,22.624000549316406 -9.706000328063965,21.673999786376953 C-1.406000018119812,17.724000930786133 3.9839999675750732,9.343999862670898 3.9839999675750732,-0.006000000052154064 C3.9839999675750732,-9.345999717712402 -1.3960000276565552,-17.715999603271484 -9.675999641418457,-21.676000595092773 C-11.675999641418457,-22.625999450683594 -12.515999794006348,-25.016000747680664 -11.565999984741211,-27.006000518798828 C-10.616000175476074,-29.006000518798828 -8.22599983215332,-29.84600067138672 -6.236000061035156,-28.895999908447266z">
                    </path>
                </g>
            </g>
            <g transform="matrix(0.9999999403953552,0,0,0.9999999403953552,56,44)" opacity="1" style="display: block;">
                <g opacity="1" transform="matrix(1,0,0,1,0,0)">
                    <path fill="rgb(255,255,255)" fill-opacity="1" d=" M-4,-13.859000205993652 C0.7799999713897705,-11.08899974822998 4,-5.919000148773193 4,0.0010000000474974513 C4,5.921000003814697 0.7799999713897705,11.090999603271484 -4,13.861000061035156 C-4,13.861000061035156 -4,-13.859000205993652 -4,-13.859000205993652z">
                    </path>
                </g>
            </g>
            <g transform="matrix(0.9999999403953552,0,0,0.9999999403953552,64.01399993896484,44.00699996948242)" opacity="1" style="display: block;">
                <g opacity="1" transform="matrix(1,0,0,1,0,0)">
                    <path fill="rgb(255,255,255)" fill-opacity="1" d=" M-6.236000061035156,-28.895999908447266 C4.803999900817871,-23.615999221801758 11.984000205993652,-12.456000328063965 11.984000205993652,-0.006000000052154064 C11.984000205993652,12.454000473022461 4.794000148773193,23.624000549316406 -6.265999794006348,28.893999099731445 C-8.255999565124512,29.8439998626709 -10.645999908447266,29.003999710083008 -11.595999717712402,27.003999710083008 C-12.545999526977539,25.013999938964844 -11.696000099182129,22.624000549316406 -9.706000328063965,21.673999786376953 C-1.406000018119812,17.724000930786133 3.9839999675750732,9.343999862670898 3.9839999675750732,-0.006000000052154064 C3.9839999675750732,-9.345999717712402 -1.3960000276565552,-17.715999603271484 -9.675999641418457,-21.676000595092773 C-11.675999641418457,-22.625999450683594 -12.515999794006348,-25.016000747680664 -11.565999984741211,-27.006000518798828 C-10.616000175476074,-29.006000518798828 -8.22599983215332,-29.84600067138672 -6.236000061035156,-28.895999908447266z">
                    </path>
                </g>
            </g>
        </g>
    </g>
</svg>`;

    const settingSVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 88 88" width="88" height="88" preserveAspectRatio="xMidYMid meet" style="width: 100%; height: 100%; transform: translate3d(0px, 0px, 0px);">
    <defs>
        <clipPath id="__lottie_element_134">
            <rect width="88" height="88" x="0" y="0"></rect>
        </clipPath>
    </defs>
    <g clip-path="url(#__lottie_element_134)">
        <g transform="matrix(1,0,0,1,44,43.875)" opacity="1" style="display: block;">
            <g opacity="1" transform="matrix(1,0,0,1,0,0)">
                <path fill="rgb(255,255,255)" fill-opacity="1" d=" M0,8.125 C-4.420000076293945,8.125 -8,4.545000076293945 -8,0.125 C-8,-4.295000076293945 -4.420000076293945,-7.875 0,-7.875 C4.420000076293945,-7.875 8,-4.295000076293945 8,0.125 C8,4.545000076293945 4.420000076293945,8.125 0,8.125z M0,16.125 C8.84000015258789,16.125 16,8.96500015258789 16,0.125 C16,-8.71500015258789 8.84000015258789,-15.875 0,-15.875 C-8.84000015258789,-15.875 -16,-8.71500015258789 -16,0.125 C-16,8.96500015258789 -8.84000015258789,16.125 0,16.125z M4.539999961853027,27.51099967956543 C3.059999942779541,27.750999450683594 1.5499999523162842,27.871000289916992 0,27.871000289916992 C-1.5499999523162842,27.871000289916992 -3.059999942779541,27.750999450683594 -4.539999961853027,27.51099967956543 C-4.539999961853027,27.51099967956543 -8.699999809265137,32.56100082397461 -8.699999809265137,32.56100082397461 C-9.9399995803833,34.07099914550781 -12.100000381469727,34.46099853515625 -13.789999961853027,33.48099899291992 C-13.789999961853027,33.48099899291992 -21.780000686645508,28.871000289916992 -21.780000686645508,28.871000289916992 C-23.469999313354492,27.891000747680664 -24.209999084472656,25.83099937438965 -23.520000457763672,24.000999450683594 C-23.520000457763672,24.000999450683594 -21.290000915527344,18.06100082397461 -21.290000915527344,18.06100082397461 C-23.3799991607666,15.621000289916992 -25.049999237060547,12.810999870300293 -26.209999084472656,9.76099967956543 C-26.209999084472656,9.76099967956543 -32.65999984741211,8.680999755859375 -32.65999984741211,8.680999755859375 C-34.59000015258789,8.361000061035156 -36,6.690999984741211 -36,4.741000175476074 C-36,4.741000175476074 -36,-4.488999843597412 -36,-4.488999843597412 C-36,-6.439000129699707 -34.59000015258789,-8.109000205993652 -32.65999984741211,-8.428999900817871 C-32.65999984741211,-8.428999900817871 -26.399999618530273,-9.479000091552734 -26.399999618530273,-9.479000091552734 C-25.309999465942383,-12.559000015258789 -23.690000534057617,-15.388999938964844 -21.65999984741211,-17.868999481201172 C-21.65999984741211,-17.868999481201172 -23.959999084472656,-23.999000549316406 -23.959999084472656,-23.999000549316406 C-24.639999389648438,-25.839000701904297 -23.899999618530273,-27.888999938964844 -22.209999084472656,-28.868999481201172 C-22.209999084472656,-28.868999481201172 -14.220000267028809,-33.479000091552734 -14.220000267028809,-33.479000091552734 C-12.529999732971191,-34.45899963378906 -10.380000114440918,-34.069000244140625 -9.130000114440918,-32.558998107910156 C-9.130000114440918,-32.558998107910156 -5.099999904632568,-27.659000396728516 -5.099999904632568,-27.659000396728516 C-3.450000047683716,-27.9689998626709 -1.7400000095367432,-28.128999710083008 0,-28.128999710083008 C1.7400000095367432,-28.128999710083008 3.450000047683716,-27.9689998626709 5.099999904632568,-27.659000396728516 C5.099999904632568,-27.659000396728516 9.130000114440918,-32.558998107910156 9.130000114440918,-32.558998107910156 C10.380000114440918,-34.069000244140625 12.529999732971191,-34.45899963378906 14.220000267028809,-33.479000091552734 C14.220000267028809,-33.479000091552734 22.209999084472656,-28.868999481201172 22.209999084472656,-28.868999481201172 C23.899999618530273,-27.888999938964844 24.639999389648438,-25.839000701904297 23.959999084472656,-23.999000549316406 C23.959999084472656,-23.999000549316406 21.65999984741211,-17.868999481201172 21.65999984741211,-17.868999481201172 C23.690000534057617,-15.388999938964844 25.309999465942383,-12.559000015258789 26.399999618530273,-9.479000091552734 C26.399999618530273,-9.479000091552734 32.65999984741211,-8.428999900817871 32.65999984741211,-8.428999900817871 C34.59000015258789,-8.109000205993652 36,-6.439000129699707 36,-4.488999843597412 C36,-4.488999843597412 36,4.741000175476074 36,4.741000175476074 C36,6.690999984741211 34.59000015258789,8.361000061035156 32.65999984741211,8.680999755859375 C32.65999984741211,8.680999755859375 26.209999084472656,9.76099967956543 26.209999084472656,9.76099967956543 C25.049999237060547,12.810999870300293 23.3799991607666,15.621000289916992 21.290000915527344,18.06100082397461 C21.290000915527344,18.06100082397461 23.520000457763672,24.000999450683594 23.520000457763672,24.000999450683594 C24.209999084472656,25.83099937438965 23.469999313354492,27.891000747680664 21.780000686645508,28.871000289916992 C21.780000686645508,28.871000289916992 13.789999961853027,33.48099899291992 13.789999961853027,33.48099899291992 C12.100000381469727,34.46099853515625 9.9399995803833,34.07099914550781 8.699999809265137,32.56100082397461 C8.699999809265137,32.56100082397461 4.539999961853027,27.51099967956543 4.539999961853027,27.51099967956543z">
                </path>
            </g>
        </g>
    </g>
</svg>`;

    const fullScreenSVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 88 88" width="88" height="88" preserveAspectRatio="xMidYMid meet" style="width: 100%; height: 100%; transform: translate3d(0px, 0px, 0px);"><defs><clipPath id="__lottie_element_182"><rect width="88" height="88" x="0" y="0"></rect></clipPath></defs><g clip-path="url(#__lottie_element_182)"><g transform="matrix(1,0,0,1,44,74.22000122070312)" opacity="1" style="display: block;"><g opacity="1" transform="matrix(1,0,0,1,0,0)"><path fill="rgb(255,255,255)" fill-opacity="1" d=" M19.219999313354492,0.2199999988079071 C7.480000019073486,7.630000114440918 -7.480000019073486,7.630000114440918 -19.219999313354492,0.2199999988079071 C-19.219999313354492,0.2199999988079071 -16.219999313354492,-5.78000020980835 -16.219999313354492,-5.78000020980835 C-6.389999866485596,0.75 6.409999847412109,0.75 16.239999771118164,-5.78000020980835 C16.239999771118164,-5.78000020980835 19.219999313354492,0.2199999988079071 19.219999313354492,0.2199999988079071z"></path></g></g><g transform="matrix(1,0,0,1,68.58000183105469,27.895000457763672)" opacity="1" style="display: block;"><g opacity="1" transform="matrix(1,0,0,1,0,0)"><path fill="rgb(255,255,255)" fill-opacity="1" d=" M11.420000076293945,16.104999542236328 C11.420000076293945,16.104999542236328 4.78000020980835,16.104999542236328 4.78000020980835,16.104999542236328 C4.78000020980835,16.104999542236328 4.78000020980835,14.635000228881836 4.78000020980835,14.635000228881836 C4.25,4.054999828338623 -1.940000057220459,-5.425000190734863 -11.420000076293945,-10.164999961853027 C-11.420000076293945,-10.164999961853027 -8.479999542236328,-16.104999542236328 -8.479999542236328,-16.104999542236328 C3.7200000286102295,-10.005000114440918 11.420000076293945,2.4649999141693115 11.420000076293945,16.104999542236328 C11.420000076293945,16.104999542236328 11.420000076293945,16.104999542236328 11.420000076293945,16.104999542236328z"></path></g></g><g transform="matrix(1,0,0,1,19.450000762939453,27.895000457763672)" opacity="1" style="display: block;"><g opacity="1" transform="matrix(1,0,0,1,0,0)"><path fill="rgb(255,255,255)" fill-opacity="1" d=" M-4.809999942779541,16.104999542236328 C-4.809999942779541,16.104999542236328 -11.449999809265137,16.104999542236328 -11.449999809265137,16.104999542236328 C-11.449999809265137,2.4649999141693115 -3.75,-10.005000114440918 8.449999809265137,-16.104999542236328 C8.449999809265137,-16.104999542236328 11.449999809265137,-10.164999961853027 11.449999809265137,-10.164999961853027 C1.4900000095367432,-5.204999923706055 -4.809999942779541,4.974999904632568 -4.809999942779541,16.104999542236328 C-4.809999942779541,16.104999542236328 -4.809999942779541,16.104999542236328 -4.809999942779541,16.104999542236328z"></path></g></g><g transform="matrix(1,0,0,1,44.0099983215332,65.96499633789062)" opacity="1" style="display: block;"><g opacity="1" transform="matrix(1,0,0,1,0,0)"><path fill="rgb(255,255,255)" fill-opacity="1" d=" M-0.009999999776482582,5.34499979019165 C-5.46999979019165,5.355000019073486 -10.800000190734863,3.7149999141693115 -15.319999694824219,0.6549999713897705 C-15.319999694824219,0.6549999713897705 -12.319999694824219,-5.34499979019165 -12.319999694824219,-5.34499979019165 C-5,0.08500000089406967 5,0.08500000089406967 12.319999694824219,-5.34499979019165 C12.319999694824219,-5.34499979019165 15.319999694824219,0.6549999713897705 15.319999694824219,0.6549999713897705 C10.800000190734863,3.7249999046325684 5.460000038146973,5.355000019073486 -0.009999999776482582,5.34499979019165z"></path></g></g><g transform="matrix(1,0,0,1,62.275001525878906,31.780000686645508)" opacity="1" style="display: block;"><g opacity="1" transform="matrix(1,0,0,1,0,0)"><path fill="rgb(255,255,255)" fill-opacity="1" d=" M9.015000343322754,10.850000381469727 C9.015000343322754,10.850000381469727 9.015000343322754,12.220000267028809 9.015000343322754,12.220000267028809 C9.015000343322754,12.220000267028809 2.434999942779541,12.220000267028809 2.434999942779541,12.220000267028809 C2.434999942779541,12.220000267028809 2.434999942779541,11.220000267028809 2.434999942779541,11.220000267028809 C2.075000047683716,3.740000009536743 -2.305000066757202,-2.9700000286102295 -9.015000343322754,-6.309999942779541 C-9.015000343322754,-6.309999942779541 -6.014999866485596,-12.220000267028809 -6.014999866485596,-12.220000267028809 C-6.014999866485596,-12.220000267028809 -6.014999866485596,-12.220000267028809 -6.014999866485596,-12.220000267028809 C2.7850000858306885,-7.800000190734863 8.524999618530273,1.0099999904632568 9.015000343322754,10.850000381469727 C9.015000343322754,10.850000381469727 9.015000343322754,10.850000381469727 9.015000343322754,10.850000381469727z"></path></g></g><g transform="matrix(1,0,0,1,25.729999542236328,31.780000686645508)" opacity="1" style="display: block;"><g opacity="1" transform="matrix(1,0,0,1,0,0)"><path fill="rgb(255,255,255)" fill-opacity="1" d=" M-2.440000057220459,12.220000267028809 C-2.440000057220459,12.220000267028809 -9.050000190734863,12.220000267028809 -9.050000190734863,12.220000267028809 C-9.050000190734863,1.8700000047683716 -3.2100000381469727,-7.590000152587891 6.050000190734863,-12.220000267028809 C6.050000190734863,-12.220000267028809 9.050000190734863,-6.309999942779541 9.050000190734863,-6.309999942779541 C2.0199999809265137,-2.809999942779541 -2.430000066757202,4.360000133514404 -2.440000057220459,12.220000267028809 C-2.440000057220459,12.220000267028809 -2.440000057220459,12.220000267028809 -2.440000057220459,12.220000267028809z"></path></g></g><g transform="matrix(1,0,0,1,44,57.654998779296875)" opacity="1" style="display: block;"><g opacity="1" transform="matrix(1,0,0,1,0,0)"><path fill="rgb(255,255,255)" fill-opacity="1" d=" M0,4.974999904632568 C-4.110000133514404,4.994999885559082 -8.119999885559082,3.6449999809265137 -11.380000114440918,1.1349999904632568 C-11.380000114440918,1.1349999904632568 -8.319999694824219,-4.974999904632568 -8.319999694824219,-4.974999904632568 C-3.6700000762939453,-0.5049999952316284 3.6700000762939453,-0.5049999952316284 8.319999694824219,-4.974999904632568 C8.319999694824219,-4.974999904632568 11.380000114440918,1.1349999904632568 11.380000114440918,1.1349999904632568 C8.109999656677246,3.634999990463257 4.110000133514404,4.985000133514404 0,4.974999904632568 C0,4.974999904632568 0,4.974999904632568 0,4.974999904632568z"></path></g></g><g transform="matrix(1,0,0,1,55.9900016784668,35.665000915527344)" opacity="1" style="display: block;"><g opacity="1" transform="matrix(1,0,0,1,0,0)"><path fill="rgb(255,255,255)" fill-opacity="1" d=" M6.619999885559082,7.40500020980835 C6.619999885559082,7.40500020980835 6.619999885559082,8.335000038146973 6.619999885559082,8.335000038146973 C6.619999885559082,8.335000038146973 0.009999999776482582,8.335000038146973 0.009999999776482582,8.335000038146973 C0.009999999776482582,3.7850000858306885 -2.549999952316284,-0.375 -6.619999885559082,-2.4049999713897705 C-6.619999885559082,-2.4049999713897705 -3.619999885559082,-8.335000038146973 -3.619999885559082,-8.335000038146973 C2.380000114440918,-5.324999809265137 6.300000190734863,0.6949999928474426 6.619999885559082,7.40500020980835 C6.619999885559082,7.40500020980835 6.619999885559082,7.40500020980835 6.619999885559082,7.40500020980835z"></path></g></g><g transform="matrix(1,0,0,1,31.9950008392334,35.665000915527344)" opacity="1" style="display: block;"><g opacity="1" transform="matrix(1,0,0,1,0,0)"><path fill="rgb(255,255,255)" fill-opacity="1" d=" M6.635000228881836,-2.4049999713897705 C2.565000057220459,-0.375 0.004999999888241291,3.7850000858306885 0.004999999888241291,8.335000038146973 C0.004999999888241291,8.335000038146973 -6.635000228881836,8.335000038146973 -6.635000228881836,8.335000038146973 C-6.635000228881836,1.274999976158142 -2.6449999809265137,-5.184999942779541 3.674999952316284,-8.335000038146973 C3.674999952316284,-8.335000038146973 6.635000228881836,-2.4049999713897705 6.635000228881836,-2.4049999713897705z"></path></g></g><g transform="matrix(1,0,0,1,44,66.322998046875)" opacity="1" style="display: block;"><g opacity="1" transform="matrix(1,0,0,1,0,0)"><path fill="rgb(255,255,255)" fill-opacity="1" d=" M8.319000244140625,-13.677000045776367 C8.319000244140625,-13.677000045776367 19.2189998626709,8.123000144958496 19.2189998626709,8.123000144958496 C13.659000396728516,11.642999649047852 7.068999767303467,13.67300033569336 -0.0010000000474974513,13.67300033569336 C-7.071000099182129,13.67300033569336 -13.66100025177002,11.642999649047852 -19.22100067138672,8.123000144958496 C-19.22100067138672,8.123000144958496 -8.321000099182129,-13.677000045776367 -8.321000099182129,-13.677000045776367 C-6.160999774932861,-11.597000122070312 -3.2309999465942383,-10.32699966430664 -0.0010000000474974513,-10.32699966430664 C3.2290000915527344,-10.32699966430664 6.169000148773193,-11.597000122070312 8.319000244140625,-13.677000045776367z"></path></g></g><g transform="matrix(1,0,0,1,64.68399810791016,27.89699935913086)" opacity="1" style="display: block;"><g opacity="1" transform="matrix(1,0,0,1,0,0)"><path fill="rgb(255,255,255)" fill-opacity="1" d=" M15.314000129699707,16.10700035095215 C15.314000129699707,16.10700035095215 -8.685999870300293,16.10700035095215 -8.685999870300293,16.10700035095215 C-8.685999870300293,11.406999588012695 -11.38599967956543,7.336999893188477 -15.315999984741211,5.367000102996826 C-15.315999984741211,5.367000102996826 -4.576000213623047,-16.10300064086914 -4.576000213623047,-16.10300064086914 C7.214000225067139,-10.192999839782715 15.314000129699707,2.006999969482422 15.314000129699707,16.10700035095215z"></path></g></g><g transform="matrix(1,0,0,1,23.31599998474121,27.89699935913086)" opacity="1" style="display: block;"><g opacity="1" transform="matrix(1,0,0,1,0,0)"><path fill="rgb(255,255,255)" fill-opacity="1" d=" M4.584000110626221,-16.10300064086914 C4.584000110626221,-16.10300064086914 15.314000129699707,5.367000102996826 15.314000129699707,5.367000102996826 C11.383999824523926,7.336999893188477 8.684000015258789,11.406999588012695 8.684000015258789,16.10700035095215 C8.684000015258789,16.10700035095215 -15.315999984741211,16.10700035095215 -15.315999984741211,16.10700035095215 C-15.315999984741211,2.006999969482422 -7.216000080108643,-10.192999839782715 4.584000110626221,-16.10300064086914z"></path></g></g><g transform="matrix(1,0,0,1,44,44)" opacity="1" style="display: block;"><g opacity="1" transform="matrix(1,0,0,1,0,0)"><path fill="rgb(255,255,255)" fill-opacity="1" d=" M0,-4 C2.140000104904175,-4 3.890000104904175,-2.319999933242798 4,-0.20000000298023224 C4,-0.20000000298023224 4,0 4,0 C4,0 4,0.20000000298023224 4,0.20000000298023224 C3.890000104904175,2.319999933242798 2.140000104904175,4 0,4 C-2.2100000381469727,4 -4,2.2100000381469727 -4,0 C-4,-2.2100000381469727 -2.2100000381469727,-4 0,-4z"></path></g></g></g></svg>
`;

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
                    <div class="${styles["video-resolvepower"]} ${styles["video-controller"]}" aria-label="分辨率" ">
                        分辨率
                        <ul class="${styles["video-resolvepower-set"]}" style="display:none;bottom:41px">
                            <li><span>1080p超清</span></li>
                            <li><span>720p高清</span></li>
                            <li><span>480p标清</span></li>
                            <li><span>360p流畅</span></li>
                            <li><span>自动</span></li>
                        </ul>
                    </div>
                    <div class="${styles["video-playrate"]} ${styles["video-controller"]}" aria-label="倍速">
                        倍速
                        <ul class="${styles["video-playrate-set"]}" aria-label="调节播放速度" style="display:none; bottom:41px">
                            <li>2.0x</li>
                            <li>1.5x</li>
                            <li>1.25x</li>
                            <li>1.0x</li>
                            <li>0.75x</li>
                            <li>0.5x</li>
                        </ul>
                    </div>
                    <div class="${styles["video-volume"]} ${styles["video-controller"]}" aria-label="音量">
                        <div class="${styles["video-volume-set"]}" aria-label="调节音量" style="display:none; bottom:41px" >
                            <div class="${styles["video-volume-show"]}">48</div>
                            <div class="${styles["video-volume-progress"]}" style="height: 70px">
                                <div class="${styles["video-volume-completed"]}" style="height: 0"></div>
                                <div class="${styles["video-volume-dot"]}" style="bottom: 100%"></div>
                            </div>
                        </div>
                        <div class="${styles["video-icon"]}">${volumeSVG}</div>
                    </div>
                    <div class="${styles["video-subsettings"]} ${styles["video-controller"]}" aria-label="设置">
                        <div class="${styles["video-icon"]}">${settingSVG}</div>
                    </div>
                    <div class="${styles["video-fullscreen"]} ${styles["video-controller"]}" aria-label="全屏">
                        <div class="${styles["video-icon"]}">${fullScreenSVG}</div> 
                    </div>
                </div>
            </div>
        `;
        }
        /**
         * @description 控制栏的事件 开始播放/关闭播放 ，全屏，设置
         */
        initControllerEvent() {
            this.volumeCompleted.style.height = this.video.volume * 100 + "%";
            this.volumeDot.style.bottom =
                parseInt(this.volumeProgress.style.height) * this.video.volume - 6 + "px";
            /**
             * @description 监听鼠标的点击事件来决定是否暂停还是播放视频
             */
            this.videoPlayBtn.onclick = (e) => {
                if (this.video.paused) {
                    this.video.play();
                }
                else if (this.video.played) {
                    this.video.pause();
                }
            };
            /**
             * @description 点击进入全屏模式
            */
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
            /**
             * @desciption 显示音量的设置
             * TODO:这部分控制选项的显示和隐藏的逻辑可以复用
             */
            this.volumeBtn.onmouseenter = (e) => {
                this.volumeSet.style.display = "block";
                let ctx = this;
                document.onmousemove = (e) => {
                    ctx.handleMouseMove(e, "volume");
                };
            };
            this.playRate.onmouseenter = (e) => {
                this.playRateSet.style.display = "block";
                let ctx = this;
                document.body.onmousemove = (e) => {
                    ctx.handleMouseMove(e, "playrate");
                };
            };
            this.resolvePower.onmouseenter = (e) => {
                this.resolvePowerSet.style.display = "block";
                let ctx = this;
                document.body.onmousemove = (e) => {
                    ctx.handleMouseMove(e, "resolvepower");
                };
            };
            this.volumeDot.onmousedown = (e) => {
                let mouseY = e.pageY;
                let comHeight = this.volumeCompleted.clientHeight;
                document.body.onmousemove = (e) => {
                    let pageY = e.pageY;
                    let scale = (mouseY - pageY + comHeight) / this.volumeProgress.clientHeight;
                    if (scale > 1)
                        scale = 1;
                    else if (scale < 0)
                        scale = 0;
                    this.volumeCompleted.style.height = scale * 100 + "%";
                    this.volumeDot.style.bottom = this.volumeProgress.clientHeight * scale - 6 + "px";
                    this.video.volume = scale;
                };
                document.onmouseup = () => {
                    document.onmousemove = null;
                };
                e.preventDefault();
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
                this.fullScreen = this.container.querySelector(`.${styles["video-fullscreen"]}`);
                this.volumeBtn = this.container.querySelector(`.${styles["video-volume"]}`);
                this.volumeSet = this.container.querySelector(`.${styles["video-volume-set"]}`);
                this.volumeCompleted = this.container.querySelector(`.${styles["video-volume-completed"]}`);
                this.volumeProgress = this.container.querySelector(`.${styles["video-volume-progress"]}`);
                this.volumeDot = this.container.querySelector(`.${styles["video-volume-dot"]}`);
                this.playRate = this.container.querySelector(`.${styles["video-playrate"]}`);
                this.playRateSet = this.container.querySelector(`.${styles["video-playrate-set"]}`);
                this.resolvePower = this.container.querySelector(`.${styles["video-resolvepower"]}`);
                this.resolvePowerSet = this.container.querySelector(`.${styles["video-resolvepower-set"]}`);
                this.initControllerEvent();
            });
        }
        handleMouseMove(e, type) {
            let pX = e.pageX, pY = e.pageY;
            let ctx = this;
            if (type === "volume") {
                if (!checkIsMouseInRange(ctx.volumeBtn, ctx.volumeSet, pX, pY)) {
                    ctx.volumeSet.style.display = "none";
                    document.body.onmousemove = null;
                }
            }
            else if (type === "playrate") {
                if (!checkIsMouseInRange(ctx.playRate, ctx.playRateSet, pX, pY)) {
                    ctx.playRateSet.style.display = "none";
                    document.body.onmousemove = null;
                }
            }
            else if (type === "resolvepower") {
                if (!checkIsMouseInRange(ctx.resolvePower, ctx.resolvePowerSet, pX, pY)) {
                    ctx.resolvePowerSet.style.display = "none";
                    document.body.onmousemove = null;
                    document.onmousemove = null;
                }
            }
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
    exports.checkMpd = checkMpd;
    exports.checkPeriod = checkPeriod;
    exports.checkRepresentation = checkRepresentation;
    exports.checkSegmentBase = checkSegmentBase;
    exports.checkSegmentList = checkSegmentList;
    exports.checkSegmentTemplate = checkSegmentTemplate;
    exports.checkSegmentURL = checkSegmentURL;
    exports.formatTime = formatTime;
    exports.icon = icon;
    exports.parseDuration = parseDuration;
    exports.string2boolean = string2boolean;
    exports.string2number = string2number;
    exports.styles = styles;
    exports.switchToSeconds = switchToSeconds;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
