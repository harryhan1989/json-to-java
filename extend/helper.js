'use strict';
const moment = require('moment');
const java = require('js-to-java');
const _ = require('lodash');

module.exports = {
  /* 定义说明：
  ** 不带任何符号的类型定义，则是java的基本类型，见js-to-java库中说明中的基础类型
  ** ：代表有前置类型的类型（可自定义类型），如：optionsContent: 'array:String' 代表String数组，ugcTypeEnum: 'enum:com.sns.ugc.enums.UGCTypeEnum' 代表自定义类型枚举
  ** ::代表有前置类型的自定义model集合，如List<Model>，Model[]，定义如：circleInfos: 'List::ForwardToCircleInfoModel'，fileInfoModel: 'array::FileInfoModel'
  ** :::代表是个无前置类型的自定义model，定义如：overPic: ':::FileInfoModel'
  ** interface是指model得用java model的完整命名
  ** base是指继承，类似java的extend，继承子model的def，支持深度继承，写法：base:Model
  ** def是指model的详细属性定义
  **/
  javaModels: {
    UGCApiModel: {
      interface: 'com.sns.ugc.domain.UGCApiModel',
      def: {
        userId: 'Long',
        uuid: 'String',
        circleInfos: 'List::ForwardToCircleInfoModel', // ::代表有前置类型的model，如List<Model>
        ugcTypeEnum: 'enum:com.sns.ugc.enums.UGCTypeEnum',
        definiteUGCTypeEnum: 'enum:com.sns.ugc.enums.DefiniteUGCTypeEnum',
        content: 'String',
        forward: 'boolean',
        startTime: 'Date', // Date转换为java.util.Date，日期类型的数据只能为time，例：1553246231660
        overPic: ':::FileInfoModel', // :::代表是个无前置类型的Model
        fileInfoModel: 'array::FileInfoModel', // 自定义的model类型集合，如：FileInfoModel数组
        optionsContent: 'array:String', // 代表String数据
      },
    },
    ForwardToCircleInfoModel: {
      interface: 'com.sns.ugc.domain.ForwardUgcApiModel$ForwardToCircleInfo',
      def: {
        circleId: 'Long',
        circleName: 'String',
      },
    },
    FileInfoModel: {
      interface: 'com.sns.ugc.domain.FileInfoModel',
      def: {
        type: 'int',
        coverHoto: 'String',
      },
    },
    VoteApiModel: {
      base: 'UGCApiModel', // Model继承，代表VoteApiModel是继承自UGCApiModel，拥有UGCApiModel的所有属性，支持多级继承
      interface: 'com.sns.ugc.domain.VoteApiModel',
      def: {
        voteMode: 'Integer',
      },
    },
  },
  /* 参数说明：
  ** model-定义的java model，
  ** data-是需要转换的json数据，
  ** arrayType-json数据为array时对应的java集合类型，如：List,Iterator等，可不填
  ** noConvertBase- 不转换根object为java object
  */
  convertJsonToJavaModel(model, data, arrayType, noConvertBase) {
    const {
      ctx,
    } = this;
    // model继承处理
    // if (model)
    ctx.helper.fillExtendModelDef(model);
    // json转换处理
    if (_.isArray(data)) {
      arrayType = arrayType || 'List'; // 缺省为List类型
      if (arrayType === 'array') {
        data = _.map(data, function(v) {
          return ctx.helper.convertJsonToJavaModel(model, v, arrayType, true);
        });
        data = java.array(model.interface, data);
      } else {
        data = _.map(data, function(v) {
          return ctx.helper.convertJsonToJavaModel(model, v);
        });
        data = java[arrayType](data);
      }
    } else {
      data = _.mapValues(data, function(v, k) {
        const kDef = model.def[k] || 'String'; // 缺省为String类型
        if (kDef.indexOf('Date') === 0) { // 对Date类型做特殊处理
          return { $class: 'java.util.Date', $: v };
        } else if (kDef.indexOf(':::') >= 0) {
          return java(ctx.helper.javaModels[kDef.split(':::')[1]].interface, v);
        } else if (kDef.indexOf('::') >= 0) {
          return ctx.helper.convertJsonToJavaModel(ctx.helper.javaModels[kDef.split('::')[1]], v, kDef.split('::')[0]);
        } else if (kDef.indexOf(':') >= 0) {
          return java[kDef.split(':')[0]](kDef.split(':')[1], v);
        }
        return java[kDef](v);
      });
      if (!noConvertBase) { // 是否将本object转换为javamodel
        data = java(model.interface, data);
      }
    }

    return data;
  },
  fillExtendModelDef(model) {
    const {
      ctx,
    } = this;
    if (model.base) {
      const extendModel = ctx.helper.javaModels[model.base];
      _.extend(model.def, extendModel.def);
      model.base = extendModel.base;
      ctx.helper.fillExtendModelDef(model);
    }
  },
};
