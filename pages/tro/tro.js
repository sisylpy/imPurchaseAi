
const globalData = getApp().globalData;
import apiUrl from '../../config.js'
var load = require('../../lib/load.js');


Page({
  data: {
    userInfo: null,
    hasUserInfo: false,
    canIUseGetUserProfile: false,
    currentSlide: 0, // Swiper 当前页
    autoplay: true,
    url: "",
  },
  
  onShow: function () {

    // 推荐直接用新API
    let windowInfo = wx.getWindowInfo();
    let globalData = getApp().globalData;
    this.setData({
      windowWidth: windowInfo.windowWidth * globalData.rpxR,
      windowHeight: windowInfo.windowHeight * globalData.rpxR,
      navBarHeight: globalData.navBarHeight * globalData.rpxR,
    });
    this.setData({
      autoplay: false, // 停止自动切换
    });
  
    // 延迟启动 autoplay，确保 swiper 正常加载后重启
    setTimeout(() => {
      this.setData({
        autoplay: true,
        currentSlide: 0,

      });
    }, 100); // 延迟 100ms
  },

  
  onLoad: function (options) {
    this.setData({
      windowWidth: globalData.windowWidth * globalData.rpxR,
      windowHeight: globalData.windowHeight * globalData.rpxR,
      navBarHeight: globalData.navBarHeight * globalData.rpxR,
      url: apiUrl.server,
    })
 
  },

  onSwiperChange(e) {
    const current = e.detail.current;
    this.setData({ currentSlide: current });
  },

  // 方式1：使用 getUserProfile （微信官方推荐）
  // onTapGetUserProfile() {
  //   wx.getUserProfile({
  //     desc: '用于完善会员资料',
  //     success: (res) => {
  //       console.log('getUserProfile success:', res);
  //       const userInfo = res.userInfo || {};
  //       this.setData({
  //         userInfo,
  //         hasUserInfo: true,
  //       });
  //       // TODO: 调用后台注册登录接口
  //       // ...
  //       // 获取成功后跳转或刷新
  //       this._doRegisterToServer(userInfo);
  //     },
  //     fail: (err) => {
  //       console.log('getUserProfile fail:', err);
  //     }
  //   });
  // },

  // 方式2：使用旧的 getUserInfo
  // onGetUserInfo(e) {
  //   console.log('onGetUserInfo e:', e);
  //   if (e.detail.userInfo) {
  //     this.setData({
  //       userInfo: e.detail.userInfo,
  //       hasUserInfo: true
  //     });
  //     // TODO: 调用后台注册登录接口
  //     this._doRegisterToServer(e.detail.userInfo);
  //   } else {
  //     // 用户取消或拒绝授权
  //     wx.showToast({
  //       title: '您拒绝了授权',
  //       icon: 'none'
  //     });
  //   }
  // },

  // // 获取手机号
  // onGetPhoneNumber(e) {
  //   console.log('onGetPhoneNumber e:', e);
  //   if (e.detail.errMsg === "getPhoneNumber:ok") {
  //     // 这里拿到 encryptedData, iv 等信息
  //     const { encryptedData, iv } = e.detail;
  //     // 需要传到后端解密，获取真实手机号
  //     // ...
  //     this._doBindPhone(encryptedData, iv);
  //   } else {
  //     wx.showToast({
  //       title: '无法获取手机号',
  //       icon: 'none'
  //     });
  //   }
  // },

  // 提交到服务端注册
  _doRegisterToServer(userInfo) {

    console.log('模拟注册到服务端');
    wx.navigateTo({
      url: '/pages/home/index'
    });
  },


  toNext(){
    wx.navigateTo({
      url: '../register/register',
    })
  },
});
