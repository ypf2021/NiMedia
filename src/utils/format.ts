import { Time } from "../types/Time";

//  格式化播放时间工具
export function addZero(num: number): string {
    return num > 9 ? "" + num : "0" + num;
}

export function formatTime(seconds: number): string {
    seconds = Math.floor(seconds);
    let minute = Math.floor(seconds / 60);
    let second = seconds % 60;

    return addZero(minute) + ":" + addZero(second)
}

// 将 Time 类型的时间转换为秒
export function switchToSeconds(time: Time): number {
    return time.hours * 3600 + time.minutes * 60 + time.seconds;
}

// 解析MPD文件的时间字符串
// Period 的 start 和 duration 属性使用了 NPT 格式表示该期间的开始时间和持续时间，即 PT0S 和 PT60S
export function parseDuration(pt: string): Time {
    // NPT 格式的字符串以 PT 开头，后面跟着一个时间段的表示，例如 PT60S 表示 60 秒的时间段。时间段可以包含以下几个部分：
    // H: 表示小时。
    // M: 表示分钟。
    // S: 表示秒。
    // F: 表示帧数。
    // T: 表示时间段的开始时间。

    var ptTemp: any = pt.split("T")[1];
    ptTemp = ptTemp.split("H");
    var hours = ptTemp[0];
    var minutes = ptTemp[1].split("M")[0]
    var seconds = ptTemp[1].split("M")[1].split("S")[0];
    var hundredths = seconds.split(".");
    return {
        hours: Number(hours),
        minutes: Number(minutes),
        seconds: Number(hundredths[0]),
    }
}
