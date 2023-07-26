import { MediaType } from "../types/MpdFile";

export function checkMediaType(s: string | null | undefined): s is MediaType {
    if (!s) {
        return false
    }
    return (
        s === "video/mp4" ||
        s === "audio/mp4" ||
        s === "text/html" ||
        s === "text/xml" ||
        s === "text/plain" ||
        s === "image/png" ||
        s === "image/jpeg"
    )
}