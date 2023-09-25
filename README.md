# Niplayer-Mine
音视频播放器
 
 功能：音视频播放器，基于DASH(Dynamic Adaptive Streaming over HTTP)协议实现了 Mpd格式文件的流式播放。并实现了将MP4等常见格式视频资源阶段性请求，通过MP4Box转换为流式播放。以及常规播放器的全屏，播放，暂停，音量，分辨率，等功能                 

> Mpd资源流式处理：
- 线路1：
  - attachVideo --> 创建 MediaSource， Buffer， 添加数据监听事件，根据MediaSoucre创建url，赋给video
- 线路2：
  - attachSource --> 发起Mpd文件数据请求拿到Mpd文件 --> Mpd文件数据解析，构建树状结构，请求结构体 --> 根据结构体发起请求，拿到数据并向Buffer和MediaSource中添加，实现资源播放。
- Mpd文件资源解析：
  - attachSource后 基于urlLoader，向mpd文件url发起请求 --> 拿到结构触发dashParse，先后进行 string2xml parseDOMChildren(添加__array,children) mergeSegmentTemplate 设置分辨率和音频采样率，设置duration，设置baseUrl， segmentTemplateParser(将templateUrl替换为真实url并替换, RepresentationId, mediasNumber) --> 拿树状的mpd信息构建请求结构体 --> startStream  --> 不断请求向MediaSource中添加数据
- 请求及添加流程
  - startStream: 先请求第一条，SegmentTemplate。 loadSegment请求所选的视频分辨率以及默认的音频分辨率(responseType)，拿到请求结果 --> SEGMENT_LOADED 将数据添加到最初创建好的 buffer容器 中， --> BUFFER_APPENDED, videoSourceBuffer.appendBuffer/audioSourceBuffer.appendBuffers,完成播放。

> 组件及功能类

components
- Controller
  - controller  控制器汇总
  - FullScreen  全屏
  - Options 选项组件
  - PlayButton  播放按钮
  - PlayerRate  播放倍速
  - Volume  音量
- Progress
  - BufferedProgress    缓存进度条
  - CompleteProgress    播放进度条
  - Dot 进度点
  - progress    进度条汇总
- ToolBar
  - toolbar 工具栏汇总

Dash处理工具类
- EventBus 事件总监，使用发布者订阅者模式，同时加入了scope的绑定
- factoryMaker 工厂函数类，用于将单一实例类或者其他工具类进行包装，存储缓存，方便随时进行创建。
- Net
  - HTTPRequest 构建请求的基本信息常见字段，例如 method，url，header，responseType以及请求时间和结束时间(时间用于计算网速)
  - XHRLoader 封装XMLHttpRequest，用于发起请求
  - URLLoader 在发起xhr请求之前，定义xhrArray，请求类别做分类，指定一些特地函数，例如清空请求栈，删掉某个请求
- parser
  - BaseURLParser 
  - DashParser Mpd文件处理的总工具类，负责内容有解析xml构建树结构，设置总duration和representation段时间，给元素设置分辨率和采样率。 其中parse方法在mpd文件请求成功之后被调用
  - SegmentTemplateparser 由Dashparser调用，争对Mpd文件是存在SegmentTemplate类型时，进行url的处理
- stream
  - StreamController segment流的请求控制，传入mpd的解析数据，构建结构体，发起请求调用URLloader。
- vo
  - MediaPlayerBuffer 请求到数据的 buffer 容器 
  - MediaPlayerController 负责将请求到的资源放入到 buffer中， 构造video的资源内容MediaSource，资源容器，加载资源事件，seek事件等

- MediaPlayer 整个dash处理流程的入口类MediaPlayer, 类似于项目的中转中心，用于接收任务并且将任务分配给不同的解析器去完成

通用工具类
- 目录uitls
