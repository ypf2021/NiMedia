import {
    ComponentItem,
    PlayerOptions,
    ToolBar,
    DOMProps,
    registerOptions
} from "../index";
import "./player.less";

import { Component } from "../class/Component";
import { $, patchComponent } from "../utils/domUtils";
import { Plugin } from "../index";
import { CONTROL_COMPONENT_STORE } from "../utils/store";

class Player extends Component implements ComponentItem {
    readonly id = "Player";
    readonly playerOptions: PlayerOptions = {
        url: "",
        autoplay: false,
        width: "100%",
        height: "100%",
        container: document.body
    };
    props: DOMProps = {};
    container: HTMLElement;
    video: HTMLVideoElement;
    toolBar: ToolBar;

    constructor(options: PlayerOptions) {
        super(options.container, "div.video-wrapper");
        this.playerOptions = Object.assign(this.playerOptions, options);
        this.container = options.container;
        console.log("playerOptions", this.playerOptions)
        options.container.className = "video-container";
        options.container.style.width = this.playerOptions.width + "px";
        options.container.style.height = this.playerOptions.height + "px"
        this.init();
    }

    init() {
        this.video = $("video");
        this.video.src = this.playerOptions.url || "";
        this.el.appendChild(this.video);
        this.toolBar = new ToolBar(this, this.el, "div");
        this.initEvent();
        this.initPlugin();
    }

    initEvent() {
        this.el.onmousemove = (e) => {
            this.emit("showtoolbar", e);
        }

        this.el.onmouseenter = (e) => {
            this.emit("showtoolbar", e);
        }

        this.el.onmouseleave = (e) => {
            this.emit("hidetoolbar", e);
        }

        this.video.onloadedmetadata = (e) => {
            this.emit("loadedmetadata", e);
        }

        this.video.ontimeupdate = (e) => {
            this.emit("timeupdate", e);
        }

        this.video.onplay = (e) => {
            this.emit("play", e);
        }

        this.video.onpause = (e) => {
            this.emit("pause", e);
        }


        this.on("progress-click", (e, ctx) => {
            let scale = e.offsetX / ctx.el.offsetWidth;
            if (scale < 0) {
                scale = 0;
            } else if (scale > 1) {
                scale = 1;
            }
            this.video.currentTime = Math.floor(scale * this.video.duration);
            this.video.paused && this.video.play();
        })
    }


    initPlugin() {
        if (this.playerOptions.plugins) {
            this.playerOptions.plugins.forEach(plugin => {
                this.use(plugin);
            })
        }
    }

    attendSource(url: string) {
        this.video.src = url;
    }

    registerControls(id: string, component: Partial<ComponentItem> & registerOptions) {
        let store = CONTROL_COMPONENT_STORE;
        if (store.has(id)) {
            if (component.replaceElementType) {
                patchComponent(store.get(id), component, { replaceElementType: component.replaceElementType })
            } else {
                patchComponent(store.get(id), component);
            }
        } else {
            // 如果注册的内容是用户自创的，
            if (!component.el) {
                throw new Error(`传入的原创组件${id}没有对应的DOM元素`)
            }
            this.toolBar.controller.settings.appendChild(component.el);
        }
    }

    /**
     * @description 注册对应的组件
     * @param plugin 
     */
    use(plugin: Plugin) {
        plugin.install(this);
    }

}
export { Player };