import { ComponentItem } from "../types/Player";
import { FullScreen } from "../components/Controller/parts/FullScreen";
import { PlayButton } from "../components/Controller/parts/PlayButton";
import { Playrate } from "../components/Controller/parts/PlayerRate";
import { Volume } from "../components/Controller/parts/Volume";

export const CONTROL_COMPONENT_STORE = new Map<string, ComponentItem>();
export const PROGRESS_COMPONENT_STORE = new Map<string, ComponentItem>();

export function storeControlComponent(item: ComponentItem) {
    CONTROL_COMPONENT_STORE.set(item.id, item);
}

export function storeProgressComponent(item: ComponentItem) {
    PROGRESS_COMPONENT_STORE.set(item.id, item);
}


export const controllersMapping = {
    "PlayButton": PlayButton,
    "Playrate": Playrate,
    "Volume": Volume,
    "FullScreen": FullScreen
}