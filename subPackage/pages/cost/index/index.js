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

  onShow(){

     // 推荐直接用新API
     let windowInfo = wx.getWindowInfo();
     let globalData = getApp().globalData;
     this.setData({
       windowWidth: windowInfo.windowWidth * globalData.rpxR,
       windowHeight: windowInfo.windowHeight * globalData.rpxR,
       navBarHeight: globalData.navBarHeight * globalData.rpxR,
     });

     

    // if(this.data.update){      
      var myDate = wx.getStorageSync('myDate');
      if(myDate){
        this.setData({
          startDate: myDate.startDate,
          stopDate: myDate.stopDate,
          dateType: myDate.dateType,
        })
      }
      this._initCostCataData();
     
    // }
    
  },

  data: {
 
    type: "total",
    fenxiType: "costEcharts",
    ec: {
      lazyLoad: true // 延迟加载
    },

    itemIndexDep: 0,
    tab1IndexDep: 0,
    searchDepId: -1,
    searchDepIds: -1,
    searchDepList: [],
    leftWidthDep: 0,

  },

  onLoad: function (options) {
    // 页面首次加载时调用
    
    this.setData({
      isFirstLoadCost: false,
      url: apiUrl.server,
      dateType: 'month',
      startDate: dateUtils.getFirstDateInMonth(),
      stopDate: dateUtils.getArriveDate(0),
    });

    var disInfo = wx.getStorageSync('disInfo');
    if (disInfo) {
      this.setData({
        disInfo: disInfo,
        disId: disInfo.gbDistributerId,
      })
    }
   
    this._initCostCataData();
  },


  toDatePage(){   
    wx.navigateTo({
      url: '../../sel/date/date?startDate=' + this.data.startDate + '&stopDate=' + this.data.stopDate + '&dateType=' + this.data.dateType,
    })
  },


    _getSearchDepIds() {
      var allArr = [];
      var searchDeps = wx.getStorageSync('selMendianDepList');
      if (searchDeps) {
        allArr = allArr.concat(searchDeps);
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
        console.log("_getSearchDepIds_getSearchDepIds_getSearchDepIds_getSearchDepIds_getSearchDepIds")
        console.log("oldldldllsididiis", oldSearchDepIds);
        console.log("oldldldllsididiis", reversedStr);
        if (oldSearchDepIds == reversedStr) {
          this.setData({
            update: false,
            searchDepIds: -1
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
            itemIndex:0,
            tab1Index: 0,
            itemIndexDep:0,
            tab1IndexDep:0,
            searchDepIds: -1,
            searchDepId: -1,
           searchDepList:[],
          })
        }else{
          this.setData({
          update: false
          })
        }
        this.setData({  
          searchDepIds: -1,
          searchDepId: -1,
          searchDepList:[],
        })
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
        searchDepId: this.data.searchDepId
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
            outArr: [],
            total: 0,
            resultDepList: res.result.data.depArr,
          })
        }
      })
    },



    //初始化图表
    init_echarts_total: function () {
      if(this.data.searchDepList.length == 0  || this.data.itemIndexDep == 0){
        this.echartsComponnet = this.selectComponent('#mychartProfitIndex');
      }else{
        var id = this.data.searchDepId;
        this.echartsComponnet = this.selectComponent('#mychartProfitIndex_'+id);
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

    getOptionTotal() {
      const option = {
        series: [{
          type: 'pie',
          color: this._getAllDataColor(this.data.outArr),
          center: ['50%', '50%'], // 设置饼图在画布中心
          radius: ['30','40%'], // 饼图的半径，内外半径
          avoidLabelOverlap: true,
          data: this._getAllData(this.data.outArr),
          label: {
            show: true,
            position: 'outside', // 显示在外部
            // formatter: '{b}\n{d}%', // 显示名称和百分比
            textStyle: {
              fontSize: 14,
            },
          },
          labelLine: {
            show: true,
            length: 10,
            length2: 10,
          },
        }],
      };
      return option;
    },
    
    _getAllDataColor(arr) {
      return arr.map(item => item.gbDfgFatherGoodsColor);
    },
    
    _getAllData(arr) {
      const temp = arr.map(item => ({
        value: item.fatherStockTotalString,
        name: `${item.gbDfgFatherGoodsName}\n${item.fatherStockTotalString}元 ${item.fatherStockTotalPercent}%`,
      }));
      console.log("Data for pie chart:", temp);
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




    toThree(e) {
   
      wx.redirectTo({
        url: '../../echartsPage/typeOfFenxi/typeOfFenxi?type=' + e.currentTarget.dataset.type + '&startDate=' + this.data.startDate +
          '&stopDate=' + this.data.stopDate + '&dateType=' + this.data.dateType +
          '&fenxiType=' + this.data.fenxiType + '&searchDepIds=' + this.data.searchDepIds + '&searchDepId=' + this.data.searchDepId ,     
         
      })
    },



    toSalesPage(e) {
      console.log(e);
     
      var searchDepId = "";
      if(this.data.searchDepId !== -1){
        searchDepId = this.data.searchDepId;
      }else{
        searchDepId = this.data.searchDepIds;
      }
      wx.navigateTo({
        url: '../../echartsPage/fenxiPage/fenxiPage?fatherId=' + e.currentTarget.dataset.id +
          '&disId=' + this.data.disId + '&type=' + this.data.type + '&fatherName=' + e.currentTarget.dataset.name + '&startDate=' + this.data.startDate + '&stopDate=' + this.data.stopDate + '&dateType=' + this.data.dateType + '&fenxiType=' + this.data.fenxiType + '&searchDepIds=' + searchDepId + '&searchDepId=' + this.data.searchDepId + '&searchDepListLength=' + this.data.searchDepList.length , 
      })

    },


    toFilter() {
      wx.navigateTo({
        url: '../../sel/filterStockDepartment/filterStockDepartment?type=1',
      })
    },

    toBack(){
      wx.navigateBack({delta: 1});
    },

    onUnload(){
      wx.removeStorageSync('myDate');
    }




})