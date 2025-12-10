const globalData = getApp().globalData;
import apiUrl from '../../config.js'
var load = require('../../lib/load.js');

import {
  gbRegisterWithFile
} from '../../lib/apiDistributer.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    restaurantName: '',
    phone: '',
    address: '',
    avatarUrl: '', // 选
    agreed: false, // 是否同意条款
    showTerms: false, // 是否显示条款弹窗
    canRegister: false // 是否可以注册（需要同意条款且餐厅名称有内容）
  },

  onShow() {
    // 推荐直接用新API
   let windowInfo = wx.getWindowInfo();
   let globalData = getApp().globalData;
   this.setData({
     windowWidth: windowInfo.windowWidth * globalData.rpxR,
     windowHeight: windowInfo.windowHeight * globalData.rpxR,
     navBarHeight: globalData.navBarHeight * globalData.rpxR,
   });
   
    var userInfo = wx.getStorageSync('userInfo');
   if(userInfo){
     wx.redirectTo({
       url: '../index/index',
     })
   }
   

  },

  onLoad: function (options) {
    this.setData({
      url: apiUrl.server,
    })
 
    this._aaa();
  },


  _aaa(){
    wx.login({
      success: (res) => {
        console.log(res);
       this.setData({
         code: res.code
       })
      },

      fail: (res => {
        wx.showToast({
          title: '请重新操作',
          icon: 'none'
        })
      })
    })
  },

  onRestaurantNameInput(e) {
    const value = e.detail.value;
    this.setData({
      restaurantName: value
    });
    // 更新可注册状态
    this._updateCanRegister(value, this.data.agreed);
  },
  // 联系电话输入
  onPhoneInput(e) {
    this.setData({
      phone: e.detail.value
    });
  },
  // 地址输入
  onAddressInput(e) {
    this.setData({
      address: e.detail.value
    });
  },

  // 如果要用微信手机号授权
  onGetPhoneNumber(e) {
    console.log('onGetPhoneNumber e:', e);
    if (e.detail.errMsg === "getPhoneNumber:ok") {
      // 解密获取真实手机号的逻辑
      // ...
    } else {
      wx.showToast({
        title: '您未授权获取手机号',
        icon: 'none'
      });
    }
  },

  
  // 提交注册
  onSubmit() {
    // 1. 简单验证
    if (!this.data.restaurantName) {
      wx.showToast({ title: '请输入餐厅名称', icon: 'none' });
      return;
    }
    if (!this.data.phone) {
      wx.showToast({ title: '请输入联系电话', icon: 'none' });
      return;
    }

    // 2. 调用后端接口
   
  },


  async onChooseAvatar(e) {
    // e.detail.avatarUrl 就是用户选的头像
    const { avatarUrl } = e.detail;

    // 1. 先进行表单简单验证
    if (!this.data.restaurantName) {
      wx.showToast({ title: '请输入餐厅名称', icon: 'none' });
      return;
    }
    if (!this.data.phone) {
      wx.showToast({ title: '请输入联系电话', icon: 'none' });
      return;
    }
    // 校验是否同意条款
    if (!this.data.agreed) {
      wx.showToast({ title: '请先阅读并同意充值条款', icon: 'none' });
      return;
    }

    // 2. 把头像赋值到 data，给前端做预览
    this.setData({ avatarUrl });

    // 3. 显示自定义loading（假设你有封装 load.showLoading）
    load.showLoading("注册小程序订货客户");

    try {
      // 4. 调用注册接口
      const res = await gbRegisterWithFile(
        this.data.avatarUrl,
        this.data.restaurantName,
        this.data.code,       // 如果你有 code
        this.data.phone,
        this.data.address
      );

      load.hideLoading();
      console.log('注册返回:', res.result);
      const jsonObject = JSON.parse(res.result);
      if (jsonObject.code === 0) {
        console.log("res", jsonObject)
        wx.setStorageSync('disInfo', jsonObject.data.disInfo);
        wx.setStorageSync('userInfo', jsonObject.data.depUserInfo);
        // wx.setStorageSync('disUserInfo', res.result.data.userInfo);
        // 跳转到首页 or 其他页面
        wx.redirectTo({
          url: '../index/index?depId=' + jsonObject.data.disInfo.purDepartmentList[0].gbDepartmentId,
        });
      } else {
        load.hideLoading();
        wx.showToast({
          title: jsonObject.msg || '注册失败',
          icon: 'none'
        });
      }

    } catch (err) {
      load.hideLoading();
      console.error('注册异常', err);
      wx.showToast({
        title: '网络异常',
        icon: 'none'
      });
    }
  },

  toBack() {
    wx.navigateBack({delta: 1});
  },

  // 同意条款复选框变化
  onAgreementChange(e) {
    const checked = e.detail.value.includes('agree');
    this.setData({
      agreed: checked
    });
    // 更新可注册状态
    this._updateCanRegister(this.data.restaurantName, checked);
  },

  // 更新可注册状态
  _updateCanRegister(restaurantName, agreed) {
    const canRegister = restaurantName.trim().length > 0 && agreed;
    this.setData({
      canRegister: canRegister
    });
  },

  // 显示条款弹窗
  showTermsModal() {
    this.setData({
      showTerms: true
    });
  },

  // 隐藏条款弹窗
  hideTermsModal() {
    this.setData({
      showTerms: false
    });
  },

  // 阻止弹窗内容区域点击关闭
  preventClose() {
    // 空函数，阻止事件冒泡
  },

})