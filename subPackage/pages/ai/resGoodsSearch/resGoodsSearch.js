var load = require('../../../../lib/load.js');

const globalData = getApp().globalData;
var dateUtils = require('../../../../utils/dateUtil');
// import apiUrl from '../../../../../config.js'
let windowWidth = 0;
let itemWidth = 0;
let heightArr = [0];
import {
  
  queryDepDisGoodsByQuickSearchGb,
  gbDisSaveStandard,
  saveNxStandard,
  gbDisDeleteStandard,
  saveGbOrderJj,
  saveOrdersGbJjAndSaveDepGoods,
  saveOrdersGbJjAndSaveGoods,
  updateOrderGbJj,
  deleteOrderGb,



} from '../../../../lib/apiDepOrder';


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


  data: {
    showIndNx: false,
    showInd: false,
    deleteShow: false,
    tab1IndexSearch: 0,
    itemIndexSearch: 0,
    sliderOffsetSearch: 0,
    sliderOffsetsSearch: [],
    sliderLeftSearch: 0,
    tabsSearch: [{
      id: 0,
      amount: 0,
      words: "我的商品"
    }, {
      id: 1,
      amount: 0,
      words: "商品目录"
    }],
    isSearching: true,
    searchResult: false,
    placeHolder: "输入商品名称或拼音字母、首字母",

    itemDis: "",
    depGoods: null,
    orderCount: 0,
    editApply: false,
    hasStock: false,
    applyNumber: "",
    applyRemark: "",
    applyStandardName: "",
    applySubtotal: "",
    windowWidth: "",
    windowHeight: "",
    applyNumber: "",
    url: "",
    nowTime: "",
    resultTime: "",
    showType: false,
    item: {},
    itemDis: "",
    nxGoods: {},


  },


  onLoad: function (options) {
    this.setData({
      url: apiUrl.server,
    })


    var userValue = wx.getStorageSync('userInfo');
    if(userValue){
      this.setData({
        userInfo: userValue
      })
    }

   var value = wx.getStorageSync('disInfo');
    if (value) {
      this.setData({
        disInfo: value,
        disId: value.gbDistributerId,
      })
    }
    var depValue = wx.getStorageSync('orderDepInfo');
    if (depValue) {
      this.setData({
        depInfo: depValue,
        depId: depValue.gbDepartmentId,
        disId: depValue.gbDepartmentDisId,
      })
      if (this.data.depInfo.gbDepartmentFatherId == 0) {
        this.setData({
          depFatherId: this.data.depInfo.gbDepartmentId,
        })
      } 
      else {
        this.setData({
          depFatherId: this.data.depInfo.gbDepartmentFatherId,
         
        })

      }
    }
    this.clueOffsetSearch();
  

  },

  
  showDialogBtn: function (e) {
    console.log("showoowdisbetn", e);
    this.setData({
      item: e.currentTarget.dataset.item,
      showInd: true,
      showIndNx: false,
      windowHeight: this.data.windowHeight,
      windowWidth: this.data.windowWidth
    })
  },

  showDialogBtnNx: function (e) {
    console.log("showoowdisbetn", e);
    this.setData({
      item: e.currentTarget.dataset.item,
      showIndNx: true,
      showInd: false,
      windowHeight: this.data.windowHeight,
      windowWidth: this.data.windowWidth
    })
  },


  /**
   * 隐藏模态对话框
   */

  hideModal: function () {
    this.setData({
      showModal: false
    });

  },

  /**
   * 对话框取消按钮点击事件
   */

  onCancel: function () {
    this.hideModal();
  },

  /**
   * 对话框确认按钮点击事件
   */

  onConfirm: function () {
    this.hideModal();

  },



  // !!!!!!!!!!!!!!!!!!!search--------------------------------------
  /**
   * 计算偏移量
   */
  clueOffsetSearch() {
    var that = this;

    wx.getSystemInfo({
      success: function (res) {
        itemWidth = Math.ceil(res.windowWidth / that.data.tabsSearch.length);
        let tempArr = [];
        for (let i in that.data.tabsSearch) {
          tempArr.push(itemWidth * i);
        }
        // tab 样式初始化
        windowWidth = res.windowWidth;
        that.setData({
          sliderOffsetsSearch: tempArr,
          sliderOffsetSearch: tempArr[that.data.tab1IndexSearch],
          sliderLeftSearch: globalData.windowWidth / 8 ,
         
        });
      }
    });
  },

  /**
   * tabItme点击
   */
  onTab1ClickSearch(event) {
    let index = event.currentTarget.dataset.index;
    this.setData({
      sliderOffsetSearch: this.data.sliderOffsetsSearch[index],
      tab1IndexSearch: index,
      itemIndexSearch: index,
      showOperation: false
    })
    this.clueOffsetSearch();
  },

  swiperChangeSearch(event) {
    this.setData({
      sliderOffsetSearch: this.data.sliderOffsetsSearch[event.detail.current],
      tab1IndexSearch: event.detail.current,
      itemIndexSearch: event.detail.current,
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



  // 
  applyGoodsDep(e) {
    var depGoods = e.currentTarget.dataset.depgoods;
    this.setData({
      index: e.currentTarget.dataset.index,
      itemDis: e.currentTarget.dataset.disgoods,
      depGoods: e.currentTarget.dataset.depgoods,
      show: true,
      applyStandardName: depGoods.gbDdgOrderStandard,
      applyRemark: depGoods.gbDdgOrderRemark,
      canSave: true,
      placeHolder: this.data.searchString,
    })
    if (e.currentTarget.dataset.depgoods.gbDepartmentGoodsStockEntities.length > 0) {
      console.log(e.currentTarget.dataset.depgoods.gbDepartmentGoodsStockEntities.length);
      this.setData({
        hasStock: true
      })
    } else {
      this.setData({
        hasStock: false
      })
    }

  },

  applyGoods(e) {
    console.log(e.currentTarget.dataset);
    this.setData({
      placeHolder: this.data.searchString,
      index: e.currentTarget.dataset.index,
      applySubtotal: "0.0元",
      itemDis: e.currentTarget.dataset.disgoods,
      nxGoods: e.currentTarget.dataset.nxgoods,
      depGoods: e.currentTarget.dataset.depgoods,
    })
    
    if (e.currentTarget.dataset.disgoods == null) {
      this.setData({
        showNx: true,      
        applyStandardName: e.currentTarget.dataset.nxgoods.nxGoodsStandardname,
      })
    } else {
      

      if(e.currentTarget.dataset.disgoods.gbDgPullOff  == 1){
        wx.showToast({
          title: '停止订货',
          icon: 'none'
        })
    
      }else{
        this.setData({
          show: true,
          applyStandardName: e.currentTarget.dataset.disgoods.gbDgGoodsStandardname,
          
        })
      }
    }

  },


  toEditApplyDep(e) {
    var applyItem = e.currentTarget.dataset.order;
    var itemStatus = applyItem.gbDoBuyStatus;
    if (itemStatus > 1) {
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
    } else {
      this.setData({
        grandIndex: e.currentTarget.dataset.grandindex,
        fatherIndex: e.currentTarget.dataset.fatherindex,
        index: e.currentTarget.dataset.index,
        applyItem: e.currentTarget.dataset.order,
        show: true,
        applyStandardName: applyItem.gbDoStandard,
        itemDis: e.currentTarget.dataset.disgoods,
        editApply: true,
        searchString: this.data.placeHolder,
        applyNumber: applyItem.gbDoQuantity,
        applyRemark: applyItem.gbDoRemark,
        depgoods: e.currentTarget.dataset.depgoods,
      })


    }
  },


  toEditApply(e) {
    
    console.log("contoEditApplytoEditApply")
    var applyItem = e.currentTarget.dataset.order;
    var itemStatus = applyItem.gbDoBuyStatus;
    if (itemStatus > 1) {
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
    } else {
      this.setData({
        placeHolder: this.data.searchString,
        applyItem: e.currentTarget.dataset.order,
        show: true,
        applyStandardName: applyItem.gbDoStandard,
        itemDis: e.currentTarget.dataset.disgoods,
        editApply: true,
        applyNumber: applyItem.gbDoQuantity,
        applyRemark: applyItem.gbDoRemark,
        index: e.currentTarget.dataset.index,
 
      })

      if (this.data.applyItem.gbDoSubtotal !== null) {
     
        this.setData({
          applySubtotal: applyItem.gbDoSubtotal + "元"
        })

      }

    }
  },


  // 保存订货订单
  confirm: function (e) {
    if (this.data.editApply) {
      this._updateDisOrder(e);
    } else {
      this._saveOrder(e);
    }

  var ordercount = this.data.orderCount;
    this.setData({
      show: false,
      editApply: false,
      applyItem: "",
      itemDis: "",
      applyNumber: "",
      applyStandardName: "",
      orderCount: ordercount + 1
    })
    console.log("this.daordocudnnd", this.data.orderCount)
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


  _saveOrder: function (e) {
     var that = this;
    var arriveDate = dateUtils.getArriveDate(0);
    var arriveOnlyDate = dateUtils.getArriveOnlyDate(0);
    var weekYear = dateUtils.getArriveWeeksYear(0);
    var week = dateUtils.getArriveWhatDay(0);
    var depDisGoodsId = -1;
    var gbDisGoodsId = -1;
    var gbDisGoodsFatherId = -1;
    var nxGoodsId = "";
    var nxGoodsFatherId = "";
    var nxDisId = -1;
    var nxDisGoodsId = -1;
    var price = null;
    var weight = null;
    var subtotal = null;
    var goodsType = "";
    var toDepId = "";
    var printStandard = "";

    if (this.data.itemDis !== null) {
      gbDisGoodsId = this.data.itemDis.gbDistributerGoodsId;
      gbDisGoodsFatherId = this.data.itemDis.gbDgDfgGoodsFatherId;
      nxGoodsId = this.data.itemDis.gbDgNxGoodsId;
      nxGoodsFatherId = this.data.itemDis.gbDgNxFatherId;
      nxDisId = this.data.itemDis.gbDgNxDistributerId;
      nxDisGoodsId = this.data.itemDis.gbDgNxDistributerGoodsId;
      goodsType = this.data.itemDis.gbDgGoodsType;
      toDepId = this.data.itemDis.gbDgGbDepartmentId;
      //是否给weight赋值
      if (e.detail.applyStandardName == this.data.itemDis.nxGoodsStandardname) {
        weight = e.detail.applyNumber;
      }
    }else{
      nxGoodsId = this.data.nxGoods.nxGoodsId;
      nxGoodsFatherId = this.data.nxGoods.nxGoodsFatherId;
      goodsType = 2;
      toDepId = this.data.disInfo.purDepartmentList[0].gbDepartmentId;
      printStandard = this.data.nxGoods.nxGoodsStandardname;

    }

    var userId = "";
    if (this.data.userInfo !== null) {
      userId = this.data.userInfo.gbDepartmentUserId;
    }
   
    if (this.data.depGoods !== null) {
      depDisGoodsId = this.data.depGoods.gbDepartmentDisGoodsId;
      printStandard = this.data.depGoods.gbDdgPrintStandard;
    }
    
    var dg = {
      gbDoOrderUserId: userId,
      gbDoDepDisGoodsId: depDisGoodsId, //
      gbDoDisGoodsId: gbDisGoodsId, //
      gbDoDisGoodsFatherId: gbDisGoodsFatherId,
      gbDoDepartmentId: this.data.depId,
      gbDoToDepartmentId: toDepId,
      gbDoDistributerId: this.data.disId,
      gbDoDepartmentFatherId: this.data.depFatherId,
      gbDoQuantity: e.detail.applyNumber,
      gbDoPrice: price,
      gbDoWeight: weight,
      gbDoSubtotal: subtotal,
      gbDoStandard: e.detail.applyStandardName,
      gbDoRemark: e.detail.applyRemark,
      gbDoIsAgent: 5,
      gbDoArriveDate: arriveDate,
      gbDoArriveWeeksYear: weekYear,
      gbDoArriveOnlyDate: arriveOnlyDate,
      gbDoArriveWhatDay: week,
      gbDoNxGoodsId: nxGoodsId,
      gbDoNxGoodsFatherId: nxGoodsFatherId,
      gbDoNxDistributerGoodsId: nxDisGoodsId,
      gbDoNxDistributerId: nxDisId,
      gbDoGoodsType: goodsType,
      gbDoOrderType: goodsType,
      gbDoDsStandardScale: -1,
      stockIsZero: e.detail.stockIsZero,
      gbDoPrintStandard: printStandard,
    };
    console.log(dg);
    if (this.data.itemDis == null) {
      load.showLoading("保存订单");
      saveOrdersGbJjAndSaveGoods(dg).then(res => {
        load.hideLoading();
        if (res.result.code == 0) {
        
            this.setData({
              
              showNx: false
            })
            that.getSearchStringPlaceHolder();
          
        } else {
          wx.showToast({
            title: '订单保存失败',
            icon: 'none'
          })
        }
      })
    } else {
      if(this.data.depGoods == null){
        load.showLoading("保存订单");
        saveOrdersGbJjAndSaveDepGoods(dg).then(res => {
          if (res.result.code == 0) {
           load.hideLoading();
            
              this.setData({
                searchString: "",
                showNx: false
              })
              that.getSearchStringPlaceHolder();
            
          } else {
            wx.showToast({
              title: '订单保存失败',
              icon: 'none'
            })
          }
        })
      }else{
        load.showLoading("保存订单");
        saveGbOrderJj(dg).then(res => {
          if (res.result.code == 0) {
           load.hideLoading();
            this.setData({
              searchString: "",
              showNx: false
            })
            that.getSearchStringPlaceHolder();
         
          } else {
            wx.showToast({
              title: '订单保存失败',
              icon: 'none'
            })
          }
        })
      }
      
    }

  },


  cancle() {
    console.log("_cancle_cancle")
    this.setData({
      show: false,
      showNx: false,
      applyStandardName: "",
      item: null,
      editApply: false,
      applyNumber: "",
      applyRemark: "",
      applySubtotal: "",
      itemDis: null,
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

    var that = this;

    updateOrderGbJj(dg).then(res => {
      load.showLoading("修改订单")
      if (res.result.code == 0) {
        load.hideLoading();
        that.setData({
          isSearching: true,
          canSave: false,
          searchResult: false,
         
        })
        that.getSearchStringPlaceHolder();
      } else {
        load.hideLoading();
        wx.showToast({
          title: res.result.msg,
          icon: "none"
        })
      }
    })
  },


  toAddGoods() {
    
    wx.navigateTo({
      url: '../disAddGoods/disAddGoods?goodsName=' + this.data.placeHolder,
    })

  },




  confirmStandardNx(e) {
    console.log(e);
    console.log("confirmStandardconfirmStandardconfirmStandard")
    var data = {
      nxSGoodsId: this.data.nxGoods.nxGoodsId,
      nxStandardName: e.detail.newStandardName,
    }
    saveNxStandard(data).
    then(res => {
      if (res.result.code == 0) {
        var standardArr = this.data.nxGoods.nxGoodsStandardEntities;
        standardArr.push(res.result.data);
        console.log(res.result.data)
        var standards = "nxGoods.nxGoodsStandardEntities"
        this.setData({
          [standards]: standardArr,
          applyStandardName: res.result.data.nxStandardName,
        })
      } else {
        wx.showToast({
          title: res.result.msg,
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
    gbDisSaveStandard(data).
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

  /**
   * 删除订货
   */
  delApply() {
    this.setData({
      deleteShow: true,
      showOperation: true,
      show: false,
      placeHolder: this.data.searchString,
    })
  },




  delSearch() {
    console.log("delSearchdelSearch")
    var str = this.data.searchString;
    if (str.length > 0) {
      this.setData({
        searchString: str.slice(0, -1),

      })
      this.getSearchString()
    }

  },


  searchApplyDisGoods(e) {
    var pullOff = e.currentTarget.dataset.pulloff;
    if (pullOff == 1) {
      wx.showToast({
        title: '暂时不能订货',
        icon: 'none'
      })
    } else {
      this.setData({
        show: true,
        index: e.currentTarget.dataset.index,
        itemDis: e.currentTarget.dataset.item,
        applyStandardName: e.currentTarget.dataset.item.gbDgGoodsStandardname,
      })
      if (this.data.tab1IndexSearch == 0) {
        this.setData({
          depGoods: e.currentTarget.dataset.depgoods,
        })
      } else {
        this.setData({
          depGoods: e.currentTarget.dataset.item.departmentDisGoodsEntity,
        })
      }
    }
  },


  getString(e){
    console.log("searchindindidnid");
   
      var string = e.detail.value;
      string = string.replace(/\s*/g, "");
      if(string.length > 0){
        this.setData({
          searchString: string
        })
      }else{
        this.setData({
          searchString: ""
        })
      }

  },

  getSearchString(e) {
   

    if (this.data.searchString.length > 0) {
      this.setData({
        placeHolder: this.data.searchString,
       
      })
      var data = {
        disId: this.data.disId,
        searchStr: this.data.searchString,
        depId: this.data.depId
      }
      load.showLoading("搜索商品中...")
      queryDepDisGoodsByQuickSearchGb(data).then(res => {
        if (res.result.code == 0) {
          console.log(res.result.data);
          load.hideLoading();
      
          var depTabCount = "tabsSearch[0].amount";
          var disTabCount = "tabsSearch[1].amount";
          var depGoodsLength = res.result.data.dep.length;

          this.setData({
            disSearchArr: res.result.data.dis,
            depSearchArr: res.result.data.dep,
            searchResult: true,
            [depTabCount]: res.result.data.dep.length,
            [disTabCount]: res.result.data.dis.length,
          })
         if(depGoodsLength == 0){
           this.setData({
             tab1IndexSearch: 1,
             itemIndexSearch: 1
           })
         }else{
          this.setData({
            tab1IndexSearch: 0,
            itemIndexSearch: 0
          })
         }
          
        } else {
          load.hideLoading();
          wx.showToast({
            title: res.result.msg,
            icon: "none"
          })

        }
      })
    } else {
     
      load.hideLoading();
      var resCom = "tabsSearch[1].amount";
      var res = "tabsSearch[0].amount";
      that.setData({
        disSearchArr: [],
        depSearchArr: [],
        [resCom]: "0",
        [res]: "0",
        searchResult: false,
        searchString: ""
      })
    }
  },



  confirmWarn() {
    if (this.data.popupType == 'deleteSpec') {
      this.deleteStandardApi()
    } else {
      this.deleteApplyApi()
    }
  },


  delStandard(e) {
    this.setData({
      warnContent: e.detail.standardName,
      show: false,
      popupType: 'deleteSpec',
      showPopupWarn: true,
      disStandardId: e.detail.id,
    })

  },


  deleteApplyApi() {

    this.setData({
      popupType: "",
      showPopupWarn: false,
    })

    var that = this;
    deleteOrderGb(this.data.applyItem.gbDepartmentOrdersId).then(res => {
      if (res.result.code == 0) {
        if (that.data.tab1Index == 0) {
          var data = "depGoodsArr[" + this.data.grandIndex + "].fatherGoodsEntities[" + this.data.fatherIndex + "].gbDepartmentDisGoodsEntities["+ this.data.index +"].gbDepartmentOrdersEntity";
            console.log("iinex" , this.data.depGoodsArr[this.data.grandIndex].fatherGoodsEntities[ this.data.fatherIndex].gbDepartmentDisGoodsEntities[this.data.index]);
            console.log("whaissisiisisiisisis")
            this.setData({
              [data]: null
            })
        }
        if (that.data.tab1Index == 1) {
          var data1 = "goodsList[" + this.data.index + "].gbDepartmentOrdersEntity";
          this.setData({
            [data1]: null
          })
        }
        that._cancle()

      }
    })
  },

  deleteStandardApi() {
   
    gbDisDeleteStandard(this.data.disStandardId).then(res => {
      if (res.result.code == 0) {
        if(this.data.tab1Index == 0){
          var dataGoods = "depGoodsArr[" + this.data.grandIndex + "].fatherGoodsEntities[" + this.data.fatherIndex + "].gbDepartmentDisGoodsEntities["+ this.data.index +"].gbDistributerGoodsEntity";
          this.setData({
            [dataGoods]: res.result.data,
          })
        }
      
        this.setData({
          popupType: "",
          showPopupWarn: false,
          disStandardId: "",
          itemDis: "",
          item: "",
          editApply: false,
          show: false,
        })
        
      } else {
        wx.showToast({
          title: res.result.msg,
          icon: 'none'
        })
      }
    })
  },




  deleteYes() {
    this.setData({
      deleteShow: false,
    })
    var that = this;
    deleteOrderGb(this.data.applyItem.gbDepartmentOrdersId).then(res => {
      if (res.result.code == 0) {
           this.setData({
             searchString: "",
             applyNumber: "",
             applyStandardName: "",
             applyItem: "",
             editApply: false,
             isSearching: true,
           })
          that.getSearchStringPlaceHolder();

      }
    })
  },

  deleteNo() {
    this.setData({
      applyItem: "",
      deleteShow: false,
    })
  },


  /**
   * 修改配送商品申请
   */
  editApply() {
    var applyItem = this.data.applyItem;
    this.setData({
      show: true,
      applyStandardName: applyItem.gbDoStandard,
      itemDis: this.data.applyItem.gbDistributerGoodsEntity,
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


  _cancle() {
    this.setData({
      show: false,
      applyStandardName: "",
      itemDis: "",
      editApply: false,
      applyNumber: "",
      applyRemark: "",
      applySubtotal: ""
    })
  },

  // no use


  getSearchStringPlaceHolder() {

    var that = this;
    console.log("hpalslhdolddller");
    console.log(that.data.placeHolder.length);
    if (that.data.placeHolder.length > 0 ) {

      var data = {
        disId: this.data.disId,
        searchStr: this.data.placeHolder,
        depId: this.data.depId
      }
      load.showLoading("搜索商品中...")
      queryDepDisGoodsByQuickSearchGb(data).then(res => {
        if (res.result.code == 0) {
          load.hideLoading();
          var depTabCount = "tabsSearch[0].amount";
          var disTabCount = "tabsSearch[1].amount";
          var depGoodsLength = res.result.data.dep.length;

          this.setData({
            disSearchArr: res.result.data.dis,
            depSearchArr: res.result.data.dep,
            searchResult: true,
            isSearching: true,
            [depTabCount]: res.result.data.dep.length,
            [disTabCount]: res.result.data.dis.length,
            searchString: "",
            placeHolder: this.data.searchString,
          })
         if(depGoodsLength == 0){
           this.setData({
             tab1IndexSearch: 1,
             itemIndexSearch: 1
           })
         }else{
          this.setData({
            tab1IndexSearch: 0,
            itemIndexSearch: 0
          })
         }
        } else {
          load.hideLoading();
          wx.showToast({
            title: res.result.msg,
            icon: "none"
          })

        }
      })
    } else {
      var resCom = "tabsSearch[1].amount";
      var res = "tabsSearch[0].amount";
      that.setData({
        [resCom]: 0,
        [res]: 0,
        depSearchArr: [],
        disSearchArr: [],
        searchResult: false,
        isSearching: true,

      })

    }
  },



  hideMask() {
    this.setData({
      showOperation: false,
    })
  },


  toBack() {
    wx.navigateBack({
      delta: 1
    })
  },

  onUnload(){
    if(this.data.orderCount > 0){
      var pages = getCurrentPages();
      var prevPage = pages[pages.length - 2]; //上一个页面
      //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
      prevPage.setData({
        update: true
      })
    }
  }

})
