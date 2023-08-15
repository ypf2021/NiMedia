export type ConsumedSegment = {
    data: [ArrayBuffer, ArrayBuffer];
    streamId: number;
    mediaId: number;
}

// VideoBuffered 的range
export type VideoBuffers = Array<{ start: number; end: number; }>