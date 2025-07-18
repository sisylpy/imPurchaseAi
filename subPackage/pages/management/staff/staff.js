
const globalData = getApp().globalData;
var load = require('../../../../lib/load.js');

import apiUrl from '../../../../config.js'

import {
  getDepUsersByFatherIdGb,
  deleteDepUser,
} from '../../../../lib/apiDistributer'


Page({


  onShow(){
    this._initData();
  },
  /**
   * 页面的初始数据
   */
  data: {
    showOperation: false,
    toOpenMini: false,
    isTishi: false,
    toSharePurchase: false,
    editUser:  false,
    update: false

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      windowWidth: globalData.windowWidth * globalData.rpxR,
      windowHeight: globalData.windowHeight * globalData.rpxR,     
      navBarHeight: globalData.navBarHeight  * globalData.rpxR,
      url: apiUrl.server,

    })

    var userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo: userInfo,
      })
    } 
  },

  _initData(){
    getDepUsersByFatherIdGb(this.data.userInfo.gbDuDepartmentId).then(res =>{
      if(res.result.code == 0){
        this.setData({
          userArr: res.result.data,
        })
      }
    })
  },
  
  
  toShareAdmin(){
    this.setData({
      toSharePurchase:  true
    })
  },

  /**
   * 邀请采购员
   * @param {*} options 
   */
  onShareAppMessage: function (options) {
      console.log('disId=' + this.data.userInfo.gbDuDistributerId + '&depId=' + this.data.userInfo.gbDuDepartmentFatherId + '&depName=' + this.data.userInfo.gbDuWxNickName  +'&admin=2');
      console.log(this.data.url + 'userImage/say.png')
      return {
        title: "注册京京采购小程序", // 默认是小程序的名称(可以写slogan等)
        path: '/pages/inviteAdmin/inviteAdmin?disId=' + this.data.userInfo.gbDuDistributerId + '&depFatherId=' + this.data.userInfo.gbDuDepartmentFatherId + '&depId=' + this.data.userInfo.gbDuDepartmentFatherId + '&depName=' + this.data.userInfo.gbDuWxNickName  +'&admin=2',
        imageUrl:  this.data.url + 'userImage/say.png',
      }
    
  },

  openOperation(e){
    this.setData({
      showOperation: true,
      selectUserId: e.currentTarget.dataset.id,

    })
  },


  /**
   * 关闭蒙版
   */
  hideMask() {
    this.setData({
      showOperation: false,
      
    })
  },


  /**
   * 删除用户
   */
  delUser() {
    load.showLoading("删除用户")
    deleteDepUser(this.data.selectUserId).then(res => {
      if (res.result.code !== -1) {
        load.hideLoading();
        this._initData();
      } else {
        load.hideLoading();
        wx.showToast({
          title: res.result.msg,
        })
      }
    })
  },


 
  editUser(){
    this.setData({
      editUser: true
    })
    wx.navigateTo({
      url: '../disUserEdit/disUserEdit',
    })
  },


  toSharePurchase(){
    this.setData({
      toSharePurchase:  true
    })

  },
  
  closeMask(){
    this.setData({
      toOpenMini:  false,
      isTishi: false,
      toSharePurchase: false
    })

  },

  toBack(){
    wx.navigateBack({
      delta: 1,
    })
  }















})