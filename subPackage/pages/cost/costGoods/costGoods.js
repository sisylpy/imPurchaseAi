
var load = require('../../../../lib/load.js');
const globalData = getApp().globalData;
import * as echarts from '../../../../ec-canvas/echarts';
let itemWidth = 0;
let windowWidth = 0;
var dateUtils = require('../../../../utils/dateUtil');

import {
  getGoodsCharts,
} from '../../../../lib/apiDistributer'

var monthlyData=[];
var monthlyValue = []

Page({

  onShow(){

    // 推荐直接用新API
    let windowInfo = wx.getWindowInfo();
    let globalData = getApp().globalData;
    this.setData({
      windowWidth: windowInfo.windowWidth * globalData.rpxR,
      windowHeight: windowInfo.windowHeight * globalData.rpxR,
      navBarHeight: globalData.navBarHeight * globalData.rpxR,
    });


    monthlyData = [];
    if(this.data.update){
      var myDate = wx.getStorageSync('myDate');
      if (myDate) {
        this.setData({
          startDate: myDate.startDate,
          stopDate: myDate.stopDate,
          dateType: myDate.dateType,
        })
      }
      this._initData();
    }
   


  },

  /**
   * 页面的初始数据
   */
  data: {
    eca: {
      // onInit: initChart
      lazyLoad: true // 延迟加载

    },
    ecs: {
      // onInit: initChart
      lazyLoad: true // 延迟加载

    },
    ecl: {
      // onInit: initChart
      lazyLoad: true // 延迟加载

    },
    ecw: {
      // onInit: initChartsubPackage/pages/data/echartsPage/fenxiPage/fenxiPage
      lazyLoad: true // 延迟加载

    },
    tabs: ["1","日采", "周采", "月采"],
    sliderOffsets: [],
    searchDepId: -1,
    itemIndexDep: 0,
    tab1IndexDep: 0,

   
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    this.setData({
      disGoodsId: options.disGoodsId,
      name: options.name,
      detail : options.detail,
      dateType: options.dateType,
      type: options.type,
      fenxiType: options.fenxiType,
      searchDepIds: options.searchDepIds,
       disGoodsId: options.disGoodsId,
       nxDisId: options.nxDisId,
       name: options.name,
       startDate: options.startDate,
       stopDate: options.stopDate,
    })

    if(options.searchDepIds == -1){
      console.log("------")
       this._getSearchDepIds();
      }else{
        console.log("------0000000",options.searchDepIds.length)
        if(options.searchDepIds.length > 1){
          var tempArr = options.searchDepIds.split(",");
          this.setData({
            searchDepIdsArr: tempArr
          })
        }else{
          this.setData({
            searchDepIdsArr: [options.searchDepIds]
          })
        }
      
       
      }
    if(this.data.fenxiType == 'weightEcharts'){
      if(this.data.type =='cost'){
        this.setData({
          tab1Index: 0,
          itemIndex: 0,
        })
      }
      if(this.data.type =='sales'){
        this.setData({
          tab1Index: 1,
          itemIndex: 1,
        })
      }
      if(this.data.type =='loss'){
        this.setData({
          tab1Index: 2,
          itemIndex: 2,
        })
      }
      if(this.data.type =='waste'){
        this.setData({
          tab1Index: 3,
          itemIndex: 3,
        })
      }
    }

    if(this.data.fenxiType == 'profitEcharts'){
      if(this.data.type =='profit'){
        this.setData({
          tab1Index: 0,
          itemIndex: 0,
        })
      }
      if(this.data.type =='sales'){
        this.setData({
          tab1Index: 1,
          itemIndex: 1,
        })
      }
      if(this.data.type =='loss'){
        this.setData({
          tab1Index: 2,
          itemIndex: 2,
        })
      }
      if(this.data.type =='waste'){
        this.setData({
          tab1Index: 3,
          itemIndex: 3,
        })
      }
    }

    if(this.data.fenxiType == 'costEcharts'){
      if(this.data.type =='total'){
        this.setData({
          tab1Index: 0,
          itemIndex: 0,
        })
      }
      if(this.data.type =='sales'){
        this.setData({
          tab1Index: 1,
          itemIndex: 1,
        })
      }
      if(this.data.type =='loss'){
        this.setData({
          tab1Index: 2,
          itemIndex: 2,
        })
      }
      if(this.data.type =='waste'){
        this.setData({
          tab1Index: 3,
          itemIndex: 3,
        })
      }
    }
    
    this.clueOffset();

    this._initData();


  },





//
_getSearchDepIds() {
  console.log("_getSearchDepIds_getSearchDepIds");
  var allArr = [];
  var searchMendianDeps = wx.getStorageSync('selMendianDepList');
  if (searchMendianDeps) {
    allArr = allArr.concat(searchMendianDeps);
  }
  var searchStockDeps = wx.getStorageSync('selStockDepList');
  if (searchStockDeps) {
    allArr = allArr.concat(searchStockDeps);
  }

  var selDepKitchenList = wx.getStorageSync('selKitchenDepList');
  if (selDepKitchenList) {
    allArr = allArr.concat(selDepKitchenList);
  }
  if (allArr.length > 0) {
    var ids = "";
    for (var j = 0; j < allArr.length; j++) {
      var id = allArr[j].gbDepartmentId;
      ids = id + "," + ids;
    }
    let trimmedStr = ids.slice(0, -1);
    let arr = trimmedStr.split(",");
    // 颠倒数组顺序
    arr.reverse();
    let reversedStr = arr.join(",");
    var oldSearchDepIds = this.data.searchDepIds;
    if (oldSearchDepIds == reversedStr) {
      this.setData({
        update: false
      })
    } else {
      this.setData({
        update: true,
       
      })
    }
    var tempArr = reversedStr.split(",");
    this.setData({
      searchDepIds: reversedStr,
      searchDepIdsArr: tempArr
    })
    
  } else {
    var oldSearchDepIds = this.data.searchDepIds;
    if(oldSearchDepIds !== -1){
      this.setData({
        update: true,
        itemIndex:0,
        tab1Index: 0,
        itemIndexDep:0,
        tab1IndexDep:0,
      })
    }else{
      this.setData({
      update: false
      })
    }
    this.setData({  
      searchDepIds: -1,
      searchDepIds: -1,
    })
  }
},



  onTab1ClickDepTypeOfFenxi(event) {
    console.log("costcosotsto", event)
    let index = event.currentTarget.dataset.index;
    this.setData({
      tab1IndexDep: index,
      itemIndexDep: index,
    })
    console.log("thisdkadiifiaidftiememinss=====", this.data.itemIndexDep)
    if (index > 0) {
      this.setData({
        searchDepId: event.currentTarget.dataset.item.gbDepartmentId,
      })
    }else{
      this.setData({
        searchDepId: -1
      })
    }
    
    const depId = event.currentTarget.dataset.id === "-1" ? "type_dep_fixed" : `type_dep_${event.currentTarget.dataset.id}`;
    console.log("idididiidididii", depId);
    this.scrollToCenter(depId);
    this._initData();
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
    this.setData({
      // sliderOffset: this.data.sliderOffsets[event.detail.current],
      tab1IndexDep: event.detail.current,
      itemIndexDep: event.detail.current,
      
    })
    if (event.detail.current > 0) {
      this.setData({
        searchDepId: this.data.searchDepList[event.detail.current - 1].gbDepartmentId,
      })
    }else{
      this.setData({
        searchDepId: -1
      })
    }

    var depId = "";
    if(this.data.tab1IndexDep == 0){
    depId = "type_dep_fixed";
    }else{
      depId = "type_dep_" + this.data.searchDepId;
    }

    console.log("idididiidididii", depId);
    this.scrollToCenter(depId);
     this._initData();

  },


  

  _initData(){
    var that = this;
    var data = {
      startDate : this.data.startDate,
      stopDate: this.data.stopDate,
      disGoodsId: this.data.disGoodsId,
      type : this.data.type,
      fenxiType : this.data.fenxiType,
      searchDepIds: this.data.searchDepIds,
      searchDepId: this.data.searchDepId,
    }
    load.showLoading("获取数据中")
    getGoodsCharts(data).then(res => {
      if(res.result.code == 0){
        load.hideLoading();
        console.log(res.result.data)
        console.log("fenxiprororoor")
        this.setData({
          oneTotal : res.result.data.oneTotal,
          salesTotal: res.result.data.salesTotal,
          lossTotal: res.result.data.lossTotal,
          wasteTotal: res.result.data.wasteTotal,
          oneTotalWeight : res.result.data.oneTotalWeight,
          salesTotalWeight: res.result.data.salesTotalWeight,
          lossTotalWeight: res.result.data.lossTotalWeight,
          wasteTotalWeight: res.result.data.wasteTotalWeight,
          stArr: res.result.data.list,
          disGoods: res.result.data.disGoods,
          itemList: res.result.data.itemList,
          resultDepList: res.result.data.depArr,
        })

        monthlyValue = res.result.data.list;
        monthlyData = res.result.data.date;

        if(this.data.itemIndex == 0 && this.data.oneTotal > 0){
          that.init_top_echarts(); //初始化图表
        }
        if(this.data.itemIndex == 1 &&  this.data.salesTotal > 0){
          that.init_sales_echarts(); //初始化图表
        }
        if(this.data.itemIndex == 2 &&  this.data.lossTotal > 0){
          that.init_loss_echarts(); //初始化图表
        }
        if(this.data.itemIndex ==  3 &&  this.data.wasteTotal > 0){
          that.init_waste_echarts(); //初始化图表
        }
        
      }else{
        load.hideLoading;
        wx.showToast({
          title: res.result.msg,
          icon: 'none'
        })
        this.setData({
          oneTotal : 0,
          salesTotal: 0,
          lossTotal: 0,
          wasteTotal: 0,
          stArr: [],
          depArr: "",
        })
      }
      
    })

  },

    /**
     * 计算偏移量
     */
    clueOffset() {
      var that = this;

    wx.getSystemInfo({
      success: function (res) {
        itemWidth = Math.ceil(res.windowWidth / that.data.tabs.length);
        console.log(itemWidth)
        let tempArr = [];
        for (let i in that.data.tabs) {
          tempArr.push((itemWidth-6) * i);
        }
        // tab 样式初始化
        windowWidth = res.windowWidth;
        that.setData({
          sliderOffsets: tempArr,
          sliderOffset: tempArr[that.data.itemIndex],
          // sliderLeft: globalData.windowWidth * globalData.rpxR / 12,
          windowWidth: globalData.windowWidth * globalData.rpxR,
          windowHeight: globalData.windowHeight * globalData.rpxR,
        });
      }
    });
    },
  
  
  /**
   * tabItme点击
   */
  onTab1Click(event) {
    let index = event.currentTarget.dataset.index;
    this.setData({
      sliderOffset: this.data.sliderOffsets[index],
      tab1Index: index,
      itemIndex: index,
      type: event.currentTarget.dataset.type,
    })
    monthlyData = [];

  },


  /**
   * 动画结束时会触发 animationfinish 事件
   */
  animationfinish(event) {
    console.log("findiis")
    this.setData({
      sliderOffset: this.data.sliderOffsets[event.detail.current],
      tab1Index: event.detail.current,
      itemIndex: event.detail.current,
    })
   
    if (this.data.tab1Index == 0 && this.data.fenxiType == 'weightEcharts') {
      this.setData({
        type: "cost"
      })
    }
    if (this.data.tab1Index == 0 && this.data.fenxiType == 'profitEcharts') {
      this.setData({
        type: "profit"
      })
    }
    if (this.data.tab1Index == 0 && this.data.fenxiType == 'costEcharts') {
      this.setData({
        type: "total"
      })
    }
    if (this.data.tab1Index == 1) {
      this.setData({
        type: "sales"
      })
    }

    if (this.data.tab1Index == 2) {
      this.setData({
        type: "loss"
      })
    }
    if (this.data.tab1Index == 3) {
      this.setData({
        type: "waste"
      })
    }
    monthlyData = [];

    this._initData();

  },

//初始化图表
init_top_echarts: function () {
  var that  = this;
  that.echartsComponnet = that.selectComponent('#mychartTop');

  that.echartsComponnet.init((canvas, width, height) => {
    // 初始化图表
    const Chart = echarts.init(canvas, null, {
      width: width,
      height: height,
      devicePixelRatio: globalData.rpxR 


    });
    Chart.setOption(this.getOption());
    // 注意这里一定要返回 chart 实例，否则会影响事件处理等
    return Chart;
  });
},
//初始化图表
init_sales_echarts: function () {
  var that  = this;
  that.echartsComponnet = that.selectComponent('#mychartSales');

  that.echartsComponnet.init((canvas, width, height) => {
    // 初始化图表
    const Chart = echarts.init(canvas, null, {
      width: width,
      height: height,
      devicePixelRatio: globalData.rpxR 


    });
    Chart.setOption(this.getOption());
    // 注意这里一定要返回 chart 实例，否则会影响事件处理等
    return Chart;
  });
},
//初始化图表
init_loss_echarts: function () {
  var that  = this;
  that.echartsComponnet = that.selectComponent('#mychartLoss');

  that.echartsComponnet.init((canvas, width, height) => {
    // 初始化图表
    const Chart = echarts.init(canvas, null, {
      width: width,
      height: height,
      devicePixelRatio: globalData.rpxR 


    });
    Chart.setOption(this.getOption());
    // 注意这里一定要返回 chart 实例，否则会影响事件处理等
    return Chart;
  });
},
//初始化图表
init_waste_echarts: function () {
  var that  = this;
  that.echartsComponnet = that.selectComponent('#mychartWaste');

  that.echartsComponnet.init((canvas, width, height) => {
    // 初始化图表
    const Chart = echarts.init(canvas, null, {
      width: width,
      height: height,
      devicePixelRatio: globalData.rpxR 
    });
    Chart.setOption(this.getOption());
    // 注意这里一定要返回 chart 实例，否则会影响事件处理等
    return Chart;
  });
},

  getOption(){
    
    // 指定图表的配置项和数据
    var option = {
      color: ['#187e6e'],
      grid: {
        left: 10,
        right: 10,
        bottom: 15,
        top: 40,
        containLabel: true
      },
    	xAxis: {
        axisLine: {
          lineStyle: {
            color: '#999'
          }
        },
        axisLabel: {
          color: '#666'
        },
	        type: 'category',
          data: monthlyData,
	    },
	    yAxis: {
          type: 'value',
          position: 'right',
          // splitArea : {show : true},
	    },
	    series: [{
        label: {
          normal: {
            show: true,
            // position: 'inside'
          }
        },
        type: 'line',
	        data: monthlyValue,
      }
    ]
    }
    return option;

  },


  toBack(){
    monthlyData = [];
    
    wx.navigateBack({
      delta: 1
    })

  },
  


  toDatePage(){
    this.setData({
      update: true
    })
    wx.navigateTo({
      url: '../../sel/date/date?startDate=' + this.data.startDate
       + '&stopDate=' + this.data.stopDate + '&dateType=' + this.data.dateType,
    })
  },

  
  toFilter(){
    console.log("fllelesubPackage/pages/cost/reduceForDep/reduceForDep")

    wx.navigateTo({
      url: '../../../../pages/sel/filterDepartment/filterDepartment?type=1' ,
    })
  },

  delSearch(){
    wx.removeStorageSync('selDepList');
    this.setData({
      searchDepIds: -1,
      searchDepName : ""
    })
    this._initData();

  },
  
  toDetail(e){
   
      wx.navigateTo({
        url: '../statisticsReduce/statisticsReduce?depGoodsId=' + e.currentTarget.dataset.id + '&goodsName=' + e.currentTarget.dataset.name + '&startDate=' 
        +this.data.startDate + '&stopDate=' + this.data.stopDate +'&dateType=' +this.data.dateType + '&disGoodsId=' 
         + this.data.disGoodsId + '&depName=' + e.currentTarget.dataset.depname
         +'&depId=' + e.currentTarget.dataset.depid ,
         
      })
  },



  toDepReduce(e){
    console.log(e);
    var value = e.currentTarget.dataset.value;
    if(value !== "0.0"){
      wx.setStorageSync('disGoods', this.data.disGoods);

      var searchDepId = "";
      if(this.data.searchDepId !== -1){
        searchDepId = this.data.searchDepId;
      }else{
        searchDepId = this.data.searchDepIds;
      }
      var names = "";
      var arr = this.data.resultDepList;
      if(arr.length > 0){
        for(var i = 0; i < arr.length; i++){
          names = arr[i].gbDepartmentName ;
          if(i > 1){
            names = names + ","
          }
        }
      }
      wx.navigateTo({
        url: '../reduceForDep/reduceForDep?goodsId=' + this.data.disGoodsId + '&date=' + e.currentTarget.dataset.date + '&fenxiType=' + this.data.fenxiType  + '&type='
         + this.data.type +'&value=' + e.currentTarget.dataset.value + '&standardname=' + this.data.disGoods.gbDgGoodsStandardname + '&searchDepIds=' + searchDepId +'&names=' + names,
      })
      
    }else{
      wx.showToast({
        title: '无数据',
        icon: 'none'
      })
    }
  
  },
//

  onHide(){
    monthlyData = [];
  }


})