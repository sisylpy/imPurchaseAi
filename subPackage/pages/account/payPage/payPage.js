const globalData = getApp().globalData;
var app = getApp()
var load = require('../../../../lib/load.js');
import apiUrl from '../../../../config.js'

import {
  gbDisBuyUser,
  gbDisGetBuyType,
  buyMachines,
  addPoints
} from '../../../../lib/apiDistributer'


let itemWidth = 0;
let windowWidth = 0;

Page({

 
  onShow: function () {

    // 推荐直接用新API
    let windowInfo = wx.getWindowInfo();
    let globalData = getApp().globalData;
    this.setData({
      windowWidth: windowInfo.windowWidth * globalData.rpxR,
      windowHeight: windowInfo.windowHeight * globalData.rpxR,
      navBarHeight: globalData.navBarHeight * globalData.rpxR,
      statusBarHeight: globalData.statusBarHeight * globalData.rpxR,
    });


  },
  /**
   * 页面的初始数据
   */
  data: {
    sliderOffset: 0,
    sliderOffsets: [],
    sliderLeft: 0,
    tabs: [

      {
        name: "流量",
        amount: "",
        amountOk: "",
      }, {
        name: "定制",
        amount: "",
        amountOk: "",
      }, {
        name: "更多",
        amount: "",
        amountOk: "",
      },
    ],
    selArr: [],
    aaa: 0,
    type: 0,
    currentTab: 0,

    expired: false, // 默认未过期
    haveLiwu: false,
    countdownText: '',


  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    var disInfoValue = wx.getStorageSync('disInfo');
    if (disInfoValue) {
      this.setData({
        disInfo: disInfoValue,
        disId: disInfoValue.gbDistributerId,

      })
    }



    var userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo: userInfo
      })
    }



    this.setData({
      rpxR: globalData.rpxR,
      url: apiUrl.server,
      selIndex: 0,
      img: 'userImage/index_share.png',
    })

    this._initData();
    this.clueOffset(options.type);


  },


  _showLiwu() {
    var disInfoValue = this.data.disInfo;

    var dateString = disInfoValue.gbDistributerSettleFullTime;
    const dateParts = dateString.split(" ");
    const dateArray = dateParts[0].split("-"); // 获取 "YYYY-MM-DD"
    const timeArray = dateParts[1].split(":"); // 获取 "HH:MM:SS"

    // 使用 Date.UTC 来创建 UTC 时间
    const utcDate = Date.UTC(
      parseInt(dateArray[0], 10), // 年
      parseInt(dateArray[1], 10) - 1, // 月，注意：JavaScript 中月份是从 0 开始的
      parseInt(dateArray[2], 10), // 日
      parseInt(timeArray[0], 10), // 时
      parseInt(timeArray[1], 10), // 分
      parseInt(timeArray[2], 10) // 秒
    );

    const newDate = new Date(utcDate + this.data.liwuDay * 24 * 60 * 60 * 1000); // 加上天数（转成毫秒）
    var ddd = newDate.toISOString().slice(0, 19).replace("T", " "); // 格式化为 "YYYY-MM-DD HH:MM:SS" 格式
    this.setData({
      currentTime: disInfoValue.gbDistributerSettleFullTime, // 假设当前时间
      endTime: ddd,
    })

    const that = this;
    const currentTime = new Date(this.data.currentTime.replace(/-/g, '/'));
    const endTime = new Date(this.data.endTime.replace(/-/g, '/'));

    // 判断活动是否已过期
    if (currentTime > endTime) {
      this.setData({
        expired: true
      });
    } else {
      // 启动倒计时
      const currentTime = new Date();
      const timeDiff = endTime - currentTime;

      // 如果结束时间已经过期
      if (timeDiff <= 0) {
        clearInterval(that.interval);
        that.setData({
          expired: true
        });
        return;
      }

      // 计算剩余的天、小时、分钟、秒
      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

      // 更新倒计时文本
      that.setData({
        countdownText: `${days}天 ${hours} 小时 ${minutes}分钟`
      });


      // this.startCountdown(endTime);
    }

    var haveLiwu = wx.getStorageSync('haveLiwu');
    if(haveLiwu){
      this.setData({
        haveLiwu: true,
      })
    }else{
      this.setData({
        haveLiwu: false
      })
    }
  },



  startCountdown: function (endTime) {
    const that = this;
    // 每秒更新一次倒计时
    this.interval = setInterval(function () {
      const currentTime = new Date();
      const timeDiff = endTime - currentTime;

      // 如果结束时间已经过期
      if (timeDiff <= 0) {
        clearInterval(that.interval);
        that.setData({
          expired: true
        });
        return;
      }

      // 计算剩余的天、小时、分钟、秒
      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

      // 更新倒计时文本
      that.setData({
        countdownText: `${days}天 ${hours} 小时 ${minutes}分钟`
      });
    }, 10000);
  },

  getLiwu: function () {
    console.log("uuyy", this.data.disInfo.gbDistributerBuyQuantity)
    if (this.data.disInfo.gbDistributerBuyQuantity > 50) {

      var data = {
        disId: this.data.disId,
        points: this.data.liwu
      }
      var that = this;
      addPoints(data).then(res => {
        if (res.result.code == 0) {
         wx.showModal({
           title: '领取成功！',
           content: this.data.liwu + '点已到帐',
           showCancel:false,
           complete: (res) => {
             if (res.confirm) {
              wx.setStorageSync('haveLiwu', true);
              that.setData({
                haveLiwu: true,
              })
             }
           }
         })
         
        }
      })

    } else {
      wx.showToast({
        title: '需要先充值',
        icon: 'none'
      });
    }



  },



  changeIndex(e) {
    var index = e.currentTarget.dataset.index;
    this.setData({
      selIndex: index,
      orderSubtotal: this.data.payArr[index].nxNdpPaySubtotal,
      quantity: this.data.payArr[index].nxNdpBuyQuantity,
    })
  },



  _initData() {
    var data = {
      disId: this.data.disId,
      type: this.data.type,
    }
    var that  = this;
    load.showLoading("获取数据中");
    gbDisGetBuyType(data).then(res => {
      load.hideLoading();
      if (res.result.code == 0) {
        console.log(res);
        this.setData({
          payArr: res.result.data.list,
          payEntities: res.result.data.payEntities,
          liwu: res.result.data.liwu,
          liwuDay: res.result.data.liwuDay,

        })
        that._showLiwu();
        if (this.data.currentTab < 2) {
          this.setData({
            orderSubtotal: res.result.data.list[0].nxNdpPaySubtotal,
            quantity: res.result.data.list[0].nxNdpBuyQuantity,
          })
        } else {
          this.setData({
            orderSubtotal: 0,
            quantity: 0,
          })

        }
      }
    })


  },



  toDep() {

    wx.navigateTo({
      url: '../selDepartment/selDepartment?quantity=' + this.data.quantity + "&subtotal=" + this.data.orderSubtotal,
    })
  },


  gorRunnerLobbyList() {
    var arr = [];
    var sel = this.data.selArr;
    for (var i = 0; i < sel.length; i++) {

      var price = sel[i].perPrice;

      var one = {
        gbGdpPaySubtotal: sel[i].nxNdpPaySubtotal,
        payUserOpenId: this.data.userInfo.gbDuWxOpenId,
        gbGdpBuyQuantity: 1,
        gbGdpGbDisId: this.data.disInfo.gbDistributerId,
        gbGdpType: sel[i].nxNdpType,
        gbGdpImgUrl: sel[i].nxNdpImgUrl,
        gbGdpSellDetail: sel[i].nxNdpSellDetail,
      }
      arr.push(one);
    }

    buyMachines(arr)
      .then(res => {
        if (res.result.code == 0) {
          console.log(res)
          var map = res.result.map;

          wx.requestPayment({
            nonceStr: map.nonceStr,
            package: map.package,
            signType: "MD5",
            timeStamp: map.timeStamp,
            paySign: map.paySign,

            success: function (resPay) {
              wx.showToast({
                title: '充值成功',

              })
              wx.navigateBack({
                delta: 1
              })

            },
            fail: function (res) {
              console.log(res);
              console.log("failelleeespapayayyaayyay")

            }
          })


        }
      })
  },

  gorRunnerLobby: function (e) {

    var that = this;
    var data = {
      disId: this.data.disId,
      openId: this.data.userInfo.gbDuWxOpenId,
      subtotal: this.data.orderSubtotal,
      type: this.data.type,
      quantity: this.data.quantity,
    }

    gbDisBuyUser(data)
      .then(res => {
        if (res.result.code == 0) {
          console.log(res)
          var map = res.result.map;

          wx.requestPayment({
            nonceStr: map.nonceStr,
            package: map.package,
            signType: "MD5",
            timeStamp: map.timeStamp,
            paySign: map.paySign,

            success: function (resPay) {

              wx.showToast({
                title: '充值成功',

              })
              wx.navigateBack({
                delta: 1
              });


            },
            fail: function (res) {
              console.log(res);
              console.log("failelleeespapayayyaayyay")

            }
          })


        }
      })
  },



  /**
   * 计算偏移量
   */
  clueOffset(type) {

    itemWidth = Math.ceil(this.data.windowWidth / this.data.tabs.length);
    console.log("thiswiek", this.data.windowWidth, "itemw", itemWidth);
    let tempArr = [];
    for (let i in this.data.tabs) {
      tempArr.push(itemWidth * i);
    }
    // tab 样式初始化
    this.setData({
      sliderOffsets: tempArr,
      sliderLeft: (this.data.windowWidth / 8),
    });

  },

  /**
   * tabItme点击
   */
  onTab1Click(event) {

    console.log("onTab1Click");
    this.setData({
      currentTab: event.currentTarget.dataset.current,
      selIndex: 0,
    })

  },


  bindChange: function (e) {
    console.log(e);
    this.setData({
      currentTab: e.detail.current,
      sliderOffset: this.data.sliderOffsets[e.detail.current],
      type: e.detail.current,
      selIndex: 0,
    })

    this._initData()

  },


  // // 跳转客服
  toCustomerServicePages: function () {
    console.log("kefu")
    try {
      wx.openCustomerServiceChat({
        extInfo: {
          url: 'https://work.weixin.qq.com/kfid/kfce23df54c35579b3f' //客服ID
        },
        corpId: 'ww9778dea409045fe6', //企业微信ID
        success(res) {

        },fail(resF) {
          console.log(resF);
          
        }
      })
    } catch (error) {
      showToast("请更新至微信最新版本")
    }
  },


  /**
   * 邀请采购员
   * @param {*} options 
   */
  onShareAppMessage: function (options) {
    console.log("disId=" + this.data.userInfo.gbDuDistributerId +
      '&disName=' + this.data.disInfo.gbDistributerName)
    return {
      title: "向你推荐专业的饭店采购小程序", // 默认是小程序的名称(可以写slogan等)
      path: '/pages/inviteTro/inviteTro?disId=' + this.data.userInfo.gbDuDistributerId +
        '&disName=' + this.data.disInfo.gbDistributerName,
      imageUrl: this.data.url + this.data.img,
    }
  },



  addMachine(e) {

    var index = e.currentTarget.dataset.index;
    console.log(index);
    var arr = this.data.selArr;
    var item = this.data.payArr[index];
    var data = "payArr[" + index + "].isSelected";
    if (item.isSelected) {
      this.setData({
        [data]: false
      })
      var purId = item.perPrice;
      var choicePrintArr = arr.filter(item => item.perPrice !== purId);
      this.setData({
        selArr: choicePrintArr
      })

    } else {
      this.setData({
        [data]: true
      })
      var selArr = this.data.selArr;
      selArr.push(item);
      this.setData({
        selArr: selArr
      })
    }

    var selArr = this.data.selArr;
    var total = 0;
    if (selArr.length > 0) {
      for (var i = 0; i < selArr.length; i++) {
        total += Number(selArr[i].nxNdpPaySubtotal);
      }
    }
    console.log("tootoa", total);
    this.setData({
      orderSubtotal: total,
      aaa: total
    })

  },

  toBack() {
    wx.navigateBack({
      delta: 1
    })
  },


})