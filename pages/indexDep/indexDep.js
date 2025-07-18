const globalData = getApp().globalData;
var load = require('../../lib/load.js');
import apiUrl from '../../config.js'

import {
  depGetApplyGb,
  updateOrderGbJj,
  deleteOrderGb,
  getDepInfoGb,
  getDepUserInfo,
  restrauntCashPay,
  disSaveStandard
} from '../../lib/apiDepOrder'

import {
  gbLogin,

} from '../../lib/apiDistributer'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    showChoice: false,
    showOperation: false,
    depFatherId: null,
    edit: false,
    deleteShow: false,
    chooseSize: false,
    animationData: {},
    scrollViewTop: 0,
    showPay: false,
    bill: -1,
    applyNumber: "",
    applyRemark: "",
    applyStandardName: "",
    applySubtotal: "",
    item: {},
    maskHeight: "",
    statusBarHeight: "",
    windowHeight: "",
    windowWidth: "",

  },

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

    this._getDepApply();
   
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      url: apiUrl.server,
    })

    
    var userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo: userInfo,
      })
      this._getAtrrName();
      var depInfo = wx.getStorageSync('depInfo');
      if(depInfo){
        this.setData({
          depInfo: depInfo,
          depId: depInfo.gbDepartmentId,
        })
      }
    
    } else{
      
      var that = this;
      wx.login({
        success: (res) => {
          load.showLoading("正在登录");
          gbLogin(res.code)
            .then((res) => {
              load.hideLoading();
              console.log(res.result.data)
              if (res.result.code !== -1) {
                //缓存用户信息
                //缓存用户id
                wx.setStorageSync('userInfo', res.result.data.depUserInfo);
                wx.setStorageSync('depInfo', res.result.data.depInfo);
                that.setData({
                  userInfo: res.result.data.depUserInfo,
                  depInfo: res.result.data.depInfo,
                  depId: res.result.data.depInfo.gbDepartmentId,
                  
                })
                that._getAtrrName();
                that._getDepApply();
                //跳转到首页
              } else {
                 wx.navigateTo({
                url: '../register/register',
                  
                }) 
               
              }
            })
        }
      })
    } 
  },

  _getAtrrName() {

    var userName = this.data.userInfo.gbDuWxNickName;
    if (userName.length > 3) {
      userName = userName.substring(0, 3);
      userName = userName + "..."
    }
    this.setData({
      userName: userName
    })
    var userAdmin = this.data.userInfo.gbDuAdmin;
    if(userAdmin == 2){
      wx.redirectTo({
        url: '../index/index',
      })
    }
  },

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

  hideModal: function (e) {
    var that = this;
    var animation = wx.createAnimation({
      duration: 1000,
      timingFunction: 'linear'
    })
    that.animation = animation
    animation.translateY(200).step()
    that.setData({
      animationData: animation.export()

    })
    setTimeout(function () {
      animation.translateY(0).step()
      that.setData({
        animationData: animation.export(),
        chooseSize: false
      })
    }, 200)
  },

  /**
   * 获取初始化申请数据
   */
  _getDepApply() {
    load.showLoading("获取申请中")
    depGetApplyGb(this.data.depId).then(res => {
      if (res.result.code == 0) {
        load.hideLoading();
        console.log(res.result.data);
        this.setData({
          applyArr: res.result.data.arr,
          bill: res.result.data.bill,
        })
        if (res.result.data.bill !== -1) {
          this.setData({
            showPay: true
          })
        }
      } else {
        load.hideLoading();
        this.setData({
          applyArr: []
        })
      }
    })
  },




  /**
   * 打开操作面板
   * @param {}} e 
   */
  openOperation(e) {
    this.setData({
      showOperation: true,
      applyItem: e.currentTarget.dataset.item,
    })
    this.chooseSezi();

  },
  /**
   * 关闭操作面板
   */
  hideMask() {
    this.setData({
      showOperation: false,
    })
    this.hideModal();

  },



  /**
   * 点击弹窗的“关闭”按钮
   */
  cancle() {

    this.setData({
      show: false,
      editApply: false,
      applyItem: "",
      item: "",
      applyNumber: "",
      applyStandardName: "",
      applySubtotal: "0.0元",
      depStandardArr: [],

    })

  },



  /**
   * 配送申请，换订货规格
   * @param {*} e 
   */
  changeStandard: function (e) {
    this.setData({
      applyStandardName: e.detail.applyStandardName
    })
  },

  // 保存订货订单
  confirm: function (e) {
    this._updateDisOrder(e);

    this.setData({
      show: false,
      editApply: false,
      applyItem: "",
      item: "",
      applyNumber: "",
      applyStandardName: "",
      applySubtotal: "0.0元",
    })
  },


  /**
   * 修改配送申请
   * @param {} e 
   */
  _updateDisOrder(e) {
    var dg = {
      id: this.data.applyItem.gbDepartmentOrdersId,
      weight: e.detail.applyNumber,
      standard: e.detail.applyStandardName,
      remark: e.detail.applyRemark,

    };
    updateOrderGbJj(dg).then(res => {
      load.showLoading("修改订单")
      if (res.result.code == 0) {
        load.hideLoading();
        this._getDepApply();
      } else {
        load.hideLoading();
        wx.showToast({
          title: res.result.msg,
          icon: "none"
        })
      }

    })
  },



  /**
   * 修改配送商品申请
   */
  editApply(e) {
    this.setData({
      applyItem: e.currentTarget.dataset.item,
    })

    console.log("edittappaly")

    var applyItem = this.data.applyItem;


    this.setData({
      show: true,
      applyStandardName: applyItem.gbDoStandard,
      itemDis: this.data.applyItem.gbDistributerGoodsEntity,
      item: this.data.applyItem.gbDepartmentDisGoodsEntity,
      editApply: true,
      applyNumber: applyItem.gbDoQuantity,
      applyRemark: applyItem.gbDoRemark,
    })
    if (applyItem.gbDoSubtotal !== null) {
      console.log("eidididiiidid");
      this.setData({
        applySubtotal: applyItem.gbDoSubtotal + "元"
      })

    }
  },

  showTishi() {
    wx.showModal({
      title: "不能修改",
      content: "订单在配送中，如果有变化，请与采购员联系.",
      showCancel: false,
      confirmText: "知道了",
      success: function (res) {
        if (res.cancel) {
          //点击取消           
        } else if (res.confirm) {}
      }

    })
  },

  /**
   * 删除订货
   */
  delApply() {
    this.setData({
      deleteShow: true,
      showOperation: true
    })
  },

  deleteYes() {

    deleteOrderGb(this.data.applyItem.gbDepartmentOrdersId).then(res => {
      if (res.result.code == 0) {
        this.setData({
          show: false,
          applyItem: ""
        })
        this._getDepApply();
      }
    })
  },

  deleteNo() {
    this.setData({
      applyItem: "",
      deleteShow: false,
      showOperation: false
    })

  },
  /**
   * 
   * @param {*} e 
   */
  onPageScroll: function (e) { // 页面滚动监听
    this.setData({
      scrollViewTop: e.scrollTop * globalData.rpxR,
    })

  },

  /**
   * 打开修改部门页面
   */
  toEdit() {
    console.log("edididididiididdididi");
    console.log(this.data.userInfo.gbDuAdmin)
    if (this.data.userInfo.gbDuAdmin == 0) {
      wx.navigateTo({
        url: '../depUserEdit/depUserEdit',
      })
    }
    if (this.data.userInfo.gbDuAdmin == 1) {
      wx.navigateTo({
        url: '../resGroup/resGroup',
      })
    }
  },

  /**
   * 打开商品页面
   */
  toResGoods() {
   
      wx.navigateTo({
        url: '../order/resGoods/resGoods',
      })
    
  },

  _getDepInfo() {
    getDepInfoGb(this.data.userInfo.gbDuDepartmentId).then(res => {
      if (res) {
        this.setData({
          depInfo: res.result.data,
        })
        wx.setStorageSync('depInfo', res.result.data);
      }
    })
  },

  _getUserInfo() {
    getDepUserInfo(this.data.userInfo.gbDepartmentUserId).then(res => {
      if (res.result.code == 0) {
        this.setData({
          userInfo: res.result.data,
        })
        wx.setStorageSync('userInfo', res.result.data);
      } else {
        wx.showToast({
          title: '获取用户信息失败',
          icon: 'none'
        })
      }
    })

  },





  confirmStandard(e) {
    console.log(e);
    console.log("confirmStandardconfirmStandardconfirmStandard")
    var data = {
      gbDsDisGoodsId: this.data.itemDis.gbDistributerGoodsId,
      gbDsStandardName: e.detail.newStandardName,
    }
    disSaveStandard(data).
    then(res => {
      if (res.result.code == 0) {
        console.log(res)
        var standardArr = this.data.itemDis.gbDistributerStandardEntities;
        standardArr.push(res.result.data);
        var standards = "itemDis.gbDistributerStandardEntities"
        this.setData({
          [standards]: standardArr,
          applyStandardName: res.result.data.gbDsStandardName,
        })
      }else{
        wx.showToast({
          title: res.result.msg,
          icon: 'none'
        })
      }
    })
  },
  

  gorRunnerLobby: function () {

    var bill = this.data.bill;
    bill.gbUserOpenId = this.data.userInfo.gbDuWxOpenId;
    bill.gbDepartmentOrdersEntities = null;
    console.log(bill)
    restrauntCashPay(bill)
      .then(res => {
        if (res) {
          console.log(res)
          var map = res.result.map;
          var that = this;
          wx.requestPayment({
            nonceStr: map.nonceStr,
            package: map.package,
            signType: "MD5",
            timeStamp: map.timeStamp,
            paySign: map.paySign,
            success: function (res) {
              console.log(res);

              that._getDepApply();
            },
            fail: function (res) {
              console.log(res);
            }
          })
        }
      })

  },


  editUser(){
    this.setData({
      editUser: true
    })
    wx.navigateTo({
      url: '../../subPackage/pages/management/disUserEdit/disUserEdit',
    })
  },



})