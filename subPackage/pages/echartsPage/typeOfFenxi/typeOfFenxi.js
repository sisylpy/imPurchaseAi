const globalData = getApp().globalData;
var load = require('../../../../lib/load.js');
import * as echarts from '../../../../ec-canvas/echarts'

import apiUrl from '../../../../config.js'

import {
  disGetDepGoodsDailyTotal,

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



    if(this.data.update){
      var myDate = wx.getStorageSync('myDate');
      if (myDate) {
        this.setData({
          startDate: myDate.startDate,
          stopDate: myDate.stopDate,
          dateType: myDate.dateType,
        })
      }
      this._initCostCataData()
    }
     

  },

  data: {

    ec: {
      lazyLoad: true // 延迟加载
    },
    itemIndexDep: 0,
    tab1IndexDep: 0,
    leftWidthDep: 0,
    resultDepList: []
  },


  onLoad: function (options) {

    this.setData({
      url: apiUrl.server,
      type: options.type,
      fenxiType: options.fenxiType,
      startDate: options.startDate,
      stopDate: options.stopDate,
      dateType: options.dateType,
      update: false,
      updateMyDate: false,
      searchDepIds: options.searchDepIds,
      searchDepId: options.searchDepId,
    })

      // if(options.searchDepListLength !== 0){
      //   var serdep = wx.getStorageSync('selDepList');
      //  this.setData({
      //    searchDepList: serdep
      //  })
      //  this._getSearchDepIds();
      // }
      
    var disInfo = wx.getStorageSync('disInfo');
    if (disInfo) {
      this.setData({
        disId: disInfo.gbDistributerId,
      })
    }
    
    this._initCostCataData();

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
    load.showLoading("获取数据中")
    disGetDepGoodsDailyTotal(data).then(res => {
      load.hideLoading();
      if (res.result.code == 0) {
        console.log(res.result.data)
        this.setData({
          outArr: res.result.data.arr,
          resultDepList: res.result.data.depArr,
          total: res.result.data.total,
          salesTotal: res.result.data.salesTotal,
          lossTotal: res.result.data.lossTotal,
          wasteTotal: res.result.data.wasteTotal,
        })
        
        if (res.result.data.total > 0) {
          that.init_echarts_total()
        }else{
          this.setData({
            outArr: []
          })
        }
      } else {
        wx.showToast({
          title: res.result.msg,
          icon: 'none'
        })

        this.setData({
          outArr: [],
          total: 0,
          salesTotal: 0,
          lossTotal: 0,
          wasteTotal: 0,
        })
       
      }
    })
  },


    //初始化图表
    init_echarts_total: function () {
      if(this.data.resultDepList == 0 || this.data.itemIndexDep == 0){
        console.log("#idiididiiidiid=====",'#mychartProfitIndex' )
        this.echartsComponnet = this.selectComponent('#mychartProfitIndex');
      }else{
        var id = this.data.searchDepId;
        this.echartsComponnet = this.selectComponent('#mychartProfitIndex_'+id);
        console.log("#idiididiiidiid=====",'#mychartProfitIndex_'+id )
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
    

  // _getAllData(arr) {
  //   var temp = [];
  //   for (var j = 0; j < arr.length; j++) {
  //     var value = arr[j].fatherStockTotalString;
  //     if(this.data.fenxiType == "costEcharts"){
  //       var value = arr[j].fatherStockTotalString;
  //       var percent =  arr[j].fatherStockTotalPercent;
  //       var name = arr[j].gbDfgFatherGoodsName;
      
  //       var kucun = {
  //         value: value,
  //         name: name + '\n' +
  //           +value + "元 "+ percent + '%',
  //       };
  //       temp.push(kucun);
  //     }else if (this.data.fenxiType == "weightEcharts"){
       
  //       if(this.data.type == "sales"){
  //         value = arr[j].fatherSellingSubtotalString;
  //       }else if(this.data.type == "loss"){
  //         value = arr[j].fatherLossTotalString;
  //       }else if(this.data.type == "waste"){
  //         value = arr[j].fatherWasteTotalString;
  //       }
  //       var name = arr[j].gbDfgFatherGoodsName;
      
  //       var kucun = {
  //         value: value,
  //         name: name + '\n' +
  //           +value ,
  //       };
  //       temp.push(kucun);
  //     }
     
    
     
  //   }
    

  //   this.setData({
  //     temp: temp
  //   })
  //   return temp;
  // },

  // getOptionTotal() {
  //   console.log("getOptionTotalgetOptionTotal")
  //   var option = {
  //     legend: {
  //       type: 'scroll',
  //       show: true,
  //       orient: 'vertical',
  //       right: 'right',
  //       top: '10%',
  //       textStyle: {
  //         fontWeight: 500,
  //         fontSize: 14 //文字的字体大小
  //       },
  //     },
  //     series: [{
  //       type: 'pie',
  //       radius: ['40%', '70%'],
  //       color: this._getAllDataColor(this.data.outArr),
  //       top: '10%',
  //       right: '50%',
  //       clickable: false,
  //       avoidLabelOverlap: true,
  //       data: this._getAllData(this.data.outArr),

  //       label: {
  //         show: false,
  //         position: 'outline',
  //         alignTo: 'labelLine',
  //         bleedMargin: '10%'
  //       },
  //       // emphasis: {
  //       //   itemStyle: {
  //       //     shadowBlur: 10,
  //       //     shadowOffsetX: 0,
  //       //     shadowColor: 'rgba(0, 0, 0, 0.5)'
  //       //   }
  //       // },
  //     }]
  //   };
  //   return option;

  // },

  // _getAllDataColor(arr) {
  //   var temp = [];
  //   for (var j = 0; j < arr.length; j++) {
  //     var value = arr[j].gbDfgFatherGoodsColor;
  //     temp.push(value);
  //   }
  //   return temp;
  // },


  toSalesPage(e) {
    console.log(e);
    wx.navigateTo({
      url: '../fenxiPage/fenxiPage?fatherId=' + e.currentTarget.dataset.id +
        '&disId=' + this.data.disId + '&type=' + this.data.type + '&fatherName=' + e.currentTarget.dataset.name + '&startDate=' + this.data.startDate + '&stopDate=' + this.data.stopDate + '&dateType=' + this.data.dateType + '&fenxiType=' + this.data.fenxiType + '&type=' + this.data.type + '&searchDepIds=' + this.data.searchDepIds
        +'&searchDepId=' + this.data.searchDepId,
    })
  },


  toDatePage(){
    console.log("toDatePagetoDatePage")
    this.setData({
      update: false,
    })
    wx.navigateTo({
      url: '../../sel/date/date?startDate=' + this.data.startDate + '&stopDate=' + this.data.stopDate + '&dateType=' + this.data.dateType,
    })
  },



  toFilter() {
    wx.navigateTo({
      url: '../../../../pages/sel/filterDepartment/filterDepartment?type=1',
    })
  },

  delSearch() {
    wx.removeStorageSync('selDepList');;
    this.setData({
      searchDepIds: -1,
      searchDepName: ""
    })
    this._initCostCataData();

  },


  toBack() {
    // wx.navigateBack({
    //   delta: 1
    // })
    console.log("Reddd")
    wx.redirectTo({
      url: '../../cost/index/index',
    })
  }














})