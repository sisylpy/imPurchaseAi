const globalData = getApp().globalData;
var load = require('../../../../lib/load.js');
var dateUtils = require('../../../../utils/dateUtil');
import apiUrl from '../../../../config.js'

import {
  disGetDayStockByGreatId,
  changeDepStockToAnotherDep
} from '../../../../lib/apiDistributerGb.js'


import {
  getDisGoodsBusiness,
  deleteReduceItem,
  changeStockStars,
  //produce
  saveDepProduceGoodsStock,
  //loss
  saveDepLossGoodsStock,
  reduceAttachmentSaveWithFile,
  //return
  saveDepReturnGoodsStock,
  //waste 
  saveDepWasteGoodsStock,
  reduceAttachmentSaveWithFileStar,
  delAttem,

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
     });


    // 检查是否有日期更新
    if(this.data.update){
      
      this._getInitData(); 
    
     }
   

  },

  data: {
    consultItem: {
      type: Object,
      value: ""
    },
    canSure: {
      type: Boolean,
      value: true
    },

    resWeight: {
      type: String,
      value: "0"
    },
    showType: {
      type: String,
      value: ""
    },
    resultTime: {
      type: String,
      value: ""
    },
    showStockArr: [],
    selectedStockIndex: -1 // 选中的库存批次索引
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {


    this.setData({
      url: apiUrl.server,
      disGoodsId: options.disGoodsId,
      name: options.name,
      standard: options.standard,
      value: options.value,
      today: dateUtils.getArriveDate(0),
      targetStockId: options.stockId, // 接收目标库存ID
      nowTime: dateUtils.getNowTime(),

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
    
    var userValue = wx.getStorageSync('userInfo');
    if (userValue) {
      this.setData({
        userInfo: userValue
      })
    }


    var disGoods = wx.getStorageSync('disGoods');
    if (disGoods) {
      this.setData({
        disGoods: disGoods
      })
    }

    var disInfo = wx.getStorageSync('disInfo');
    if (disInfo) {
      this.setData({
        disInfo: disInfo
      })
    }

    // 统一从缓存获取筛选数据
     this._getInitData();

  },

  _getInitData() {
    var data = {
      disGoodsId: this.data.disGoodsId,
      startDate: this.data.startDate,
      stopDate: this.data.stopDate,
    }
    load.showLoading("获取数据中")
    getDisGoodsBusiness(data)
      .then(res => {
        load.hideLoading();
        console.log(res);
        if (res.result.code == 0) {
          this.setData({
            stockArr: res.result.data,
            update: false,
          })
          
          // 如果有目标库存ID，自动滚动到对应位置
          if (this.data.targetStockId) {
            this._scrollToTargetStock();
          }

        } else {
          this.setData({
            stockArr: []
          })
        }
      })
  },

  // 自动滚动到目标库存批次
  _scrollToTargetStock() {
    const targetStockId = this.data.targetStockId;
    if (!targetStockId) return;
    
    console.log('🎯 开始滚动到目标库存批次:', targetStockId);
    
    // 延迟执行，确保DOM渲染完成
    setTimeout(() => {
      // 查找目标库存批次在数组中的索引
      const stockArr = this.data.stockArr;
      let targetIndex = -1;
      
      for (let i = 0; i < stockArr.length; i++) {
        if (stockArr[i].gbDepartmentGoodsStockId == targetStockId) {
          targetIndex = i;
          break;
        }
      }
      
      if (targetIndex === -1) {
        console.log('❌ 未找到目标库存批次:', targetStockId);
        return;
      }
      
      console.log('✅ 找到目标库存批次，索引:', targetIndex);
      
      // 设置选中状态
      this.setData({
        selectedStockIndex: targetIndex
      });
      
      // 使用选择器查询目标元素的位置
      const query = wx.createSelectorQuery();
      query.select(`#stock-item-${targetIndex}`).boundingClientRect();
      query.exec((res) => {
        if (res[0]) {
          const rect = res[0];
          // 修复滚动计算：使用 rect.top 减去导航栏高度和偏移量
          const scrollTop = Math.max(0, rect.top - this.data.navBarHeight - 20); // 20px 的偏移量
          
          console.log('📏 滚动参数:', {
            rect: rect,
            scrollTop: scrollTop,
            navBarHeight: this.data.navBarHeight
          });
          
          wx.pageScrollTo({
            scrollTop: scrollTop,
            duration: 500
          });
          
          console.log('🎯 滚动完成');
        } else {
          console.log('❌ 未找到目标元素');
        }
      });
    }, 300);
  },

  changeStar(e){
    var item = e.currentTarget.dataset.item;
    item.gbDistributerGoodsEntity = this.data.disGoods;

    this.setData({
      showStar: true,
      index: e.currentTarget.dataset.index,
      item: item,
      consultItem: JSON.parse(JSON.stringify(item)),
      canSure:false

    })
  },

  toDate(){
    wx.navigateTo({
      url: '../stockGoodsBusinessDate/stockGoodsBusinessDate?depGoodsId=' + this.data.depGoodsId,
    })
  }, 

  
  showStock(e){
      console.log("=== showStock 方法开始 ===");
      console.log("点击事件数据:", e.currentTarget.dataset.item);
      console.log("当前页面数据状态:", {
        showStock: this.data.showStock,
        disGoods: this.data.disGoods,
        disInfo: this.data.disInfo
      });
      
     var item = e.currentTarget.dataset.item;
     if (!item) {
       console.error("item 数据为空!");
       return;
     }
     
     item.gbDistributerGoodsEntity = this.data.disGoods;
     var depList = this.data.disInfo.mendianDepartmentList[0].gbDepartmentEntityList;
     console.log("部门列表长度:", depList.length);
     
     // 设置初始showType
     var initialShowType = (depList.length > 1) ? 6 : 1;
     console.log("初始showType:", initialShowType);
     
     // 处理废弃时间逻辑
     console.log("废弃时间检查:", item.gbDgsWasteFullTime);
     if (item.gbDgsWasteFullTime !== null && item.gbDgsWasteFullTime !== '') {
        var endTime = item.gbDgsWasteFullTime;
        var startTime = this.data.nowTime;
        var endTimeFormat = endTime.replace(/-/g, '/') //所有的- 都替换成/
        var endTimeDown = Date.parse(new Date(endTimeFormat));
        var startTimeFormat = startTime.replace(/-/g, '/') //所有的- 都替换成/
        var startTimeDown = Date.parse(new Date(startTimeFormat));
        var thisResult = Number(endTimeDown) - Number(startTimeDown);
        thisResult = Math.floor(thisResult / 1000 / 60 / 60);
        
        console.log("时间计算结果:", {
          endTime: endTime,
          startTime: startTime,
          thisResult: thisResult
        });
        
        if (thisResult < 0) { // 超过废弃时间
          var restWeight = item.gbDgsRestWeight;
          item.gbDgsMyWasteWeight = restWeight;
          item.gbDgsMyProduceWeight = "0";
          console.log("超过废弃时间，设置为废弃模式");
          this.setData({
            canWaste: true,
            canSure: true,
            showType: 4,
          })
        } else {
          item.gbDgsMyProduceWeight = item.gbDgsRestWeight;
          console.log("未超过废弃时间，设置为生产模式");
          this.setData({
            canWaste: false,
            resultTime: thisResult,
            canSure: true,
            showType: initialShowType
          })
        }
      } else {
        item.gbDgsMyProduceWeight = item.gbDgsRestWeight;
        console.log("无废弃时间，设置为生产模式");
        this.setData({
          canWaste: false,
          canSure: true,
          showType: initialShowType
        })
      }
  
      console.log("最终item数据:", {
        gbDgsRestWeight: item.gbDgsRestWeight,
        gbDgsMyProduceWeight: item.gbDgsMyProduceWeight,
        gbDgsMyWasteWeight: item.gbDgsMyWasteWeight
      });
      
      // 修复数据传递问题：使用stockItem而不是item
      console.log("设置弹窗显示数据...");
      item.gbDistributerGoodsEntity = this.data.disGoods;
      this.setData({
        showStock: true,
        stockItem: item,  // 修复：使用stockItem
        item: item,      // 保留item以防其他地方需要
        consultItem: JSON.parse(JSON.stringify(item)),
        depGoods: e.currentTarget.dataset.goods,
        depList: depList
      });
      
      console.log("弹窗数据设置完成，当前showStock状态:", this.data.showStock);
      console.log("=== showStock 方法结束 ===");
    },
    


    confirmStock(e) {
      var item = e.detail.item;
      var showType = e.detail.showType;
      console.log("showtypeoeoe", showType);
      if (this.data.transfer !== '1') {
        item.gbDgsReduceWeightUserId = this.data.userInfo.gbDepartmentUserId;
      }
      if (showType == 1) {
        load.showLoading("保存数据中")
        console.log(item);
        saveDepProduceGoodsStock(item)
          .then(res => {
            load.hideLoading();
            if (res.result.code == 0) {
             this._getInitData();
            }
          })
      } else if (showType == 2) {
        load.showLoading("保存数据中");
        this.setData({
          src: e.detail.src,
          reason: e.detail.reason,
        })
  
        saveDepLossGoodsStock(item)
          .then(res => {
            load.hideLoading();
            console.log(res.result.data);
            console.log("---==========")
            if (res.result.code == 0) {
              
              this._getInitData();
  
  
              var that = this;
              var src = that.data.src;
              var reason = that.data.reason;
              var id = res.result.data.gbDepartmentGoodsStockReduceId;
              console.log(src + reason + id);
              reduceAttachmentSaveWithFile(src, reason, id).then((res) => {
                console.log(res);
                if (res.result == '{"code":0}') {
                
                 
                } else {
                  load.hideLoading();
                  wx.showToast({
                    title: res.result.msg,
                    icon: 'none'
                  })
                }
  
              })
           
            }
          })
      } else if (showType == 3) {
        if (this.data.transfer !== '1') {
          item.gbDgsReturnUserId = this.data.userInfo.gbDepartmentUserId;
        }
        console.log(item);
        load.showLoading("保存数据中")
        saveDepReturnGoodsStock(item)
          .then(res => {
            load.hideLoading();
            console.log(res.result.data);
            if (res.result.code == 0) {
              this._getInitData();
            }else{
              wx.showToast({
                title: res.result.msg,
                icon: 'none'
              })
            }
          })
      } else if (showType == 4) {
        load.showLoading("保存数据中");
  
        console.log(item);
        saveDepWasteGoodsStock(item)
          .then(res => {
            load.hideLoading();
            if (res.result.code == 0) {
              this._getInitData();
            }
          })
  
      }else if(showType == 5){
        this.confirmStar(e);
      }else if(showType == 6){
        var data  = {
          stockId: this.data.item.gbDepartmentGoodsStockId,
          toDepId: e.detail.targetDepId,
        }
  
        changeDepStockToAnotherDep(data).then(res =>{
          if(res.result.code == 0){
            this._getInitData();
          }
        })
  
  
  
  
      }
    },

  
  confirmStar(e){
   
   var that = this;
    var src = e.detail.src;
    var reason = e.detail.reason;
    var id = this.data.item.gbDepartmentGoodsStockId;
    var userId = this.data.userInfo.gbDepartmentUserId;
    var stars = e.detail.item.gbDgsStars;
     load.showLoading("保存数据中")
     console.log("stars", stars)
    reduceAttachmentSaveWithFileStar(src, reason, id,stars, userId).then((res) => {
      console.log(res);
      load.hideLoading();
      console.log("resres", res.result)
      if (res.result == '{"code":0}') {
        that.setData({
          showStar: false
        })
        that._getInitData();
      } else {
        load.hideLoading();
        wx.showToast({
          title: res.result.msg,
          icon: 'none',
        });
      }
    })
  },


  delAttem(){
    
    delAttem(this.data.item.starReduce.gbDeGoodsStockReduceAttachmentEntity.gbDepartmentGoodsStockReduceAttachId).then(res => {
      if(res.result.code == 0){
        this.setData({
          showStar:false
        })
        this._getInitData();
      }
    })
  },


  confirmStar1(e){
    this.setData({
      src: e.detail.src,
      srcLarge: e.detail.srcLarge,
      reason: e.detail.reason,
      stars:  e.detail.item.gbDgsStars,
    })
    
    var data = {
      id: this.data.item.gbDepartmentGoodsStockId,
      stars: e.detail.item.gbDgsStars,
      userId: this.data.userInfo.gbDepartmentUserId
    }
    load.showLoading("修改新鲜度")
    changeStockStars(data).then(res => {
      if (res.result.code == 0) {
        load.hideLoading();
        var changeData = "stockArr[" + this.data.index + "].gbDgsStars"
        this.setData({
          showStock: false,
          [changeData]: e.detail.item.gbDgsStars
        })      
       
        var reason = that.data.reason;
        var id = this.data.item.gbDepartmentGoodsStockId;
        var stars = that.data.stars;
         load.showLoading("保存数据中")
        reduceAttachmentSaveWithFileStar(src, reason, id,stars).then((res) => {
          console.log(res);
          load.hideLoading();
          if (res.result.code == 0) {
            console.log("that",that);
            that._getInitData();
          } else {
            load.hideLoading();
            wx.showToast({
              title: res.result.msg,
              icon: 'none',
            });
          }
        }).catch((error) => {
          load.hideLoading();
          wx.showToast({
            title: '上传失败，请重试',
            icon: 'none',
          });
          console.error(error);
        });
      }
    });
  },

  updateStars(e) {
    console.log(e);
    var data = {
      id: this.data.item.gbDepartmentGoodsStockId,
      stars: e.detail.gbDgsStars,
    }
    changeStockStars(data).then(res => {
      if (res.result.code == 0) {
        this.setData({
          showStock: false,
          item: "",
        })
        this._getInitData();
      }
    })
  },











  deleteReduce(e) {

    console.log(e)
    var id = e.currentTarget.dataset.id;

    deleteReduceItem(id)
      .then(res => {
        load.hideLoading();
        if (res.result.code == 0) {
          var pages = getCurrentPages();
          var prevPagePre = pages[pages.length - 2];
          prevPagePre.setData({
            update: true
          })

          this._getInitData()
        }
      })

  },



  toDatePageSearch() {
   
    this.setData({
      update: true,
    })
    wx.navigateTo({
      url: '../../sel/searchDate/searchDate?startDate=' + this.data.startDate + '&stopDate=' + this.data.stopDate + '&dateType=' + this.data.dateType,
    })
  },

  toBack() {
    wx.navigateBack({
      delta: 1,
    })
  },

  onUnload() {
    
  }




})