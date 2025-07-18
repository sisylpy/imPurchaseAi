var load = require('../../../../lib/load.js');
const globalData = getApp().globalData;

import {
  getEveryGoodsStockJingjing
} from '../../../../lib/apiDistributerGb.js'


Page({
  
  data: {
   
    tab1IndexDep: 0,
    itemIndexDep: 0,
    searchDepId: -1,
    leftWidthDep: 0,
    resultDepList: [],
    fatherNeme: ""

  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      windowWidth: globalData.windowWidth * globalData.rpxR,
      windowHeight: globalData.windowHeight * globalData.rpxR,
      navBarHeight: globalData.navBarHeight * globalData.rpxR,
      disGoodsFatherId: options.fatherId,
      dateDuring: options.dateDuring,
      fatherNeme: options.fatherName,
      dateDuring: options.dateDuring,
      color: options.color,
      total: options.fatherTotal,
      days:options.days,
      searchDepIds: options.searchDepIds,
    
    })
    
    this._getInitData();
  },

  _getInitData() {
    var data = {
      which: this.data.dateDuring,
      goodsGrandId: this.data.disGoodsFatherId,
      searchDepIds: this.data.searchDepIds,
      searchDepId: this.data.searchDepId,
    }
    load.showLoading("获取数据中");
    getEveryGoodsStockJingjing(data)
      .then(res => {
        load.hideLoading();
        console.log(res.result.data)
        if (res.result.code == 0) {
          this.setData({
            // resultDepList: res.result.data.depArr,
            total: res.result.data.total,
            dateString: res.result.data.dateString,
            arr: res.result.data.arr,            
          })
          // if(res.result.data.arr.length == 1){
          //   var searId = res.result.data.arr[0].dep.gbDepartmentId;
          //   this.setData({
          //     searchDepId: searId,
          //   })
          // }
        }else{
          this.setData({
            resultDepList: [],          
          })
        }
      })
  },


 /**
     * tabItme点击
     */
    onTab1ClickDepTypeOfFenxi(event) {
      let index = event.currentTarget.dataset.index;
      console.log(event.currentTarget.dataset)
      this.setData({
        tab1IndexDep: index,
        itemIndexDep: index,
      })
      if (index > 0) {
        this.setData({
          searchDepId: event.currentTarget.dataset.item.gbDepartmentId,
        })
      }else{
        this.setData({
          searchDepId: -1
        })
      }
      
      const depId = event.currentTarget.dataset.id === "-1" ? "dep_fixed" : `dep_${event.currentTarget.dataset.id}`;
      console.log("idididiidididii", depId);
      this.scrollToCenter(depId);

    },

    scrollToCenter(depId) {
      setTimeout(() => {
        const query = wx.createSelectorQuery();
  
        // 查询点击的元素和 scroll-view 容器的尺寸
        query.select(`#${depId}`).boundingClientRect();
        query.select('.nav_dep').boundingClientRect();
        query.select('.nav_dep').scrollOffset();
        query.exec((res) => {
          console.log("zahuishsisshisisisiisi", res)
          if (res[0] && res[1] && res[2]) {
            const item = res[0]; // 目标元素
            const container = res[1]; // scroll-view 容器
            const scrollOffset = res[2].scrollLeft; // 当前的 scrollLeft 值
  
            // 计算目标 scrollLeft，确保目标元素居中
            let scrollLeft = item.left + scrollOffset - (container.width / 2) + (item.width / 2);
  
            // 确保 scrollLeft 不超过最大值或小于 0
            const maxScrollLeft = container.scrollWidth - container.width;
            if (scrollLeft > maxScrollLeft) {
              scrollLeft = maxScrollLeft;
            }
            if (scrollLeft < 0) {
              scrollLeft = 0;
            }
  
            // 设置 scrollLeft
            this.setData({
              leftWidthDep: scrollLeft
            });
            console.log("diidnsxbegbuemsrlllll", this.data.tab1IndexDep, "lefc", this.data.leftWidthDep)
          } else {
            console.error(`元素不存在或未渲染: #${depId}`);
          }
        });
      }, 100); // 延时 100ms 执行查询，确保渲染完成
    },
  


    animationfinishDepType(event) {
      console.log("amddddepanimationfinishDepanimationfinishDepanimationfinishDepType",event)
      this.setData({
        tab1IndexDep: event.detail.current,
        itemIndexDep: event.detail.current,
      })
      console.log("thisdkadiifiaidftiememinss=====", this.data.itemIndexDep)
      if (event.detail.current > 0) {
        this.setData({
          searchDepId: this.data.resultDepList[event.detail.current - 1].gbDepartmentId,
        })
      }else{
        this.setData({
          searchDepId: -1
        })
      }
  
      var depId = "";
      if(this.data.tab1IndexDep == 0){
      depId = "dep_fixed";
      }else{
        depId = "dep_" + this.data.searchDepId;
      }
  
      console.log("idididiidididii", depId);
      this.scrollToCenter(depId);
       this._getInitData();
  
    },


  toStockList(e){
   wx.setStorageSync('disGoods', e.currentTarget.dataset.item);
    var detail =  e.currentTarget.dataset.detail;
    if(detail != null){
      this.setData({
        goodsDetail:detail
      })
    }else{
      this.setData({
        goodsDetail:""
      })
    }
    this.setData({
      goodsId: e.currentTarget.dataset.id,
      goodsName: e.currentTarget.dataset.name,
    })
    var id = "";
    if(this.data.tab1IndexDep == 0){
      id = this.data.searchDepIds;
    }else{
      id = this.data.searchDepId;
    }
   
    wx.navigateTo({
      url: '../stockList/stockList?disGoodsId=' + this.data.goodsId
       + '&dateDuring=' + this.data.dateDuring +'&name=' + this.data.goodsName+'&days=' + this.data.days + '&searchDepIds=' + id ,
       
    })
  },

  

  toBack() {
    wx.navigateBack({
      delta: 1,
    })
  },


 onUnload(){
  wx.removeStorageSync('disGoods');
  
}

})