## 知识点介绍

#### 流媒体技术介绍
https://blog.csdn.net/liitdar/article/details/114539213?ops_request_misc=%257B%2522request%255Fid%2522%253A%2522169035627616800197077908%2522%252C%2522scm%2522%253A%252220140713.130102334..%2522%257D&request_id=169035627616800197077908&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~top_positive~default-1-114539213-null-null.142^v91^koosearch_v1,239^v3^control&utm_term=%E6%B5%81%E5%AA%92%E4%BD%93&spm=1018.2226.3001.4187

#### MDP
前端 MPD（Media Presentation Description）是一种用于描述多媒体内容的格式。它被广泛应用于流媒体技术中，特别是在 DASH（Dynamic Adaptive Streaming over HTTP）协议中使用。通过使用 MPD，前端开发人员可以指定多个媒体片段以及其不同的质量和码率，以便在不同的网络条件下进行自适应的流媒体传输。

前端开发人员可以使用 HTML5 的 <video> 元素结合 JavaScript 来处理 MPD 文件，并通过 DASH 协议获取和播放多媒体内容。当用户请求播放一个流媒体时，前端会加载 MPD 文件并解析其中的信息，然后根据用户的设备和网络情况选择合适的媒体片段进行播放。

#### DASH协议
https://blog.csdn.net/qiwoo_weekly/article/details/93149710?ops_request_misc=&request_id=&biz_id=102&utm_term=%E5%89%8D%E7%AB%AFmpd&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduweb~default-5-93149710.142^v91^koosearch_v1,239^v3^control&spm=1018.2226.3001.4187

### MPD文件内容

MPD文件构成

![640?wx_fmt=png](https://img-blog.csdnimg.cn/img_convert/e4f49b4618ce3517b2feca64b930a574.png)



1. **MPD 标签**
   **属性:** 
   profiles: 不同的profile对应不同的MPD要求和Segment格式要求
   mediaPresentationDuration:整个节目的时长
   minBufferTime: 至少需要缓冲的时间
   type:点播对应static，直播对应dynamic
   availabilityStartTime=2019-05-22T22:16:57Z:如果是直播流的话,则必须提供,代表MPD中所有Seg从该时间开始可以request了
   minimumUpdatePeriod=PT10H:至少每隔这么长时间,MPD就有可能更新一次,只用于直播流
2. **BaseURL 根目录**

该元素可以在MPD\Period\AdaptationSet\Representation同时出现,若同时出现,则层层嵌套;在每一层也可以出现多次,默认使用第一个BaseURL;

3. **Period 区段**

一条完整的mpeg  dash码流可能由一个或多个Period构成，每个Period代表某一个时间段。比如某条码流有60秒时间，Period1从0-15秒，Period2从16秒到40秒，Period3从41秒到60秒。同一个Period内，意味着可用的媒体内容及其各个可用码率（Representation）不会发生变更。直播情况下，“可能”需要周期地去服务器更新MPD文件，服务器可能会移除旧的已经过时的Period,或是添加新的Period。新的Period中可能会添加新的可用码率或去掉上一个Period中存在的某些码率, 即上面的 Representation 字段

每个 Period 可以包含以下内容：

    Adaptation Set：Adaptation Set 包含了一组具有相同媒体类型（如视频、音频）和相同媒体特性（如编码方式、分辨率、比特率等）的媒体内容。

    Subtitle Stream：Subtitle Stream 用于描述字幕流。

    Segment Template：Segment Template 定义了在该 Period 中的所有媒体内容的 URL 模板及其时间戳信息。

    Base URL：Base URL 用于指定在 Segment Template 中使用的相对 URL 的基础 URL。



**属性:**

duration:Period的时长;
start:Period的开始时间

4. **AdaptationSet 自适应子集**

一个Period由一个或者多个Adaptationset组成。Adaptationset由一组可供切换的不同码率的码流（Representation)组成，这些码流中可能包含一个（ISO profile)或者多个(TS profile)media content components，因为ISO  profile的mp4或者fmp4 segment中通常只含有一个视频或者音频内容，而TS profile中的TS  segment同时含有视频和音频内容. 当同时含有多个media component content时，每个被复用的media content  component将被单独描述。

**属性:** 

segmentAlignment: 分段对其 如果为true,则代表该AS中的segment互不重叠
startWithSAP: 每个Segment的第一帧都是关键帧
mimeType AdaptationSet 的媒体类型
minWidth 最小宽度
par 宽高比
contentType: 内容类型

5. **media content component 媒体内容**

一个media content component表示表示一个不同的音视频内容，比如不同语言的音轨属于不同的media content  component,而同一音轨的不同码率（mpeg dash中叫做Representation)属于相同的media content  component。如果是TS profile，同一个码率可能包括多个media content components。

6. **SegmentTemplate 片段模板**

组成下载 Representation 的URL 模板

**属性:** 

media:　指定用来生成Segment列表的模板,可以包含的通配符有$RepresentaonID$，$Bandwidth$，$Number$, $Time$

7. **Representation 媒体文件描述**

每个Adaptationset包含了一个或者多个Representations,一个Representation包含一个或者多个media streams，每个media [stream](https://so.csdn.net/so/search?q=stream&spm=1001.2101.3001.7020)对应一个media content component。为了适应不同的网络带宽，dash客户端可能会从一个Representation切换到另外一个Representation

**属性:**

codecs=avc1.640028 解码器标准
bandwidth=3200000 需要带宽 3.2Mbps

8. **segment 切片**

每个Representation由一个或者多个segment组成，每个segment由一个对应的URL指定，也可能由相同的URL+不同的byte range指定。dash 客户端可以通过HTTP协议来获取URL（+byte range）对应的分片数据。MPD中描述segment  URL的形式有多种，如Segment list，Segment template，Single segment。

单独介绍一个特殊的segment : Initialization Segment(初始化片段), 

Representation的Segments一般都采用1个Init Segment+多个普通Segment的方式，还有一种形式就是Self Initialize Segment，这种形式没有单独的Init  Segment，初始化信息包括在了各个Segment中。Init  Segment中包含了解封装需要的全部信息，比如Representation中有哪些音视频流，各自的编码格式及参数。对于 ISO  profile来说(容器为MP4)，包含了moov box,H264的sps/pps数据等关键信息存放于此（avCc box）。


在 MPD 文件中，Representation 标签可以包含以下一些常见的子标签：

    BaseURL: 指定该媒体流版本的基本 URL，用于组成媒体片段（Segment）的完整 URL。

    SegmentBase: 定义该 Representation 使用的媒体片段的基本信息，包括 Initialization、Index 和 RepresentationIndex 等属性，用于生成媒体片段的 URL 和时间戳。

    SegmentList: 定义该 Representation 使用的媒体片段的列表，包括 SegmentURL 和 SegmentTimeline 等属性，用于生成媒体片段的 URL 和时间戳。

    SegmentTemplate: 定义该 Representation 使用的媒体片段的 URL 和时间戳的生成方式，包括 media、initialization、timescale 和 duration 等属性。

    ContentProtection: 定义该媒体流版本的内容保护机制，包括对称加密、数字签名、数字水印等。

    InbandEventStream: 定义该媒体流版本的事件流，用于传输媒体相关的事件，例如广告、字幕、交互式应用程序等。

    SupplementalProperty: 定义该媒体流版本的附加属性，例如音量、亮度、对比度等。



![640?wx_fmt=jpeg](https://img-blog.csdnimg.cn/img_convert/84f6a1f937121ac957462be2ae0f796f.png)

#### MediaSource
MediaSource 是 Media Source Extensions API 表示媒体资源 HTMLMediaElement 对象的接口。MediaSource 对象可以附着在 HTMLMediaElement 在客户端进行播放。
https://developer.mozilla.org/zh-CN/docs/Web/API/MediaSource

MediaSource() 是 MediaSource 的构造函数，返回一个没有分配 source buffers 新的 MediaSource 对象。

SourceBuffer 接口表示通过 MediaSource 对象传递到 HTMLMediaElement 并播放的媒体分块。它可以由一个或者多个媒体片段组成。