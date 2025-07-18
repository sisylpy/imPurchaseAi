const globalData = getApp().globalData;
var load = require('../../lib/load.js');
import apiUrl from '../../config.js'
var dateUtils = require('../../utils/dateUtil')


import {
  gbLoginIndex
} from '../../lib/apiDistributer'

import {
  // swiper-1
  getPurchaseGoodsGbWithTabCount,
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
  deleteDisBatchGb,
  //swiper -- 3
  gbGetAppOrders

} from '../../lib/apiDepOrder'

Page({

  onShow() {
    
    if(this.data.userInfo == null){
      this._userLogin();
   }else{
    if (this.data.tab1Index == 0) {
      this._getInitData();
      
    } else if (this.data.tab1Index == 1) {
      this._getPurchasingBatch();
    } 
   }
   
  },


  /**
   * 页面的初始数据
   */
  data: {
    update: false,
    tab1Index: 0,
    itemIndex: 0, // 当前选中的 Tab 索引
    sliderWidth: 0, // 滑块宽度
    sliderLeft: 0, // 滑块偏移量
    tabs: [{
        name: "未采购",
        amount: ""
      },
      {
        name: "供货商",
        amount: ""
      }
    ],

    purArr: [],
    selectedArr: [],
    showSelGoods: false,
    userInfo: null,
    showPage: false, // 控制弹出层和蒙版显示
    popupAnimation: {}, // 弹出层动画
    disInfo: {
      gbDistributerName: '', // 门店名称
    },
    hasSubs: 2, // 部门类型
    selNumber: 1, // 部门数量
    purchaseRefreshing: false,
    orderRefreshing: false,
    appRefreshing: false,
    item: {},
    returnItem:{},
    batch: {},
    url: "aa",
    returnOrders:{},
    windowHeight:"",
    isTishi: false,

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    this.setData({
      windowWidth: globalData.windowWidth * globalData.rpxR,
      windowHeight: globalData.windowHeight * globalData.rpxR,
      navBarHeight: globalData.navBarHeight * globalData.rpxR,
      url: apiUrl.server,
      week: dateUtils.getWhatDay(0),
      date: dateUtils.getOnlyHao(0),
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
          console.log(res.result.data);
          var newOrderCount = "tabs[0].amount";
          var wxOrderCountData = "tabs[1].amount";
          // var appOrderData = "tabs[2].amount";
          this.setData({
            purArr: res.result.data.arr,
            selectedArr: [],
            [newOrderCount]: res.result.data.orderAmount,
            [wxOrderCountData]: res.result.data.wxAmount,
            // [appOrderData]: res.result.data.appAmount,
            disInfo: res.result.data.disInfo,
          })
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
          // var appOrderData = "tabs[2].amount";
          this.setData({
            batchArr: res.result.data.arr,
            [newOrderCount]: res.result.data.orderAmount,
            [wxOrderCountData]: res.result.data.wxAmount,
            // [appOrderData]: res.result.data.appAmount,
            disInfo: res.result.data.disInfo,
          })

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
      // var appOrderData = "tabs[2].amount";
      console.log("gbGetAppOrdersgbGetAppOrders", res.result.data);
      load.hideLoading();
      if (res.result.code == 0) {
        this.setData({
          appArr: res.result.data.arr,
          selectedArr: [],
          [newOrderCount]: res.result.data.orderAmount,
          [wxOrderCountData]: res.result.data.wxAmount,
          // [appOrderData]: res.result.data.appAmount,
          disInfo: res.result.data.disInfo,
        })
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


  //swiper one 
  _getInitData() {
    load.showLoading("获取订单");
    var data = {
      depId: this.data.depId,
      disId: this.data.disId,
      appDepId: this.data.disInfo.appSupplierDepartment.gbDepartmentId
    }
    getPurchaseGoodsGbWithTabCount(data)
      .then(res => {
        load.hideLoading();
        if (res.result.code == 0) {
          console.log(res.result.data);
          var newOrderCount = "tabs[0].amount";
          var wxOrderCountData = "tabs[1].amount";
          // var appOrderData = "tabs[2].amount";
          this.setData({
            purArr: res.result.data.arr,
            selectedArr: [],
            [newOrderCount]: res.result.data.orderAmount,
            [wxOrderCountData]: res.result.data.wxAmount,
            // [appOrderData]: res.result.data.appAmount,
            disInfo: res.result.data.disInfo,
          })
          wx.setStorageSync('disInfo', res.result.data.disInfo)
        } else {
          this.setData({
            purArr: [],
          })
          wx.showToast({
            title: res.result.msg,
            icon: 'none'
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
        gbLoginIndex(resLogin.code)
          .then((res) => {
            console.log("res.re", res.result)
            if (res.result.code !== -1) {
              if(res.result.data !== "noBuyer"){
                var admin = res.result.data.depUserInfo.gbDuAdmin;
                if(admin == 2){
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
                }else{
                 wx.redirectTo({
                   url: '../../subPackage/pages/ai/chefOrder/chefOrder',
                 })
                }
               
              }else{
                wx.redirectTo({
                  url: '../../subPackage/pages/gbMarket/jinriListWithLogin/jinriListWithLogin',
                })

              }
              
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
    wx.navigateTo({
      url: '../order/resGoods/resGoods?depId=' + depId + '&disId=' + this.data.disId +
        '&depName=' + depName,
    })
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
    wx.navigateTo({
      url: '../order/resGoods/resGoods?depId=' + depId + '&disId=' + this.data.disId +
        '&depName=' + depName,
    })

  },



  /**
   * 配货商
   */
  toYishang() {
    wx.navigateTo({
      url: '../../subPackage/pages/yishang/index/index',
    })
  },

/**
 * 自采
 */
  toFinishPurGoods() {
    var arr = this._getPurSelArr();
    wx.setStorageSync('purArr', arr);
    wx.navigateTo({
      url: '../purGoods/purGoods',
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
    // 保存原始的分享参数到临时变量（用于失败时恢复）
    const prevShareConfig = {
      title: this.data.shareTitle,
      path: this.data.sharePath,
      imageUrl: this.data.shareImageUrl
    };

   
  
    var arr = this._getPurSelArr();
    var batch = {
      // ...原有batch配置
      gbDpbPurUserId: this.data.userInfo.gbDepartmentUserId,
      gbDpbDistributerId: this.data.disInfo.gbDistributerId,
      gbDpbPurDepartmentId: this.data.depId,
      gbDpbUserAdminType: 2,
      gbDPGEntities: arr,
      gbDpbPurchaseType: 2,
      gbDpbBuyUserOpenId: this.data.userInfo.gbDuWxOpenId,
      gbDpbBuyUserId: this.data.userInfo.gbDepartmentUserId,
    };
  
    // 调用保存批次接口
    load.showLoading("保存订货单");
    saveDisPurGoodsBatchGb(batch).then(res => {
      load.hideLoading();
      if (res.result.code == 0) {
        const { 
          gbDistributerPurchaseBatchId: batchId,
          gbDistributerName: retName
        } = res.result.data;
  
        console.log(`batchId=${batchId}&retName=${encodeURIComponent(retName)}&disId=${this.data.disInfo.gbDistributerId}&fromBuyer=1&buyerUserId=${this.data.userInfo.gbDepartmentUserId}&depId=${this.data.depId}`)
        // 更新页面数据和分享配置
        this.setData({
         
          update: true,
          selectedArr: [],
          batchId,
          retName,
          // 设置分享配置
          shareTitle: "今日订货",
          sharePath: `../../subPackage/pages/gbMarket/gbOrderBatch/gbOrderBatch?batchId=${batchId}&retName=${encodeURIComponent(retName)}&disId=${this.data.disInfo.gbDistributerId}&fromBuyer=1&buyerUserId=${this.data.userInfo.gbDepartmentUserId}&depId=${this.data.depId}`,
          shareImageUrl: this.data.url + '/userImage/say.png',
          showShareButton: true  // 控制分享按钮显示
        });
        
      } else {
        wx.showToast({ title: res.result.msg });
        // 恢复之前的分享配置
        this.setData(prevShareConfig);
      }
    }).catch(error => {
      wx.showToast({ title: '保存批次失败' });
      this.setData(prevShareConfig);
    });
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
                batchId: batchId,  // 保存batchId
                retName: retName  // 保存retName
              });
             
              resolve({
                title: "今日订货", // 默认是小程序的名称(可以写slogan等)
                path: `subPackage/pages/gbMarket/gbOrderBatch/gbOrderBatch?batchId=${batchId}&retName=${retName}&disId=${this.data.disInfo.gbDistributerId}&fromBuyer=1&buyerUserId=${userId}&depId=${depId}`,
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




toStock(){
  console.log("dstooddkckc")
  wx.navigateTo({
    url: '../../subPackage/pages/stock/index/index',
  })
},


toJrdh() {
  wx.navigateTo({
    url: '../../subPackage/pages/supplier/index/index',
  })
},

  toLaodu(){
    // wx.navigateToMiniProgram({
    //   appId: 'wx38e2e89afe95a51f',
    //   path: 'pages/index/index'  ,
    //   envVersion: 'trial', //release  develop  trial
    //   success(res) {
        
    //   },
    // })
    // wx.setStorageSync('nxDisInfo', e.currentTarget.dataset.item)
    // var id = e.currentTarget.dataset.id;
    // var name = e.currentTarget.dataset.name;
    
    wx.navigateTo({
      url: '../../subPackage/pages/yishang/nxDistributerGoods/nxDistributerGoods?nxDisId=' + this.data.disInfo.nxDistributerEntity.nxDistributerId  +
      '&name=' + "ld" + '&toDepId=' + this.data.depId,
    })
  },


  toDdc(){
 
    wx.navigateToMiniProgram({
      appId: 'wxb143cab0d2768fce',
      path: 'pages/index/index',
      envVersion: 'trial', //release  develop  trial
      success(res) {
        
      },
    })
  },  


/**
 * 供货商
 */


// toOrderWx1(e) {
//   var arr = this._getPurSelArr();
//   var batch = {
//     gbDpbPurUserId: this.data.userInfo.gbDepartmentUserId,
//     gbDpbDistributerId: this.data.disInfo.gbDistributerId,
//     gbDpbPurDepartmentId: this.data.depId,
//     gbDpbUserAdminType: 2,
//     gbDPGEntities: arr,
//     gbDpbPurchaseType: 2,
//     gbDpbBuyUserOpenId: this.data.userInfo.gbDuWxOpenId,
//     gbDpbBuyUserId: this.data.userInfo.gbDepartmentUserId,
//   };

//   // 调用保存批次接口
//   load.showLoading("保存订单");
//   saveDisPurGoodsBatchGb(batch).then(res => {
//     load.hideLoading();
//     if (res.result.code == 0) {  // 检查接口返回是否成功
//       // 成功保存后设置数据
//       var batchId = res.result.data.gbDistributerPurchaseBatchId;
//       var retName = this.data.disInfo.gbDistributerName;
//       var userId = this.data.userInfo.gbDepartmentUserId;
//       var depId = this.data.depId;

//       this.setData({
//         update: true,
//         selectedArr: [],
//         batchId: batchId,  // 保存batchId
//         retName: retName  // 保存retName
//       });

//       // 确保保存成功后再触发分享
//       wx.shareAppMessage({
//         title: "注册京京采购小程序", 
//         path: `subPackage/pages/gbMarket/gbOrderBatch/gbOrderBatch?batchId=${batchId}&retName=${retName}&disId=${this.data.disInfo.gbDistributerId}&fromBuyer=1&buyerUserId=${userId}&depId=${depId}`,
//         imageUrl: this.data.url + '/userImage/say.png',
//       });
      
//     } else {  // 如果接口调用失败，显示提示
//       wx.showToast({
//         title: res.result.msg,
//       });
//     }
//   }).catch(error => {
//     // 错误处理
//     wx.showToast({
//       title: '保存批次失败',
//     });
//   });
// },



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

/**
 * 配送订货
 */
  toOrderApp() {
    var arr = this._getPurSelArr();
    var ids = [];
    if (arr.length > 0) {
      for (var i = 0; i < arr.length; i++) {
        ids.push(arr[i].gbDpgDisGoodsId);
      }
    }
    wx.setStorageSync('purArrIds', ids);
    wx.navigateTo({
      url: '../../subPackage/pages/yishang/addAppGoodsWithOrder/addAppGoodsWithOrder',
    })

  },


  /**
   * 获取App配送
   */
  _getAppOrder() {

    var data = {
      disId: this.data.disId,
      depId: this.data.depId,
      appDepId: this.data.disInfo.appSupplierDepartment.gbDepartmentId,
    }
    load.showLoading("获取配送订单");
    gbGetAppOrders(data).then(res => {
      var newOrderCount = "tabs[0].amount";
      var wxOrderCountData = "tabs[1].amount";
      // var appOrderData = "tabs[2].amount";
      load.hideLoading();
      if (res.result.code == 0) {
        this.setData({
          appArr: res.result.data.arr,
          selectedArr: [],
          [newOrderCount]: res.result.data.orderAmount,
          [wxOrderCountData]: res.result.data.wxAmount,
          // [appOrderData]: res.result.data.appAmount,
          disInfo: res.result.data.disInfo,
        })
        wx.setStorageSync('disInfo', res.result.data.disInfo);
      }
    })
  },


  /**
   * 删除配送商品
   * @param {}} e 
   */
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


  /**
   * 删除订货批次商品
   * @param {}} e 
   */
  cancelGbBatchItem(e) {
    load.showLoading("删除订货商品");
    deleteDisPurBatchGbItem(e.currentTarget.dataset.id)
      .then(res => {
        load.hideLoading();
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
      var orderArr = this.data.purArr[index].gbDepartmentOrdersEntities;
      console.log(orderArr.length);
      for (var i = 0; i < orderArr.length; i++) {

        var orderData = "purArr[" + index + "].gbDepartmentOrdersEntities[" + i + "].isNotice";
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

      var arr = this.data.purArr[index].gbDepartmentOrdersEntities;
      for (var i = 0; i < arr.length; i++) {
        var orderChoicedData = "purArr[" + index + "].gbDepartmentOrdersEntities[" + i + "].isNotice";
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
    var orderChoiced = this.data.purArr[index].gbDepartmentOrdersEntities[orderIndex].isNotice;
    console.log(this.data.purArr[index].gbDepartmentOrdersEntities[orderIndex].gbDoQuantity)
    var arr = this.data.purArr[index].gbDepartmentOrdersEntities;
    var orderChoicedData = "purArr[" + index + "].gbDepartmentOrdersEntities[" + orderIndex + "].isNotice";
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
    var orderArr = this.data.purArr[selgoodsIndex].gbDepartmentOrdersEntities;
    if (orderArr.length > 0) {
      for (var i = 0; i < orderArr.length; i++) {
        var oderData = "purArr[" + selgoodsIndex + "].gbDepartmentOrdersEntities[" + i + "].isNotice";
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
          // var appOrderData = "tabs[2].amount";
          this.setData({
            batchArr: res.result.data.arr,
            [newOrderCount]: res.result.data.orderAmount,
            [wxOrderCountData]: res.result.data.wxAmount,
            // [appOrderData]: res.result.data.appAmount,
            disInfo: res.result.data.disInfo,
          })

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
    }

  },


  confirmPay(e) {
    var item = e.detail.item;
    var batch = this.data.batch;
    batch.gbDpbPayType = item.gbDpbPayType;
    console.log(batch)
    load.showLoading("完成订货");
    finishSharePurGoodsBatch(batch)
      .then(res => {
        load.hideLoading();
        this.setData({
          batch: "",
          showPay: false,
        })
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
   
    load.showLoading("完成订货");
    finishSharePurGoodsBatchIsAuto(data).then(res => {
      load.hideLoading();
      this.setData({
        batch: "",
        showPayAuto: false,
        isAuto: false
      })
      if (res.result.code == 0) {
        this._getPurchasingBatch();
      }else{
        wx.showToast({
          title: res.result.msg,
          icon: 'none'
        })
        this._getPurchasingBatch();
      }
    })
  },


  hide() {
    this.setData({
      showChoice: false
    })
  },

  toEditHome() {
    wx.navigateTo({
      url: '../management/homePage/homePage?disId=' + this.data.disId,
    })
  },


  showCar() {
    this.setData({
      showSelGoods: true,
    })
  },

  closeGoods() {
    this.setData({
      showSelGoods: false,
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
      returnOrders: e.currentTarget.dataset.item.gbDepartmentOrdersEntities[0],
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





  cancelDisBatch() {
    var that  = this;
    that.setData({
      isTishi: false
    })
    deleteDisBatchGb(that.data.batchId)
    .then(res => {
      if (res.result.code == 0) {
      
        that._getInitData()
      }
    })
    
  },

  out(){
    this.setData({
      isTishi: false
    })
  }

})





