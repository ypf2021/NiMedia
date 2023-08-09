import { FactoryFunction, FactoryObject } from "../../types/dash/Factory";
import { Mpd } from "../../types/dash/MpdFile";
import FactoryMaker from "../FactoryMaker";
import { Path } from "../../types/dash/Loocation";
class URLNode {
    url: string | null;
    children: URLNode[] = []
    constructor(url: string | null) {
        this.url = url || null;
    }

    setChild(index: number, child: URLNode) {
        this.children[index] = child;
    }

    getChild(index: number): URLNode {
        return this.children[index]
    }
}

class BaseURLParser {
    private config: FactoryObject = {};
    constructor(ctx: FactoryObject, ...args: any[]) {
        this.config = ctx.context;
        this.setup()
    }

    setup() { }

    // 返回URLNode 
    /**
     * @description 在Mpd结构中 找BaseURL ，有可能找不到返回的 URLNode信息全为null
     * @param {Mpd} manifest
     * @return {*}  {URLNode}
     * @memberof BaseURLParser
     */
    parseManifestForBaseURL(manifest: Mpd): URLNode {
        let root = new URLNode(null);
        //1. 一层层遍历每一个Period,AdaptationSet,Representation，规定BaseURL节点只可能出现在Period,AdaptationSet,Representation中
        manifest["Period_asArray"].forEach((p, pId) => {
            let url = null;
            if (p["BaseURL_asArray"]) {
                url = p["BaseURL_asArray"][0];
            }
            let periodNode = new URLNode(url);
            root.setChild(pId, periodNode);
            p["AdaptationSet_asArray"].forEach((a, aId) => {
                let url = null;
                if (a["BaseURL_asArray"]) {
                    url = a["BaseURL_asArray"][0];
                }
                let adaptationSetNode = new URLNode(url);
                periodNode.setChild(aId, adaptationSetNode);

                a["Representation_asArray"].forEach((r, rId) => {
                    let url = null;
                    if (r["BaseURL_asArray"]) {
                        url = r["BaseURL_asArray"][0];
                    }
                    let representationNode = new URLNode(url);
                    adaptationSetNode.setChild(rId, representationNode);
                })
            })
        })
        // 全部遍历完后返回URLNode构成的节点
        return root;
    }

    getBaseURLByPath(path: Path, urlNode: URLNode): string {
        let baseURL = "";
        let root = urlNode;
        for (let i = 0; i < path.length; i++) {
            if (path[i] >= root.children.length || path[i] < 0) {
                throw new Error("传入的路径不正确");
            }
            // baseURL += root.children[path[i]].url;
            if (root.children[path[i]].url) {
                baseURL += root.children[path[i]].url;
            }
            root = root.children[path[i]];
        }
        // 遍历到最后一层时 root 的child应该为空，不能再有值
        if (root.children.length > 0) {
            throw new Error("传入的路径不正确");
        }
        // console.log("getBaseURLByPath生成的baseUrl", baseURL) // 如果 AdaptionSet再往下都没有 baseURL那么就全是空
        return baseURL; // 这是对每一层的url进行了一个拼接
    }
}

const factory = FactoryMaker.getSingleFactory(BaseURLParser)
export default factory;
export { BaseURLParser, URLNode } 