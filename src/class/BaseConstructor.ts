export interface BaseConstructor<T> {
    // 构造函数： name属性为构造函数的名字， new 可以创建实例
    new(context: object, ...args: any[]): T;
    name: string;
}

