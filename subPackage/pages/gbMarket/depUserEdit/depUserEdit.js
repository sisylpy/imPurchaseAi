const globalData = getApp().globalData;
var load = require('../../../../lib/load.js');
import apiUrl from '../../../../config.js'


import {
  updateJrdhUserWithFile,
  updateJrdhUser,
  getJrdhUser
 
} from '../../../../lib/apiDepOrder'

Page({

  onShow: function () {

    // 推荐直接用新API
    let windowInfo = wx.getWindowInfo();
    let globalData = getApp().globalData;
    this.setData({
      windowWidth: windowInfo.windowWidth * globalData.rpxR,
      windowHeight: windowInfo.windowHeight * globalData.rpxR,
      navBarHeight: globalData.navBarHeight * globalData.rpxR,
    });


  },

  /**
   * 页面的初始数据
   */
  data: {

    canSave: false,
    imgChanged: false,
  

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      url: apiUrl.server,

    })

   


    var nxJrdhSellerValue = wx.getStorageSync('jrdhUserInfo');
    if (nxJrdhSellerValue) {
      this.setData({
        jrdhUserInfo: nxJrdhSellerValue,
        userName: nxJrdhSellerValue.nxJrdhWxNickName,
        src: this.data.url + nxJrdhSellerValue.nxJrdhWxAvartraUrl
      })
    }

  },


  //选择图片
  choiceImg: function (e) {
    var _this = this;

    wx.chooseImage({
      count: 1, // 最多可以选择的图片张数，默认9
      sizeType: ['original', 'compressed'], // original 原图，compressed 压缩图，默认二者都有
      sourceType: ['album', 'camera'], // album 从相册选图，camera 使用相机，默认二者都有
      success: function (res) {
        _this.setData({
          src: res.tempFilePaths,
          isSelectImg: true,
          imgChanged: true,
          canSave: true

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


  /**
   * 获取用户名
   * @param {*} e 
   */
  getUserName(e) {
    if(e.detail.value !== this.data.jrdhUserInfo.nxJrdhWxNickName){
      this.setData({
        userName: e.detail.value,
        canSave: true,
      })
    }
   

  },

/**
 * 保存修改内容
 */
  save() {

    //如果修改了图片
    if (this.data.imgChanged) {
      var that = this;
      var filePathList = this.data.src;
      var userName = this.data.userName;
      var userId = this.data.jrdhUserInfo.nxJrdhUserId;
      // var depId = this.data.nxJrdhSellerValue.gbDepartmentId;
      load.showLoading("保存修改内容")
      updateJrdhUserWithFile(filePathList, userName, userId).then(res => {       
        load.hideLoading();
        console.log(res)
        if(res.result == '{"code":0}'){
       
          getJrdhUser(that.data.jrdhUserInfo.nxJrdhUserId)
          .then(res => {
            if (res.result.code == 0) {
              wx.setStorageSync('jrdhUserInfo', res.result.data);
              var pages = getCurrentPages();
              // var prevPage = pages[pages.length - 3];
              // prevPage.setData({
              //   jrdhUserInfo: res.result.data,
              // })
              var prevPage1 = pages[pages.length - 2];
              prevPage1.setData({
                jrdhUserInfo: res.result.data,
              })
              wx.navigateBack({
                delta: 1
              })
            
            }
          })
        }else{
          wx.showToast({
            title: res.result.msg,
            icon: 'none'
          })
        }   
      })
    } else {
      //没有修改图片
      var userName = this.data.userName;
      var userId = this.data.jrdhUserInfo.nxJrdhUserId;
      var data = {
        userName: userName,
        userId: userId,
      }
      load.showLoading("保存修改内容");
      updateJrdhUser(data).then(res => {
        if (res.result.code == 0) {
          console.log(res)
        load.hideLoading();
        wx.setStorageSync('jrdhUserInfo', res.result.data);
        var pages = getCurrentPages();
        // var prevPage = pages[pages.length - 3];
        // prevPage.setData({
        //   jrdhUserInfo: res.result.data,
        // })
        var prevPage1 = pages[pages.length - 2];
        prevPage1.setData({
          jrdhUserInfo: res.result.data,
        })
        wx.navigateBack({
          delta: 1
        })
      }else{
        load.hideLoading();
        wx.showToast({
          title: '获取信息失败',
          icon: 'none'
        })
      }
      })
    }
  },

  

  toBack(){
    wx.navigateBack({
      delta: 1,
    })
  }






})