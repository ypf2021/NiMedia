import { EventObject } from "../types/EventObject";

// 写一个发布订阅模式的类，供其他类继承
export class BaseEvent {
    $events: EventObject = {}
    constructor() { }

    // 事件触发
    emit(event: string, ...args: any[]) {
        if (this.$events[event]) {
            this.$events[event].forEach((cb, index) => {
                cb.call(this, ...args)
            })
        }
    }

    // 事件监听/注册
    on(event: string, cb: Function) {
        this.$events[event] = this.$events[event] || []
        this.$events[event].push(cb)
    }
}