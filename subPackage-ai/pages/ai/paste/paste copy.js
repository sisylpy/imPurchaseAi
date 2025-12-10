import load from '../../../../lib/load';
import {
  depPasteSearchGoods,
  deleteOrderGb,
  addRecord,
  depGetTodayRecordSeconds
} from '../../../../lib/apiDepOrder';


const globalData = getApp().globalData;
const plugin = requirePlugin("QCloudAIVoice");
const speechRecognizerManager = plugin.speechRecognizerManager();

// 添加 DeepSeek API 配置
const DEEPSEEK_API_KEY = 'sk-ab54d76efc1e4d95a7ab2cdb3013a920'; // 需要替换为实际的 API key
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

// 添加优化语音文本的函数
async function optimizeTextWithDeepSeek(text, temperature) {
  try {
    console.log('开始调用 DeepSeek API，输入文本:', text);

    return new Promise((resolve, reject) => {
      wx.request({
        url: DEEPSEEK_API_URL,
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
        },
        data: {
          model: "deepseek-chat",
          messages: [{
              role: "system",
              content: `本场景为饭店/餐饮行业订货录单。所有输入内容都应优先理解为餐饮行业采购相关的商品（如生鲜、调料、餐具等），并结合行业常用词、同音词、近义词进行智能归类和纠正。

请特别注意以下规则：
1.  **输入来源**：上传的内容主要来自腾讯语音识别，因此很多汉字可能是同音词的错误转换。你需要将它们智能地识别为正确的蔬菜、水果或调料名称，不能只看字面意思。
2.  **特殊商品名**：以下商品名称是完整的商品名，不要将其拆分为商品名+备注：
   - "去叶中葱"、"去叶大葱" - 这些都是完整的葱类商品名称
   - "西兰苔" - 完整的蔬菜名称
   - "板蓝根" - 完整的药材名称
   - "手指胡萝卜" - 这是一种特殊的胡萝卜品种，是完整的蔬菜名称，不要识别为普通"胡萝卜"
   - 其他以"去叶"、"去根"、"去皮"等开头的商品名都是完整的商品名称
3.  **宽容处理**：不要随便删除无法立刻理解的内容，应尽最大努力将其理解为同音的蔬菜、水果或调料名称。

你是一个专业的订单文本优化助手。请将用户输入的文本转换为标准订单格式，要求：
1. 每行一个商品
2. 商品名称和数量用冒号分隔
3. 数量后面跟单位（斤、个、包、根、棵、条、盒、捆、袋等）
4. 去除无关内容
5. 保持商品名称的准确性
6. 支持"数字+商品名"格式，如"3香菜"应理解为"香菜:3斤"
7. 如果商品数量后没有单位，请自动补全"斤"作为单位
8. 如果商品名称后面没有明确的数量和单位，不要随意添加
9. 备注信息只和具体商品关联：如果备注内容在商品前面或后面（如"要新鲜的西红柿5斤"或"西红柿5斤要新鲜的"），请将其作为该商品的备注内容。
10. 如果备注内容是独立一句（没有和任何商品直接关联），请不要自动归为任何商品的备注。
11. 支持"备注+商品+数量"格式（如"小颗的油菜两斤"或"油菜小颗的两斤"），请将备注内容（如"小颗的"）作为该商品的备注。
12. 如果商品名称或规格中包含数字（如"1000圆餐盒"或"一千圆餐盒"），请优先将数字视为商品名称或规格的一部分，只有在数字紧跟在商品名称后、且后面有单位时，才将其视为数量。
13. 对于所有输入内容，都尽量理解为饭店采购相关的商品（如生鲜、调料、餐具等），不要简单过滤。
14. 如果遇到不常见的词汇或疑似地名、备注等，也请尝试用同音词、近义词或常见饭店采购商品进行智能纠正和归类。
15. 如果无法确定具体商品，也请尽量输出为最接近的生鲜、调料或餐具商品名。
16. 对于商品名称中的常见同音词或行业错别字要自动归一。例如：
    - "1000元餐盒"应理解为"1000圆餐盒"（"元"归一为"圆"，表示圆形）。
    - 其他类似行业常用错别字或同音词，也请自动归一为最常用的采购商品名称。
17. 如果商品名称中出现"各"字（如"红黄彩椒各"），请整体视为一个商品名，不要拆分为多个商品。
18. 当遇到不常见或容易混淆的商品名称时，请在输出中添加说明。说明格式为"（说明具体说明内容）"，说明内容应该解释为什么这样识别，以及可能的同音词或近义词。
19. 注意语音识别错误：由于输入内容来自腾讯语音识别，可能存在识别不准确的情况。当遇到明显不合理的数量或商品名时，请根据上下文和餐饮行业常识进行智能纠正。例如：
    - "实质"可能是"10只"的语音识别错误
    - "死机"可能是"4斤"的语音识别错误
    - "无间"可能是"5斤"的语音识别错误
    - "溜达"可能是"6大"的语音识别错误
    - 其他类似的数字同音词错误

示例：
输入："红黄彩椒各2斤"
输出：
红黄彩椒各:2斤
输入："油菜小颗的两斤"
输出：
油菜:2斤（小颗的）
输入："一千圆餐盒 1 件"
输出：
一千圆餐盒:1件
输入："1000餐盒一件。西湖路。两根。要小的。"
输出：
1000餐盒:1件
西葫芦:2根（要小的）
输入："去叶中葱5斤"
输出：
去叶中葱:5斤
输入："去叶大葱3斤"
输出：
去叶大葱:3斤
输入："去根胡萝卜2斤"
输出：
去根胡萝卜:2斤
输入："安装5斤"
输出：
按酱:5斤（说明"安装"根据餐饮行业常用调料纠正为"按酱"或"安酱"，这是调味酱料的一种）
输入："鸡蛋实质"
输出：
鸡蛋:10只（说明"实质"根据语音识别错误纠正为"10只"）
`
            },
            {
              role: "user",
              content: text
            }
          ],
          temperature: temperature
        },
        success: (res) => {
          console.log('API 响应成功:', res);
          if (res.statusCode === 200 && res.data && res.data.choices && res.data.choices[0]) {
            const optimizedText = res.data.choices[0].message.content;
            console.log('优化后的文本:', optimizedText);
            resolve(optimizedText);
          } else {
            console.error('API 响应格式不正确:', res);
            reject(new Error('API 响应格式不正确'));
          }
        },
        fail: (err) => {
          console.error('API 请求失败:', err);
          reject(new Error('API 请求失败: ' + JSON.stringify(err)));
        }
      });
    });
  } catch (error) {
    console.error('DeepSeek API 调用错误:', error);
    console.error('错误详情:', {
      message: error.message,
      stack: error.stack,
      response: error.response
    });
    return text; // 如果 API 调用失败，返回原始文本
  }
}

var books = "";

Page({

  onHide() {
    // 页面隐藏时停止录音
    if (this.data.isRecording) {
      this.stopRecord();
    }
  },

  onUnload() {
    // 页面卸载时停止录音
    if (this.data.isRecording) {
      this.stopRecord();
    }
    // 清除所有定时器
    if (this.data.timer) {
      clearInterval(this.data.timer);
    }
    if (this.restSecondsTimer) {
      clearInterval(this.restSecondsTimer);
    }
    // 清除静音定时器
    if (this.data.silenceTimer) {
      clearTimeout(this.data.silenceTimer);
    }
  },


  data: {
    orderArr: [],
    show: false,
    showOperation: false,
    todayCount: null,
    goodsName: null,
    count: 0,
    duration: 0,
    timer: null,
    customerName: "",
    sentence: "",
    inputContent: "",
    originSentence: '',
    bottomHeight: 180,
    showDeepSeekLoading: false,
    hasAiRecognized: false,
    temperature: 0.7,
    aiRetryCount: 0,
    isRecording: false,
    showExplanationModal: false,
    explanationContent: "",
    silenceTimer: null, // 静音超时定时器
    lastVoiceTime: 0, // 最后一次检测到语音的时间
    showOperationLinshi: false,
    isProcessingError: false // 防止重复处理OnError

  },


  onLoad: function (options) {
    this.setData({
      windowWidth: globalData.windowWidth * globalData.rpxR,
      windowHeight: globalData.windowHeight * globalData.rpxR,
      navBarHeight: globalData.navBarHeight * globalData.rpxR,
      depFatherId: options.depFatherId,
      depId: options.depId,
      disId: options.disId,
    })

    var value = wx.getStorageSync('userInfo');
    if (value) {
      this.setData({
        userInfo: value,
        disId: value.gbDuDistributerId,
        userId: value.gbDepartmentUserId,
      })
    }


    depGetTodayRecordSeconds(this.data.disId).then(res => {
      if (res.result.code == 0) {
        this.setData({
          restSeconds: res.result.data.minute,
        })
        books = res.result.data.books;
      }
    })


    // 检查隐私设置并处理隐私弹窗逻辑
    wx.getPrivacySetting({
      success: res => {
        console.log("getPrivacySetting", res);
        if (res.needAuthorization) {
          // 需要弹出隐私协议
          wx.showModal({
            title: '隐私协议',
            content: '为了提供更好的服务，我们需要收集您的某些信息。请仔细阅读并同意我们的隐私协议。',
            showCancel: false,
            success: function (result) {
              if (result.confirm) {
                // 用户同意隐私协议，尝试调用需要授权的API
                wx.authorize({
                  scope: 'scope.record', // 替换为你需要授权的API范围
                  success: function () {
                    // 授权成功，可以调用相关API了
                    console.log('授权成功');
                    // 调用相关API的代码...
                  },
                  fail: function () {
                    // 授权失败，处理错误
                    console.log('授权失败');
                  }
                });
              }
            }
          });
        } else {
          // 用户已经授权，可以直接调用相关API
          console.log('已经授权');
          // 调用相关API的代码...
        }
      }
    });

    // 初始化语音识别回调
    speechRecognizerManager.OnRecognitionStart = (res) => {
      console.log('开始识别', res)
      this.setData({
        recognitionStatus: '识别中...'
      })
    }

    speechRecognizerManager.OnSentenceBegin = (res) => {
      console.log('一句话开始', res)
    }

    speechRecognizerManager.OnRecognitionResultChange = (res) => {
      console.log('识别变化时', res)
      if (res.result) {
        // 检测到语音，重置静音计时器
        this.setData({
          sentence: res.result.voice_text_str,
          lastVoiceTime: Date.now()
        });

        // 清除之前的静音定时器
        if (this.data.silenceTimer) {
          clearTimeout(this.data.silenceTimer);
        }

        // 设置新的静音检测定时器（6秒）
        const silenceTimer = setTimeout(() => {
          console.log('检测到6秒静音，自动停止录音');
          this.stopRecord();
          wx.showToast({
            title: '检测到静音，已停止录音',
            icon: 'none',
            duration: 2000
          });
        }, 6000);

        this.setData({
          silenceTimer: silenceTimer
        });
      }
    }

    speechRecognizerManager.OnSentenceEnd = (res) => {
      console.log('一句话结束', res)
    }

    speechRecognizerManager.OnRecognitionComplete = async (res) => {
      console.log('识别结束', res);
      
      // 清理静音定时器，防止误触发"检测到静音"提示
      if (this.data.silenceTimer) {
        clearTimeout(this.data.silenceTimer);
        this.setData({
          silenceTimer: null
        });
      }
      
      this.setData({
        recognitionStatus: '识别完成',
        isRecording: false
      });

      try {
        // 获取识别到的文本
        const recognizedText = this.data.sentence;
        console.log('【语音识别原始文本】:', recognizedText);
        if (!recognizedText || recognizedText.trim() === '') {
          console.log('识别文本为空，跳过优化');
          return;
        }

        // DeepSeek 优化前日志
        console.log('【DeepSeek优化前】:', recognizedText);
        // 显示 DeepSeek loading 动画
        this.setData({
          showDeepSeekLoading: true
        });
        // 调用 DeepSeek API 优化文本
        const optimizedText = await optimizeTextWithDeepSeek(recognizedText, this.data.temperature);
        // DeepSeek 优化后日志
        console.log('【DeepSeek优化后】:', optimizedText);
        // 隐藏 DeepSeek loading 动画
        this.setData({
          inputContent: optimizedText,
          sentence: optimizedText,
          originSentence: recognizedText, // 保存最初的录音文本
          showDeepSeekLoading: false
        });

      } catch (error) {
        // 隐藏 DeepSeek loading 动画（异常时也要隐藏）
        this.setData({
          showDeepSeekLoading: false
        });
        console.error('处理语音识别结果时出错:', error);
        wx.showToast({
          title: '文本优化失败，使用原始文本',
          icon: 'none',
          duration: 2000
        });
      }
    }

    speechRecognizerManager.OnError = async (res) => {
      console.log('识别失败', res)

      // 防止重复处理OnError
      if (this.data.isProcessingError) {
        console.log('OnError - 正在处理中，跳过重复调用');
        return;
      }

      // 设置处理标志
      this.setData({
        isProcessingError: true
      });

      // 保存当前录音时长，避免被stopRecord重置
      const currentDuration = this.data.duration;
      console.log('OnError - 当前录音时长:', currentDuration);

      // 检查是否有语音识别结果需要处理
      const recognizedText = this.data.sentence;
      console.log('OnError - 当前识别文本:', recognizedText);

      // 如果有识别结果，尝试处理
      if (recognizedText && recognizedText.trim() !== '') {
        console.log('OnError - 处理识别结果:', recognizedText);
        try {
          // 显示 DeepSeek loading 动画
          this.setData({
            showDeepSeekLoading: true
          });
          // 调用 DeepSeek API 优化文本
          const optimizedText = await optimizeTextWithDeepSeek(recognizedText, this.data.temperature);
          console.log('OnError - DeepSeek优化后:', optimizedText);
          // 隐藏 DeepSeek loading 动画
          this.setData({
            inputContent: optimizedText,
            sentence: optimizedText,
            originSentence: recognizedText, // 保存最初的录音文本
            showDeepSeekLoading: false
          });
        } catch (error) {
          // 隐藏 DeepSeek loading 动画（异常时也要隐藏）
          this.setData({
            showDeepSeekLoading: false
          });
          console.error('OnError - 处理语音识别结果时出错:', error);
          // 如果优化失败，至少显示原始文本
          this.setData({
            inputContent: recognizedText,
            sentence: recognizedText,
            originSentence: recognizedText
          });
        }
      }

      // 如果是超时错误（4008），需要记录录音时长
      if (res.code === 4008) {
        console.log('检测到超时错误，记录录音时长:', currentDuration);

        // 只有录音时长大于等于3秒时才记录
        if (currentDuration >= 3) {
          // 调用 addRecord 接口记录录音时长
          var data = {
            gbNdplGbDisId: this.data.disId,
            gbNdplPaySubtotal: currentDuration,
            gbNdplGbDepartmentFatherId: this.data.depFatherId,
            gbNdplGbDepartmentId: this.data.depId,
          };

          load.showLoading("保存录音");
          console.log('[OnError] addRecord data:', data);
          addRecord(data).then(res => {
            if (res.result.code == 0) {
              load.hideLoading();
              console.log('超时录音时长记录成功');
            } else {
              load.hideLoading();
              console.error('超时录音时长记录失败:', res.result.msg);
            }
          }).catch(err => {
            load.hideLoading();
            console.error('超时录音时长记录异常:', err);
          });
        } else {
          console.log('录音时长小于3秒，跳过记录:', currentDuration);
        }
      }

      this.setData({
        recognitionStatus: '识别失败',
        isRecording: false,
        isProcessingError: false // 重置处理标志
      })

      // 清理定时器和状态
      if (this.data.timer) {
        clearInterval(this.data.timer);
      }
      if (this.restSecondsTimer) {
        clearInterval(this.restSecondsTimer);
      }
      if (this.data.silenceTimer) {
        clearTimeout(this.data.silenceTimer);
        this.setData({
          silenceTimer: null
        });
      }
    }

    speechRecognizerManager.OnRecorderStop = (res) => {
      console.log('录音结束', res);
      this.setData({
        inputContent: this.data.sentence,
      })
    }

    // //。
  },


  startRecord() {
    // 检查录音时间是否已用完
    if (this.data.restSeconds <= 0) {
      wx.showModal({
        title: '录音时长提醒',
        content: '今日录音时间已用完，请选择用其它方式下单。如果您的下单时间不够用，请联系配送商为您增加录音时长。',
        showCancel: false,
        confirmText: '知道了',
        success: function (res) {
          if (res.confirm) {
            console.log('用户确认了录音时间用完');
          }
        }
      });
      return;
    }

    wx.vibrateShort && wx.vibrateShort();
    const that = this;
    console.log('[startRecord] called');
    this.setData({
      duration: 0,
      isRecording: true,
      isProcessingError: false // 重置处理标志
    }, () => {
      console.log('[startRecord] setData done, duration:', that.data.duration, 'isRecording:', that.data.isRecording);
    });

    const params = {
      secretkey: 'YOUR_SECRET_KEY',
      secretid: 'YOUR_SECRET_ID',
      appid: '1308821743',
      engine_model_type: '16k_zh',
      voice_format: 1
    };

    if (this.restSecondsTimer) clearInterval(this.restSecondsTimer);
    this.restSecondsTimer = setInterval(() => {
      if (that.data.restSeconds > 0) {
        that.setData({
          restSeconds: that.data.restSeconds - 1
        });
      } else {
        // 录音时长用完，停止录音
        that.stopRecord();

        wx.showModal({
          title: '录音时长提醒',
          content: '今日录音时长已用完，请您用其它方式下单',
          showCancel: false,
          confirmText: '知道了',
          success: function (res) {
            if (res.confirm) {
              console.log('用户确认了录音时长用完');
            }
          }
        });
      }
    }, 1000);

    if (that.data.timer) clearInterval(that.data.timer);
    that.data.timer = setInterval(() => {
      that.setData({
        duration: that.data.duration + 1
      }, () => {
        console.log('[timer] duration:', that.data.duration);
      });
    }, 1000);

    console.log('[startRecord] timer started:', !!that.data.timer);
    speechRecognizerManager.start(params);
  },

  stopRecord() {
    const that = this;
    that.lastRecordDuration = that.data.duration;
    console.log('[stopRecord] called, duration:', that.data.duration, 'isRecording:', that.data.isRecording);
    clearInterval(that.data.timer);
    if (this.restSecondsTimer) clearInterval(this.restSecondsTimer);
    // 清除静音定时器
    if (this.data.silenceTimer) {
      clearTimeout(this.data.silenceTimer);
      this.setData({
        silenceTimer: null
      });
    }
    // 增强：确保isRecording状态被正确关闭
    if (that.data.isRecording) {
      console.log('[stopRecord] set isRecording false');
      that.setData({
        isRecording: false
      });
    }
    that.setData({
      recording: false,
      timer: null,
      // isRecording: false, // 保留原有，防止遗漏
    }, () => {
      console.log('[stopRecord] setData done, duration:', that.data.duration, 'isRecording:', that.data.isRecording);
    });

    // 只有录音时长大于等于3秒时才记录
    if (that.data.duration >= 3) {
      var data = {
        gbNdplGbDisId: that.data.disId,
        gbNdplPaySubtotal: that.data.duration,
        gbNdplGbDepartmentFatherId: that.data.depFatherId,
        gbNdplGbDepartmentId: that.data.depId,
      };
      load.showLoading("保存录音");
      console.log('[stopRecord] addRecord data:', data);
      addRecord(data).then(res => {
        if (res.result.code == 0) {
          load.hideLoading();
          that.setData({

            duration: 0,
          }, () => {
            console.log('[stopRecord] duration reset to 0');
          });
          // that.formatContent();
        }
      });
    } else {
      console.log('录音时长小于3秒，跳过记录:', that.data.duration);
      // 即使不记录，也要重置时长
      that.setData({
        duration: 0,
      }, () => {
        console.log('[stopRecord] duration reset to 0 (skipped recording)');
      });
    }
    speechRecognizerManager.stop();
  },

  // 统一AI+本地解析处理
  async handleContentWithAI(content, temperature) {
    try {
      this.setData({
        showDeepSeekLoading: true
      });
      const optimizedText = await optimizeTextWithDeepSeek(content, temperature || this.data.temperature);

      // 检查是否包含说明性文字
      const explanationMatches = optimizedText.match(/（说明(.+?)）/g);
      if (explanationMatches && explanationMatches.length > 0) {
        // 提取所有说明内容
        const explanations = explanationMatches.map(match => {
          const content = match.match(/（说明(.+?)）/);
          return content ? content[1] : '';
        }).filter(text => text.length > 0);

        // 移除说明文字，只保留订单内容
        let cleanText = optimizedText.replace(/（说明.+?）/g, '').trim();

        // 移除可能的前缀说明文字
        cleanText = cleanText.replace(/^根据餐饮行业.*?：\s*/g, '');
        cleanText = cleanText.replace(/^我将对输入内容进行专业优化处理.*?：\s*/g, '');
        cleanText = cleanText.replace(/^特别注意.*?：\s*/g, '');

        // 移除末尾的总结说明
        cleanText = cleanText.replace(/\n说明：.*$/s, '');

        // 显示说明弹窗
        this.setData({
          showDeepSeekLoading: false,
          showExplanationModal: true,
          explanationContent: explanations.join('\n\n')
        });

        // 如果有清理后的文本，再进行解析
        if (cleanText) {
          this.setData({
            inputContent: cleanText
          });
          const {
            orders,
            formatted
          } = this._formatOrderContent(cleanText);
          this.setData({
            orderArr: orders,
            formattedContent: formatted
          });
        }
      } else {
        // 没有说明文字，正常处理
        let cleanText = optimizedText;
        // 移除可能的前缀说明文字
        cleanText = cleanText.replace(/^根据餐饮行业.*?：\s*/g, '');
        cleanText = cleanText.replace(/^我将对输入内容进行专业优化处理.*?：\s*/g, '');
        cleanText = cleanText.replace(/^特别注意.*?：\s*/g, '');

        // 移除末尾的总结说明
        cleanText = cleanText.replace(/\n说明：.*$/s, '');

        this.setData({
          inputContent: cleanText,
          showDeepSeekLoading: false
        });
        const {
          orders,
          formatted
        } = this._formatOrderContent(cleanText);
        this.setData({
          orderArr: orders,
          formattedContent: formatted
        });
      }
    } catch (e) {
      this.setData({
        showDeepSeekLoading: false
      });
      wx.showToast({
        title: 'AI识别失败',
        icon: 'none'
      });
      console.error('handleContentWithAI error:', e);
    }
  },

  // 粘贴内容/按钮入口
  async formatContent() {
    const content = this.data.inputContent;
    if (!content || !content.trim()) {
      wx.showToast({
        title: '内容为空',
        icon: 'none'
      });
      return;
    }
    // 只做本地格式化
    const {
      orders,
      formatted
    } = this._formatOrderContent(content);
    this.setData({
      orderArr: orders,
      formattedContent: formatted
    });
  },

  // 录音识别完成后调用
  async onRecordRecognizeFinish(originSentence) {
    if (!originSentence || !originSentence.trim()) {
      wx.showToast({
        title: '录音内容为空',
        icon: 'none'
      });
      return;
    }
    await this.handleContentWithAI(originSentence);
  },

  clearSentence() {
    this.setData({
      inputContent: '',
      sentence: '',
      orderArr: [],
      orderArrFixed: [],
    });
  },

  onInput(e) {
    const text = e.detail.value;
    console.log('[onInput] textarea value:', text);
    this.setData({
      inputContent: text.trim() !== '' ? text : ''
    }, () => {
      console.log('[onInput] setData done, inputContent:', this.data.inputContent);
    });
  },


  async again() {
    const content = this.data.originSentence || this.data.inputContent;
    let temp = 1.5;
    let retry = this.data.aiRetryCount;

    if (!content || content.trim() === '') {
      wx.showToast({
        title: '内容为空',
        icon: 'none'
      });
      return;
    }
    if (retry >= 1) {
      wx.showToast({
        title: '已达最大尝试次数',
        icon: 'none'
      });
      return;
    }

    this.setData({
      showDeepSeekLoading: true,
      temperature: temp,
      aiRetryCount: retry + 1
    });
    try {
      const optimizedText = await optimizeTextWithDeepSeek(content, temp);
      this.setData({
        inputContent: optimizedText,
        sentence: optimizedText,
        showDeepSeekLoading: false,
        hasAiRecognized: true // 1次后显示"重新操作"按钮
      });
      this.formatContent();
    } catch (e) {
      this.setData({
        showDeepSeekLoading: false
      });
      wx.showToast({
        title: '识别失败',
        icon: 'none'
      });
    }
  },

  // 合并被拆开的商品行（如"500"、"黑方餐盒"、"100个"）
  mergeLines: function (lines) {
    const merged = [];
    let i = 0;
    while (i < lines.length) {
      // 如果当前行是纯数字，且后面有两行，合并三行
      if (/^[\d一二三四五六七八九十百千万]+$/.test(lines[i]) && i + 2 < lines.length) {
        merged.push(lines[i] + lines[i + 1] + lines[i + 2]);
        i += 3;
      } else if (/^[\d一二三四五六七八九十百千万]+$/.test(lines[i]) && i + 1 < lines.length) {
        merged.push(lines[i] + lines[i + 1]);
        i += 2;
      } else {
        merged.push(lines[i]);
        i++;
      }
    }
    return merged;
  },

  _formatOrderContent: function (content) {
    console.log('[formatOrderContent] 入参 content:', content);
    // 改为 let，后面要对 orders 重新赋值
    let orders = [];
    // 1. 按行拆分
    let lines = content.split(/\r?\n/);

    // 过滤无效行
    console.log("linessss", lines);
    lines = lines.filter(line => {
      line = line.trim();
      if (!line) return false; // 跳过空行
      if (/^备注[:：]/.test(line)) return true;

      let orderRegex = /^\d+[、，\.．]\s*(.+?)[:：]\s*(.+)$/;
      if (orderRegex.test(line)) return true;

      let commaRegex = /^(.*?)\s*[\,，]\s*(.+)$/;
      if (commaRegex.test(line)) return true;

      let hasNumber = /[\d零一二两三四五六七八九十百千万半]/.test(line);
      return hasNumber;
    });

    // ============ A. 中文数字转阿拉伯数字 ============
    function chineseNumberToArabic(chineseNum) {
      const map = {
        '零': 0,
        '一': 1,
        '二': 2,
        '两': 2,
        '三': 3,
        '四': 4,
        '五': 5,
        '六': 6,
        '七': 7,
        '八': 8,
        '九': 9,
        '十': 10,
        '百': 100,
        '千': 1000,
        '万': 10000,
        '半': 0.5
      };
      let result = 0,
        temp = 0;
      for (let i = 0; i < chineseNum.length; i++) {
        const char = chineseNum[i];
        if (char === '半') {
          result += 0.5;
        } else if (map[char] >= 10) {
          if (temp === 0) temp = 1;
          result += temp * map[char];
          temp = 0;
        } else if (map[char] !== undefined) {
          temp = temp * 10 + map[char];
        }
      }
      result += temp;
      return result;
    }

    // ============ B. 从尾部解析「名称 + 括号备注 + 数量+单位」 ============
    function parseSegmentEndOfLine(segment) {
      segment = segment.trim().replace(/[,，、。.]+$/g, '');

      // 先移除说明文字，避免被当作备注
      segment = segment.replace(/（说明.+?）/g, '');

      const bracketRegex = /(?:（|\(|【)(.+?)(?:）|\)|】)/;
      let remarkText = '';
      const bracketMatch = segment.match(bracketRegex);
      if (bracketMatch) {
        remarkText = bracketMatch[1];
        segment = segment.replace(bracketRegex, '').trim();
      }

      const hasArabic = /[0-9]/.test(segment);
      let name = segment,
        qtyVal = '',
        qtyUnit = '',
        regex;

      if (hasArabic) {
        regex = /^(.*?)([\d\.]+)(\S*)$/;
      } else {
        regex = /^(.*?)([一二两三四五六七八九十百千万半]+)(\S*)$/;
      }
      const m = segment.match(regex);
      if (m) {
        let potentialName = m[1].trim().replace(/\s+/g, '');
        let potentialQty = m[2].trim();
        let potentialUnit = m[3].trim();
        name = potentialName.trim(); // 确保商品名没有前后空格

        // 数量值
        if (/^[\d\.]+$/.test(potentialQty)) {
          qtyVal = potentialQty;
        } else {
          qtyVal = chineseNumberToArabic(potentialQty).toString();
        }

        // 单位列表
        const validUnits = ['斤', '个', '包', '根', '棵', '条', '盒', '捆', '袋', '跟'];
        let foundUnit = '';
        for (let u of validUnits) {
          if (potentialUnit.startsWith(u)) {
            foundUnit = u;
            break;
          }
        }
        if (foundUnit) {
          qtyUnit = foundUnit;
          const extra = potentialUnit.slice(foundUnit.length).trim();
          if (extra) remarkText = remarkText ? (remarkText + ' ' + extra) : extra;
        } else {
          qtyUnit = potentialUnit;
        }
      }

      return {
        gbDoGoodsName: name,
        gbDoQuantity: qtyVal,
        gbDoStandard: qtyUnit,
        gbDoRemark: remarkText,
      };
    }

    // ============ C. 序号格式解析 ============
    function parseLineWithSerial(line) {
      const match = line.match(/^(\d+)[、，\.．]\s*(.+?)[:：]\s*(.+)$/);
      if (!match) return null;

      let namePart = match[2].trim().replace(/\s+/g, '');
      let qtyPart = match[3].trim().replace(/[\.。]+$/g, '').trim();

      // 先移除说明文字，避免被当作备注
      namePart = namePart.replace(/（说明.+?）/g, '');
      qtyPart = qtyPart.replace(/（说明.+?）/g, '');

      let remarkText = '';
      const br = namePart.match(/(?:（|\(|【)(.+?)(?:）|\)|】)/);
      if (br) {
        remarkText = br[1];
        namePart = namePart.replace(/(?:（|\(|【).+?(?:）|\)|】)/, '').trim();
      }

      const qMatch = qtyPart.match(/^([\d一二三四五六七八九十百千万半\.]+)\s*(\S*)$/);
      let val = '',
        unit = '';
      if (qMatch) {
        val = qMatch[1];
        unit = qMatch[2];
      }
      if (/[零一二两三四五六七八九十百千万半]/.test(val)) {
        val = chineseNumberToArabic(val).toString();
      }
      if (unit === '两' || unit === '量') {
        let v = parseFloat(val) / 10;
        v = +v.toFixed(1);
        val = v.toString();
        unit = '斤';
      }

      return {
        gbDoGoodsName: namePart.trim(), // 确保商品名没有前后空格
        gbDoQuantity: val,
        gbDoStandard: unit,
        gbDoRemark: remarkText
      };
    }

    // ============ D. 拆逗号分隔 ============
    function splitByCommaOutsideBrackets(str) {
      let res = [],
        depth = 0,
        cur = '';
      for (let c of str) {
        if ('（(【'.includes(c)) {
          depth++;
          cur += c;
        } else if ('）)】'.includes(c)) {
          depth = Math.max(0, depth - 1);
          cur += c;
        } else if ((c === ',' || c === '，' || c === '、') && depth === 0) {
          if (cur.trim()) res.push(cur.trim());
          cur = '';
        } else cur += c;
      }
      if (cur.trim()) res.push(cur.trim());
      return res;
    }

    function parseLineWithComma(line) {
      // 先处理空格分隔优先
      if (/\s/.test(line)) {
        let parts = line.split(/\s+/),
          arr = [];

        // 新增：处理"商品名 数量 单位"三部分格式
        if (parts.length === 3) {
          let name = parts[0].trim();
          let quantity = parts[1].trim();
          let unit = parts[2].trim();

          // 验证数量是否为数字
          if (/^[\d一二两三四五六七八九十百千万半\.]+$/.test(quantity)) {
            let qtyVal = quantity;
            if (/[零一二两三四五六七八九十百千万半]/.test(quantity)) {
              qtyVal = chineseNumberToArabic(quantity).toString();
            }

            arr.push({
              gbDoGoodsName: name,
              gbDoQuantity: qtyVal,
              gbDoStandard: unit,
              gbDoRemark: ''
            });

            if (arr.length) return arr;
          }
        }

        // 原有的单部分处理逻辑
        parts.forEach(item => {
          let mm = item.match(/^(.+?)(\d+)(.+)$/);
          if (mm) {
            // 验证匹配结果是否合理：商品名应该包含中文字符
            let goodsName = mm[1].trim();
            if (/[\u4e00-\u9fa5]/.test(goodsName) && goodsName.length > 0) {
              let result = {
                gbDoGoodsName: goodsName,
                gbDoQuantity: mm[2].trim(),
                gbDoStandard: mm[3].trim(),
                gbDoRemark: ''
              };
              arr.push(result);
            }
          }
        });
        if (arr.length) {
          return arr;
        }

        // 如果没有匹配到，尝试将整个行作为单个商品处理
        if (parts.length === 2) {
          // 可能是 "商品名 数量单位(备注)" 的格式
          let name = parts[0].trim();
          let qtyPart = parts[1].trim();

          // 使用 parseSegmentEndOfLine 来处理数量部分
          let parsed = parseSegmentEndOfLine(qtyPart);
          if (parsed && parsed.gbDoQuantity) {
            let result = {
              gbDoGoodsName: name,
              gbDoQuantity: parsed.gbDoQuantity,
              gbDoStandard: parsed.gbDoStandard,
              gbDoRemark: parsed.gbDoRemark
            };
            arr.push(result);
            return arr;
          }
        }
      }

      // 逗号分隔
      line = line.replace(/[\u3002]+/g, ',');
      let segs = splitByCommaOutsideBrackets(line),
        arr = [];
      segs.forEach(seg => {
        let result = parseSegmentEndOfLine(seg);
        if (result) arr.push(result);
      });
      return arr;
    }

    // ============ E. 逐行处理 ============
    lines.forEach(line => {
      line = line.trim();
      if (!line) return;

      if (/^备注[:：]/.test(line)) {
        if (orders.length) {
          let last = orders[orders.length - 1];
          last.gbDoRemark = (last.gbDoRemark || '') + ' ' + line.replace(/^备注[:：]/, '').trim();
        }
        return;
      }

      // 1) 序号格式
      let obj1 = parseLineWithSerial(line);
      if (obj1) {
        orders.push({
          ...obj1,
          gbDoAddRemark: !!obj1.gbDoRemark,
          gbDoStatus: -2,
          gbDoDepartmentId: this.data.depId,
          gbDoDepartmentFatherId: this.data.depFatherId,
          gbDoDisGoodsId: null,
          gbDoStandardWarn: 0,
          goodsNameWarn: 0,
          gbDoDistributerId: this.data.disId,
          gbDoPurchaseUserId: -1,
          rawText: line,
          gbDoOrderUserId: this.data.userId,
          gbDoIsAgent: 1,
        });
        return;
      }

      // 2) 冒号替换为空格
      if (/^(.*?)[:：](.+)$/.test(line)) {
        console.log('[formatOrderContent] 检测到冒号，替换为空格');
        line = line.replace(/^(.+?)[:：](.+)$/, '$1 $2');
        console.log('[formatOrderContent] 冒号替换后:', line);
      }

      // 3) 逗号分隔

      let arr2 = parseLineWithComma(line);
      if (arr2 && arr2.length) {
        arr2.forEach(i => {
          if (i && i.gbDoGoodsName) {
            orders.push({
              ...i,
              gbDoAddRemark: !!i.gbDoRemark,
              gbDoStatus: -2,
              gbDoDepartmentId: this.data.depId,
              gbDoDepartmentFatherId: this.data.depFatherId,
              gbDoDisGoodsId: null,
              gbDoStandardWarn: 0,
              goodsNameWarn: 0,
              gbDoDistributerId: this.data.disId,
              gbDoPurchaseUserId: -1,
              rawText: line,
              gbDoOrderUserId: this.data.userId,
              gbDoIsAgent: 1,
            });
          }
        });
        return;
      }

      // 4) 空格分隔（兜底）
      let parts = line.split(/\s+/);
      parts.forEach(item => {
        let mm = item.match(/^(.+?)(\d+)(.+)$/);
        if (mm) {
          orders.push({
            gbDoGoodsName: mm[1].trim(),
            gbDoQuantity: mm[2].trim(),
            gbDoStandard: mm[3].trim(),
            gbDoRemark: '',
            gbDoAddRemark: false,
            gbDoStatus: -2,
            gbDoDepartmentId: this.data.depId,
            gbDoDepartmentFatherId: this.data.depFatherId,
            gbDoDisGoodsId: null,
            gbDoStandardWarn: 0,
            goodsNameWarn: 0,
            gbDoDistributerId: this.data.disId,
            gbDoPurchaseUserId: -1,
            rawText: line,
            gbDoOrderUserId: this.data.userId,
            gbDoIsAgent: 1,
          });
        }
      });
    });

    // ============ F. 初次写入 ============
    this.setData({
      orderArr: orders
    });

    // ============ F2. 异常重解析 ============
    function reparseSingleOrder(raw) {
      raw = raw.replace(/\s+/g, '');
      let m = raw.match(/^(.+?)([\d一二两三四五六七八九十百千万半\.]+)(斤|把|包|件|个|捆|棵|条|盒|袋|跟|根)?(.*)?$/);
      if (!m) return null;
      return {
        gbDoGoodsName: m[1].trim(),
        gbDoQuantity: m[2].trim(),
        gbDoStandard: m[3] ? m[3].trim() : '',
        gbDoRemark: m[4] ? m[4].trim() : ''
      };
    }
    orders.forEach((order, idx) => {
      const validName = /[\u4e00-\u9fa5]/.test(order.gbDoGoodsName);
      const validQty = Number(order.gbDoQuantity) > 0;
      const validStandard = /[\u4e00-\u9fa5]/.test(order.gbDoStandard);
      if (!validName || !validQty || !validStandard) {
        let rep = reparseSingleOrder(order.rawText);
        if (rep) {
          orders[idx] = {
            ...order,
            ...rep,
            gbDoAddRemark: !!rep.gbDoRemark
          };
        }
      }
    });

    // ============ F3. 最终新增 gbDoAddRemark 字段（保险） ============
    orders = orders.map(o => ({
      ...o,
      gbDoAddRemark: !!o.gbDoRemark
    }));

    // ============ G. 最终写入 ============
    this.setData({
      orderArr: orders
    });

    // ============ H. 可选：返回预览字符串 ============
    const formatted = orders.map(o => {
      let str = `${o.gbDoGoodsName}${o.gbDoQuantity}${o.gbDoStandard}`;
      if (o.gbDoRemark) str += `（${o.gbDoRemark}）`;
      return str;
    }).join('\n');
    return {
      orders,
      formatted
    };
  },

  //修改预览订单内容
  editOrder(e) {

    var type = e.currentTarget.dataset.type;
    var index = e.currentTarget.dataset.index;

    if (e.detail.value.length > 0) {

      this.setData({
        orderArrIndex: index,

      })
      if (type == "name") {
        var data = "orderArr[" + index + "].gbDoGoodsName";
        this.setData({

          [data]: e.detail.value,
        })
      }
      if (type == "quantity") {
        console.log("quannaididi", e.detail.value);
        var data = "orderArr[" + index + "].gbDoQuantity";
        this.setData({
          [data]: e.detail.value,
        })
      }
      if (type == "standard") {
        var data = "orderArr[" + index + "].gbDoStandard";
        this.setData({
          [data]: e.detail.value,
        })
      }

    }
    if (type == "remark") {
      var data = "orderArr[" + index + "].gbDoRemark";
      if (e.detail.value.length > 0) {
        this.setData({
          [data]: e.detail.value,
        })
      } else {
        var dataAdd = "orderArr[" + index + "].gbDoAddRemark";
        this.setData({
          [data]: "",
          [dataAdd]: false
        })
      }

    }


  },


  //保存预览订单
  depPasteSearchGoods() {
    var canSave = this._checkOrderContent();
    if (canSave) {
      load.showLoading("识别商品中");
      depPasteSearchGoods(this.data.orderArr).then(res => {
        if (res.result.code == 0) {
          console.log(res.result.data);
          wx.setStorageSync('needRefreshOrderData', true);

          var tempArr = res.result.data;
          this.setData({
            strArr: [],
            saveCount: null,
          })
          var listArr = [];
          if (tempArr.length > 0) {
            var haveId = 0;
            for (var i = 0; i < tempArr.length; i++) {
              var id = tempArr[i].gbDoStatus;
              if (id !== -2) {
                haveId = Number(haveId) + Number(1);
              }
              var item = tempArr[i];
              item.gbDoStandardWarn = 0;
              listArr.push(item);
            }
            this.setData({
              todayCount: this.data.orderArr.length,
              saveCount: haveId,
              orderArr: listArr,
            })
          }
        }
        load.hideLoading();
        wx.showToast({
          title: res.msg,
          icon: 'none'
        })
      })
    }
  },


  _checkOrderContent() {
    var arr = this.data.orderArr;
    var canSave = true;
    var that = this;

    console.log('=== 开始批量检查订单 ===');
    console.log('订单数组:', arr);
    console.log('订单数量:', arr ? arr.length : 'undefined');

    // 添加基本空值检查
    if (!arr || !Array.isArray(arr) || arr.length === 0) {
      console.warn('❌ 订单列表为空或无效');
      wx.showModal({
        title: '订单检查',
        content: '订单列表为空，请先添加订单内容',
        showCancel: false,
        confirmText: "知道了",
      });
      return false;
    }

    console.log('✅ 订单列表有效，开始逐个检查');

    for (var i = 0; i < arr.length; i++) {
      var order = arr[i];

      console.log(`\n--- 检查第 ${i + 1} 个订单 ---`);
      console.log('订单对象:', order);

      // 添加订单对象检查
      if (!order) {
        console.warn(`❌ 第 ${i + 1} 个订单对象为空，跳过检查`);
        continue;
      }

      var name = order.gbDoGoodsName || '';
      var standard = order.gbDoStandard || '';
      var quantity = order.gbDoQuantity || '';
      var standarWarn = order.gbDoStandardWarn || 0;

      console.log('📋 订单数据:', {
        name,
        standard,
        quantity,
        standarWarn,
        nameLength: name.length,
        standardLength: standard.length,
        quantityType: typeof quantity
      });

      console.log('📏 单位检查:', {
        standardLength: standard.length,
        standarWarn: standarWarn,
        shouldShowModal: standard.length > 1 && standarWarn == 0
      });

      if (standard.length > 1 && standarWarn == 0) {
        console.log('⚠️ 第', i + 1, '个订单单位长度过长，显示确认弹窗');
        canSave = false;
        wx.showModal({
          title: '检查 "单位"是否正确',
          content: standard,
          showCancel: true,
          cancelText: "确定正确",
          cancelColor: 'black',
          confirmText: "修改单位",
          confirmColor: '#147062',
          complete: function (res) {
            if (res.cancel) {
              console.log('✅ 用户确认第', i + 1, '个订单单位正确');
              var data = "orderArr[" + i + "].gbDoStandardWarn";
              that.setData({
                [data]: 1
              })
            }
            if (res.confirm) {
              console.log('🔄 用户选择修改第', i + 1, '个订单单位');
              that.setData({
                editApply: true,
                applyItem: order,
                showOrder: true,
                applyStandardName: order.gbDoStandard,
                itemDis: order.gbDistributerGoodsEntity,
                applyNumber: order.gbDoQuantity,
                applyRemark: order.gbDoRemark,
              })
            }
          }
        })
        break;
      } else {
        console.log('✅ 第', i + 1, '个订单单位检查通过，检查字段完整性');

        var quantityNum = Number(quantity);
        var fieldsValid = name.length > 0 && standard.length > 0 && quantityNum > 0;

        console.log('📋 字段完整性检查:', {
          nameValid: name.length > 0,
          standardValid: standard.length > 0,
          quantityValid: quantityNum > 0,
          quantityType: typeof quantity,
          quantityValue: quantity,
          allValid: fieldsValid
        });

        if (fieldsValid) {
          if (standarWarn > 0) {
            console.log('✅ 第', i + 1, '个订单已确认，检查通过');
            canSave = true;
          } else {
            console.log('⚠️ 第', i + 1, '个订单未确认，但字段完整');
            canSave = true;
          }
        } else {
          console.log('❌ 第', i + 1, '个订单字段不完整，显示错误弹窗');
          wx.showModal({
            title: '订单是否缺少内容?',
            content: name + " " + quantity + " " + standard,
            showCancel: false,
            confirmText: "知道了",
          })
          canSave = false;
          break;
        }
      }
    }

    console.log('🎯 批量检查完成，最终结果:', canSave);
    return canSave;
  },

  _checkOrderItemContent(order, i) {
    var that = this;

    console.log('=== 开始检查订单项 ===');
    console.log('订单索引:', i);
    console.log('原始订单对象:', order);

    // 添加订单对象检查
    if (!order) {
      console.warn('❌ 订单对象为空');
      return false;
    }

    var name = order.gbDoGoodsName || '';
    var standard = order.gbDoStandard || '';
    var quantity = order.gbDoQuantity || '';
    var standarWarn = order.gbDoStandardWarn || 0;

    console.log('📋 解析后的订单数据:', {
      name,
      standard,
      quantity,
      standarWarn,
      nameLength: name.length,
      standardLength: standard.length,
      quantityType: typeof quantity,
      standarWarnType: typeof standarWarn
    });

    // 添加属性存在性检查
    if (!standard || typeof standard !== 'string') {
      console.warn('❌ 订单单位属性无效:', order);
      wx.showModal({
        title: '订单数据错误',
        content: '订单单位数据无效，请检查订单信息',
        showCancel: false,
        confirmText: "知道了",
      });
      return false;
    }

    // 检查数量是否为有效数字
    var quantityNum = Number(quantity);
    console.log('🔢 数量检查:', {
      originalQuantity: quantity,
      quantityNum: quantityNum,
      isNaN: isNaN(quantityNum),
      isPositive: quantityNum > 0
    });

    if (isNaN(quantityNum) || quantityNum <= 0) {
      console.warn('❌ 订单数量错误:', {
        quantity,
        quantityNum
      });
      wx.showModal({
        title: '订单数量错误',
        content: '订单数量必须为大于0的数字',
        showCancel: false,
        confirmText: "知道了",
      });
      return false;
    }

    // 检查单位长度是否过长且未确认
    console.log('📏 单位长度检查:', {
      standardLength: standard.length,
      standarWarn: standarWarn,
      shouldShowModal: standard.length > 2 && standarWarn == 0
    });

    if (standard.length > 2 && standarWarn == 0) {
      console.log('⚠️ 单位长度过长，显示确认弹窗');
      wx.showModal({
        title: '单位是否正确?',
        content: name + " " + quantity + " " + standard,
        showCancel: true,
        cancelText: "确定正确",
        cancelColor: 'black',
        confirmText: "修改单位",
        confirmColor: '#147062',
        success: function (res) {
          if (res.cancel) {
            // 用户确认单位正确
            console.log("✅ 用户确认单位正确，索引:", i);
            var data = "orderArr[" + i + "].gbDoStandardWarn";
            that.setData({
              [data]: 1
            });
            that._choiceGoods();
          } else if (res.confirm) {
            // 用户选择修改单位
            console.log("🔄 用户选择修改单位");
            // 这里可以添加修改单位的逻辑
          }
        }
      });
      return false;
    }

    // 检查必要字段是否完整
    console.log('✅ 字段完整性检查:', {
      nameValid: name.length > 0,
      standardValid: standard.length > 0,
      quantityValid: quantityNum > 0,
      allValid: name.length > 0 && standard.length > 0 && quantityNum > 0
    });

    if (name.length > 0 && standard.length > 0 && quantityNum > 0) {
      // 如果已经确认过单位，或者单位长度合理，则允许保存
      var canSave = standarWarn > 0 || standard.length <= 2;
      console.log('🎯 最终检查结果:', {
        standarWarn: standarWarn,
        standardLength: standard.length,
        standarWarnValid: standarWarn > 0,
        standardLengthValid: standard.length <= 2,
        canSave: canSave
      });

      if (canSave) {
        console.log("✅ 订单项检查通过");
        return true;
      } else {
        console.log("❌ 订单项检查失败：单位未确认且长度过长");
      }
    } else {
      console.log("❌ 订单项检查失败：必要字段不完整");
    }

    // 订单信息不完整
    console.log('❌ 显示订单信息不完整弹窗');
    wx.showModal({
      title: '订单是否缺少内容?',
      content: name + " " + quantity + " " + standard,
      showCancel: false,
      confirmText: "知道了",
    });
    return false;
  },


  showPasteOperation(e) {
    this.setData({
      orderPasteIndex: e.currentTarget.dataset.index,
      showOperationPaste: true,
      orderItem: this.data.orderArr[e.currentTarget.dataset.index],
    })
  },


  addRemark() {
    var index = this.data.orderPasteIndex;

    var data = "orderArr[" + index + "].gbDoAddRemark";
    this.setData({
      [data]: true,
      showOperationPaste: false
    })

  },


  //删除预览订单
  delOrder() {
    var index = this.data.orderPasteIndex;
    var arr = this.data.orderArr;
    arr.splice(index, 1);
    console.log(arr.length);
    this.setData({
      orderArr: arr,
      showOperationPaste: false,
    })

  },

  showOperation(e) {
    this.setData({
      orderArrIndex: e.currentTarget.dataset.index,
      showOperation: true,
      applyItem: this.data.orderArr[e.currentTarget.dataset.index],
    })
  },

  hideMask() {
    this.setData({
      showOperation: false,
      showOperationPaste: false
    })
  },


  delApplyPaste() {

    var that = this;
    deleteOrderGb(this.data.applyItem.gbDepartmentOrdersId).then(res => {
      if (res.result.code == 0) {
        var arr = that.data.orderArr;
        arr = arr.filter((_, index) => index !== that.data.orderArrIndex);
        that.setData({
          editApply: false,
          showOrder: false,
          applyItem: "",
          orderArr: arr,
          showOperationLinshi:false
        })
        

      } else {
        wx.showToast({
          title: res.result.msg,
          icon: 'none'
        })
      }
    })
  },




  toBack() {
    wx.navigateBack({
      delta: 1
    })

  },


  backBegin() {
    this.setData({
      inputContent: '',
      sentence: '',
      orderArr: [],
      orderArrFixed: [],
      hasAiRecognized: false,
      temperature: 0.7,
      aiRetryCount: 0,
    });
  },

  toggleRecord() {
    console.log('[toggleRecord] called, isRecording:', this.data.isRecording);
    if (this.data.isRecording) {
      console.log('[toggleRecord] will call stopRecord');
      this.stopRecord();
    } else {
      console.log('[toggleRecord] will call startRecord');
      this.startRecord();
    }
  },

  // 关闭说明弹窗
  closeExplanationModal() {
    this.setData({
      showExplanationModal: false,
      explanationContent: ""
    });
  },

  // 确认说明弹窗
  confirmExplanationModal() {
    this.setData({
      showExplanationModal: false,
      explanationContent: ""
    });
  },



  //

  openOperationLinshi(e) {
    console.log(e);
    this.setData({
      showOperationLinshi: true,
      applyItem: e.currentTarget.dataset.order,
      goodsName: e.currentTarget.dataset.name,
      orderArrIndex: e.currentTarget.dataset.index,
    })
    this.chooseSezi();
  },



  toPasteFromGoods(e) {
    console.log("toPasteFromGoodstoPasteFromGoods");
    wx.setStorageSync('applyItem', this.data.applyItem)
    this.hideMaskLinshi();
    wx.navigateTo({
      url: '../editDepApplyGoods/editDepApplyGoods?from=paste&orderPasteIndex=' + this.data.orderArrIndex
    })

  },

  hideMaskLinshi() {
    this.setData({
      showOperationLinshi: false
    })

  },


  // /////
  chooseSezi: function (e) {
    // 用that取代this，防止不必要的情况发生
    var that = this;
    // 创建一个动画实例
    var animation = wx.createAnimation({
      // 动画持续时间
      duration: 100,
      // 定义动画效果，当前是匀速
      timingFunction: 'linear'
    })
    // 将该变量赋值给当前动画
    that.animation = animation
    // 先在y轴偏移，然后用step()完成一个动画
    animation.translateY(200).step()
    // 用setData改变当前动画
    that.setData({
      // 通过export()方法导出数据
      animationData: animation.export(),
      // 改变view里面的Wx：if
      chooseSize: true
    })
    // 设置setTimeout来改变y轴偏移量，实现有感觉的滑动
    setTimeout(function () {
      animation.translateY(0).step()
      that.setData({
        animationData: animation.export()
      })
    }, 20)
  },






})