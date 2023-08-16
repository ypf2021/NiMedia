import { FactoryObject } from "../../types/dash/Factory";
import FactoryMaker from "../FactoryMaker";
import { AdaptationSet, Mpd, Period, Representation, SegmentTemplate } from "../../types/dash/MpdFile";
import { parseDuration, switchToSeconds } from "../../utils/format";
import { DashParser } from "./DashParser";

/**
 * @description 该类仅用于处理MPD文件中具有SegmentTemplate此种情况,
 */
class SegmentTemplateParser {
    private config: FactoryObject
    // private dashParser: DashParser

    constructor(ctx: FactoryObject, ...args: any[]) {
        this.config = ctx.context;
        this.setup()
    }
    setup() {
    }

    /**
     * @param {(Mpd | Period | AdaptationSet)} Mpd
     * @memberof SegmentTemplateParser
     * @description 处理 InitializationURL，MediaURL 的函数 将其从模板转换为真实的地址，并放到Representation上面
     */
    parse(Mpd: Mpd | Period | AdaptationSet) {
        // DashParser.setDurationForRepresentation(Mpd);
        // this.setSegmentDurationForRepresentation(Mpd as Mpd);
        this.parseNodeSegmentTemplate(Mpd as Mpd);
    }

    /**
     * @param {Mpd} Mpd
     * @memberof SegmentTemplateParser
     * @description 调用 处理 InitializationURL，MediaURL 的函数 将其从模板转换为真实的地址
     */
    parseNodeSegmentTemplate(Mpd: Mpd) {
        Mpd["Period_asArray"].forEach(Period => {
            Period["AdaptationSet_asArray"].forEach(AdaptationSet => {
                AdaptationSet["Representation_asArray"].forEach(Representation => {
                    let SegmentTemplate = Representation["SegmentTemplate"];
                    if (SegmentTemplate) {
                        this.generateInitializationURL(SegmentTemplate, Representation);
                        this.generateMediaURL(SegmentTemplate, Representation);
                    }
                })
            })
        })
    }

    /**
     * @param {SegmentTemplate} SegmentTemplate
     * @param {Representation} parent
     * @memberof SegmentTemplateParser
     * @description 通过正则和替换 得出 initializationURL
     */
    generateInitializationURL(SegmentTemplate: SegmentTemplate, parent: Representation) {
        let templateReg: RegExp = /\$(.+?)\$/ig;
        let initialization = SegmentTemplate.initialization;
        let r;
        let formatArray = new Array<string>();
        let replaceArray = new Array<string>();
        if (templateReg.test(initialization)) {
            templateReg.lastIndex = 0;
            while (r = templateReg.exec(initialization)) {
                formatArray.push(r[0]);
                // console.log("ri", r, formatArray)

                if (r[1] === "Number") {
                    r[1] = "1";
                } else if (r[1] === "RepresentationID") {
                    r[1] = parent.id!;
                }
                replaceArray.push(r[1]);
            }

            let index = 0;
            while (index < replaceArray.length) {
                initialization = initialization.replace(formatArray[index], replaceArray[index]);
                index++;
            }
        }
        parent.initializationURL = initialization;
    }

    /**
     * @param {SegmentTemplate} SegmentTemplate
     * @param {Representation} parent
     * @memberof SegmentTemplateParser
     * @description 通过正则和替换 得出 MediaURL
     */
    generateMediaURL(SegmentTemplate: SegmentTemplate, parent: Representation) {
        let templateReg: RegExp = /\$(.+?)\$/ig;  //这个正则表达式的意思是匹配字符串中所有以"$"开头和结束的部分
        let media = SegmentTemplate.media;
        let r; // exec返回值为数组 
        // 索引 0 包含匹配的字符串。
        // 索引 1 开始包含第一个捕获组（如果有的话）的匹配结果。
        // 索引 2 开始包含第二个捕获组的匹配结果，以此类推。

        let formatArray = new Array<string>();
        let replaceArray = new Array<string>();
        parent.mediaURL = new Array<string>();

        // test() 方法执行一个检索，用来查看正则表达式与指定的字符串是否匹配。返回 true 或 false。
        if (templateReg.test(media)) {
            templateReg.lastIndex = 0;
            while (r = templateReg.exec(media)) {
                console.log(r)
                formatArray.push(r[0]); // "$Number$"
                if (r[1] === "Number") { //如果 $ xxx $ 包含的内容为 number就换为 @number@
                    r[1] = "@Number@";
                } else if (r[1] === "RepresentationID") {
                    r[1] = parent.id;
                }
                replaceArray.push(r[1]);
            }
        }

        let index = 0;
        while (index < replaceArray.length) {
            // 把 $ 的部分换为 @
            media = media.replace(formatArray[index], replaceArray[index]);
            index++;
        }

        // 有的mpd文件的duration是 秒，有的是 NPT
        if (typeof parent.duration === "string" && parent.duration.startsWith("PT")) {
            parent.duration = switchToSeconds(parseDuration(parent.duration))
        }

        console.log("parent.duration", parent.duration, "parent.segmentDuration", parent.segmentDuration)

        for (let i = 1; i <= Math.ceil(parent.duration / parent.segmentDuration); i++) {
            let s = media;
            console.log("medias", s)
            while (s.includes("@Number@")) {
                s = s.replace("@Number@", `${i}`);
            }
            // parent.mediaURL[i] = s; 这样的话mediaURL[]的第一项是空的
            parent.mediaURL.push(s);
        }

    }

}

const factory = FactoryMaker.getSingleFactory(SegmentTemplateParser);
export default factory;
export { SegmentTemplateParser };