var load = require('../../../../lib/load.js');
const globalData = getApp().globalData;
import apiUrl from '../../../../config.js'

import {
  indexJrdhUserLoginJj,
  sellerDistributerPurchaseBatchsGb,
} from '../../../../lib/apiDepOrder'


Page({

  onShow() {
// 推荐直接用新API
let windowInfo = wx.getWindowInfo();
let globalData = getApp().globalData;
this.setData({
  windowWidth: windowInfo.windowWidth * globalData.rpxR,
  windowHeight: windowInfo.windowHeight * globalData.rpxR,
  navBarHeight: globalData.navBarHeight * globalData.rpxR,
  countWindowWidth: windowInfo.windowWidth,
  statusBarHeight: globalData.statusBarHeight * globalData.rpxR,
});

    this._userLogin();
  },

  /**
   * 页面的初始数据
   */
  data: {

    canSave: false,
    menuOpen: false, // 菜单是否打开
    mainAnimationData: {}, // 主内容动画数据
    menuAnimationData: {}, // 菜单动画数据

    startX: 0,
    startY: 0,
    isSwiping: false,
    showIndex: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      rpxR: globalData.rpxR,
      countWindowWidth: globalData.windowWidth,
      statusBarHeight: globalData.statusBarHeight * globalData.rpxR,
      url: apiUrl.server,
      from: options.from,
      nxDisId: options.nxDisId
    })

    if (this.data.from == 'nx') {
      wx.setStorageSync('nxDisId', this.data.nxDisId)
    }


    this.setData({
      sideMenuWidth: this.data.countWindowWidth * 0.8, // 侧边菜单宽度为屏幕宽度的80%
    });

    console.log('sideMenuWidth:', this.data.sideMenuWidth);

    // 创建动画实例
    this.mainAnimation = wx.createAnimation({
      duration: 300,
      timingFunction: 'ease-out',
    });
    this.menuAnimation = wx.createAnimation({
      duration: 300,
      timingFunction: 'ease-out',
    });

  },


  // 切换菜单状态
  toggleMenu: function () {
    console.log("toggleMenutoggleMenu")
    if (this.data.menuOpen) {
      // 关闭菜单
      this.mainAnimation.translateX(0).step();
      this.menuAnimation.translateX(-this.data.sideMenuWidth).step();
      this.setData({
        mainAnimationData: this.mainAnimation.export(),
        menuAnimationData: this.menuAnimation.export(),
        menuOpen: false,
      });
    } else {
      // 打开菜单
      this.mainAnimation.translateX(this.data.sideMenuWidth).step();
      this.menuAnimation.translateX(this.data.sideMenuWidth).step();
      this.setData({
        mainAnimationData: this.mainAnimation.export(),
        menuAnimationData: this.menuAnimation.export(),
        menuOpen: true,
      });
    }
  },

  // 触摸开始事件
  sideMenuTouchStart: function (e) {
    this.setData({
      startX: e.touches[0].pageX,
      startY: e.touches[0].pageY,
      isSwiping: true,
    });
  },

  // 触摸移动事件
  sideMenuTouchMove: function (e) {
    if (!this.data.isSwiping) return;

    const moveX = e.touches[0].pageX;
    const moveY = e.touches[0].pageY;
    const deltaX = moveX - this.data.startX;
    const deltaY = moveY - this.data.startY;

    // 判断是否主要是水平滑动
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      // 阻止滚动穿透
      this.setData({
        isHorizontalSwipe: true,
      });

      // 如果需要滑动跟随效果，添加相应代码
      // ...
    } else {
      this.setData({
        isHorizontalSwipe: false,
      });
    }
  },

  // 触摸结束事件
  sideMenuTouchEnd: function (e) {
    if (!this.data.isSwiping || !this.data.isHorizontalSwipe) return;

    const endX = e.changedTouches[0].pageX;
    const deltaX = endX - this.data.startX;

    this.setData({
      isSwiping: false,
      isHorizontalSwipe: false,
    });

    if (deltaX < -50) {
      // 向左滑动超过50px，关闭菜单
      this.toggleMenu();
    }
  },

  // 阻止滚动穿透
  stopTouchMove: function () {
    return false;
  },



  // selGbDis(e) {
  //   console.log("selGbdis", e);
  //   var index = e.currentTarget.dataset.index;
  //   var gbArr = this.data.gbBuyerList;
  //   wx.setStorageSync('userInfo', gbArr[index].gbBuyerInfo);
  //   this.setData({
  //     showIndex: index,
  //     gbDisInfo: gbArr[index].gbDisInfo,
  //     nxSupplierArr: gbArr[index].nxSupplierArr
  //   })

  //   this.toggleMenu()

  // },




  supplierSelGb(e) {

    this.toggleMenu();
    var index = e.currentTarget.dataset.index;
    console.log("=======", this.data.showIndex, "index", index);
    if (this.data.showIndex !== index) {

      var supplierArr = this.data.supplierArr;
      console.log("index--------supplierSelGb", index);
      this.setData({
        gbDisInfo: supplierArr[index].gbDistributerEntity,
        gbDisId: supplierArr[index].gbDistributerEntity.gbDistributerId,
        sellerId: supplierArr[index].nxJrdhsUserId,
        supplierId: supplierArr[index].nxJrdhSupplierId,
        showIndex: index,
      })
      wx.setStorageSync('showIndex', this.data.showIndex);
      wx.setStorageSync('gbDisInfo', this.data.gbDisInfo);
      this._getSupplerBillsGb();
    }


  },

  _getSupplerBillsGb() {
    var data = {
      disId: this.data.gbDisId,
      supplierId: this.data.supplierId,
    }
    console.log(data);
    load.showLoading("获取数据")
    sellerDistributerPurchaseBatchsGb(data)
      .then(res => {
        load.hideLoading();
        if (res.result.code == 0) {
          this.setData({
            arr: res.result.data.arr,
            resultPayTotal: res.result.data.resultPayTotal,
            gbDisInfo: res.result.data.disInfo,
            // supplierInfo: res.result.data.supplierInfo,
          })
        }
      })
  },


  supplierOpenBatchDetailGb(e) {

    var batch = e.currentTarget.dataset.item;
    var batchId = batch.gbDistributerPurchaseBatchId;
    var retName = this.data.gbDisInfo.gbDistributerName;
    var disId = this.data.gbDisId;
    var buyerUserId = batch.gbDpbBuyUserId;
    var depId = batch.gbDpbPurDepartmentId;
    var purUserId = batch.gbDpbPurUserId;
    if (batch.gbDpbPurchaseType == 9) {
      wx.navigateTo({
        url: '../gbOrderBatchReturn/gbOrderBatchReturn?batchId=' + batchId + '&retName=' + retName + '&disId=' + disId + '&fromBuyer=0' + '&buyerUserId=' + buyerUserId +
          '&depId=' + depId + '&purUserId=' + purUserId + '&supplierId=' + this.data.supplierId
      })
    } else {
      wx.navigateTo({
        url: '../gbOrderBatch/gbOrderBatch?batchId=' + batchId + '&retName=' + retName + '&disId=' + disId + '&fromBuyer=0' + '&buyerUserId=' + buyerUserId +
          '&depId=' + depId + '&purUserId=' + purUserId
      })
    }




  },

  _userLogin() {
    console.log("whcicicloggongigng");
    load.showLoading("登录中");
    var that = this;
    wx.login({
      success: (res) => {
        indexJrdhUserLoginJj(res.code)
          .then((res) => {
            load.hideLoading();
            console.log("登录中登录中登录中登录中");
            console.log(res.result);
            this.setData({
              jrdhUserInfo: res.result.data.userInfo,
              sellerId: res.result.data.userInfo.nxJrdhUserId,
              supplierArr: res.result.data.arr,


            })
            var showIndex = wx.getStorageSync('showIndex');
            if (showIndex) {
              this.setData({
                showIndex: showIndex,
                supplierInfo: res.result.data.arr[showIndex],
                supplierId: res.result.data.arr[showIndex].nxJrdhSupplierId,
                gbDisInfo: res.result.data.arr[showIndex].gbDistributerEntity,
                gbDisId: res.result.data.arr[showIndex].gbDistributerEntity.gbDistributerId,

              })
            } else {
              this.setData({
                supplierInfo: res.result.data.arr[0],
                supplierId: res.result.data.arr[0].nxJrdhSupplierId,
                gbDisInfo: res.result.data.arr[0].gbDistributerEntity,
                gbDisId: res.result.data.arr[0].gbDistributerEntity.gbDistributerId,
                showIndex: 0,
              })
            }
            wx.setStorageSync('jrdhUserInfo', res.result.data.userInfo);
            this._getSupplerBillsGb();
          })
      }
    })
  },



  toSettleGb() {

    wx.navigateTo({
      url: '../settlePageGb/settlePageGb?supplierId=' + this.data.supplierId + '&disId=' + this.data.gbDisId,
    })

  },

  toSettle() {
    wx.navigateTo({
      url: '../../management/settlePage/settlePage?supplierId=' + this.data.supplierId + '&disId=' + this.data.nxDisId,
    })

  },

  //gb采购员打开供货商订单
  // toSupplierBillGb(e) {
  //   wx.navigateTo({
  //     url: '../supplierBills/supplierBills?supplierId=' + e.currentTarget.dataset.id + '&disId=' + this.data.gbDisInfo.gbDistributerId + '&sellUserId=' + e.currentTarget.dataset.userid,
  //   })
  // },


  // toGbDis() {
  //   wx.navigateTo({
  //     url: '../index/index?disId=' + this.data.gbDisInfo.gbDistributerId,
  //   })
  // },



  // toDis() {
  //   wx.navigateTo({
  //     url: '../txs/index/index?disId=' + this.data.nxDisInfo.nxDistributerId,
  //   })
  // },

  // toGbDis(e) {
  //   wx.navigateTo({
  //     url: '../index/index?disId=' + this.data.gbDisInfo.gbDistributerId,
  //   })
  // },


  // toSupplier(e) {
  //   var disId = e.currentTarget.dataset.dis.nxDistributerId;
  //   var name = e.currentTarget.dataset.dis.nxDistributerName;
  //   wx.navigateTo({
  //     url: '../txs/supplierBills/supplierBills?sellerId=' + this.data.sellerInfo.nxJrdhUserId + '&disId=' + disId + '&retName=' + name + '&supplierId=' + e.currentTarget.dataset.id,
  //   })
  // },

  // toSupplierGb(e) {
  //   var disId = e.currentTarget.dataset.dis.gbDistributerId;
  //   var name = e.currentTarget.dataset.dis.gbDistributerName;

  //   wx.navigateTo({
  //     url: '../supplierBills/supplierBills?sellUserId=' + this.data.sellerInfo.nxJrdhUserId + '&disId=' + disId + '&retName=' + name,
  //   })
  // },

  onShareAppMessage: function (options) {
    console.log('nxDisId=' + this.data.nxDisId + '&gbDisId=' + this.data.gbDisId + '&commId=' + this.data.commId + '&disName=' + this.data.disName + '&supplierId=' + options.target.dataset.id + '&buyerUserId=' + this.data.buyerInfo.nxJrdhUserId);
    return {
      title: "注册管理员", // 默认是小程序的名称(可以写slogan等)
      path: '/pages/jinriListWithLogin/jinriListWithLogin?nxDisId=' + this.data.nxDisId + '&gbDisId=' + this.data.gbDisId + '&commId=' + this.data.commId + '&disName=' + this.data.disName + '&supplierId=' + options.target.dataset.id + '&buyerUserId=' + this.data.buyerInfo.nxJrdhUserId,
      imageUrl: '',
    }
  },

  toStarsPage() {
    wx.navigateTo({
      url: '../jrdhGoodsStars/jrdhGoodsStars?id=' + this.data.supplierId + '&from=navigate',
    })
  },


  toEditUserGb() {
    wx.setStorageSync("jrdhUserInfo", this.data.jrdhUserInfo);
    this.toggleMenu();
    wx.navigateTo({
      url: '../depUserEdit/depUserEdit',
    })
  },


})