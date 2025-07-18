var load = require('../../../../lib/load.js');
const globalData = getApp().globalData;

let itemWidth = 0;
let windowWidth = 0;
var monthlyData = [];
var oneValue = [];
var salesValue = [];
var lossValue = [];
var wasteValue = [];

import {
  getGoodsEchartsByGoodsGrandId
} from '../../../../lib/apiDepOrder.js'


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


    monthlyData = [];
    
    // if(this.data.update){
      var myDate = wx.getStorageSync('myDate');
      if(myDate){
        this.setData({
          startDate: myDate.startDate,
          stopDate: myDate.stopDate,
          dateType: myDate.dateType,
        })
        this._getInitData();
      }
    // }
   
   
  },

  /**
   * 页面的初始数据
   */
  data: {
   
    tabs: ["1", "2", "3", "4"],
    tab1Index: 0,
    itemIndex: 0,
    sliderOffsets: [],
    sliderOffset: 0,
  
    itemIndexDep: 0,
    tab1IndexDep: 0,
    searchDepId: -1,
    leftWidthDep: 0,
    resultDepList: []

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
      searchDepIds: options.searchDepIds,
      
    })

  
      if (this.data.type == 'total' || this.data.type == 'cost') {
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
    

    this.clueOffset();
    this._getInitData();
    
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
    this._getInitData();
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
      // sliderOffset: this.data.sliderOffsets[event.detail.current],
      tab1IndexDep: event.detail.current,
      itemIndexDep: event.detail.current,
      
    })
    console.log("thisdkadiifiaidftiememinss=====", this.data.itemIndexDep)
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
     this._getInitData();

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
  //
  _getInitData() {
    var that = this;
    var data = {
      disGoodsGrandId: this.data.disGoodsFatherId,
      type: this.data.type,
      startDate: this.data.startDate,
      stopDate: this.data.stopDate,
      disId: this.data.disId,
      echartsType: this.data.fenxiType,
      searchDepIds: this.data.searchDepIds,
      searchDepId: this.data.searchDepId,
    }
    load.showLoading("获取数据中")
    getGoodsEchartsByGoodsGrandId(data)
      .then(res => {
        load.hideLoading();
        console.log(res.result.data);
        console.log("abc")
        if (res.result.code == 0) {
          this.setData({
            produceArr: res.result.data.arr,
            oneTotal: res.result.data.oneTotal,
            salesTotal: res.result.data.salesTotal,
            lossTotal: res.result.data.lossTotal,
            wasteTotal: res.result.data.wasteTotal,
            resultDepList: res.result.data.depArr,
          })

        } else {
          console.log("meiyoushujuu")
          this.setData({
            produceArr: [],
            oneTotal: 0,
            salesTotal: 0,
            lossTotal: 0,
            wasteTotal: 0
          })
         
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
        type: "cost"
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




  toStatistics(e) {
    console.log("toStatistics" ,e);
    var item = e.currentTarget.dataset.item;
    this.setData({
      item: e.currentTarget.dataset.item,
      goodsId: item.gbDistributerGoodsId,
      goodsName: item.gbDgGoodsName,
      standard: item.gbDgGoodsStandardname,
    })
    var searchDepId = "";
    if(this.data.searchDepId !== -1){
      searchDepId = this.data.searchDepId;
    }else{
      searchDepId = this.data.searchDepIds;
    }
    

     wx.navigateTo({
      url: '../../cost/costGoods/costGoods?disGoodsId=' + this.data.goodsId + '&startDate=' + this.data.startDate + '&stopDate=' + this.data.stopDate + '&dateType=' + this.data.dateType + '&type=' + this.data.type + '&fenxiType=' + this.data.fenxiType +  '&searchDepIds=' + searchDepId ,
    })

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

  toFilter(){
    wx.navigateTo({
      url: '../../../../pages/sel/filterDepartment/filterDepartment?type=1' ,
    })
  },

  delSearch(){
    wx.removeStorageSync('selDepList');;
    this.setData({
      searchDepIds: -1,
      searchDepName : ""
    })
    this._getInitData();

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
      update: false
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

})