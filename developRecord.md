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

#### 8/13 
今日完成项目：
- 完善 StreamController ，并通过 MediaPlayerController 播放到video中
- StreamController中拿出请求的结构体中的请求url，发起请求，请求完成后存放到buffer中，触发相关回调，SEGEMTN_LOADED，BUFFER_APPENDED
- 在 MediaPlayerController 中 初始化 mediaSource，和sourceBuffer，作为video的播放资源 ， 由 BUFFER_APPENDE 触发回调，分别在视频和音的sourceBuffer中添加相关数据。
- 初步编写视频资源按组循环请求

##### 梳理流程
由主文件触发 attachSource， 就会在 dashParse中为 Mpd添加BaseUrl，并且发起请求 获取 Mpd文件，获取到之后进行parse，转换为树状结构。解析完毕后触发 MANIFEST_PARSE_COMPLETED ，在streamController中进行请求结构体的解析，解析完毕之后，发起对initialUrl和MediaUrl的请求(startStream)。请求时，每请求一个资源都会 调用 MediaPlayer中的 SEGEMTN_LOADED 回调，记录第一组请求（），并将请求到的内容 添加到 buffer中 通过 BUFFER_APPENDED 回调，处理资源。同时没完成一组(23个)请求，就会调用consume回调， 目前是一口气加载23个，然后再请求一个，循环还没做好

#### 8/14
今日完成项：
- 通过给 mediaSource设置duration属性，给video弄出总时间。
- 注掉之前对每一组的规划
- 修改在eventbus中遗留的bug
- 通过streamId的标识（目前只有0），在mediaPlayerController，MeidaPlayer等部分添加streamId
- 添加更具时间和streamId相关的处理utils类 TimeRangeUtils， 功能有，得出该streamId之前的时间，判断currentTime是否在该streamId的范围内，getSegmentAndStreamIndexByTime，等工具
- 根据上面的 初步添加 当进度条发生跳转时触发

#### 8/15
今日完成项：
- 以前的资源请求只有第一个Segment的部分。这次的更新中，借助 TileRangeUtils 中根据时间获得streamId和mediaId的功能，在点击切换到没有加载的部分的时候，发起针对这个部分的请求，获取部分资源（还没有接上按组请求）
- 上面功能对应的监听包括，SEGMENT_REQUEST 和 addEventListener（seek）
- 并且优化了请求的部分内容，设立一个请求的列表，给其添加终止，和清除功能。终止是在点击没有请求的部分时，将原来的请求删掉

#### 8/16   
今日完成项：
- 修改了样式，将 controller部分的内容进行了更加细致的更新，完成了分辨率，倍率，音量，移上去的选项。
- 主要编写了两个检测dom位置的工具 getDOMPoint checkIsMouseInRange

#### v1.2 重构
- 将创建dom的方式从原先的写template模板字符串，改为了通过 $ 的方法动态的传入元素类型属性等创建dom并搭载。 为每个组件创建自己的类，添加唯一标识
- 之前的缺点 尤其体现在 controller.ts 中。页面的结构是由字符串template模板组成的，在里面写入样式和结构，然后插入innerHTMl，再通过querySelector()的方式获取元素实例，进行很多的事件操作。划分结构非常困难，按照这种模式进行分离也不容易，强行分割的话难以拼接，同时会让目录结构很复杂，但功能又是相似，同级的。所以尽心重构，动态的创建DOM元素。
- 新的类继承了事件总线，Component，规范每个功能类，细化分工。

