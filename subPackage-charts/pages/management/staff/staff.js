
const globalData = getApp().globalData;
var load = require('../../../../lib/load.js');
var dateUtils = require('../../../../utils/dateUtil');

import apiUrl from '../../../../config.js'

import {
  getDepUsersByFatherIdGb,
  deleteDepUser,
} from '../../../../lib/apiDistributer'


Page({


  onShow(){

    if(this.data.update){
     
      this._initData();
    }

  
     
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
    var myDate = wx.getStorageSync('myDate');
    if(myDate){
      // 如果是自定义日期，传递具体的开始和结束日期
      var dateRange;
      if (myDate.name === 'custom' ) {
        dateRange = dateUtils.getDateRange(myDate.name, myDate.startDate, myDate.stopDate);
      } else {
        dateRange = dateUtils.getDateRange(myDate.name);
      }
    
      this.setData({
        startDate: dateRange.startDate,
        stopDate: dateRange.stopDate,
        dateType: myDate.dateType,
        hanzi: myDate.hanzi || dateRange.name,
      })
    }else{
      this.setData({
        dateType: 'month',
        startDate: dateUtils.getFirstDateInMonth(),
        stopDate: dateUtils.getArriveDate(0),
        hanzi:  "本月",
      })
    }

    var userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo: userInfo,
      })
    } 
    this._initData();

  },

  _initData(){
    var data  = {
      startDate: this.data.startDate,
      stopDate: this.data.stopDate,
      depId: this.data.userInfo.gbDuDepartmentId
    }
    getDepUsersByFatherIdGb(data).then(res =>{
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
        title: "注册京采账本小程序", // 默认是小程序的名称(可以写slogan等)
        path: '/pages/inviteAdmin/inviteAdmin?disId=' + this.data.userInfo.gbDuDistributerId + '&depFatherId=' + this.data.userInfo.gbDuDepartmentFatherId + '&depId=' + this.data.userInfo.gbDuDepartmentFatherId + '&depName=' + this.data.userInfo.gbDuWxNickName  +'&admin=2',
        imageUrl:  this.data.url + 'userImage/say.png',
      }
    
  },

  openOperation(e){
    this.setData({
      showOperation: true,
      selectUserId: e.currentTarget.dataset.id,
      purUserItem: e.currentTarget.dataset.item,
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




  toPurUserDetail(e){
    
    wx.setStorageSync('purUserItem', e.currentTarget.dataset.item);
    wx.navigateTo({
      url: '../purUserEveryDay/purUserEveryDay?purUserId=' + e.currentTarget.dataset.item.gbDepartmentUserId
       ,
    })
  },


  toPurUserFenxi(){
    this.setData({
      showOperation: false,
      
    })
    wx.setStorageSync('purUserItem', this.data.purUserItem);
    wx.navigateTo({
      url: '../purUserFenxi/purUserFenxi?purUserId=' + this.data.purUserItem.gbDepartmentUserId 
      + '&type=0&supplierId=-1&startDate=' + this.data.startDate + '&stopDate=' + this.data.stopDate 
       + '&dateType=' + this.data.dateType,
    })
  },


  toPurGoodsStars(e){
    wx.navigateTo({
      url: '../purUserReturnGoods/purUserReturnGoods?purUserId=' + e.currentTarget.dataset.item.gbDepartmentUserId + '&name=' + e.currentTarget.dataset.item.gbDuWxNickName,
    })

  },  


  toDatePageSearch() {
    this.setData({
      update: true,
    })
    wx.navigateTo({
      url: '../../sel/searchDate/searchDate?startDate=' + this.data.startDate +
        '&stopDate=' + this.data.stopDate + '&dateType=' + this.data.dateType,
    })
  },


  
  toBack(){
    wx.navigateBack({
      delta: 1,
    })
  }















})