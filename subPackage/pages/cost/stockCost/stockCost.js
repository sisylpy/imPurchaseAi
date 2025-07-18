const globalData = getApp().globalData;
var load = require('../../../../lib/load.js');
var dateUtils = require('../../../../utils/dateUtil');
import * as echarts from '../../../../ec-canvas/echarts';

import apiUrl from '../../../../config.js';
let windowWidth = 0;
let itemWidth = 0;

var monthlyData = [];
var listValue = "";

import {
  disGetDepGoodsDailyTotal,
} from '../../../../lib/apiDepOrder.js'



Page({



  data: {
    type: "total",
    fenxiType: "costEcharts",
    searchDepId: -1,
    ec: {
      lazyLoad: true // 延迟加载
    },
    isFirstLoadCost: true,
    dateType: 'month',
    startDate: dateUtils.getFirstDateInMonth(),
    stopDate: dateUtils.getArriveDate(0),
    searchDepList:[],
    itemIndexDep: 0,
    tab1IndexDep: 0,
  },


  onShow() {

      // 推荐直接用新API
      let windowInfo = wx.getWindowInfo();
      let globalData = getApp().globalData;
      this.setData({
        windowWidth: windowInfo.windowWidth * globalData.rpxR,
        windowHeight: windowInfo.windowHeight * globalData.rpxR,
        statusBarHeight: globalData.statusBarHeight * globalData.rpxR,
      });

    this._getSearchDepIds();
     console.log("Athisdadfdddfafais", this.data.isFirstLoadCost);
    if(this.data.isFirstLoadCost){
      this._initCostCataData();
    }else{
     
      if(this.data.update){
        this._initCostCataData();
      }
    }
  
  },


  onLoad: function (options) {
    this.setData({
      url: apiUrl.server,
     
    });

    var uservalue = wx.getStorageSync('userInfo');
    if (uservalue) {
      this.setData({
        userInfo: uservalue,
        disId: uservalue.gbDiuDistributerId,
      })
    }


   
  },

  _getSearchDepIds() {
    console.log("_getSearchDepIds_getSearchDepIds");
    var allArr = [];
  
    var searchStockDeps = wx.getStorageSync('selStockDepList');
    console.log("stockckkckckkcckkckckckkckckckckckckckckkc")
    if (searchStockDeps) {
      allArr = allArr.concat(searchStockDeps);
      console.log("sellarrrrrrrrr", allArr);
    }

    var selDepKitchenList = wx.getStorageSync('selKitchenDepList');
    if (selDepKitchenList) {
      allArr = allArr.concat(selDepKitchenList);
    }

    if (allArr.length > 0) {
      console.log("thisdldeldpdpdplisthisdldeldpdpdplis", allArr);
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
          tab1IndexDep: 0,
          itemIndexDep: 0,
          leftWidthDep: 0,
        })
      }
      this.setData({
        searchDepList: allArr,
        searchDepIds: reversedStr,
      })
    } else {
      var oldSearchDepIds = this.data.searchDepIds;
      if(oldSearchDepIds !== -1){
        this.setData({
          update: true,
        })
      }else{
        this.setData({
          update: false
        })
      }
      this.setData({
        searchDepList: [],
        searchDepIds: -1,
      })
      wx.removeStorageSync('searchDepList');
    }

  },


  onTab1ClickDep(event) {
    console.log("costcosotsto", event)
    let index = event.currentTarget.dataset.index;
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
    this._initCostCataData();
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


  animationfinishDep(event) {
    console.log("amddddep")
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
    depId = "dep_fixed";
    }else{
      depId = "dep_" + this.data.searchDepId;
    }

    console.log("idididiidididii", depId);
    this.scrollToCenter(depId);

    this._initCostCataData();

  },



    _initCostCataData() {
      var that = this;
      var data = {
        startDate: this.data.startDate,
        stopDate: this.data.stopDate,
        disId: this.data.disId,
        type: this.data.type,
        fenxiType: this.data.fenxiType,
        searchDepIds: this.data.searchDepIds,
        searchDepId: this.data.searchDepId,
      }
      load.showLoading("获取数据")
      disGetDepGoodsDailyTotal(data).then(res => {
        if (res.result.code == 0) {
          load.hideLoading();
          console.log(res.result.data);
          this.setData({
            outArr: res.result.data.arr,
            total: res.result.data.total,
            salesTotal: res.result.data.salesTotal,
            lossTotal: res.result.data.lossTotal,
            wasteTotal: res.result.data.wasteTotal,
            resultDepList: res.result.data.depArr,
          })
          if (res.result.data.total !== "0.0") {
            that.init_echarts_total()
          }
        } else {
          load.hideLoading();
          wx.showToast({
            title: res.result.msg,
            icon: 'none'
          })
          this.setData({
            outArr: []
          })
        }
      })
    },



    //初始化图表
    init_echarts_total: function () {
      if(this.data.searchDepList.length < 2){
        this.echartsComponnet = this.selectComponent('#mychartProfitIndex');
      }else{
        if(this.data.itemIndexDep > 0){
          this.echartsComponnet = this.selectComponent('#mychartProfitIndex_' + this.data.searchDepId);
        }else{
          this.echartsComponnet = this.selectComponent('#mychartProfitIndex');
        }
      }
     

      this.echartsComponnet.init((canvas, width, height) => {
        // 初始化图表
        const Chart = echarts.init(canvas, null, {
          width: width,
          height: height,
          devicePixelRatio: globalData.rpxR
        });
        Chart.setOption(this.getOptionTotal());
        // 注意这里一定要返回 chart 实例，否则会影响事件处理等
        return Chart;
      });
    },


    _getAllData(arr) {
      var temp = [];
      for (var j = 0; j < arr.length; j++) {
        var value = arr[j].fatherStockTotalString;
        var percent = arr[j].fatherStockTotalPercent;
        var name = arr[j].gbDfgFatherGoodsName
        var kucun = {
          value: value,
          name: name + '\n' +
            +value + "元 " + percent + "%",
        };
        temp.push(kucun);
      }

      this.setData({
        temp: temp
      })
      return temp;
    },

    getOptionTotal() {
      var option = {
        legend: {
          type: 'scroll',
          show: true,
          orient: 'vertical',
          right: 'right',
          top: '10%',
          textStyle: {
            fontWeight: 500,
            fontSize: 14 //文字的字体大小
          },
        },
        series: [{
          type: 'pie',
          radius: ['40%', '70%'],
          color: this._getAllDataColor(this.data.outArr),
          top: '10%',
          right: '50%',
          clickable: false,
          avoidLabelOverlap: true,
          data: this._getAllData(this.data.outArr),

          label: {
            show: false,
            position: 'outline',
            alignTo: 'labelLine',
            bleedMargin: '10%'
          },
          // emphasis: {
          //   itemStyle: {
          //     shadowBlur: 10,
          //     shadowOffsetX: 0,
          //     shadowColor: 'rgba(0, 0, 0, 0.5)'
          //   }
          // },
        }]
      };
      return option;

    },

    _getAllDataColor(arr) {
      var temp = [];
      for (var j = 0; j < arr.length; j++) {
        var value = arr[j].gbDfgFatherGoodsColor;
        temp.push(value);
      }
      return temp;
    },


    getOptiona() {
      var that = this;
      // 指定图表的配置项和数据
      var option = {
        // title: {
        //   text: that._getTital()
        // },
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
          data: listValue,
        }]
      }
      return option;

    },




    toDatePage() {
      this.setData({
        isFirstLoadCost: false
      })
      wx.navigateTo({
        url: '../../sel/date/date?startDate=' + this.data.startDate +
          '&stopDate=' + this.data.stopDate + '&dateType=' + this.data.dateType,
      })
    },


    toThree(e) {
      
      wx.navigateTo({
        url: '../../../../subPackage/pages/data/echartsPage/typeOfFenxiStock/typeOfFenxiStock?type=' + e.currentTarget.dataset.type + '&startDate=' + this.data.startDate +
          '&stopDate=' + this.data.stopDate + '&dateType=' + this.data.dateType +
          '&fenxiType=' + this.data.fenxiType + '&searchDepIds=' + this.data.searchDepIds,
      })
    },



    toSalesPage(e) {
      console.log(e);
     
      var searchDepName = e.currentTarget.dataset.searchDepName;
      wx.navigateTo({
        url: '../../../../subPackage/pages/data/echartsPage/fenxiPageStock/fenxiPageStock?fatherId=' + e.currentTarget.dataset.id +
          '&disId=' + this.data.disId + '&type=' + this.data.type + '&fatherName=' + e.currentTarget.dataset.name + '&startDate=' + this.data.startDate + '&stopDate=' + this.data.stopDate + '&dateType=' + this.data.dateType + '&fenxiType=' + this.data.fenxiType + '&searchDepIds=' + this.data.searchDepIds +
          '&searchDepName=' + searchDepName,
      })

    },


    toFilter() {
      this.setData({
        isFirstLoadCost: false
      })
      console.log("chanannnangeeisisiiffiifiiffiif", this.data.isFirstLoadCost)
      wx.navigateTo({
        url: '../../sel/filterStockDepartment/filterStockDepartment',
      })
    },


    toBack(){
      wx.navigateBack({delta: 1});
    },

    onUnload(){
      wx.removeStorageSync('myDate');
      wx.removeStorageSync('selStockDepList');
      wx.removeStorageSync('selKitchenDepList');
    }



  



})