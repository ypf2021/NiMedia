import { ManifestObjectNode } from "../../types/dash/DomNodeTypes";
import { FactoryObject } from "../../types/dash/Factory";
import { SegmentTemplate, Representation } from "../../types/dash/MpdFile";
declare class DashParser {
    private config;
    private segmentTemplateParser;
    private templateReg;
    constructor(ctx: FactoryObject, ...args: any[]);
    setup(): void;
    string2xml(s: string): Document;
    parse(manifest: string): ManifestObjectNode["MpdDocument"] | ManifestObjectNode["Mpd"];
    parseDOMChildren<T extends string>(name: T, node: Node): ManifestObjectNode[T];
    mergeNodeSegementTemplate(Mpd: FactoryObject): void;
    mergeNode(node: FactoryObject, compare: FactoryObject): void;
    parseNodeSegmentTemplate(Mpd: FactoryObject): void;
    generateInitializationURL(SegmentTemplate: SegmentTemplate, parent: Representation): void;
    generateMediaURL(SegmentTemplate: SegmentTemplate, parent: Representation): void;
}
declare const DashParserFactory: import("../../types/dash/Factory").FactoryFunction<DashParser>;
export default DashParserFactory;
export { DashParser };
