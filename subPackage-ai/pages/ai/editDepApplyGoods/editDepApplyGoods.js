var app = getApp();

const globalData = getApp().globalData;
import apiUrl from '../../../../config.js'
var load = require('../../../../lib/load.js');


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
} from '../../../../lib/apiDepOrder'


let itemWidth = 0;

let windowWidth = 0;

Page({
  data:{
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


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    var disInfo = wx.getStorageSync('disInfo');
    if(disInfo){
      this.setData({
        disInfo: disInfo
      })
    }

  

    var value = wx.getStorageSync('applyItem');
    if (value) {
      this.setData({
        disId: value.gbDoDistributerId,
        applyItem: value,
        depId: value.gbDoDepartmentId,
        searchString:value.gbDoGoodsName,
        depFatherId: value.gbDoDepartmentFatherId
      })
    }

    this.setData({
      windowWidth: globalData.windowWidth * globalData.rpxR,
      windowHeight: globalData.windowHeight * globalData.rpxR,
      navBarHeight: globalData.navBarHeight * globalData.rpxR,
      url: apiUrl.server,
      from: options.from,
      orderPasteIndex: options.orderPasteIndex
    })

    
    this.clueOffsetSearch();
    this.getSearchString();
    

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
    var applyItem = this.data.applyItem;
    console.log(e.currentTarget.dataset);
    this.setData({
      placeHolder: this.data.searchString,
      index: e.currentTarget.dataset.index,
      itemDis: e.currentTarget.dataset.disgoods,
      nxGoods: e.currentTarget.dataset.nxgoods,
      depGoods: e.currentTarget.dataset.depgoods,
      canSave: true,

      applyStandardName: applyItem.gbDoStandard,
      itemDis: e.currentTarget.dataset.disgoods,
      searchString: this.data.placeHolder,
      applyNumber: applyItem.gbDoQuantity,
      applyRemark: applyItem.gbDoRemark,
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


  // 保存订货订单
  confirm: function (e) {
    this._saveOrder(e);

  },



  _saveOrder: function (e) {
  
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

  
    if (this.data.depGoods !== null) {
      depDisGoodsId = this.data.depGoods.gbDepartmentDisGoodsId;
      printStandard = this.data.depGoods.gbDdgPrintStandard;
    }
    
    var dg = {
      gbDoOrderUserId: this.data.applyItem.gbDoOrderUserId,
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
      gbDoIsAgent: 1,
      gbDoNxGoodsId: nxGoodsId,
      gbDoNxGoodsFatherId: nxGoodsFatherId,
      gbDoNxDistributerGoodsId: nxDisGoodsId,
      gbDoNxDistributerId: nxDisId,
      gbDoGoodsType: goodsType,
      gbDoOrderType: goodsType,
      gbDoDsStandardScale: -1,
      stockIsZero: e.detail.stockIsZero,
      gbDoPrintStandard: printStandard,
      gbDoGoodsName: this.data.applyItem.gbDoGoodsName,
    };
    console.log(dg);
    if (this.data.itemDis == null) {
      load.showLoading("保存订单");
      saveOrdersGbJjAndSaveGoods(dg).then(res => {
        load.hideLoading();
        if (res.result.code == 0) {
          load.hideLoading();
           this.setData({
            orderItem: res.result.data,
           })
          this._delApplyItem();

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
            orderItem: res.result.data,
           })
            this._delApplyItem();           
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
            orderItem: res.result.data,
           })
           this._delApplyItem();
         
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


  _delApplyItem(){
    var id = this.data.applyItem.gbDepartmentOrdersId;

    deleteOrderGb(id).then(res =>{
      if(res.result.code == 0){

        if(this.data.from == 'paste'){
          var index = this.data.orderPasteIndex;

          var pages = getCurrentPages();
          var prevPage = pages[pages.length - 2]; //上一个页面
          //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
          var data = "orderArr["+ index +"]"
          prevPage.setData({
            [data]: this.data.orderItem,
          })
        }

        wx.setStorageSync('needRefreshOrderData', true);
        wx.navigateBack({delta: 1});
      }
    })
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



  toAddGoods() {
    
    wx.navigateTo({
      url: '../disAddGoods/disAddGoods?goodsName=' + this.data.placeHolder,
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



  toBack() {
   
    wx.navigateBack({
      delta: 1,
    })
  },
  

   onUnload(){
    // wx.removeStorageSync('applyItem');
   },


  toAddGoods(e){
    console.log(e);
    this.setData({
      applyNumber: this.data.applyItem.gbDoQuantity,
      canSave: true,
      gbDoPrintStandard: this.data.applyItem.gbDoStandard,
    })
    wx.navigateTo({
      url: '../pasteAddGoods/pasteAddGoods?name=' + this.data.applyItem.gbDoGoodsName + 
      '&standard=' + this.data.applyItem.gbDoStandard ,
    })
  },

})