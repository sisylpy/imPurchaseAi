var load = require('../../../../lib/load.js');
const globalData = getApp().globalData;
import apiUrl from '../../../../config.js'

import {
  jrdhUserPurchaserRegisterWithFile,
  jrdhPurchaserUserLogin,
  getDisPurchaseGoodsBatchGb,
  updateBatchBuyerIdGb,
  deleteDisBatchGb
} from '../../../../lib/apiDepOrder'


Page({

  onShow: function () {

    // 推荐直接用新API
    let windowInfo = wx.getWindowInfo();
    let globalData = getApp().globalData;
    this.setData({
      windowWidth: windowInfo.windowWidth * globalData.rpxR,
      windowHeight: windowInfo.windowHeight * globalData.rpxR,
      statusBarHeight: globalData.statusBarHeight  * globalData.rpxR,
      navBarHeight: globalData.navBarHeight * globalData.rpxR,
    });


  },


  /**
   * 页面的初始数据
   */
  data: {
    isTishi: false,
    reduceWidth: 120,
    bottomHeight: 300,
    formHeight: 590,
    headerHeight: 100,
    batchId: -1,
    avatarUrl: ""


  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    this.setData({
      retName: options.retName,
      batchId: options.batchId,
      url: apiUrl.server,
      purUserId: options.purUserId,
      depId: options.depId,
      disId: options.disId
    })

    this._userLogin()

  },

  _getInitData() {
    load.showLoading("获取订货商品")
    var that = this;
    getDisPurchaseGoodsBatchGb(this.data.batchId)
      .then(res => {
        load.hideLoading();
        if (res.result.code == 0) {
          that.setData({
            batch: res.result.data,
            batchStatus: res.result.data.gbDpbStatus,
          })

        } else {
          wx.showToast({
            title: '没有订货',
            icon: 'none'
          })

          this.setData({
            batchStatus: -1
          })
        }
      })
  },


  _userLogin() {
    //jrdh用户登陆，默认是供货商卖方
    var that = this;
    wx.login({
      success: (res) => {
      var data = {
        code: res.code,
        nxDisId: -1,
        gbDisId: this.data.disId,
        commId: -1,
      }
      jrdhPurchaserUserLogin(data)
          .then((res) => {
            console.log("logoignnigokokkk")
            console.log(res)
            if (res.result.code !== -1) {
                     this.setData({
                      userInfo: res.result.data,
                     })    
              that._getInitData();
            } else {
              
              //采购员登陆失败
              that.setData({
                isSellRegiste: true
              })
            }

          })
      }
    })
  },
  
  closeMask() {
    this.setData({
      isTishi: false,
    })
  },

  sellRegiste() {
    wx.getUserProfile({
      desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: resUser => {
        wx.login({
          success: (res) => {
            this.setData({
              code: res.code
            })
          }
        })
      }
    })
  },
  getNickName(e) {
    this.setData({
      nickName: e.detail.value
    })
  },

  onChooseAvatar(e) {
    var that = this;
    var src = [];
    src.push(e.detail.avatarUrl)
    var filePathList = src;
    var userName = that.data.nickName;
    var gbDisId = that.data.disId;
    var gbPurUserId = that.data.purUserId;
    var code = that.data.code;
    var depId = that.data.depId;
    var admin = 2;
   
    jrdhUserPurchaserRegisterWithFile(filePathList, userName, code,admin,-1, -1,-1, -1,gbDisId,depId,gbPurUserId).then((res) => {
      console.log(res);
      if (res.result == '{"code":0}') {
        this.setData({
          isSellRegiste: false
        })
       
        that._userLogin();

      }

    })
  },

  onShareAppMessage: function (options) {
    console.log('batchId='+ this.data.batchId + '&retName=' + this.data.retName + '&disId=' + this.data.disId + '&fromBuyer=1' +'&buyUserId=' + this.data.userInfo.nxJrdhUserId 
    +'&depId=' + this.data.depId + '&purUserId=' + this.data.purUserId);
    
      return {
        title: '订货',
        path: '/pages/gbMarket/gbOrderBatch/gbOrderBatch?batchId='+ this.data.batchId + '&retName=' + this.data.retName + '&disId=' + this.data.disId + '&fromBuyer=1' +'&buyUserId=' + this.data.userInfo.nxJrdhUserId 
        +'&depId=' + this.data.depId + '&purUserId=' + this.data.purUserId,
      }
      
    },
  
    showShareTishi() {
      var that = this;
      setTimeout(function () {
        that.setData({
          isTishi: true,
        })
      }, 2000)
    },

    out(){
      var data = {
        buyerId : this.data.userInfo.nxJrdhUserId,
        batchId: this.data.batchId,
        openId: this.data.userInfo.nxJrdhWxOpenId
      }
      updateBatchBuyerIdGb(data)
      .then(res => {
        load.hideLoading();
        if (res.result.code == 0) {
          wx.exitMiniProgram({
            success: function () {
            
            }
          }) 

        } else {
         
        }
      })
    },
  

  cancelDisBatch() {
    this.setData({
      isTishi: false
    })
    if(this.data.batchId !== -1){
      deleteDisBatchGb(this.data.batchId)
      .then(res => {
        if (res.result.code == 0) {
         wx.exitMiniProgram()
        
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