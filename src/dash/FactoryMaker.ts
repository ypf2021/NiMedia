import { BaseConstructor } from "../class/BaseConstructor";
import { FactoryFunction, FactoryObject } from "../types/dash/Factory";

const FactoryMaker = (function () {
    // 用自执行函数构建作用域
    class FactoryMaker {
        __class_factoryMap: { [props: string]: FactoryFunction<any> }
        __single_factoryMap: { [props: string]: FactoryFunction<any> };
        __single_instanceMap: { [props: string]: any };

        constructor() {
            this.__class_factoryMap = {};
            this.__single_factoryMap = {};
            this.__single_instanceMap = {};
        }

        // 每次调用都返回 一个 新的 new 实例
        getClassFactory<T>(classConstructor: BaseConstructor<T>): FactoryFunction<T> {
            let factory = this.__class_factoryMap[classConstructor.name] as FactoryFunction<T>;
            let ctx = this;
            // 如果map当中没有存储过
            if (!factory) {
                factory = function (context?: FactoryObject) {
                    if (!context) context = {}
                    return {
                        create(...args: any[]) {
                            return ctx.merge<T>(classConstructor, context, ...args);
                        }
                    };
                };
            };
            return factory
        }

        // 单一实例 单例模式
        getSingleFactory<T>(classConstructor: BaseConstructor<T>): FactoryFunction<T> {
            let factory = this.__single_factoryMap[classConstructor.name];
            let ctx = this;
            if (!factory) {
                // 调用 getSingleFactory() 时传入的 context 会传递到new时的第一个参数的 context中
                factory = function (context) {
                    if (!context) context = {}
                    return {
                        getInstance(...args): T {
                            let instance = ctx.__single_instanceMap[classConstructor.name];
                            if (!instance) {
                                instance = new classConstructor({ context }, ...args)
                                ctx.__single_instanceMap[classConstructor.name] = instance
                            }
                            return instance
                        },
                    };
                };
            };
            return factory;
        }

        merge<T>(classConstructor: BaseConstructor<T>, context: FactoryObject, ...args: any[]): T {
            // 在调用 getClassFactory 返回的 create 函数的时候，会在这里进行merge，如果写入的context不存在就跳过，如果存在在判断是否需要覆写，如果不覆写，优先ne context中的内容
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
                return new classConstructor({ context }, ...args)
            }
        }
    }



    return new FactoryMaker()
})()

export default FactoryMaker


// getSingleFactory
// getSingleFactory的返回值是一个函数
// getSingleFactory返回的函数运行结果是一个 有着 getInstance 属性的 对象FactoryFunction。 再通过调用getInstance函数，就可以创建对应的 实例
// 使用：
// XHRLoaderFactory = FactoryMaker.getSingleFactory(XHRLoader)
// this.xhrLoader = XHRLoaderFactory({}).getInstance();
// 得到的 xhrLoader 就是 XHRLoader类的实例

