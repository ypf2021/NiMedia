export function getFileExtension(file: string): string | never {
    let start = file.lastIndexOf(".")
    if (start !== -1) {
        return file.slice(start + 1, file.length);
    }
    throw new Error("传入的文件没有扩展名!")
}