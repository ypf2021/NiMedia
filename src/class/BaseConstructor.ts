export interface BaseConstructor<T> {
    // 接收一个构造函数 和 name
    new(context: object, ...args: any[]): T;
    name: string;
}

