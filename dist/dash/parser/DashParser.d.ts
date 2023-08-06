import { ManifestObjectNode } from "../../types/dash/DomNodeTypes";
import { FactoryObject } from "../../types/dash/Factory";
import { Mpd, AdaptationSet, Period } from "../../types/dash/MpdFile";
declare class DashParser {
    private config;
    private segmentTemplateParser;
    constructor(ctx: FactoryObject, ...args: any[]);
    setup(): void;
    string2xml(s: string): Document;
    parse(manifest: string): ManifestObjectNode["MpdDocument"] | ManifestObjectNode["Mpd"];
    /**
     * @param {T} name
     * @param {Node} node
     * @return {*}  {ManifestObjectNode[T]}
     * @memberof DashParser
     * @description 根据节点类型进行分类 将 Dom 类型的数据 通过递归的转换子节点，最后返回一个result的树状对象,在请求得到的数据上面加上 __children和 _asArray
     */
    parseDOMChildren<T extends string>(name: T, node: Node): ManifestObjectNode[T];
    /**
     * @param {Mpd} Mpd MPDdom资源文件
     * @memberof DashParser
     * @description 将 SegementTemplate 放到子节点当中， 在转换好的 树状dom文件中 找到 SegmentTemplate 调用下面的mergeNode把一层层的SegmentTemplate汇总起来
     */
    mergeNodeSegementTemplate(Mpd: Mpd): void;
    /**
     * @param {FactoryObject} node 目标
     * @param {FactoryObject} compare 被合并的
     * @memberof DashParser
     * @description 用来合并节点的内容 合并规则：有相同tag时 有的属性按 node，没有的属性按compare，node上面没有时，全用compare
     */
    mergeNode(node: FactoryObject, compare: FactoryObject): void;
    static getTotalDuration(Mpd: Mpd): number | never;
    /**
     * @static
     * @param {(Mpd | Period | AdaptationSet)} Mpd
     * @memberof DashParser
     * @description 给每一个Representation对象上挂载duration属性
     */
    static setDurationForRepresentation(Mpd: Mpd | Period | AdaptationSet): void;
}
declare const DashParserFactory: import("../../types/dash/Factory").FactoryFunction<DashParser>;
export default DashParserFactory;
export { DashParser };
