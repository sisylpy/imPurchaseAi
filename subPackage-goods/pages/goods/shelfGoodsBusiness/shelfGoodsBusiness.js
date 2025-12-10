const globalData = getApp().globalData;
var load = require('../../../../lib/load.js');
var dateUtils = require('../../../../utils/dateUtil');

import {
  getDisGoodsOutEveryDay,
  getDisGoodsOrderDayJingjinig,
  getDisGoodsPurListJingjing,
  getDisGoodsBusinessTypeJj,
  getDisGoodsStock,
  getWhichDayReduce

} from '../../../../lib/apiDepOrder'

let windowWidth = 0;
let itemWidth = 0;

Page({

  onShow(){
    if(this.data.update || this.data.updateSearch){
      var myDate = wx.getStorageSync('myDate');
      if(myDate){
        this.setData({
          startDate: myDate.startDate,
          stopDate: myDate.stopDate,
          dateType: myDate.dateType,
        })
      }
      if(this.data.showType == 1){
        this._initData();
      }
      else if(this.data.showType == 2){
        this._initDataPur()
      }
      else if(this.data.showType == 3){
        this._initDataThree()
      }
      else if(this.data.showType == 4){
        this._initDataStock()
      }
    }

    // 检查是否有供货商筛选更新
    var selectedSupplier = wx.getStorageSync('selectedSupplier');
    if (selectedSupplier) {
      console.log("供货商筛选更新:", selectedSupplier);
      this.setData({
        supplierIds: selectedSupplier.supplierIds || -1,
        selectedSupplierNames: selectedSupplier.supplierNames || ""
      });
     
      // 重新获取数据
      this._refreshData();
    }

   // 检查是否有采购员筛选更新
   var selectedPurUser = wx.getStorageSync('selectedPurUser');
   if (selectedPurUser) {
     console.log("采购员筛选更新:", selectedPurUser);
     this.setData({
       purUserIds: selectedPurUser.purUserIds || -1,
       selectedPurUserNames: selectedPurUser.purUserName || ""
     });
     // 直接更新图表，不需要重新请求接口
     this._refreshData();

   }
 // 检查是否有采购员筛选更新
 var searchGoods = wx.getStorageSync('searchGoods');
 if (searchGoods) {
   console.log("采购员筛选更新:", selectedPurUser);
   this.setData({
    searchGoods: searchGoods
   });
  
 }

  },

  /**
   * 页面的初始数据
   */
  data: {

    items: [
      {
        name: '1',
        value: '订货',
      },
        {
        name: '2',
        value: '采购',
      }
      , {
        name: '3',
        value: '成本',
      },
      {
        name: '4',
        value: '库存',
      }
      
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {


    this.setData({
      windowWidth: globalData.windowWidth * globalData.rpxR,
      windowHeight: globalData.windowHeight * globalData.rpxR,
      navBarHeight: globalData.navBarHeight * globalData.rpxR,
      disGoodsId: options.disGoodsId,
      nxDisId: options.nxDisId,
      name: options.name,
      showType: options.type,
      update: false,
      searchDepIds: -1,
      supplierIds: options.supplierId || -1, // 供货商ID，如果传入了供货商ID，则设置为选中的供货商
      selectedSupplierNames: options.supplierName || "", // 选中的供货商名称
      purchaseUserIds: -1, // 采购员ID
      selectedPurchaseUserNames: "", // 选中的采购员名称
      startDate: dateUtils.getFirstDateInMonth(),
      stopDate: dateUtils.getArriveDate(0),
      dateType: "month",
      
    })

    var disGoods = wx.getStorageSync('disGoods');
    if (disGoods){
        this.setData({
          disGoods: disGoods,
          standard: disGoods.gbDgGoodsStandardname,
          disId: disGoods.gbDgDistributerId,
        })
    }
   
    
    if(this.data.showType == 1){
      this._initData();
    }
    else if(this.data.showType == 2){
      this._initDataPur()
    }
    else if(this.data.showType == 3){
      this._initDataThree()
    }
    else if(this.data.showType == 4){
      this._initDataStock()
    }

  },

  _initData() {
   
    var data = {
      disGoodsId: this.data.disGoodsId,
      startDate: this.data.startDate,
      stopDate: this.data.stopDate,
      depId: -1,
      searchDepIds: this.data.searchDepIds
    }
    load.showLoading("获取数据中")
    getDisGoodsOrderDayJingjinig(data)
      .then(res => {
        if (res.result.code == 0) {
          load.hideLoading();
          console.log(res.result.data);
          this.setData({
            businessArr: res.result.data,
          })
        } else {
          load.hideLoading();
          this.setData({
            businessArr: []
          })
          // wx.showToast({
          //   title: res.result.msg,
          //   icon: 'none'
          // })
        }

      })
  },



  radioChange(e) {
    var type = e.detail.value;
    this.setData({
      showType: type,
    })
    if(this.data.showType == 1 ){
      this._initData();
    }
   else if(this.data.showType == 2) {
    this._initDataPur();

   }else if(this.data.showType == 3){
    this._initDataThree();
   }
   else if(this.data.showType == 4){
    this._initDataStock();
   }
  },

  _initDataPur(){
    var data ={
      disGoodsId : this.data.disGoodsId,
      startDate: this.data.startDate,
      stopDate: this.data.stopDate,
      depId: -1,
      supplierIds: this.data.supplierIds, // 添加供货商ID参数
    }
    load.showLoading("获取数据中")
    getDisGoodsPurListJingjing(data)
     .then(res =>{
       if(res.result.code == 0){
         load.hideLoading()
         console.log("reespurlr", res.result.data);
         this.setData({
           item: res.result.data,
           businessArr: res.result.data.arr,
           supplierList: res.result.data.supplierList,
         })
       } else{
         load.hideLoading();
         this.setData({
          businessArr: []
        })
       }
  
     })
  },
  _initDataThree1(){
    console.log("this.atdad.sdearciid" + this.data.searchDepIds)
   var data ={
    disGoodsId : this.data.disGoodsId,
    startDate: this.data.startDate,
    stopDate: this.data.stopDate,
    disId: this.data.disId,
    searchDepIds: this.data.searchDepIds

  }
  load.showLoading("获取数据中")
   getDisGoodsBusinessTypeJj(data)
   .then(res =>{
     if(res.result.code == 0){
       load.hideLoading()
       this.setData({
        businessArr: res.result.data,
       })
     } else{
       load.hideLoading();
       this.setData({
        businessArr: []
      })
     }

   })
   },


   _initDataThree() {
    
    var data = {
      disGoodsId: this.data.disGoodsId,
      startDate: this.data.startDate,
      stopDate: this.data.stopDate,
      searchDepIds: this.data.searchDepIds,
      type: 0,

    }
    load.showLoading("获取数据中")
    getWhichDayReduce(data)
      .then(res => {
        load.hideLoading();
        console.log(res)
        console.log("abc")
        if (res.result.code == 0) {
          this.setData({
            arr: res.result.data.arr,
            total: res.result.data.total,
            totalWeight: res.result.data.totalWeight,
            produce: res.result.data.produce,
            produceWeight: res.result.data.produceWeight,
            waste: res.result.data.waste,
            wasteWeight: res.result.data.wasteWeight,
            loss: res.result.data.loss,
            lossWeight: res.result.data.lossWeight,

          })
         


        }else{
        
          this.setData({
            businessArr: []
          })
        }

      })
  },

 

   _initDataStock(){
     load.showLoading("获取数据中")

    getDisGoodsStock(this.data.disGoodsId).then(res => {
      if(res.result.code == 0){
        load.hideLoading();
        this.setData({
          businessArr: res.result.data
        })
      }else{
        wx.showToast({
          title: res.result.msg,
          icon: 'none'
        })
      }
    })
   },


  
toFilter() {
  wx.setStorageSync('supplierList', this.data.supplierList);
  wx.navigateTo({
    url: '../../sel/filterData/filterData',
  })
},

delSearch(){
  wx.removeStorageSync('selDepList');;
  this.setData({
    searchDepIds: -1,
    searchDepName : "",
    
  })
  if(this.data.showType == 1){
    this._initData();
  }
  else if(this.data.showType == 2){
    this._initDataPur()
  }
  else if(this.data.showType == 3){
    this._initDataThree()
  }
  else if(this.data.showType == 4){
    this._initDataStock()
  }
},

// 删除供货商选择
delSupplierSearch() {
  this.setData({
    supplierIds: -1,
    selectedSupplierNames: ""
  });
  this._refreshData();
},

// 删除采购员选择
delPurchaseUserSearch() {
  this.setData({
    purchaseUserIds: -1,
    selectedPurchaseUserNames: ""
  });
  this._refreshData();
},

// 刷新数据
_refreshData() {
  if(this.data.showType == 1){
    this._initData();
  }
  else if(this.data.showType == 2){
    this._initDataPur()
  }
  else if(this.data.showType == 3){
    this._initDataThree()
  }
  else if(this.data.showType == 4){
    this._initDataStock()
  }
},


toDatePage() {
  this.setData({
    update: true
  })
  wx.navigateTo({
    url: '../../sel/date/date?startDate=' + this.data.startDate +
      '&stopDate=' + this.data.stopDate + '&dateType=' + this.data.dateType,
  })
},


  toBack() {
    wx.navigateBack({
      delta: 1,
    })
  },

  onUnload() {
    
     // 清除缓存
     wx.removeStorageSync('searchGoods');
     wx.removeStorageSync('selectedSupplier');
     wx.removeStorageSync('selectedPurUser');
  }


})