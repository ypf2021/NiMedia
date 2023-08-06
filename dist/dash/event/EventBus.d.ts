import { FactoryObject } from "../../types/dash/Factory";
declare class EventBus {
    private config;
    private __events;
    constructor(ctx: FactoryObject, ...args: any[]);
    setup(): void;
    on(type: string, listener: Function, scope: FactoryObject): void | never;
    off(type: string, listener: Function, scope: FactoryObject): void | never;
    tigger(type: string, ...payload: any[]): void | never;
}
declare const EventBusFactory: import("../../types/dash/Factory").FactoryFunction<EventBus>;
export default EventBusFactory;
export { EventBus };
