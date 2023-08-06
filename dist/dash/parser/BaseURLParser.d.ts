import { FactoryFunction, FactoryObject } from "../../types/dash/Factory";
import { Mpd } from "../../types/dash/MpdFile";
import { Path } from "../../types/dash/Loocation";
declare class URLNode {
    url: string | null;
    children: URLNode[];
    constructor(url: string | null);
    setChild(index: number, child: URLNode): void;
    getChild(index: number): URLNode;
}
declare class BaseURLParser {
    private config;
    constructor(ctx: FactoryObject, ...args: any[]);
    setup(): void;
    parseManifestForBaseURL(manifest: Mpd): URLNode;
    getBaseURLByPath(path: Path, urlNode: URLNode): string;
}
declare const factory: FactoryFunction<BaseURLParser>;
export default factory;
export { BaseURLParser, URLNode };
