import { DomNodeTypes, ManifestObjectNode } from "../../types/dash/DomNodeTypes";
import { FactoryObject } from "../../types/dash/Factory";
import FactoryMaker from "../FactoryMaker";
import { Mpd, SegmentTemplate, AdaptationSet, Period } from "../../types/dash/MpdFile";
import SegmentTemplateParserFactory, { SegmentTemplateParser } from "./SegmentTemplateParser";
import { parseDuration, switchToSeconds } from "../../utils/format";
import { checkMpd, checkPeriod } from "../../utils/typeCheck";
import EventBusFactory, { EventBus } from "../event/EventBus";
import { EventConstants } from "../event/EventConstants";
import URLUtilsFactory, { URLUtils } from "../utils/URLUtils";

// DashParser 调用 new实例 的 parse方法 会返回 对应string的 节点解析数据
class DashParser {
    private config: FactoryObject = {};
    private segmentTemplateParser: SegmentTemplateParser;
    private eventBus: EventBus;
    private mpdURL: string;
    private URLUtils: URLUtils;

    constructor(ctx: FactoryObject, ...args) {
        this.config = ctx.context;
        this.setup();
        this.initialEvent();
    }

    setup() {
        this.segmentTemplateParser = SegmentTemplateParserFactory().getInstance()
        this.eventBus = EventBusFactory().getInstance();
        this.URLUtils = URLUtilsFactory().getInstance();
    }

    initialEvent() {
        this.eventBus.on(EventConstants.SOURCE_ATTACHED, this.onSourceAttached, this)
    }

    string2xml(s: string): Document {
        // DOMParser 提供将XML或HTML源代码从字符串解析成DOM文档的能力。
        let parser = new DOMParser();
        return parser.parseFromString(s, "text/xml");
    }

    // 解析请求到的xml类型的文本字符串，生成MPD对象,方便后续的解析

    /**
     * @description 处理请求到的Mpd字符串，parse之后 Mpd有SegmentTemplate，分辨率，持续时间，Media，initial地址，baseURL
     * @param {string} manifest
     * @return {*}  {(ManifestObjectNode["MpdDocument"] | ManifestObjectNode["Mpd"])}
     * @memberof DashParser
     */
    parse(manifest: string): ManifestObjectNode["MpdDocument"] | ManifestObjectNode["Mpd"] {
        let xml = this.string2xml(manifest);

        let Mpd;
        // 将 dom类型的 xml转换成 mpd
        if (this.config.override) {
            Mpd = this.parseDOMChildren("Mpd", xml);
        } else {
            Mpd = this.parseDOMChildren("MpdDocument", xml);
        }
        console.log("parseDOMChildren后的 Mpd资源", Mpd)

        this.mergeNodeSegementTemplate(Mpd);
        this.setResolvePowerForRepresentation(Mpd);
        this.setDurationForRepresentation(Mpd);
        this.setSegmentDurationForRepresentation(Mpd);
        this.setBaseURLForMpd(Mpd);
        this.segmentTemplateParser.parse(Mpd);
        console.log("处理segmentTemplate后的mpd", Mpd);

        return Mpd
    }

    // 

    /**
     * @param {T} name
     * @param {Node} node
     * @return {*}  {ManifestObjectNode[T]}
     * @memberof DashParser
     * @description 根据节点类型进行分类 将 Dom 类型的数据 通过递归的转换子节点，最后返回一个result的树状对象,在请求得到的数据上面加上 __children和 _asArray
     */
    parseDOMChildren<T extends string>(name: T, node: Node): ManifestObjectNode[T] {
        // 如果node的类型为文档类型 9
        if (node.nodeType === DomNodeTypes.DOCUMENT_NODE) {
            let result = {
                tag: node.nodeName,
                __children: []
            };
            // 
            for (let index in node.childNodes) {
                // 文档类型的节点一定只有一个子节点
                if (node.childNodes[index].nodeType === DomNodeTypes.ELEMENT_NODE) {
                    // 忽略更节电  如果在配置指定需要忽略根节点的话，也就是忽略MpdDocument节点
                    if (!this.config.ignoreRoot) {
                        // 递归传递
                        result.__children[index] = this.parseDOMChildren(
                            node.childNodes[index].nodeName, node.childNodes[index]
                        );
                        result[node.childNodes[index].nodeName] = this.parseDOMChildren(
                            node.childNodes[index].nodeName, node.childNodes[index]
                        );
                    }
                    else {
                        // 文本节点，parseDOMChildren 只有一个子直接返回
                        return this.parseDOMChildren(node.childNodes[index].nodeName, node.childNodes[index]);
                    }
                }
            }
            return result;
        } else if (node.nodeType === DomNodeTypes.ELEMENT_NODE) {
            let result: FactoryObject = {
                tag: node.nodeName,
                __children: [],
            };
            // 1.解析node的子节点
            for (let index = 0; index < node.childNodes.length; index++) {
                let child = node.childNodes[index];
                result.__children[index] = this.parseDOMChildren(child.nodeName, child);
                // 下面3if是将同名的节点（同类型）放到一个数组里面
                if (!result[child.nodeName]) {
                    result[child.nodeName] = this.parseDOMChildren(child.nodeName, child);
                    continue
                }
                if (result[child.nodeName] && !Array.isArray(result[child.nodeName])) {
                    result[child.nodeName] = [result[child.nodeName]];
                }
                if (result[child.nodeName]) {
                    result[child.nodeName].push(this.parseDOMChildren(child.nodeName, child));
                }
            }
            // 将result遍历完后 将result上所有内容进行遍历, 将对应的nodename 全部转换为 nodeName__asArray模式，并全部转为对象
            for (let key in result) {
                if (key !== "tag" && key !== "__children") {
                    result[key + "_asArray"] = Array.isArray(result[key]) ? [...result[key]] : [result[key]]
                }
            }

            // 3.如果该Element节点中含有text节点，则需要合并为一个整体
            result["#text_asArray"] && result["#text_asArray"].forEach(text => {
                result.__text = result.__text || "";
                result.__text += `${text.text}/n`
            })

            // 2.解析node上挂载的属性
            for (let prop of (node as Element).attributes) {
                result[prop.name] = prop.value
            }
            return result; //最终返回的result中有tag 有nodename组成的数组，有属性
        } else if (node.nodeType === DomNodeTypes.TEXT_NODE) {
            return {
                tag: "#text",
                text: node.nodeValue
            }
        }
    };


    /**
     * @param {Mpd} Mpd MPDdom资源文件
     * @memberof DashParser
     * @description 将 SegementTemplate 放到子节点当中， 在转换好的 树状dom文件中 找到 SegmentTemplate 调用下面的mergeNode把一层层的SegmentTemplate汇总起来
     */
    mergeNodeSegementTemplate(Mpd: Mpd) {
        let segmentTemplate: SegmentTemplate | null = null;
        Mpd["Period_asArray"].forEach(Period => {
            if (Period["SegmentTemplate_asArray"]) {
                // 取[0]是因为他们 template只能在第一位
                segmentTemplate = Period["SegmentTemplate_asArray"][0];
            }
            Period["AdaptationSet_asArray"].forEach(AdaptationSet => {
                let template = segmentTemplate;
                // 先判断上面层中有没有segmentTemplate，有就merge
                if (segmentTemplate) {
                    this.mergeNode(AdaptationSet, segmentTemplate);
                }
                // 然后处理当前层的 SegmentTemplate， 赋值給segmentTemplate
                if (AdaptationSet["SegmentTemplate_asArray"]) {
                    segmentTemplate = AdaptationSet["SegmentTemplate_asArray"][0];
                }

                // 这一步再把 segmentTemplate 放到 Representation上面
                AdaptationSet["Representation_asArray"].forEach(Representation => {
                    if (segmentTemplate) {
                        this.mergeNode(Representation, segmentTemplate);
                    }
                })
                segmentTemplate = template
            });
        });
    }

    /**
     * @param {FactoryObject} node 目标
     * @param {FactoryObject} compare 被合并的
     * @memberof DashParser
     * @description 用来合并节点的内容 合并规则：有相同tag时 有的属性按 node，没有的属性按compare，node上面没有时，全用compare
     */
    mergeNode(node: FactoryObject, compare: FactoryObject) {
        // 合并规则：有相同tag时 有的属性按 node，没有的属性按compare，
        //          node上面没有时，全用compare

        // 先判断目标上面有没有这个东西， 有的话 原有的属性按原来的，新的属性按compare的
        if (node[compare.tag]) {
            let target = node[`${compare.tag}_asArray`];
            target.forEach(element => {
                for (let key in compare) {
                    if (!element.hasOwnProperty(key)) {
                        element[key] = compare[key];
                    }
                }
            });
        } else {
            // 如果目标上没有的话，就直接赋值过去
            node[compare.tag] = compare;
            node.__children = node.__children || [];
            node.__children.push(compare);
            node[`${compare.tag}__asArray`] = [compare];
        }
    }

    // 获取播放的总时间
    getTotalDuration(Mpd: Mpd): number | never {
        let totalDuration = 0;
        let MpdDuration = NaN;
        if (Mpd.mediaPresentationDuration) {
            MpdDuration = switchToSeconds(parseDuration(Mpd.mediaPresentationDuration));
            console.log("MpdDuration", MpdDuration)
        }
        // MPD文件的总时间要么是由Mpd标签上的availabilityStartTime指定，要么是每一个Period上的duration之和
        if (isNaN(MpdDuration)) {
            Mpd.children.forEach(Period => {
                if (Period.duration) {
                    totalDuration += switchToSeconds(parseDuration(Period.duration));
                } else {
                    throw new Error("MPD文件格式错误")
                }
            })
        } else {
            totalDuration = MpdDuration;
        }
        return totalDuration;
    }

    /**
     * @static
     * @param {(Mpd | Period | AdaptationSet)} Mpd
     * @memberof DashParser
     * @description 给每一个Representation对象上挂载duration属性
     */
    setDurationForRepresentation(Mpd: Mpd) {

        //1. 如果只有一个Period
        if (Mpd["Period_asArray"].length === 1) {
            let totalDuration = this.getTotalDuration(Mpd);
            Mpd["Period_asArray"].forEach(Period => {
                Period.duration = Period.duration || totalDuration;
                Period["AdaptationSet_asArray"].forEach(AdaptationSet => {
                    AdaptationSet.duration = totalDuration;
                    AdaptationSet["Representation_asArray"].forEach(Representation => {
                        Representation.duration = totalDuration;
                    })
                })
            })
        } else {
            Mpd["Period_asArray"].forEach(Period => {
                if (!Period.duration) throw new Error("MPD文件格式错误");
                let duration = Period.duration;
                Period["AdaptationSet_asArray"].forEach(AdaptationSet => {
                    AdaptationSet.duration = duration;
                    AdaptationSet["Representation_asArray"].forEach(Representation => {
                        Representation.duration = duration;
                    })
                })
            })
        }
    }

    /**
     * @description 将Mpd的请求URL 截取到最后一个 / 之前，作为Mpd的BaseURL
     * @param {*} Mpd
     * @memberof DashParser
     */
    setBaseURLForMpd(Mpd) {
        // 将用来请求Mpd的url截取到最后一个 / 之前
        // console.log("截取前的url", this.mpdURL)
        Mpd.baseURL = this.URLUtils.sliceLastURLPath(this.mpdURL);
        // console.log("截取后的url", Mpd)
    }

    // 给每一个Rpresentation对象上挂载segmentDuration属性，用来标识该Representation每一个Segment的时长
    /**
    * @param {Mpd} Mpd
    * @memberof SegmentTemplateParser
    * @description 设置 Representation_asArray 的 segmentDuration 一般为 (duration / timescale)
    */
    setSegmentDurationForRepresentation(Mpd: Mpd) {
        let maxSegmentDuration = switchToSeconds(parseDuration(Mpd.maxSegmentDuration));
        Mpd["Period_asArray"].forEach(Period => {
            Period["AdaptationSet_asArray"].forEach(AdaptationSet => {
                AdaptationSet["Representation_asArray"].forEach(Representation => {
                    if (Representation["SegmentTemplate"]) {
                        if ((Representation["SegmentTemplate"] as SegmentTemplate).duration) {
                            let duration = (Representation["SegmentTemplate"] as SegmentTemplate).duration
                            let timescale = (Representation["SegmentTemplate"] as SegmentTemplate).timescale || 1;
                            Representation.segmentDuration = (duration / timescale).toFixed(1);
                        } else {
                            if (maxSegmentDuration) {
                                Representation.segmentDuration = maxSegmentDuration;
                            } else {
                                throw new Error("MPD文件格式错误")
                            }
                        }
                    }
                })
            })
        })
    }

    onSourceAttached(url: string) {
        this.mpdURL = url; // 这里拿到的url是我们用来请求Mpd文件的url
    }

    /**
    * @description 在 Representation_asArray 上添加分辨率 resolvePower
    * @param {Mpd} Mpd
    * @memberof DashParser
    */
    setResolvePowerForRepresentation(Mpd: Mpd) {
        Mpd["Period_asArray"].forEach(Period => {
            Period["AdaptationSet_asArray"].forEach(AdaptationSet => {
                AdaptationSet["Representation_asArray"].forEach(Representation => {
                    if (Representation.width && Representation.height) {
                        Representation.resolvePower = `${Representation.width}*${Representation.height}`;
                    }
                })
            })
        })
    }

}

const DashParserFactory = FactoryMaker.getSingleFactory(DashParser);

export default DashParserFactory;

export { DashParser }
