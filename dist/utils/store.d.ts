import { ComponentItem } from "../types/Player";
import { FullScreen } from "../components/Controller/parts/FullScreen";
import { PlayButton } from "../components/Controller/parts/PlayButton";
import { Playrate } from "../components/Controller/parts/PlayerRate";
import { Volume } from "../components/Controller/parts/Volume";
export declare const CONTROL_COMPONENT_STORE: Map<string, ComponentItem>;
export declare const PROGRESS_COMPONENT_STORE: Map<string, ComponentItem>;
export declare function storeControlComponent(item: ComponentItem): void;
export declare function storeProgressComponent(item: ComponentItem): void;
export declare const controllersMapping: {
    PlayButton: typeof PlayButton;
    Playrate: typeof Playrate;
    Volume: typeof Volume;
    FullScreen: typeof FullScreen;
};
