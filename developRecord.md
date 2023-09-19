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

#### 8/30
- 截至到现在，将新版本进行完善，连接通mp4文件和mpd文件的播放，mpd如原先一样，mp4进行了 MP4Box的加工

- 需要的知识点：
- 请求头 Range，响应头 Content-Range


### 知识点部分

页面结构的处理，initTemplate() 每个class（组件）都有各自的 _template,时字符串格式的dom结构，通过 new 组件拿到组件的template，进行字符串拼接，插入到 options.container中，完成dom的创建
缺点：再后续开发的过程中，用手写字符串的方法，比较冗余，不易扩展，每次改动都要添加大量的代码，来实现html的拼接。后续重构中改为了使用 $ 创建dom 并通过 component基础类来实现挂载dom

initComponent() 在需要层叠的组件中，在initComponent函数中 new class，来获取子组件实例，

MP4player中直接将 options.url 给到 video的url，在定义监听事件addEventListener 和 发布事件emit

事件汇总：播放相关 video -> timeupdate play pause，移入影响toolbar: video -> mouseenter mouseleave  播放情况：stalled error abort


MPD播放器，前置内容都相似，不同点在 new MpdPlayer。 流媒体文件的处理目录全部位于 src/dash

前置工具。
流媒体内有多种内置的工具类。每一个工具都负责各自的需求，工具创建被 FactoryMaker 类进行处理。

FactoryMaker，它提供了获取单例实例和类实例的工厂函数。
伪代码：
```js
    class FactoryMaker {
        __class_factoryMap = {};
        __single_factoryMap = {};
        __single_instanceMap = {};

        constructor(){
            this.__class_factoryMap = {};
            this.__single_factoryMap = {};
            this.__single_instanceMap = {};
        }

        getSingleInstance(classConstructor){
            let factory = this.__single_factoryMap[classConstructor.name]
            let ctx = this
            if(!factory){
                factory = function(context){
                    if(!context)  cosntxt = {};
                    return {
                        getInstance(...args){
                            let instance = ctx.__single_instanceMap[classConstructor.name]
                            if(!instance){
                                instance = new classConstructor({constxt}, ..args)
                                ctx.__single_instanceMap[classConstructor.name] = instance
                            }
                            return instance;
                        }
                    }
                }
            }
            return factory
        }
    
        getClassFactory(classConstructor){
            let factory = this.__class_factoryMap[classConstructor.name]
            let ctx = this;
            if(!factory){
                factory = function (cotext){
                    if(!context) context = {};
                    return {
                        create(...args){
                            return ctx.merge(classConstructor, context, ...args);
                        }
                    }
                }
            }
        }

        merge(classConstructor, context, ...args){
            let extentionConstructor = context[classConstructor.name];
            if(extentionConstructor){
                if(extentionConstructor.override){
                    let instance = new classConstructor({ context }, ...ags);
                    let override = new extentionConstructor.instance({
                        constext
                        parent:instance
                    })
                    return override
                }else {
                    return new extensionObjejct.instance({
                        context
                    })
                }
            } else {
                return new classConstructor({context}, ...args)
            }
        }   
    }
```

使用时通过  `const MediaPlayerFactory = FactoryMaker.getClassFactory(MediaPlayer)` `URLLoaderFactory().getInstance();` 这种方式来获得实例

后续的功能组件全部使用该方法进行创建。

Mpd播放器解析流程：

1. MediaPlayer().create() 创建MediaPlayer实例， setup 里面创建 之后要使用的工具 urlLoader xhrLoader(请求相关) eventBus(单一事件总线) dashParser(解析Mpd) streamController(数据流请求控制) buffer(数据流容器)
2. mediaPlayer.attachSource(player.playerOptions.url) ---> 发布事件SOURCE_ATTACHED(DataParse接受请求url，用于设置BaseURL)，发送加载MPD文件的请求(由urlloader和xhrloader完成，异步请求，拿到结构后 发布事件 MANIFEST_LOADED)
3. mediaPlayer.attachVideo(player.video); 设置 MediaPlayer的video属性 注册 MediaPlayerControllerFactory
4. MediaPlayerControllerFactory 主要负责对MPD buffer资源的处理， 负责将buffer添加到对应的容器中(每次加载segment)，处理点击进度条时的资源加载
5. MPD资源加载完毕，发布事件 MANIFEST_LOADED 。 后由dashParser对parse文件进行解析
6. parse解析：将XML转换为 对象类型的树状结构，一层层的构造，还多写入了 _children 和 ["XXX_asArray"]; mergeNodeSegementTemplate(将每一个Peroid中的SegmentTemplate都绑定到Representation中) setResolvePowerForRepresentation(设置分辨率和音频采样率容器)，setDurationForRepresentation(设置duration) setBaseURLForMpd(设置文件的baseUrl，后续请求) segmentTemplateParser.parse(!!)
7. segmentTemplateParser.parse(!!) 通过之前的处理，还剩下请求每个segment的链接。就在这步处理 parseNodeSegmentTemplate()， 访问到每个 SegmentTemplate 将其中的 initialization，media 拿出来，通过正则匹配和替换，把其中的变量转换为真实的请求链接，挂载到Representation上面。 到这步基本完成 MPDparse
8. 当MpdParse转换完后 触发事件MANIFEST_PARSE_COMPLETED。 在MediaPlayerController中做一些小处理(设置mediaSource时间)；并在 streamController中构建请求结构体 segmentRequestStruct()
9. segmentRequestStruct 结合BaseURL，initializationURL，MediaURl，分辨率，音频频率，生成一个结构体，用于发送请求
10. startStream  开始发送请求 初始化播放流，一次至多加载23个Segement过来。 后续还涉及到了 每一个segment资源的接受，append到Buffer中，点击请求，添加buffr,最后全部下载完毕之后会触发结束的回调

# 项目亮点

## 项目构建模式
整个项目是原生HTML TS编写，通过各种方法，各种类之间相互联系，构造而成。
页面的基础架构。通过类继承的方式，完成一个个的组件。
- 页面架构：
  - Component extends BaseEvent（事件总线） 
  - 通过 $ 方法创建html结构，传入desc，prop，children 动态创建一个html元素，并将其挂载到传入的container中
    - $ 方法接收参数 desc，prop，children。 desc 由 element # . 构成，通过正则表达式，解析，创建dom并添加id和类名， prop：style特殊添加，其余设置 attribute。 children，判断子元素类型，如果是typeof string，就是文本设置innerHtml，其余appendChild
  - BaseEvent（事件总线），实现了订阅发布模式 emit on off
  - 每一个组件都有各自的 initEvent监听函数  initComponent$创建自己的子元素，
  - 事件通过  this.player.emit("progress-click", e, this);
  - 用户扩展功能 通过`player.use{ install(player){ player.registerControls("Toolbar", {}) } }` 可以添加新的组件元素进去添加到 toolBar中，或者将已有组件进行修改 `patchComponent` 属性进行合并, el判断是内还是外，进行替换， 函数，改变指向一起执行
- 实现基本MPD文件解析。
  - 解析过程中有很多的函数方法。按照solid原则，结合工厂模式，让解析的过程分工明确，条例清晰。公用组件通过`getSingleFactory`返回单一特例，可复用的类通过`getClassFactory`包装，每次返回new的结果，并且进行缓存。 例如 `XHRLoaderFactory = FactoryMaker.getSingleFactory(XHRLoader) this.xhrLoader = XHRLoaderFactory({}).getInstance();`
  - 两条线路  attachVideo 负责资源->video中 ， attachSource 负责mpd文件解析 -> 视频资源  就是上面的Mpd播放器解析流程：
- MP4文件部分的处理， 借助 MP4Box


