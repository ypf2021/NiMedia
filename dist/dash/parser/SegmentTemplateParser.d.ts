import { FactoryObject } from "../../types/dash/Factory";
import { AdaptationSet, Mpd, Period, Representation, SegmentTemplate } from "../../types/dash/MpdFile";
/**
 * @description 该类仅用于处理MPD文件中具有SegmentTemplate此种情况,
 */
declare class SegmentTemplateParser {
    private config;
    constructor(ctx: FactoryObject, ...args: any[]);
    setup(): void;
    /**
     * @param {(Mpd | Period | AdaptationSet)} Mpd
     * @memberof SegmentTemplateParser
     * @description 处理 InitializationURL，MediaURL 的函数 将其从模板转换为真实的地址，并放到Representation上面
     */
    parse(Mpd: Mpd | Period | AdaptationSet): void;
    /**
     * @param {Mpd} Mpd
     * @memberof SegmentTemplateParser
     * @description 调用 处理 InitializationURL，MediaURL 的函数 将其从模板转换为真实的地址
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
