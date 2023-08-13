import { FactoryObject } from "../../types/dash/Factory";
import FactoryMaker from "../FactoryMaker";

class EventBus {
    private config: FactoryObject = {};
    // _events 对象， 对象键为 string ，值为 array， array由回调函数和，范围对象构成
    private __events: { [props: string]: Array<{ cb: Function, scope: FactoryObject }> } = {}
    constructor(ctx: FactoryObject, ...args: any[]) {
        this.config = ctx.context;
        this.setup()
    }

    setup() {

    }

    // 订阅 scope 是回调函数执行的上下文 在后期执行时调用 call(scope,...args)
    on(type: string, listener: Function, scope: FactoryObject): void | never {
        if (!this.__events[type]) {
            this.__events[type] = [
                {
                    cb: listener,
                    scope: scope
                }
            ]
            console.log(this.__events[type])
            return
        }
        if (this.__events[type].filter(event => {
            return event.scope === scope && event.cb === listener;
        })) {
            throw new Error("请勿重复绑定监听器");
        }
        this.__events[type].push({
            cb: listener,
            scope
        })
    }

    // 取消订阅
    off(type: string, listener: Function, scope: FactoryObject): void | never {
        if (!this.__events[type] || this.__events[type].filter(event => {
            return event.scope === scope && event.cb === listener;
        })) {
            throw new Error("不存在该事件");
        }
        // filter过滤
        this.__events[type] = this.__events[type].filter(event => {
            return event.scope === scope && event.cb === listener;
        })
    }

    // 发布
    tigger(type: string, ...payload: any[]): void | never {
        if (this.__events[type]) {
            this.__events[type].forEach(event => {
                event.cb.call(event.scope, ...payload);
            })
        }
    }
}

const EventBusFactory = FactoryMaker.getSingleFactory(EventBus);
export default EventBusFactory;
export { EventBus }