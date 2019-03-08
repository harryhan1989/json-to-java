# json-to-java
nodejs eggjs json 序列化为复杂的dubbo java实体方法,可支持实体类中嵌入实体或List<实体>等的转换。现只是个eggjs的工具类，有兴趣的同学可以基于此方法思路扩产为通用的eggjs插件或者nodejs通用插件，可以欢迎提交代码。

### 用法
由于此方法基于eggjs模式开发，所以调用暂时只支持eggjs直接调用，若是其它nodejs环境，需要做些简单修改，主要是访问方式上的修改。
1、将helper.js文件复制到app/extend目录下面，若是原本已经自己定义了helper方法，则可以直接将本js文件中的程序复制过去即可，这样可以保证不覆盖用户自己的helper定义。

2、参考[js-to-java](https://github.com/node-modules/js-to-java)插件里面定义的类型，在helper.js 的 javaModels中定义需要转换的仿JAVA实体类，具体定义参考此我预定义的三个Model(UGCApiModel,ForwardToCircleInfoModel,FileInfoModel),这些预置的Model定义主要是为了方便参考，实际使用中可以删除掉。

3、调用，以eggjs为例， const ugcModel = ctx.helper.convertJsonToJavaModel(ctx.helper.javaModels.UGCApiModel, ctx.request.body); 这样调用后即可得到最终dubbo可识别的序列化后的JSON,可以直接使用这个序列化后的json与dubbo的接口调用，具体js调用dubbo，这里推荐使用[node-zookeeper-dubbo](https://github.com/omnip620/node-zookeeper-dubbo)这个组件, 调用举例：const result = await app.dubboClient.ugcAgent.createUgc(ugcModel);

感谢 [js-to-java](https://github.com/node-modules/js-to-java), [hessian.js](https://github.com/node-modules/hessian.js),感谢 [node-zookeeper-dubbo](https://github.com/omnip620/node-zookeeper-dubbo) 的作者们。
