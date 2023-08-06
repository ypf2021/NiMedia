import { FactoryObject } from "../../types/dash/Factory";
import { AdaptationSet, Mpd, Period, Representation, SegmentTemplate } from "../../types/dash/MpdFile";
/**
 * @description 该类仅用于处理MPD文件中具有SegmentTemplate此种情况
 */
declare class SegmentTemplateParser {
    private config;
    private dashParser;
    constructor(ctx: FactoryObject, ...args: any[]);
    setup(): void;
    /**
     * @param {(Mpd | Period | AdaptationSet)} Mpd
     * @memberof SegmentTemplateParser
     * @description MPDdom设置持续时间等内容
     */
    parse(Mpd: Mpd | Period | AdaptationSet): void;
    /**
     * @param {Mpd} Mpd
     * @memberof SegmentTemplateParser
     * @description 设置 Representation_asArray 的 segmentDuration 一般为 (duration / timescale)
     */
    setSegmentDurationForRepresentation(Mpd: Mpd): void;
    /**
     * @param {Mpd} Mpd
     * @memberof SegmentTemplateParser
     * @description 调用 处理 InitializationURL，MediaURL 的函数
     */
    parseNodeSegmentTemplate(Mpd: Mpd): void;
    /**
     * @param {SegmentTemplate} SegmentTemplate
     * @param {Representation} parent
     * @memberof SegmentTemplateParser
     * @description 通过正则和替换 得出 initializationURL
     */
    generateInitializationURL(SegmentTemplate: SegmentTemplate, parent: Representation): void;
    /**
     * @param {SegmentTemplate} SegmentTemplate
     * @param {Representation} parent
     * @memberof SegmentTemplateParser
     * @description 通过正则和替换 得出 MediaURL
     */
    generateMediaURL(SegmentTemplate: SegmentTemplate, parent: Representation): void;
}
declare const factory: import("../../types/dash/Factory").FactoryFunction<SegmentTemplateParser>;
export default factory;
export { SegmentTemplateParser };
