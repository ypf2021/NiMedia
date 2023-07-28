import { BaseConstructor } from "../class/BaseConstructor";
import { FactoryFunction } from "../types/dash/Factory";

const FactoryMaker = (function () {
    // 用自执行函数构建作用域
    class FactoryMaker {
        readonly __factoryMap: { [props: string]: FactoryFunction } // 返回值类型是 FactoryFunction
        constructor() {
            this.__factoryMap = {}
        }

        // 获取对应name的 factory
        getClassFactory<T>(classConstructor: BaseConstructor<T>): FactoryFunction {
            let factory = this.__factoryMap[classConstructor.name];
            let ctx = this // this 指的是FactoryMaker类
            if (!factory) {
                //如果factoryMap中不存在
                factory = function (context?: object) {
                    if (!context) context = {};
                    return {
                        create(...args: any[]) {
                            return ctx.merge<T>(classConstructor, context, args)
                        }
                    }
                }
                this.__factoryMap[classConstructor.name] = factory;
            }
            return factory;
        }

        merge<T>(classConstructor: BaseConstructor<T>, context: object, args: any[]): T {
            let extensionObjejct = context[classConstructor.name]
            if (extensionObjejct) {
                // 如果获取到的上下文的属性classConstructor.name对应的对象上具有覆写（override）属性，则意味着需要覆写classConstructor上对应的属性
                if (extensionObjejct.override) {
                    let instance = new classConstructor({ context }, ...args);
                    let override = new extensionObjejct.instance({
                        context,
                        parent: instance // 重载的父类是这个
                    })

                    for (let props in override) {
                        if (instance.hasOwnProperty(props)) {
                            instance[props] = parent[props]
                        }
                    }
                } else {
                    // 如果不需要覆写，则意味着直接拿context中传入的构造函数来替换这个构造函数
                    return new extensionObjejct.instance({
                        context
                    })

                }
            } else {
                return new classConstructor(context, ...args)
            }
        }
    }



    return new FactoryMaker()
})()