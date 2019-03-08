'use strict';

const java = require('js-to-java');
const _ = require('lodash');

module.exports = {
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
        title: 'String',
        topicContent: 'String',
        forward: 'boolean',
        share: 'boolean',
        commentate: 'boolean',
        fabulous: 'boolean',
        Tread: 'boolean',
        startTime: 'Date', // Date转换为java.util.Date
        overPic: ':::FileInfoModel', // :::代表是个无前置类型的Model
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
  },
  // model-定义的java model，data-是需要转换的json数据，arrayType-json数据为array时对应的java集合类型，如：List,Iterator等，可不填
  convertJsonToJavaModel(model, data, arrayType) {
    const {
      ctx,
    } = this;
    if (_.isArray(data)) {
      arrayType = arrayType || 'List'; // 缺省为List类型
      data = _.map(data, function(v) {
        return ctx.helper.convertJsonToJavaModel(model, v);
      });
      data = java[arrayType](data);
    } else {
      data = _.mapValues(data, function(v, k) {
        const kDef = model.def[k] || 'String'; // 缺省为String类型
        if (kDef.indexOf('Date') === 0) { // 对Date类型做特殊处理
          return { $class: 'java.util.Date', $: v };
        } else if (kDef.indexOf(':::') >= 0) {
          return java(ctx.helper.javaModels[kDef.split(':::')][1].interface, v);
        } else if (kDef.indexOf('::') >= 0) {
          return ctx.helper.convertJsonToJavaModel(ctx.helper.javaModels[kDef.split('::')[1]], v, kDef.split('::')[0]);
        } else if (kDef.indexOf(':') >= 0) {
          return java[kDef.split(':')[0]](kDef.split(':')[1], v);
        }
        return java[kDef](v);
      });
      data = java(model.interface, data);
    }
    return data;
  },
};
