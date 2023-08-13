// 以下注释部分全部弃用
// 下面注释处理资源文件都很蠢
// import { parseMpd } from "../../dash/parseMpd";
// import { Axios } from "../../axios/Axios";
// import { Player } from "./player";
// import { AxiosReturnType } from "../../types/AxiosRequest";
// import { PeriodRequest, RangeRequest, SegmentRequest } from "../../types/MpdFile";

// export class MpdPlayer {
//     private player: Player;
//     private mpd: Document;
//     private RequestInfo: any;
//     private mpdUrl: string;
//     private axios: Axios;
//     constructor(player: Player) {
//         this.player = player;
//         this.axios = new Axios();
//         this.mpdUrl = this.player.playerOptions.url;
//         this.init();
//     }

//     //
//     async init() {
//         // this.player.video.controls = true; // 当 video.controls 属性为 true 时，用户界面中会显示视频控件
//         await this.getMpdFile(this.mpdUrl);
//         this.RequestInfo.mpdRequest.forEach(async (child) => {
//             //每一个 child 都是 PeriodRequest 类型的

//             await this.handlePeriod(child)

//         });
//     }

//     initEvent() {
//         this.player.toolbar.emit("mounted");
//         this.player.emit("mounted", this);
//     }




//     /**
//      * @description 获取并且解析MPD文件
//      */
//     async getMpdFile(url: string) {
//         let val = await this.axios.get(url, {}, "text")
//         let parser = new DOMParser(); // DOMParser 是一个 JavaScript API，用于将 XML 或 HTML 字符串解析为 DOM（Document Object Model）文档。
//         let document = parser.parseFromString(val.data as string, "text/xml");
//         let result = parseMpd(
//             document,
//             "https://dash.akamaized.net/envivio/EnvivioDash3/"
//         );
//         this.mpd = document
//         this.RequestInfo = result
//         console.log("mpd文件资源", document, ".  请求资源", result);
//     }

//     async handlePeriod(child: PeriodRequest) {
//         let videoResolve = child.videoRequest["1920*1080"];
//         let audioResolve = child.audioRequest["48000"];
//         await this.handleInitializationSegment(
//             videoResolve[0].url,
//             audioResolve[0].url
//         )
//         await this.handleMediaSegment(videoResolve.slice(1), audioResolve.slice(1));
//     }

//     async handleInitializationSegment(videoUrl: string, audioUrl: string) {
//         let val = await Promise.all([
//             this.getSegment(videoUrl),
//             this.getSegment(audioUrl)
//         ])
//     }

//     /**
//      * @description @description 根据解析到的MPD文件的段（Initialization Segment 和 Media Segment）
//      * 发起请求
//      */
//     getSegment(url: string): Promise<AxiosReturnType> {
//         return this.axios.get(url, {}, "arraybuffer")
//     }

//     // 处理第一个之后的全部
//     async handleMediaSegment(
//         videoRequest: (SegmentRequest | RangeRequest)[],
//         audioRequest: (SegmentRequest | RangeRequest)[]
//     ) {
//         for (
//             let i = 0;
//             i < Math.min(videoRequest.length, audioRequest.length);
//             i++
//         ) {
//             let val = await Promise.all([
//                 this.getSegment(videoRequest[i].url),
//                 this.getSegment(audioRequest[i].url),
//             ]);
//             // console.log(i + 1, val);
//         }
//     }
// }

import MediaPlayer from "../../dash/MediaPlayer";
import { Player } from "./player"

export class MpdPlayer {
    constructor(player: Player) {
        let mediaPlayer = MediaPlayer().create();
        mediaPlayer.attachSource(player.playerOptions.url)
        mediaPlayer.attachVideo(player.video);
        player.video.controls = true;
    }
}
