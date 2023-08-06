import { DomNodeTypes, ManifestObjectNode } from "../../types/dash/DomNodeTypes";
import { FactoryObject } from "../../types/dash/Factory";
import FactoryMaker from "../FactoryMaker";
import { SegmentTemplate, Representation } from "../../types/dash/MpdFile";
import SegmentTemplateParserFactory, { SegmentTemplateParser } from "./SegmentTemplateParser";


// DashParser 调用 new实例 的 parse方法 会返回 对应string的 节点解析数据
class DashParser {
    private config: FactoryObject = {};
    private segmentTemplateParser: SegmentTemplateParser;
    private templateReg: RegExp = /\$(.+)?\$/;

    constructor(ctx: FactoryObject, ...args) {
        this.config = ctx.context;
        this.setup()
    }

    setup() {
        this.segmentTemplateParser = SegmentTemplateParserFactory({}).getInstance()
    }

    string2xml(s: string): Document {
        // DOMParser 提供将XML或HTML源代码从字符串解析成DOM文档的能力。
        let parser = new DOMParser();
        return parser.parseFromString(s, "text/xml");
    }

    // 将string转换为 MpdDocument 或者 Mpd
    parse(manifest: string): ManifestObjectNode["MpdDocument"] | ManifestObjectNode["Mpd"] {
        let xml = this.string2xml(manifest);

        let Mpd;
        // 将 dom类型的 xml转换成 mpd
        if (this.config.override) {
            Mpd = this.parseDOMChildren("Mpd", xml);
        } else {
            Mpd = this.parseDOMChildren("MpdDocument", xml);
        }

        this.mergeNodeSegementTemplate(Mpd);
        return Mpd
    }

    // 根据节点类型进行分类 将 Dom 类型的数据 通过递归的转换子节点，最后返回一个result的树状对象
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

    // 将 SegementTemplate 放到子节点当中， 在转换好的 树状dom文件中 找到 SegmentTemplate 调用下面的mergeNode把一层层的SegmentTemplate汇总起来
    mergeNodeSegementTemplate(Mpd: FactoryObject) {
        let segmentTemplate: SegmentTemplate | null = null;
        Mpd["Period_asArray"].forEach(Period => {
            if (Period["SegmentTemplate_asArray"]) {
                // 取[0]是因为他们 template只能在第一位
                segmentTemplate = Period["SegmentTemplate_asArray"][0];
            }
            Period["AdaptationSet_asArray"].forEach(AdaptationSet => {
                let template = segmentTemplate;
                // 这一步把 segmentTemplate 放到 adaptionset里面 
                if (segmentTemplate) {
                    this.mergeNode(AdaptationSet, segmentTemplate);
                }
                // 再把 segmentTemplate 拿出来
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

    mergeNode(node: FactoryObject, compare: FactoryObject) {
        // 合并规则：有相同tag时 有的属性按 node，没有的属性按compare，
        //          node上面没有时，全用compare

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
            node[compare.tag] = compare;
            node.__children = node.__children || [];
            node.__children.push(compare);
            node[`${compare.tag}__asArray`] = [compare];
        }
    }

    // 将进过merge后的SegementTemplate，转换为真是的路由地址
    parseNodeSegmentTemplate(Mpd: FactoryObject) {
        Mpd["Period_asArray"].forEach(Period => {
            Period["AdaptationSet_asArray"].forEach(AdaptationSet => {
                AdaptationSet["Representation_asArray"].forEach(Representation => {
                    let SegmentTemplate = Representation["SegmentTemplate"];
                    this.generateInitializationURL(SegmentTemplate, Representation);
                    this.generateMediaURL(SegmentTemplate, Representation);
                })
            })
        });
    }

    // 通过匹配替换的方式 在 上层注入initializationURL
    generateInitializationURL(SegmentTemplate: SegmentTemplate, parent: Representation) {
        let initialization = SegmentTemplate.initialization;
        let media = SegmentTemplate.media;
        let r;
        let formatArray = new Array<string>();
        let replaceArray = new Array<string>();
        if (this.templateReg.test(initialization)) {
            while (r = this.templateReg.exec(initialization)) {
                formatArray.push(r[0]);
                if (r[1] === "Number") {
                    r[1] = "1";
                } else if (r[1] === "RepresentationID") {
                    r[1] = parent.id!;
                }
                replaceArray.push(r[1]);
            }

            let index = 0;
            while (index < replaceArray.length) {
                initialization.replace(formatArray[index], replaceArray[index]);
                index++;
            }
        }
        parent.initializationURL = initialization;
    }

    generateMediaURL(SegmentTemplate: SegmentTemplate, parent: Representation) {
        let meida = SegmentTemplate.media;
        let r;
        let formatArray = new Array<string>();
        let replaceArray = new Array<string>();
    }

}

const DashParserFactory = FactoryMaker.getSingleFactory(DashParser);

export default DashParserFactory;

export { DashParser }
