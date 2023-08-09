import { ManifestObjectNode } from "../../types/dash/DomNodeTypes";
import { FactoryObject } from "../../types/dash/Factory";
import { Mpd } from "../../types/dash/MpdFile";
declare class DashParser {
    private config;
    private segmentTemplateParser;
    private eventBus;
    private mpdURL;
    private URLUtils;
    constructor(ctx: FactoryObject, ...args: any[]);
    setup(): void;
    initialEvent(): void;
    string2xml(s: string): Document;
    /**
     * @description 处理请求到的Mpd字符串，parse之后 Mpd有SegmentTemplate，分辨率，持续时间，Media，initial地址，baseURL
     * @param {string} manifest
     * @return {*}  {(ManifestObjectNode["MpdDocument"] | ManifestObjectNode["Mpd"])}
     * @memberof DashParser
     */
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
    getTotalDuration(Mpd: Mpd): number | never;
    /**
     * @static
     * @param {(Mpd | Period | AdaptationSet)} Mpd
     * @memberof DashParser
     * @description 给每一个Representation对象上挂载duration属性
     */
    setDurationForRepresentation(Mpd: Mpd): void;
    /**
     * @description 将Mpd的请求URL 截取到最后一个 / 之前，作为Mpd的BaseURL
     * @param {*} Mpd
     * @memberof DashParser
     */
    setBaseURLForMpd(Mpd: any): void;
    /**
    * @param {Mpd} Mpd
    * @memberof SegmentTemplateParser
    * @description 设置 Representation_asArray 的 segmentDuration 一般为 (duration / timescale)
    */
    setSegmentDurationForRepresentation(Mpd: Mpd): void;
    onSourceAttached(url: string): void;
    /**
    * @description 在 Representation_asArray 上添加分辨率 resolvePower
    * @param {Mpd} Mpd
    * @memberof DashParser
    */
    setResolvePowerForRepresentation(Mpd: Mpd): void;
}
declare const DashParserFactory: import("../../types/dash/Factory").FactoryFunction<DashParser>;
export default DashParserFactory;
export { DashParser };
