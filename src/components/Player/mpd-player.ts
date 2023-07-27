import { parseMpd } from "../../dash/parseMpd";
import { Axios } from "../../axios/Axios";
import { Player } from "./player";
import { AxiosReturnType } from "../../types/AxiosRequest";

export class MpdPlayer {
    private player: Player;
    private mpd: Document;
    private RequestInfo: any;
    private mpdUrl: string;
    private axios: Axios;
    constructor(player: Player) {
        this.player = player;
        this.axios = new Axios();
        this.mpdUrl = this.player.playerOptions.url;
        this.init();
    }

    // 
    async init() {
        await this.getMpdFile(this.mpdUrl);
        this.RequestInfo.mpdRequest.forEach(async (child) => {
            let videoResolve = child.videoRequest["1920*1080"];
            let audioResolve = child.audioRequest["48000"];
            let val = await Promise.all([
                this.getInitializationSegment(videoResolve[0].url),
                this.getInitializationSegment(audioResolve[0].url),
            ]);
            console.log(val)
        });
    }

    /**
     * @description 获取并且解析MPD文件
     */
    async getMpdFile(url: string) {
        let val = await this.axios.get(url, {}, "text")
        let parser = new DOMParser(); // DOMParser 是一个 JavaScript API，用于将 XML 或 HTML 字符串解析为 DOM（Document Object Model）文档。
        let document = parser.parseFromString(val.data as string, "text/xml");
        let result = parseMpd(
            document,
            "https://dash.akamaized.net/envivio/EnvivioDash3/"
        );
        this.mpd = document
        this.RequestInfo = result
        console.log("mpd文件资源", document, ".  请求资源", result);
    }

    /**
     * @description 根据解析到的MPD文件获取初始段（Initialization Segment）
     */
    getInitializationSegment(url: string): Promise<AxiosReturnType> {
        return this.axios.get(url, {}, "arraybuffer")
    }

}