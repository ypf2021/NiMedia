## 时间线
#### 7/25
>至今完成了如下功能
- 视频暂停播放
- 视频播放时间和总时间展示 00:00 / 04:12 
- 工具栏的展示隐藏
>代码重点部分
- 通过订阅发布模式+类继承 实现组件的事件触发
- HTML的展示通过动态的 字符串拼接实现
- 代码入口可以从 Player类 开始看

#### 7/26
>至今完成了如下功能
- 在进度条上滚动时显示时间位置
- 进度条的功能完善，拖动，展示，点击
- 完成一个播放器的基本功能
- 对流媒体进行了解，争对MPD文件以及DASH协议进行阅读思考
- 完成对MPD文件的解析 initMpd

#### 7/27
>至今完成了以下功能
- 完成对MPD文件的解析 initMPD
- 完成对解析后的MPD文档进行请求资源的分离 parseMPD
- 封装自己的xhr请求，实现请求MPD文件
- 完成mp4视频和MPD视频的分离
>代码重点部分
- xhr请求的简易封装
- 最重要的部分在 parseMPD中对各种情况的解析

#### 7/28
>代码重点部分
- 删除之前对mpd文件的解析 initMpd，parseMpd
- 构建一个工厂模式，对创建实例的过程进行分割，分为单一实例，和class实例
- 根据工程模式对请求部分进行重构，暴露出单一实例 urlLoader和 xhrloader，分别用于构建url和发起xml请求
- 让所有类的创建变得更加灵活易用

#### 8/5
>代码重点部分
- HTTP URL XHR MediaPlayer 等部分的工厂函数实例
这个模式的好处是让各个模块之间的功能都通过class的方式来分割，各司其职，

#### 8/6
>今日完成了以下功能
- eventBusFactory部分 ，请求部分的事件逻辑完善
- mediaplayer 初始化时注册监听on，调用attachSource发起资源请求，在urlloader 请求完成时，触发tigger，调用监听的函数， 对请求到的资源进行 parse处理
- 完善Mpd文件中 有 Segmenttemplate 时对时间的处理。 以及对应文件的 media 和init 资源的处理。

- 阅读代码，理清思路

#### 8/8
- 今日完成项 StreamController
- 解读： StreamController目前被调用的方法为 generateSegmentRequestStruct，获取 MpdSegmentRequest 包含了Mpd文件中 通过media和initial构成的地址表 

#### 8/9
- 今日完成项: 
- 将dashParse 和 SegmentTemplateParser 中作用区分的部分进行提取，将Media，initial，duration等内容都转移到dashParse中，让dashParse专注于解析MPD文件
- 添加了两个监听事件，一个用来在attcah时在 Mpd上绑定baseURL， 一个在解析完Mpd文件 dashParse之后，由StreamController进行请求结构体的构建
- StreamController 构建请求结构体，主要是将各个部分的baseURL进行拼接，并赋值給对应的 video（区分分辨率），audio，
- 辅助工具 URLUtils 有 resolve 合并函数， 以及 sliceLastURLPath 函数
- 理清思路