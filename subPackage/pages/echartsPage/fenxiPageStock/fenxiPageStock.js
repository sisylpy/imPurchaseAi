var load = require('../../../../lib/load.js');
const globalData = getApp().globalData;
import apiUrl from '../../../../config.js'
var dateUtils = require('../../../../utils/dateUtil');
//
// import * as echarts from '../../../../ec-canvas/echarts';
let itemWidth = 0;
let windowWidth = 0;
var monthlyData = [];
var oneValue = [];
var salesValue = [];
var lossValue = [];
var wasteValue = [];
import {
  getGoodsEchartsByGoodsFatherIdAndOutDeps
} from '../../../../lib/apiDepOrder.js'


Page({

  onShow() {


    // 推荐直接用新API
    let windowInfo = wx.getWindowInfo();
    let globalData = getApp().globalData;
    this.setData({
      windowWidth: windowInfo.windowWidth * globalData.rpxR,
      windowHeight: windowInfo.windowHeight * globalData.rpxR,
      statusBarHeight: globalData.statusBarHeight * globalData.rpxR,
    });



    monthlyData = [];
    
   
   

    var searchStockDeps = wx.getStorageSync('selStockDepList');
    if (searchStockDeps) {
      this.setData({
        stockDepartmentList: searchStockDeps
      })
    }else{
      this.setData({
        stockDepartmentList: []
      })
    }  

    var searchKitchenDeps = wx.getStorageSync('selKitchenDepList');
    if (searchKitchenDeps) {
      this.setData({
        kitchenDepartmentList: searchKitchenDeps
      })
    }else{
      this.setData({
        kitchenDepartmentList: []
      })
    } 
    this._getSearchDepIds();

    this._getInitData()

  },

  /**
   * 页面的初始数据
   */
  data: {
   
    tabs: ["1", "2", "3", "4"],
    inventoryType: 1,
    tab1Index: 0,
    itemIndex: 0,
    sliderOffsets: [],
    sliderOffset: 0,
    update: false,
    updateMyDate: false,
    searchDepId: -1,

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      disId: options.disId,
      disGoodsFatherId: options.fatherId,
      startDate: options.startDate,
      stopDate: options.stopDate,
      dateType: options.dateType,
      fatherNeme: options.fatherName,
      type: options.type,
      fenxiType: options.fenxiType,
      showType: 0,
    })

    if (this.data.fenxiType == 'weightEcharts') {
      if (this.data.type == 'cost') {
        this.setData({
          tab1Index: 0,
          itemIndex: 0,
        })
      }
      if (this.data.type == 'sales') {
        this.setData({
          tab1Index: 1,
          itemIndex: 1,
        })
      }
      if (this.data.type == 'loss') {
        this.setData({
          tab1Index: 2,
          itemIndex: 2,
        })
      }
      if (this.data.type == 'waste') {
        this.setData({
          tab1Index: 3,
          itemIndex: 3,
        })
      }


    }
    if (this.data.fenxiType == 'profitEcharts') {
      if (this.data.type == 'profit') {
        this.setData({
          tab1Index: 0,
          itemIndex: 0,
        })
      }
      if (this.data.type == 'sales') {
        this.setData({
          tab1Index: 1,
          itemIndex: 1,
        })
      }
      if (this.data.type == 'loss') {
        this.setData({
          tab1Index: 2,
          itemIndex: 2,
        })
      }
      if (this.data.type == 'waste') {
        this.setData({
          tab1Index: 3,
          itemIndex: 3,
        })
      }
    }
    if (this.data.fenxiType == 'costEcharts') {
      if (this.data.type == 'total') {
        this.setData({
          tab1Index: 0,
          itemIndex: 0,
        })
      }
      if (this.data.type == 'sales') {
        this.setData({
          tab1Index: 1,
          itemIndex: 1,
        })
      }
      if (this.data.type == 'loss') {
        this.setData({
          tab1Index: 2,
          itemIndex: 2,
        })
      }
      if (this.data.type == 'waste') {
        this.setData({
          tab1Index: 3,
          itemIndex: 3,
        })
      }
    }

    this.clueOffset();
    
  },


  _getSearchDepIds(){
    var ids = "";
    var name = "";
    var selArr = [];
    var stockArr = this.data.stockDepartmentList;
    if(stockArr.length > 0){
      for(var i =0; i < stockArr.length; i++){
        selArr.push(stockArr[i]);
        ids = ids + stockArr[i].gbDepartmentId + ",";
        name = name +  stockArr[i].gbDepartmentName + ",";
      }
    }
    var kitchenArr = this.data.kitchenDepartmentList;
    if(kitchenArr.length > 0){
      for(var i =0; i < kitchenArr.length; i++){
        selArr.push(kitchenArr[i]);
        ids = ids + kitchenArr[i].gbDepartmentId + ",";
        name = name +  kitchenArr[i].gbDepartmentName + ",";
      }
    }

    this.setData({
      searchDepIds: ids,
      searchDepName: name,
    })
  },

  openOperation(e) {
    this.setData({
      showOperation: true,
    })
    this.chooseSezi();
   
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
  
  hideMask() {
   
    this.hideModal();
    this.setData({
      showOperation: false,
    })
  },



  changeType(e){
    var type = this.data.fenxiType;
  console.log(e);
    if(type !==  e.currentTarget.dataset.type){
      this.setData({
        fenxiType:e.currentTarget.dataset.type
      })
      if(this.data.fenxiType == 'weightEcharts'){
        if(this.data.itemIndex == 0){
          this.setData({
            type : 'cost'
          })
        }
      } if(this.data.fenxiType == 'costEcharts'){
        if(this.data.itemIndex == 0){
          this.setData({
            type : 'total'
          })
        }
      }
      this.hideMask();
      this._getInitData();
    }
   
  },
  _getInitData() {
    var that = this;
    var data = {
      disGoodsFatherId: this.data.disGoodsFatherId,
      type: this.data.type,
      startDate: this.data.startDate,
      stopDate: this.data.stopDate,
      disId: this.data.disId,
      echartsType: this.data.fenxiType,
      searchDepIds: this.data.searchDepIds,
      searchDepId: this.data.searchDepId,
    }
    load.showLoading("获取数据中")
    getGoodsEchartsByGoodsFatherIdAndOutDeps(data)
      .then(res => {
        load.hideLoading();
        console.log(res.result.data);
        console.log("abc")
        if (res.result.code == 0) {
          this.setData({
            produceArr: res.result.data.arr,
            oneTotal: res.result.data.top.oneTotal,
            salesTotal: res.result.data.top.salesTotal,
            lossTotal: res.result.data.top.lossTotal,
            wasteTotal: res.result.data.top.wasteTotal,
            stockDepartmentList: res.result.data.stockDeps,
            kitchenDepartmentList: res.result.data.kitchenDeps
          })
          this._getSearchDepIds();
          // monthlyData = res.result.data.top.date;
          // oneValue = res.result.data.top.one;
          // salesValue = res.result.data.top.sales;
          // console.log("ssalevelueee" , salesValue)
          // lossValue = res.result.data.top.loss;
          // wasteValue = res.result.data.top.waste;
      

        } else {
          console.log("meiyoushujuu")
          this.setData({
            produceArr: [],
            oneTotal: 0,
            salesTotal: 0,
            lossTotal: 0,
            wasteTotal: 0

          })
          monthlyData = [];
          oneValue = [];
          salesValue = [];
          lossValue = [];
          wasteValue = [];
          wx.showToast({
            title: res.result.msg,
            icon: 'none'
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
        let tempArr = [];
        for (let i in that.data.tabs) {
          tempArr.push((itemWidth - 6) * i);
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
    this._getInitData();
  },


  /**
   * 动画结束时会触发 animationfinish 事件
   */
  animationfinish(event) {
    this.setData({
      sliderOffset: this.data.sliderOffsets[event.detail.current],
      tab1Index: event.detail.current,
      itemIndex: event.detail.current,
    })

    if (this.data.tab1Index == 0 && this.data.fenxiType == 'weightEcharts') {
      this.setData({
        type: "total"
      })
    }
    if (this.data.tab1Index == 0 && this.data.fenxiType == 'profitEcharts') {
      this.setData({
        type: "profit"
      })
    }
    if (this.data.tab1Index == 0 && this.data.fenxiType == 'costEcharts') {
      console.log("amdmdmmdmdmdmdmdmd")
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
    this._getInitData();

  },




  //初始化图表
  init_top_echarts: function () {
    console.log("mychartTopmychartTopmychartTop")
    var that = this;
    that.echartsComponneta = that.selectComponent('#mychartTop');

    that.echartsComponneta.init((canvas, width, height) => {
      // 初始化图表
      const Chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: globalData.rpxR

      });
      Chart.setOption(this.getOptiona());
      // 注意这里一定要返回 chart 实例，否则会影响事件处理等
      return Chart;
    });
  },
  init_sales_echarts: function () {
    var that = this;
    that.echartsComponneta = that.selectComponent('#mychartSales');

    that.echartsComponneta.init((canvas, width, height) => {
      // 初始化图表
      const Chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: globalData.rpxR

      });
      Chart.setOption(this.getOptiona());
      // 注意这里一定要返回 chart 实例，否则会影响事件处理等
      return Chart;
    });
  },

  init_loss_echarts: function () {
    var that = this;
    that.echartsComponneta = that.selectComponent('#mychartLoss');

    that.echartsComponneta.init((canvas, width, height) => {
      // 初始化图表
      const Chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: globalData.rpxR

      });
      Chart.setOption(this.getOptiona());
      // 注意这里一定要返回 chart 实例，否则会影响事件处理等
      return Chart;
    });
  },
  init_waste_echarts: function () {
    var that = this;
    that.echartsComponneta = that.selectComponent('#mychartWaste');

    that.echartsComponneta.init((canvas, width, height) => {
      // 初始化图表
      const Chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: globalData.rpxR

      });
      Chart.setOption(this.getOptiona());
      // 注意这里一定要返回 chart 实例，否则会影响事件处理等
      return Chart;
    });
  },


  getOptiona() {

    // 指定图表的配置项和数据
    var option = {
      // title: {
      //   text: this.data.depName
      // },
      // tooltip: {
      //   trigger: 'axis'
      // },
      // legend: {
      //   data: ['销售量', '损耗量', '废弃量']
      // },
      color: ['#3ba272', '#9a60b4', '#fac858'],
      grid: {
        top: '10%',
        left: '3%',
        right: '4%',
        bottom: '3%',
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


      },
      series: [{
          name: '总利润',
          type: 'line',
          color: '#4343e7',
          lineStyle: {
            color: '#4343e7'
          },
          label: {
            normal: {
              show: true,
            },
          },
          type: 'line',
          data: oneValue,
        }, {
          name: '总销售量',
          type: 'line',
          color: '#4343e7',
          lineStyle: {
            color: '#4343e7'
          },
          label: {
            normal: {
              show: true,
            },
          },
          type: 'line',
          data: salesValue,
        },

        {
          name: '损耗量',
          type: 'line',
          lineStyle: {

            color: '#9a60b4'
          },
          label: {
            normal: {
              show: true,
            },
          },
          type: 'line',
          data: lossValue,
        },
        {
          name: '废弃量',
          type: 'line',
          lineStyle: {
            color: '#fac858'
          },
          label: {
            normal: {
              show: true,

            }
          },
          type: 'line',
          data: wasteValue,
        }
      ],




    }
    return option;

  },


  _getDepName(id){
    var name = "";
    if(this.data.stockDepartmentList.length > 0){
      for(var i = 0; i < this.data.stockDepartmentList.length; i++){
        var depId = this.data.stockDepartmentList[i].gbDepartmentId;
        if(id == depId){
          name = this.data.stockDepartmentList[i].gbDepartmentName;
        }
      }
    }
    if(name.length == 0){
      if(this.data.kitchenDepartmentList.length > 0){
        for(var i = 0; i < this.data.kitchenDepartmentList.length; i++){
          var depId = this.data.kitchenDepartmentList[i].gbDepartmentId;
          if(id == depId){
            name = this.data.kitchenDepartmentList[i].gbDepartmentName;
          }
        }
      }
    }

    return name;
    
  },

  toStatistics(e) {
    console.log("toStatistics" ,e);
    var item = e.currentTarget.dataset.item;
    var depId = e.currentTarget.dataset.item.gbDgGbDepartmentId;
    var depName = this._getDepName(depId);
    this.setData({
      item: e.currentTarget.dataset.item,
      goodsId: item.gbDistributerGoodsId,
      goodsName: item.gbDgGoodsName,
      standard: item.gbDgGoodsStandardname,
    })

     
     wx.navigateTo({
      url: '../../../cost/costGoodsStock/costGoodsStock?disGoodsId=' + this.data.goodsId + '&startDate=' + this.data.startDate + '&stopDate=' + this.data.stopDate + '&dateType=' + this.data.dateType + '&type=' + this.data.type + '&fenxiType=' +
        this.data.fenxiType + '&searchDepIds=' + depId +'&searchDepName=' + depName ,
    })

//
  //  if(this.data.searchDepIds > 0){
  //   wx.navigateTo({
  //     url: '../../../../pages/mendian/statisticsReduce/statisticsReduce?goodsName=' + e.currentTarget.dataset.name + '&startDate=' 
  //     +this.data.startDate + '&stopDate=' + this.data.stopDate +'&dateType=' +this.data.dateType + '&disGoodsId=' 
  //      + this.data.goodsId + '&depName=' + this.data.searchDepName
  //      +'&searchDepIds=' + this.data.searchDepIds + '&type=' + e.currentTarget.dataset.type,
       
  //   })
  //  }else{

  //   console.log("ishehhehrhehhrehrjehejhrejhrjerhjej")
   
  //  }
  },

 

  toOut(e){
    console.log("outototot");
    console.log(this.data.startDate)
    this.setData({
      goods: e.currentTarget.dataset.item,
    })
    wx.setStorageSync('disGoods', this.data.goods);
    wx.navigateTo({
      url: '../../../goods/cost/purGoodsList?disGoodsId=' + this.data.goods.gbDistributerGoodsId + '&name=' + this.data.goods.gbDgGoodsName +'&type=2' + '&startDate=' + this.data.startDate + '&stopDate=' + this.data.stopDate ,
    })
  },

  toFilter() {
    wx.navigateTo({
      url: '../../../../pages/sel/filterStockDepartment/filterStockDepartment',
    })
  },


  toMyDate(){
    this.setData({
      updateMyDate: false,
      update: false
    })
    wx.navigateTo({
      url: '../../../../pages/sel/myDate/myDate',
    })
  },

  toDatePage() {
    this.setData({
      updateMyDate: false,
      update: false
    })
    wx.navigateTo({
      url: '../../../../pages/sel/date/date?startDate=' + this.data.startDate +
        '&stopDate=' + this.data.stopDate + '&dateType=' + this.data.dateType,
    })
  },

  toBack() {
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2]; //上一个页面
    //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
    prevPage.setData({
      update: false
    })
    wx.navigateBack({
      delta: 1,
    })

  },

})