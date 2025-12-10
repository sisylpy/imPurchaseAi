const globalData = getApp().globalData;
var load = require('../../../lib/load.js');
import apiUrl from '../../../config.js'
var dateUtils = require('../../../utils/dateUtil')
import utils from '../../../utils/util'


import {
  gbLogin
} from '../../../lib/apiDistributer'

import {
  addAppGoodsWithOrder,
  gbGetCouponListBySalesUserId
} from '../../../lib/apiDistributerGb'

import {
  // swiper-1
  getPurchaseGoodsGbWithTabCountWithNxDisId,
  saveDisPurGoodsBatchGb,
  purUserSaveMendain,
  puraserReturnPurGoods,
  //swiper -
  jingjingGetBuyingGoodsGb, //供货商
  deleteDisPurBatchGbItem,
  deleteDisPurAndNxDataItem,
  finishSharePurGoodsBatch,
  finishSharePurGoodsBatchReturn,
  finishSharePurGoodsBatchIsAuto,
  finishShixianBill,
  //swiper -- 3
  gbGetAppOrders,
  shixianGetAppOrders,

} from '../../../lib/apiDepOrder'

Page({

  onShow() {

    

  },


  /**
   * 页面的初始数据
   */
  data: {
    update: false,
    openIndex: -1,
    tab1Index: 0,
    itemIndex: 0, // 当前选中的 Tab 索引
    sliderWidth: 0, // 滑块宽度
    sliderLeft: 0, // 滑块偏移量



    update: false,
    purArr: [],
    selectedArr: [],
    showGoods: false,
    userInfo: null,
    showPage: false, // 控制弹出层和蒙版显示
    popupAnimation: {}, // 弹出层动画
    disInfo: {
      gbDistributerName: '', // 门店名称
    },
    hasSubs: 2, // 部门类型
    selNumber: 1, // 部门数量
    isShixianAuto: false,
    toLaodu: false,
    tabs: [{
      name: "未采购",
      amount: ""
    },
    {
      name: "供货商",
      amount: ""
    }
  ],


  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("opeoieiiee",options)

    if (options.q) {
      console.log("opeoieiiee",options)
      //获取二维码的携带的链接信息
       let qrUrl = decodeURIComponent(options.q)
       this.setData({
         //获取链接中的参数信息
         salesUserId: utils.getQueryString(qrUrl, 'salesUserId'),
         nxDisId: utils.getQueryString(qrUrl, 'nxDisId'),
       })
      }

    this.setData({
      windowWidth: globalData.windowWidth * globalData.rpxR,
      windowHeight: globalData.windowHeight * globalData.rpxR,
      navBarHeight: globalData.navBarHeight * globalData.rpxR,
      url: apiUrl.server,
      depId: options.depId,
      todayDate: dateUtils.getArriveDate(0),
    })
    var week = dateUtils.getWhatDay(0);
    var date = dateUtils.getOnlyHao(0);
    var todayaaa = dateUtils.getArriveDate(0);

    this.setData({
      week: week,
      date: date,
      todayaaa: todayaaa
    })

    var userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo: userInfo,
        userId: userInfo.gbDepartmentUserId,
      })

      var disInfo = wx.getStorageSync('disInfo');
      if (disInfo) {
        this.setData({
          disInfo: disInfo,
          disId: disInfo.gbDistributerId,
          depId: disInfo.purDepartmentList[0].gbDepartmentId,

        })
      }


      this._checkIfShowPage();

    } else {
      this._userLogin()
    }

    this.calculateSlider(0); // 初始化时计算滑块宽度和位置

    

  },


  //swiper one 
  _getInitData() {
    load.showLoading("获取进货商铺");
    var data = {
      depId: this.data.depId,
      disId: this.data.disId,
      appDepId: this.data.disInfo.appSupplierDepartment.gbDepartmentId,
      nxDisId: this.data.nxDisId,
    }
    getPurchaseGoodsGbWithTabCountWithNxDisId(data)
      .then(res => {
        load.hideLoading();
        if (res.result.code == 0) {
          var newOrderCount = "tabs[0].amount";
          var wxOrderCountData = "tabs[1].amount";
          console.log("tabs===" , this.data.tabs)
          this.setData({
            showCoupon: true,
            couponList: res.result.data.couponList,
            purArr: res.result.data.arr,
            selectedArr: [],
            disInfo: res.result.data.disInfo,
            [newOrderCount]: res.result.data.orderAmount,
            [wxOrderCountData]: res.result.data.wxAmount,
          })
          if(res.result.data.couponList.length == 0){
            wx.redirectTo({
              url: '../../../pages/index/index',
            })
          }
          if (res.result.data.disInfo.nxDistributerEntity !== null) {
            this.setData({
            
              tabs: [{
                  name: "未采购",
                  amount: ""
                },
                {
                  name: "供货商",
                  amount: ""
                },
                {
                  name: "京京送货",
                  amount: ""
                }
              ],
              
            })
            var newOrderCount = "tabs[0].amount";
            var wxOrderCountData = "tabs[1].amount";
            var appOrderData = "tabs[2].amount";
            this.setData({
              [newOrderCount]: res.result.data.orderAmount,
              [wxOrderCountData]: res.result.data.wxAmount,
              [appOrderData]: res.result.data.appAmount,
            })
          } else{
            this.setData({
            
              tabs: [{
                  name: "未采购",
                  amount: ""
                },
                {
                  name: "供货商",
                  amount: ""
                }
              ],
              
            })
            var newOrderCount = "tabs[0].amount";
            var wxOrderCountData = "tabs[1].amount";
            this.setData({
              [newOrderCount]: res.result.data.orderAmount,
              [wxOrderCountData]: res.result.data.wxAmount,
            })
          }
         
          wx.setStorageSync('disInfo', res.result.data.disInfo)
        } else {
          this.setData({
            purArr: [],

          })
          wx.showToast({
            title: res.result.msg,
            icon: 'none'
          })
          this.setData({
            purArr: []
          })
        }
      })
  },

  gbGetCouponList(){
     var ids = "";
     var arr = this.data.couponList;
     for(var i = 0; i < arr.length; i++){
       ids = ids +  arr[i].nxDistributerCouponId + ","
     }
    var data  ={
      salesUserId: this.data.salesUserId,
      nxDisId: this.data.nxDisId,
      gbDisId: this.data.disId,
      ids: ids,
    }
    load.showLoading("获取优惠卷")
    gbGetCouponListBySalesUserId(data).then(res =>{
      if(res.result.code == 0){
        load.hideLoading();
        wx.redirectTo({
          url: '../../../pages/index/index',
        })
      }
    })
  },

  // Purchase页面刷新
  onPurchaseRefresh() {
    console.log("onPurchaseRefreshonPurchaseRefresh")
    this.setData({
      purchaseRefreshing: true
    })
    load.showLoading("获取进货商铺");
    var data = {
      depId: this.data.depId,
      disId: this.data.disId,
      appDepId: this.data.disInfo.appSupplierDepartment.gbDepartmentId
    }
    getPurchaseGoodsGbWithTabCount(data)
      .then(res => {
        load.hideLoading();
        if (res.result.code == 0) {
          wx.stopPullDownRefresh()
          this.setData({
            purchaseRefreshing: false
          })
          var newOrderCount = "tabs[0].amount";
          var wxOrderCountData = "tabs[1].amount";
          this.setData({
            purArr: res.result.data.arr,
            selectedArr: [],
            [newOrderCount]: res.result.data.orderAmount,
            [wxOrderCountData]: res.result.data.wxAmount,
            disInfo: res.result.data.disInfo,
          })
          if (res.result.data.disInfo.nxDistributerEntity !== null) {
            var appOrderData = "tabs[2].amount";
            this.setData({
              [appOrderData]: res.result.data.appAmount,
            })
          }
          wx.setStorageSync('disInfo', res.result.data.disInfo)
        } else {
          this.setData({
            purArr: [],

          })
          wx.showToast({
            title: res.result.msg,
            icon: 'none'
          })
          this.setData({
            purArr: []
          })
        }
      })

  },

  // Order页面刷新
  onOrderRefresh() {
    this.setData({
      orderRefreshing: true
    })
    load.showLoading("获取微信好友订货")
    var data = {
      disId: this.data.disId,
      depId: this.data.depId,
      appDepId: this.data.disInfo.appSupplierDepartment.gbDepartmentId
    }

    jingjingGetBuyingGoodsGb(data)
      .then(res => {
        load.hideLoading();
        console.log(res.result.data);
        if (res.result.code == 0) {
          wx.stopPullDownRefresh()
          this.setData({
            orderRefreshing: false
          })
          var newOrderCount = "tabs[0].amount";
          var wxOrderCountData = "tabs[1].amount";
          this.setData({
            batchArr: res.result.data.arr,
            [newOrderCount]: res.result.data.orderAmount,
            [wxOrderCountData]: res.result.data.wxAmount,
            disInfo: res.result.data.disInfo,
          })
          if (res.result.data.disInfo.nxDistributerEntity !== null) {
            var appOrderData = "tabs[2].amount";
            this.setData({
              [appOrderData]: res.result.data.appAmount,
            })
          }

          wx.setStorageSync('disInfo', res.result.data.disInfo);

        } else {
          this.setData({
            purArr: [],
            batchSize: 0,
            finishSize: 0,
            selectedArr: []
          })
          wx.showToast({
            title: res.result.msg,
            icon: 'none'
          })
          this.setData({
            purArr: []
          })
        }
      })



  },

  // App页面刷新
  onAppRefresh() {
    this.setData({
      appRefreshing: true
    })

    var data = {
      disId: this.data.disId,
      depId: this.data.depId,
      appDepId: this.data.disInfo.appSupplierDepartment.gbDepartmentId,
    }
    load.showLoading("获取配送订单");
    gbGetAppOrders(data).then(res => {

      wx.stopPullDownRefresh()
      this.setData({
        appRefreshing: false
      })


      var newOrderCount = "tabs[0].amount";
      var wxOrderCountData = "tabs[1].amount";
      console.log("gbGetAppOrdersgbGetAppOrders", res.result.data);
      load.hideLoading();
      if (res.result.code == 0) {
        this.setData({
          appArr: res.result.data.arr,
          selectedArr: [],
          [newOrderCount]: res.result.data.orderAmount,
          [wxOrderCountData]: res.result.data.wxAmount,
          disInfo: res.result.data.disInfo,
        })
        if (res.result.data.disInfo.nxDistributerEntity !== null) {
          var appOrderData = "tabs[2].amount";
          this.setData({
            [appOrderData]: res.result.data.appAmount,
          })
        }
        wx.setStorageSync('disInfo', res.result.data.disInfo);
      }
    })

  },

  loadPurchaseData(callback) {
    setTimeout(() => {
      const newList = Array.from({
        length: 10
      }, (_, i) => `Purchase ${i + 1}`)
      this.setData({
        purchaseList: newList
      })
      callback && callback()
    }, 1000)
  },

  loadOrderData(callback) {
    setTimeout(() => {
      const newList = Array.from({
        length: 10
      }, (_, i) => `Order ${i + 1}`)
      this.setData({
        orderList: newList
      })
      callback && callback()
    }, 1000)
  },

  loadAppData(callback) {
    setTimeout(() => {
      const newList = Array.from({
        length: 10
      }, (_, i) => `App ${i + 1}`)
      this.setData({
        appList: newList
      })
      callback && callback()
    }, 1000)
  },


  _checkIfShowPage() {
    if (this.data.disInfo.mendianDepartmentList.length > 0) {

      this._getInitData();

    } else {
      this.setData({
        showPage: true,
        mendianInfo: {
          gbDepartmentDisId: this.data.disId,
          gbDepartmentType: 1,
          gbDepartmentSubAmount: 0,
          gbDepartmentIsGroupDep: 1,
          gbDepartmentFatherId: 0,
          gbDepartmentName: this.data.disInfo.gbDistributerName,
          gbDepartmentPrintName: this.data.disInfo.gbDistributerName,
          gbDepartmentAttrName: this.data.disInfo.gbDistributerName,
          gbDepartmentLevel: 0,
          gbDepartmentEntityList: [{
            gbDepartmentName: this.data.disInfo.gbDistributerName
          }],
        },
        gbDepartmentEntities: [{
          gbDepartmentName: this.data.disInfo.gbDistributerName
        }],
      })

      this.showPopup();
    }
  },


  changeIsAuto(e) {
    console.log(e);
    this.setData({
      isShixianAuto: e.detail.value
    })
  },
  gorRunnerLobby: function (e) {

    var bill = e.currentTarget.dataset.item;
    bill.gbUserOpenId = this.data.userInfo.gbDuWxOpenId;
    bill.gbDepartmentOrdersEntities = null;
    if (this.data.isShixianAuto) {
      bill.gbDbSetAutoGoods = 1;
    } else {
      bill.gbDbSetAutoGoods = 0;
    }
    console.log(bill);
    finishShixianBill(bill)
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

              that._getAppOrder();
            },
            fail: function (res) {
              console.log(res);
            }
          })
        }
      })

  },





  showPopup() {
    const animation = wx.createAnimation({
      duration: 1300,
      timingFunction: 'ease-in-out',
    });
    animation.translateY(0).step();
    this.setData({
      popupAnimation: animation.export(),
    });
  },

  hidePopup() {
    const animation = wx.createAnimation({
      duration: 300,
      timingFunction: 'ease-in-out',
    });
    animation.translateY('100%').step();
    this.setData({
      popupAnimation: animation.export(),
    });
    setTimeout(() => {
      this.setData({
        showPage: false
      });
    }, 300);
  },

  // 绑定门店名称输入
  bindKeyInput(e) {
    this.setData({
      'disInfo.gbDistributerName': e.detail.value,
    });
  },

  // 选择部门类型
  radioChange(e) {
    const value = parseInt(e.detail.value, 10);
    this.setData({
      hasSubs: value,
      selNumber: value === 2 ? 1 : 0, // 如果是多个部门，初始化部门数量为 1
      gbDepartmentEntities: value === 2 ? [{
        gbDepartmentName: ''
      }] : [],
    });
  },

  // 处理部门数量输入
  handleDepartmentNumber(e) {
    const num = parseInt(e.detail.value, 10);
    if (num > 0) {
      const departments = Array(num)
        .fill('')
        .map(() => ({
          gbDepartmentName: ''
        }));
      this.setData({
        selNumber: num,
        gbDepartmentEntities: departments,
      });
    }
  },

  // 更新部门名称
  getDepartmentName(e) {
    const index = e.currentTarget.dataset.index;
    const value = e.detail.value;
    const departments = this.data.gbDepartmentEntities;
    departments[index].gbDepartmentName = value;
    this.setData({
      gbDepartmentEntities: departments,
    });
  },


  // 保存设置
  toSave() {
    if (!this.data.disInfo.gbDistributerName) {
      wx.showToast({
        title: '请输入门店名称',
        icon: 'none'
      });
      return;
    }
    if (this.data.hasSubs === 2 && this.data.selNumber > 0) {
      const incomplete = this.data.gbDepartmentEntities.some(
        (item) => !item.gbDepartmentName
      );
      if (incomplete) {
        wx.showToast({
          title: '请填写所有部门名称',
          icon: 'none'
        });
        return;
      }
    }

    var mendian = this.data.mendianInfo;
    mendian.gbDepartmentEntityList = this.data.gbDepartmentEntities;
    console.log(mendian);
    purUserSaveMendain(mendian).then(res => {
      if (res.result.code == 0) {
        this.setData({
          disInfo: res.result.data,
        })
        wx.setStorageSync('disInfo', res.result.data);
        this._getInitData();
        this.hidePopup();
      }
    })
  },


  // 隐藏弹出层
  hidePopup() {
    this.setData({
      showPage: false
    });
  },


  //swiper one before
  _userLogin() {
    wx.login({
      success: (resLogin) => {
        gbLogin(resLogin.code)
          .then((res) => {
            if (res.result.code !== -1) {
              console.log("lgoososososoosso")
              console.log(res.result.data)
              this.setData({
                disInfo: res.result.data.disInfo,
                userInfo: res.result.data.depUserInfo,
                disId: res.result.data.disInfo.gbDistributerId,
                depId: res.result.data.disInfo.purDepartmentList[0].gbDepartmentId,
              })
              wx.setStorageSync('disInfo', res.result.data.disInfo);
              wx.setStorageSync('userInfo', res.result.data.depUserInfo);
              this._checkIfShowPage();
              this._getInitData();
              //跳转到首页
            } else {
              wx.redirectTo({
                url: '../tro/tro',
              })
            }
          })
      }
    })
  },



  // xiadan
  toResGoods() {

    if (this.data.disInfo.mendianDepartmentList.length > 1 || this.data.disInfo.mendianDepartmentList[0].gbDepartmentSubAmount > 1) {
      this.setData({
        showChoice: true,
      })
    } else {


      wx.setStorageSync('depInfo', this.data.disInfo.mendianDepartmentList[0].gbDepartmentEntityList[0]);
      console.log('depId=' + this.data.depId + '&disId=' + this.data.disId + '&depName=' + this.data.disInfo.mendianDepartmentList[0].gbDepartmentEntityList[0].gbDepartmentName)
      wx.navigateTo({
        url: '../order/resGoods/resGoods?depId=' + this.data.depId + '&disId=' + this.data.disId + '&depName=' + this.data.disInfo.mendianDepartmentList[0].gbDepartmentEntityList[0].gbDepartmentName,
      })
    }

  },


  choiceSubDep(e) {

    var dep = e.currentTarget.dataset.item;
    var depId = dep.gbDepartmentId;
    var depName = dep.gbDepartmentName;
    this.setData({
      showChoice: false,
    })
    wx.setStorageSync('depInfo', dep);
    console.log('depId=' + depId + '&disId=' + this.data.disId +
      '&depName=' + depName)
    if (this.data.toLaodu) {
      this.setData({
        toLaodu: false
      })

      wx.navigateTo({
        url: '../../subPackage/pages/yishang/nxDistributerGoods/nxDistributerGoods?id='+this.data.disInfo.nxDistributerEntity.nxDistributerId + '&name=ls' + '&depId=' + depId + '&disId=' + this.data.disId + '&depName=' + depName,
      })

    } else {
      wx.navigateTo({
        url: '../order/resGoods/resGoods?depId=' + depId + '&disId=' + this.data.disId +
          '&depName=' + depName,
      })
    }



  },


  choiceMendian(e) {
    var dep = e.currentTarget.dataset.item;
    var depId = dep.gbDepartmentId;
    var depName = dep.gbDepartmentName;
    this.setData({
      showChoice: false,
    })
    wx.setStorageSync('depInfo', dep);
    console.log('depId=' + depId + '&disId=' + this.data.disId +
      '&depName=' + depName)
    if (this.data.toLaodu) {
      this.setData({
        toLaodu: false
      })

      wx.navigateTo({
        url: '../../subPackage/pages/yishang/nxDistributerGoods/nxDistributerGoods?id=' + this.data.disInfo.nxDistributerEntity.nxDistributerId + '&name=ls' + '&depId=' + depId + '&disId=' + this.data.disId + '&depName=' + depName,
      })

    } else {
      wx.navigateTo({
        url: '../order/resGoods/resGoods?depId=' + depId + '&disId=' + this.data.disId +
          '&depName=' + depName,
      })
    }


  },






  toYishang() {
    wx.navigateTo({
      url: '../../subPackage/pages/yishang/index/index',
    })
  },

  toJrdh() {
    wx.navigateTo({
      url: '../../subPackage/pages/supplier/index/index',
    })
  },



  toFinishPurGoods(e) {
    var arr = this._getPurSelArr();
    wx.setStorageSync('purArr', arr);
    wx.navigateTo({
      url: '../../subPackage/pages/purGoods/purGoods',
    })



  },

  _getPurSelArr() {
    var arr = this.data.selectedArr;
    var temp = [];
    if (arr.length > 0) {
      for (var i = 0; i < arr.length; i++) {
        temp.push(arr[i].item);
      }
    }
    return temp;
  },


  toOrderWx(e) {
    var arr = this._getPurSelArr();
    var batch = {
      gbDpbPurUserId: this.data.userInfo.gbDepartmentUserId,
      gbDpbDistributerId: this.data.disInfo.gbDistributerId,
      gbDpbPurDepartmentId: this.data.depId,
      gbDpbUserAdminType: 2,
      gbDPGEntities: arr,
      gbDpbPurchaseType: 2,
    }

    this.setData({
      toOrder: true
    })

    saveDisPurGoodsBatchGb(batch).then(res => {
      if (res.result.code == 0) {
        this.setData({
          update: true,
          selectedArr: [],
        })
        var batchId = res.result.data.gbDistributerPurchaseBatchId;
        var retName = this.data.disInfo.gbDistributerName;
        var userId = this.data.userInfo.gbDepartmentUserId;
        var depId = this.data.depId;
        var that = this;
        console.log("batchId=" + batchId + "&retName=" + retName + "&disId=" + that.data.disId + "&purUserId=" + userId + "&depId=" + depId);
        console.log("-------")
        wx.navigateToMiniProgram({
          appId: 'wxfa34176649802291',
          path: 'pages/gbMarket/prepareBatchMarket/prepareBatchMarket?batchId=' + batchId + '&retName=' + retName + '&disId=' + that.data.disId + '&purUserId=' + userId + '&depId=' + depId,
          envVersion: 'release', //release  develop  trial
          success(res) {

          },
        })

      } else {
        wx.showToast({
          title: res.result.msg,
        })
      }
    })
  },


  toOpenOrder(e) {
    var batchId = e.currentTarget.dataset.id;
    var retName = this.data.disInfo.gbDistributerName;
    var userId = this.data.userInfo.gbDepartmentUserId;
    var depId = this.data.depId;
    console.log("batchId=" + batchId + "&retName=" + retName + "&disId=" + this.data.disId + "&purUserId=" + userId + "&depId=" + depId);
    wx.navigateToMiniProgram({
      appId: 'wxfa34176649802291',
      path: 'pages/gbMarket/prepareBatchMarket/prepareBatchMarket?batchId=' + batchId + '&retName=' + retName + '&disId=' + this.data.disId + '&purUserId=' + userId + '&depId=' + depId,
      envVersion: 'release', //release  develop  trial
      success(res) {

      },
    })
  },

  // toOrderApp() {
  //   var arr = this._getPurSelArr();
  //   var ids = [];
  //   if (arr.length > 0) {
  //     for (var i = 0; i < arr.length; i++) {
  //       ids.push(arr[i].gbDpgDisGoodsId);
  //     }
  //   }
  //   wx.setStorageSync('purArrIds', ids);
  //   wx.navigateTo({
  //     url: '../../subPackage/pages/yishang/addAppGoodsWithOrder/addAppGoodsWithOrder',
  //   })

  // },

  toOrderApp(e) {
    // var ids = wx.getStorageSync('purArrIds');
    var arr = this._getPurSelArr();
    var ids = [];
    if (arr.length > 0) {
      for (var i = 0; i < arr.length; i++) {
        ids.push(arr[i].gbDpgDisGoodsId);
      }
    }
    if (ids) {
      var data = {
        ids: ids,
        nxDisId: this.data.disInfo.nxDistributerEntity.nxDistributerId,
      }
      load.showLoading("设置订货商品")
      addAppGoodsWithOrder(data).then(res => {
        load.hideLoading();
        if (res.result.code == 0) {
          this._getInitData();

        }
      })

    }
  },


  cancelDisBatch() {
    this.setData({
      isTishi: false
    })
    if (this.data.batchId !== -1) {
      deleteDisBatch(this.data.batchId)
        .then(res => {
          if (res.result.code == 0) {
            // this._getWxPurGoods();
          }
        })
    }

  },



  _getAppOrder() {

    var data = {
      disId: this.data.disId,
      depId: this.data.depId,
      appDepId: this.data.disInfo.appSupplierDepartment.gbDepartmentId,
    }
    load.showLoading("获取配送订单");
    shixianGetAppOrders(data).then(res => {
      var newOrderCount = "tabs[0].amount";
      var wxOrderCountData = "tabs[1].amount";
      console.log("gbGetAppOrdersgbGetAppOrders", res.result.data);
      load.hideLoading();
      if (res.result.code == 0) {

        this.setData({
          appArr: res.result.data.arr,
          billArr: res.result.data.billArr,
          selectedArr: [],
          [newOrderCount]: res.result.data.orderAmount,
          [wxOrderCountData]: res.result.data.wxAmount,
          disInfo: res.result.data.disInfo,
          aaa: res.result.data.aaa,
        })
        if (res.result.data.disInfo.nxDistributerEntity !== null) {
          var appOrderData = "tabs[2].amount";
          this.setData({
            [appOrderData]: res.result.data.appAmount,
          })
        }
        wx.setStorageSync('disInfo', res.result.data.disInfo);
      }
    })


  },


  //

  cancelGbNxDataItem(e) {
    deleteDisPurAndNxDataItem(e.currentTarget.dataset.id)
      .then(res => {
        if (res.result.code == 0) {
          this._getAppOrder();
        } else {
          wx.showToast({
            title: res.result.msg,
            icon: 'none'
          })
          this._getAppOrder();
        }
      })
  },

  cancelGbBatchItem(e) {
    deleteDisPurBatchGbItem(e.currentTarget.dataset.id)
      .then(res => {
        if (res.result.code == 0) {
          this._getPurchasingBatch();
        } else {
          wx.showToast({
            title: res.result.msg,
            icon: 'none'
          })
          this._getPurchasingBatch();
        }
      })
  },

  // swiper one



  selectItem(e) {
    var index = e.currentTarget.dataset.index;
    var id = e.currentTarget.dataset.id;
    console.log(index);
    console.log(this.data.purArr);
    var item = this.data.purArr[index];
    var itemSelected = this.data.purArr[index].isSelected;
    var selectedData = "purArr[" + index + "].isSelected";
    var selectedArrTemp = this.data.selectedArr;

    if (itemSelected) {
      selectedArrTemp.splice(selectedArrTemp.findIndex(item => item.id === id), 1);
      this.setData({
        [selectedData]: false,
        selectedArr: selectedArrTemp
      })
      var orderArr = this.data.purArr[index].gbDistributerGoodsEntity.gbDepartmentOrdersEntities;
      console.log(orderArr.length);
      for (var i = 0; i < orderArr.length; i++) {

        var orderData = "purArr[" + index + "].gbDistributerGoodsEntity.gbDepartmentOrdersEntities[" + i + "].isNotice";
        this.setData({
          [orderData]: false
        })

      }

    } else {
      var item = {
        item: item,
        goodsIndex: index,
        id: id
      }
      selectedArrTemp.push(item);
      var userData = "purArr[" + index + "].gbDpgPurUserId";
      this.setData({
        [selectedData]: true,
        [userData]: this.data.userInfo.gbDepartmentUserId,
        selectedArr: selectedArrTemp
      })

      var arr = this.data.purArr[index].gbDistributerGoodsEntity.gbDepartmentOrdersEntities;
      for (var i = 0; i < arr.length; i++) {
        var orderChoicedData = "purArr[" + index + "].gbDistributerGoodsEntity.gbDepartmentOrdersEntities[" + i + "].isNotice";
        this.setData({
          [orderChoicedData]: true
        })
      }
    }
  },


  selectOrders(e) {
    console.log(e);
    var index = e.currentTarget.dataset.index;
    var orderIndex = e.currentTarget.dataset.orderindex;
    var orderChoiced = this.data.purArr[index].gbDistributerGoodsEntity.gbDepartmentOrdersEntities[orderIndex].isNotice;
    console.log(this.data.purArr[index].gbDistributerGoodsEntity.gbDepartmentOrdersEntities[orderIndex].gbDoQuantity)
    var arr = this.data.purArr[index].gbDistributerGoodsEntity.gbDepartmentOrdersEntities;
    var orderChoicedData = "purArr[" + index + "].gbDistributerGoodsEntity.gbDepartmentOrdersEntities[" + orderIndex + "].isNotice";
    if (orderChoiced) {
      this.setData({
        [orderChoicedData]: false
      })
      var noChoiceAmount = 0;
      for (var i = 0; i < arr.length; i++) {
        var choice = arr[i].isNotice;
        if (!choice) {
          noChoiceAmount = Number(noChoiceAmount) + Number(1);
        }
      }
      console.log("noechociicid", noChoiceAmount);
      console.log("noechociicid", arr.length);
      if (noChoiceAmount == arr.length) {
        var goodsSelectedData = "purArr[" + index + "].isSelected";
        var selArr = this.data.selectedArr;
        var newSelArr = selArr.filter(item => item.goodsIndex !== index);
        this.setData({
          [goodsSelectedData]: false,
          selectedArr: newSelArr
        })
      }
    } else {
      this.setData({
        [orderChoicedData]: true
      })

      var id = this.data.purArr[index].gbDistributerPurchaseGoodsId;
      var selectedArrTemp = this.data.selectedArr;
      var item = this.data.purArr[index];

      if (selectedArrTemp.length > 0) {
        for (var i = 0; i < selectedArrTemp.length; i++) {
          var selid = selectedArrTemp[i].id;
          if (id == selid) {
            selectedArrTemp.splice(i, 1);
          }
        }

        var item = {
          item: item,
          goodsIndex: index,
          id: id
        }
        selectedArrTemp.push(item);

        var selectedData = "purArr[" + index + "].isSelected";
        this.setData({
          [selectedData]: true,
          selectedArr: selectedArrTemp
        })
      } else {
        var temp = [];
        var item = {
          item: item,
          goodsIndex: index,
          id: id
        }
        temp.push(item);
        var selectedData = "purArr[" + index + "].isSelected";
        this.setData({
          [selectedData]: true,
          selectedArr: temp
        })
      }
    }
  },

  deleteOrderGoods(e) {
    var selArr = this.data.selectedArr;
    var index = e.currentTarget.dataset.index;
    var selItem = this.data.selectedArr[index];
    var selgoodsIndex = selItem.goodsIndex;
    var purData = "purArr[" + selgoodsIndex + "].isSelected";
    selArr.splice(index, 1);
    var orderArr = this.data.purArr[selgoodsIndex].gbDistributerGoodsEntity.gbDepartmentOrdersEntities;
    if (orderArr.length > 0) {
      for (var i = 0; i < orderArr.length; i++) {
        var oderData = "purArr[" + selgoodsIndex + "].gbDistributerGoodsEntity.gbDepartmentOrdersEntities[" + i + "].isNotice";
        this.setData({
          [oderData]: false
        })
      }
    }
    this.setData({
      [purData]: false,
      selectedArr: selArr
    })
    if (selArr.length == 0) {
      this.setData({
        showOperation: false
      })
    }
  },





  /**
   * 计算偏移量
   */
  calculateSlider(index) {
    const query = wx.createSelectorQuery();
    query.select(`#tab-${index}`).boundingClientRect(); // 获取选中 Tab 的宽度和位置
    query.exec(res => {
      const tabRect = res[0]; // 当前 Tab 的位置信息
      this.setData({
        sliderWidth: tabRect.width, // 设置滑块宽度等于 Tab 宽度
        sliderLeft: tabRect.left, // 设置滑块左侧偏移量等于 Tab 的左边距
      });
    });
  },

  /**
   * tabItme点击
   */
  onTab1Click(event) {
    let index = event.currentTarget.dataset.index;
    this.setData({
      tab1Index: index,
      itemIndex: index,
    })

  },

  /**
   * 动画结束时会触发 animationfinish 事件
   */
  swiperChange(event) {
    this.setData({
      tab1Index: event.detail.current,
      itemIndex: event.detail.current,
      openIndex: -1,
    })

    if (this.data.tab1Index == 0) {
      this._getInitData();
    }
    if (this.data.tab1Index == 1) {

      this._getPurchasingBatch();

    }
    if (this.data.tab1Index == 2) {

      this._getAppOrder();

    }
    this.calculateSlider(event.detail.current); // 更新滑块宽度和位置
  },

  // swiper two
  _getPurchasingBatch() {
    load.showLoading("获取微信好友订货")
    var data = {
      disId: this.data.disId,
      depId: this.data.depId,
      appDepId: this.data.disInfo.appSupplierDepartment.gbDepartmentId
    }

    jingjingGetBuyingGoodsGb(data)
      .then(res => {
        load.hideLoading();
        console.log(res.result.data);
        if (res.result.code == 0) {
          var newOrderCount = "tabs[0].amount";
          var wxOrderCountData = "tabs[1].amount";
          this.setData({
            batchArr: res.result.data.arr,
            [newOrderCount]: res.result.data.orderAmount,
            [wxOrderCountData]: res.result.data.wxAmount,
            disInfo: res.result.data.disInfo,
          })
          if(res.result.data.disInfo.nxDistributerEntity !== null){
            var appOrderData = "tabs[2].amount";
            this.setData({
              [appOrderData]: res.result.data.appAmount,
            })
          }

          wx.setStorageSync('disInfo', res.result.data.disInfo);

        } else {
          this.setData({
            purArr: [],
            batchSize: 0,
            finishSize: 0,
            selectedArr: []
          })
          wx.showToast({
            title: res.result.msg,
            icon: 'none'
          })
          this.setData({
            purArr: []
          })
        }
      })
  },



  showFinish(e) {
    var item = e.currentTarget.dataset.item;
    item.gbDpbPaySubtotal = item.gbDpbSubtotal;
    if (item.gbDpbPayType !== 1) {
      item.gbDpbPayType = 0;
    }
    this.setData({
      batch: item,
      url: this.data.url,
    })
    if (item.gbDpbPurchaseType == 21) {
      this.setData({
        showPay: true,
      })
    } else if (item.gbDpbPurchaseType == 2) {
      this.setData({
        showPayAuto: true,
      })
    } else {
      this.setData({
        showPayReturn: true,
      })
    }

  },

  toSupplier() {
    wx.setStorageSync('supplierArr', this.data.supplierArr)
    wx.navigateTo({
      url: '../selectSupplier/selectSupplier?type=buy&orderType=' + this.data.orderType,
    })
  },

  toSupplierReturn() {
    wx.navigateTo({
      url: '../selectSupplier/selectSupplier?type=return',
    })
  },

  toSupplierUserReturn(e) {
    if (this.data.returnSupplierId > 0) {
      wx.navigateTo({
        url: '../selectSupplierUser/selectSupplierUser?supplierId=' + this.data.returnSupplierId,
      })
    } else {
      wx.showModal({
        title: "请先选择退货供货商",
        content: "这个收到退货的供货商的业务员",
        showCancel: false,
        confirmText: "知道了",
      })
    }
  },

  confirmPay(e) {
    var item = e.detail.item;
    var batch = this.data.batch;
    batch.gbDpbPayType = item.gbDpbPayType;
    console.log(batch)
    finishSharePurGoodsBatch(batch)
      .then(res => {
        if (res.result.code == 0) {
          this.setData({
            batch: "",
            showPay: false,
            showPayReturn: false,
          })
          this._getPurchasingBatch();
        } else {
          wx.showToast({
            title: res.result.msg,
            icon: 'none'
          })
        }
      })


  },


  confirmPayAuto(e) {
    console.log("confirmPayAuto")
    var item = e.detail.item;
    var batch = this.data.batch;
    batch.gbDpbPayType = item.gbDpbPayType;
    console.log(batch);
    var data = {
      payType: item.gbDpbPayType,
      batchId: item.gbDistributerPurchaseBatchId,
      isAuto: e.detail.isAuto
    }
    console.log(data);
    finishSharePurGoodsBatchIsAuto(data).then(res => {
      if (res.result.code == 0) {
        this.setData({
          batch: "",
          showPayAuto: false,
        })
        this._getPurchasingBatch();
      }
    })



  },



  confirmPayReturn(e) {
    console.log("confirmPayReturnconfirmPayReturn")
    console.log("confirmPayAuto")
    var item = e.detail.item;

    finishSharePurGoodsBatchReturn(item.gbDistributerPurchaseBatchId).then(res => {
      if (res.result.code == 0) {
        this.setData({
          batch: "",
          showPayReturn: false
        })
        this._getPurchasingBatch();
      }
    })
  },

  confirmReturn(e) {
    console.log(e);
    var returnSupplier = null;
    if (this.data.returnOrders.returnPurGoodsEntity.gbDisPurchaseBatchEntity !== null) {
      returnSupplier = this.data.returnOrders.returnPurGoodsEntity.gbDisPurchaseBatchEntity.nxJrdhSupplierEntity;
    }

    var payType = this.data.returnOrders.returnPurGoodsEntity.gbDpgPayType;
    //退货到部门
    if (returnSupplier == null) {
      // item.
      var ordersItem = this.data.returnOrders;
      ordersItem.gbDoReturnUserId = this.data.userInfo.gbDepartmentUserId;
      ordersItem.gbDoStatus = 4;
      console.log("orditmem", ordersItem)
      finishReturnOrderToDep(ordersItem)
        .then(res => {
          if (res.result.code == 0) {
            this.setData({
              item: "",
              returnOrders: "",
              showReturn: false
            })
            this._getInitData();
          }
        })
    } else {

      var item = {
        gbDpbSupplierUserId: this.data.returnOrders.returnPurGoodsEntity.gbDisPurchaseBatchEntity.nxJrdhSellerEntity.nxJrdhUserId,
        gbDpbSupplierId: this.data.returnOrders.returnPurGoodsEntity.gbDisPurchaseBatchEntity.nxJrdhSupplierEntity.nxJrdhSupplierId,
        gbDpbBuyUserId: this.data.returnOrders.returnPurGoodsEntity.gbDisPurchaseBatchEntity.gbDpbBuyUserId,
        gbDpbSellUserId: this.data.returnOrders.returnPurGoodsEntity.gbDisPurchaseBatchEntity.gbDpbSellUserId,
        gbDpbDistributerId: this.data.userInfo.gbDuDistributerId,
        gbDpbPurDepartmentId: this.data.userInfo.gbDuDepartmentFatherId,
        gbDpbPayType: payType,
        gbDpbPurUserId: this.data.userInfo.gbDepartmentUserId,
        gbDpbSubtotal: "-" + this.data.returnOrders.gbDoSubtotal,
        gbDpbUserAdminType: this.data.userInfo.gbDuAdmin,
        gbDPGEntities: this.data.item
      }

      console.log(item);
      finishReturnToSuppler(item)
        .then(res => {
          if (res.result.code == 0) {
            this.setData({
              item: "",
              returnOrders: "",
              showReturn: false,
              returnCash: true,
              returnSupplierId: "",
              returnSupplierName: "",
              returnSupplierUsrId: "",
              returnSupplierUserName: "",
            })
            this._getInitData();
          }
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
    }, 100)
  },

  hideModal: function (e) {
    var that = this;
    var animation = wx.createAnimation({
      duration: 2000,
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
    }, 4000)
  },



  hideMask() {
    this.setData({
      showOperation: false,
    })
    this.hideModal();
  },


  hide() {
    this.setData({
      showChoice: false
    })
  },

  toEditHome() {
    wx.navigateTo({
      url: '../../subPackage/pages/management/homePage/homePage?disId=' + this.data.disId,
    })
  },


  showCar() {
    this.setData({
      showGoods: true,
    })
  },

  closeGoods() {
    this.setData({
      showGoods: false,
    })
  },

  toPay() {
    wx.navigateTo({
      url: '../../subPackage/pages/account/payPage/payPage?type=0',
    })
  },

  toEditUser() {
    wx.navigateTo({
      url: '../../subPackage/pages/account/userEdit/userEdit',
    })
  },



  showReturnType(e) {
    console.log(e);
    this.setData({
      showReturn: true,
      returnItem: e.currentTarget.dataset.item,
      returnOrders: e.currentTarget.dataset.item.gbDistributerGoodsEntity.gbDepartmentOrdersEntities[0],
      // depName: this.data.userInfo.gbDepartmentEntity.gbDepartmentName
    })

  },

  confirmReturn() {
    var item = this.data.returnItem;
    item.gbDpgPurUserId = this.data.userInfo.gbDepartmentUserId;
    puraserReturnPurGoods(item).then(res => {
      if (res.result.code == 0) {
        this._getInitData();
      }
    })



  },



  onShareAppMessage(e) {
    return new Promise((resolve, reject) => {

      var arr = this._getPurSelArr();
      var batch = {
        gbDpbPurUserId: this.data.userInfo.gbDepartmentUserId,
        gbDpbDistributerId: this.data.disInfo.gbDistributerId,
        gbDpbPurDepartmentId: this.data.depId,
        gbDpbUserAdminType: 2,
        gbDPGEntities: arr,
        gbDpbPurchaseType: 2,
        gbDpbBuyUserOpenId: this.data.userInfo.gbDuWxOpenId,
        gbDpbBuyUserId: this.data.userInfo.gbDepartmentUserId,
      };

      load.showLoading("保存订货")
      saveDisPurGoodsBatchGb(batch).then(res => {
        load.hideLoading();

        if (res.result.code == 0) {
          var batchId = res.result.data.gbDistributerPurchaseBatchId;
          var retName = this.data.disInfo.gbDistributerName;
          var userId = this.data.userInfo.gbDepartmentUserId;
          var depId = this.data.depId;
          this.setData({
            isTishi: true,
            // update: true,
            selectedArr: [],
            batchId: batchId, // 保存batchId
            retName: retName // 保存retName
          });

          resolve({
            title: "今日订货", // 默认是小程序的名称(可以写slogan等)
            path: `subPackage/pages/gbMarket/gbOrderBatch/gbOrderBatch?batchId=${batchId}&retName=${retName}&disId=${this.data.disInfo.gbDistributerId}&fromBuyer=1&buyUserId=${userId}&depId=${depId}`,
            imageUrl: this.data.url + '/userImage/say.png',
          })
        } else {
          wx.showToast({
            title: res.result.msg,
            icon: 'none'
          })
        }
      })
    })

  },


  toLaodu() {

   
    if (this.data.disInfo.mendianDepartmentList.length > 1 || this.data.disInfo.mendianDepartmentList[0].gbDepartmentSubAmount > 1) {
      this.setData({
        showChoice: true,
        toLaodu: true,
      })
    } else {


      wx.setStorageSync('depInfo', this.data.disInfo.mendianDepartmentList[0].gbDepartmentEntityList[0]);

      wx.navigateTo({
        url: '../../subPackage/pages/yishang/nxDistributerGoods/nxDistributerGoods?id='+this.data.disInfo.nxDistributerEntity.nxDistributerId +'&name=ls' + '&depId=' + this.data.depId + '&disId=' + this.data.disId + '&depName=' + this.data.disInfo.mendianDepartmentList[0].gbDepartmentEntityList[0].gbDepartmentName,
      })
    }
  },



toStock(){
  console.log("dstooddkckc")
  wx.navigateTo({
    url: '../../subPackage/pages/stock/index/index',
  })
},







})