

import apiUrl from '../../../../config.js'
const globalData = getApp().globalData;
var load = require('../../../../lib/load.js');

import {
  updateGbDistributerWithFile,
  updateDisContent,
  getDisInfo,
  jjPurchaserUserUpdateWithFile

  
} from '../../../../lib/apiDistributer'

Page({


  onShow(){


    // 推荐直接用新API
    let windowInfo = wx.getWindowInfo();
    let globalData = getApp().globalData;
    this.setData({
      windowWidth: windowInfo.windowWidth * globalData.rpxR,
      windowHeight: windowInfo.windowHeight * globalData.rpxR,
      navBarHeight: globalData.navBarHeight * globalData.rpxR,
      statusBarHeight: globalData.statusBarHeight * globalData.rpxR,
    });

    getDisInfo(this.data.disInfo.gbDistributerId).then(res =>{
      if(res.result.code == 0){
        this.setData({
          disInfo: res.result.data,
        })
      }
    })
  },
  

  /**
   * 页面的初始数据
   */
  data: {
    editNow: false,
    showName: false,
    showPhone: false,

  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      url: apiUrl.server,
    })
    var disInfo = wx.getStorageSync('disInfo');
    if (disInfo) {
       this.setData({
        disInfo: disInfo
       })
      }
      var userInfo = wx.getStorageSync('userInfo');
      if (userInfo) {
         this.setData({
          userInfo: userInfo
         })
        }
  },



  //选择图片
  choiceImgUser: function (e) {
    var _this = this;

    wx.chooseImage({
      count: 1, // 最多可以选择的图片张数，默认9
      sizeType: ['original', 'compressed'], // original 原图，compressed 压缩图，默认二者都有
      sourceType: ['album', 'camera'], // album 从相册选图，camera 使用相机，默认二者都有
      success: function (res) {
        _this.setData({
          src: res.tempFilePaths,
        })
        console.log("savefileleel");
        var filePathList = _this.data.src;
        var userName = _this.data.userInfo.gbDuWxNickName;
        var userId = _this.data.userInfo.gbDepartmentUserId;
        load.showLoading("保存修改内容")
        jjPurchaserUserUpdateWithFile(filePathList, userName, userId).then(res => {
          const jsonObject = JSON.parse(res.result);
          console.log("jsobdjdd", jsonObject.data)
          load.hideLoading();
          if (jsonObject.code === 0) {
            _this.setData({
              userInfo: jsonObject.data,
            })
            let pages = getCurrentPages();
          let prevPage = pages[pages.length - 2];
          prevPage.setData({
            userInfo: jsonObject.data
          })
            wx.setStorageSync('userInfo', jsonObject.data)
            
          }else{
            wx.showToast({
              title: '修改失败',
              icon: 'none'
            })
          }   
        })
        // _this._checkSave();
      },
      fail: function () {
        // fail
      },
      complete: function () {
        // complete
      }
    })

  },

  

  //选择图片
  choiceImg: function (e) {
    var _this = this;
    wx.chooseImage({
      count: 1, // 最多可以选择的图片张数，默认9
      sizeType: ['compressed'], // original 原图，compressed 压缩图，默认二者都有
      sourceType: ['album', 'camera'], // album 从相册选图，camera 使用相机，默认二者都有
      success: function (res) {
        _this.setData({
          src: res.tempFilePaths,
        })
        var userId = _this.data.disInfo.gbDistributerId;
      console.log(_this.data.src, userId)
      updateGbDistributerWithFile(_this.data.src, userId).then(res => {
        console.log(res);
        const jsonObject = JSON.parse(res.result);
          if (jsonObject.code === 0) {
            _this.setData({
              disInfo: jsonObject.data,
            })

          }
        })
      
        
      },
      fail: function () {
        // fail
      },
      complete: function () {
        // complete
      }
    })

  },


  showDisName(){
    this.setData({
      showName: true,
    })
  },

getName(e){
  var data = "disInfo.gbDistributerName";
  this.setData({
    [data]: e.detail.value
  })
},


  showDisPhone(){

    this.setData({
      showPhone: true,
      editNow: true
    })

  },  

  getPhone(e){
    var data = "disInfo.gbDistributerPhone";
    this.setData({
      [data]: e.detail.value,
    })
  },

  finish(){
    this.setData({
      editNow: false
    })
  },
  stopPropagation(){
   this.setData({
    editNow: true,
   })
  },

  updateInfo(){
    this.setData({
      editPhone: false,
      editName: false,
      editNow: false
    })
    var user = this.data.disInfo;
    updateDisContent(user).then(res =>{
      if(res.result.code == 0){
        this.setData({
          showOperation: false,
          editNow: false
        })
      }
    })
  },


  requestSubscribeMessage() {
    wx.requestSubscribeMessage({
      tmplIds: [
        'CgludlqVZc_vmFaZUgVFC-iprkydrtOfF_GcODltpTc',
        '_KhWtCVg3fIBH-tHqSV0hUk5m_vuKmxw1CGn0PEv6D0',
        'TE6HIkd7LRQ08zdnQXowRjZu8OBK0eGEd368p2NtTeA'
      ],
      success: (res) => {
        if (res[
          'CgludlqVZc_vmFaZUgVFC-iprkydrtOfF_GcODltpTc',
          '_KhWtCVg3fIBH-tHqSV0hUk5m_vuKmxw1CGn0PEv6D0',
          'TE6HIkd7LRQ08zdnQXowRjZu8OBK0eGEd368p2NtTeA'
        ] === 'accept') {
          console.log("用户同意订阅AAA");
          this.showSucessModal();
        } else {
          console.log("用户拒绝订阅");
          // 可选：提示用户去设置页重新开启
          this.showGuideModal();
        }
      },
      fail: (err) => {
        console.error("订阅失败:", err);
      }
    });
  },

  showSucessModal(){
    console.log("sucecee")
    
    wx.showModal({
      title: '完成订阅提示',
      content: '您已订阅成功，无需重复订阅',
      confirmText: '好的',
      showCancel: false,
      success: (res) => {
        if (res.confirm) {
          // wx.navigateTo({ url: '/pages/settings/index' });
          // wx.openSetting(); // 打开微信设置页

        }
      },
      fail: (err) => {
        console.error("订阅失败:", err);
      }
    });
  },
  showGuideModal() {
    wx.showModal({
      title: '订阅提示',
      content: '开启通知后，您将及时收到订单状态提醒。您可以在“个人中心-消息设置”中重新开启。',
      confirmText: '去设置',
      success: (res) => {
        if (res.confirm) {
          // wx.navigateTo({ url: '/pages/settings/index' });
          wx.openSetting(); // 打开微信设置页

        }
      }
    });
  },



hideMask(){
  if(!this.data.editNow){

    this.setData({
      showName:false,
      showPhone: false
    })
  }
},


toPayPage(){
  wx.navigateTo({
    url: '../payPage/payPage?type=0',
  })
},

toGuanli(){

  wx.navigateToMiniProgram({
    appId: "wxd18ed10d341c957b",
    path: '/pages/inviteAdmin/inviteAdmin?disId=' + this.data.disInfo.gbDistributerId,
    envVersion: 'release', //release develop trial
    success(res) {
      // that.setData({
      //   toOpenMini: false
      // })
    }
  })
},

toPayList(){
  wx.navigateTo({
    url: '../payList/payList',
  })
},

toCouponList(){
  wx.navigateTo({
    url: '../couponList/couponList',
  })
},


toMendian(){
  wx.navigateTo({
    url: '../../../pages/mendian/index/index',
  })
},

toBack(){
  wx.navigateBack({
    delta :1
  })
}






})