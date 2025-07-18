var load = require('../../../../lib/load.js');
const globalData = getApp().globalData;
var dateUtils = require('../../../../utils/dateUtil');
import * as echarts from '../../../../ec-canvas/echarts';

import apiUrl from '../../../../config.js'

import {
  getGbPurGoodsFenxi
} from '../../../../lib/apiDepOrder.js'


Page({

  onShow() {

    this.setData({
      windowWidth: globalData.windowWidth * globalData.rpxR,
      windowHeight: globalData.windowHeight * globalData.rpxR,
      navBarHeight: globalData.navBarHeight * globalData.rpxR,
    })

    if (this.data.update) {

      var myDate = wx.getStorageSync('myDate');
      console.log("showowowow", myDate)
      if (myDate) {
        this.setData({
          startDate: myDate.startDate,
          stopDate: myDate.stopDate,
          dateType: myDate.dateType,
        })
      }
      this._getInitData();

    }

  },

  /**
   * 页面的初始数据
   */
  data: {

    type: "goods",
    typeString: "",
    showSearch: false,
    totalPage: 0,
    totalCount: 0,
    limit: 15,
    currentPage: 1,
    eca: {
      // onInit: initChart
      lazyLoad: true // 延迟加载

    },
    ecw: {
      // onInit: initChart
      lazyLoad: true // 延迟加载

    },
    ecp: {
      // onInit: initChart
      lazyLoad: true // 延迟加载

    },
    ecl: {
      // onInit: initChart
      lazyLoad: true // 延迟加载

    },
    ecwt: {
      // onInit: initChart
      lazyLoad: true // 延迟加载

    },
    weightValue: [], // 初始化 weightValue
    produceValue: [], // 初始化 produceValue
    lossValue: [], // 初始化 lossValue
    wasteValue: [], // 初始化 wasteValue
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
     
      url: apiUrl.server,
      startDate: dateUtils.getFirstDateInMonth(),
      // startDate: "2025-04-01",
      stopDate: dateUtils.getArriveDate(0),
      // stopDate: "2025-06-30",
      dateType: "month",
      disGoodsId: options.id,

    })

    this._getInitData();

  },


toSupplierStars(){
 
  wx.navigateTo({
    url: '../../../../subPackage/pages/supplier/jrdhGoodsStars/jrdhGoodsStars?supplierId=-1'  +'&goodsId=' + this.data.disGoodsId + '&from=navigate',
  })
},

  _getInitData() {
    var data = {
      startDate: this.data.startDate,
      stopDate: this.data.stopDate,
      disGoodsId: this.data.disGoodsId,
    }
    load.showLoading("获取数据中");
    getGbPurGoodsFenxi(data)
      .then(res => {
        load.hideLoading();
        console.log(res.result.data)
        if (res.result.code == 0) {
          var goodsCode = Number(res.result.data.goodsData.code);
          var goodsData = res.result.data;
          this.setData({
            goods: goodsData,
            goodsCode: goodsCode,
            arr: (goodsData && goodsData.gbDgGoodsName) ? [goodsData] : []
          });

          if (goodsCode == 0 ) {
            var dateList = [];
            var priceValue = [];
            var weightValue = [];
            var produceValue = [];
            var lossValue = [];
            var wasteValue = [];

            if (goodsData && goodsData.purEveryDay) {
              dateList = goodsData.purEveryDay.dateList || [];
              priceValue = goodsData.purEveryDay.priceValue || [];
              weightValue = goodsData.purEveryDay.weightValue || [];
              produceValue = goodsData.purEveryDay.produceValue || [];
              lossValue = goodsData.purEveryDay.lossValue || [];
              wasteValue = goodsData.purEveryDay.wasteValue || [];
              console.log('[Debug] API purEveryDay:', JSON.stringify(goodsData.purEveryDay));
            }
            console.log('[Debug] API dateList:', dateList);

            const xAxisDateList = this._generateDateRange(this.data.startDate, this.data.stopDate);
            console.log('[Debug] Generated xAxisDateList:', xAxisDateList);

            this.setData({
              dateList: dateList,
              priceValue: priceValue,
              weightValue: weightValue,
              produceValue: produceValue,
              lossValue: lossValue,
              wasteValue: wasteValue,
              xAxisDateList: xAxisDateList,
            });

            if (xAxisDateList.length > 0) {
              if (priceValue.length > 0) this.init_price_echarts();
              if (weightValue.length > 0) this.init_weight_echarts();
              if (produceValue.length > 0) this.init_produce_echarts();
              if (lossValue.length > 0) this.init_loss_echarts();
              if (wasteValue.length > 0) this.init_waste_echarts();
            }
          }
        } else {
          this.setData({
            arr: []
          });
        }
      })
      .catch(err => {
        load.hideLoading();
        console.error('获取数据失败:', err);
        // 设置默认空数据
        this.setData({
          goods: {},
          dateList: [],
          priceValue: [],
          weightValue: [], // 设置空的 weightValue
          produceValue: [], // 设置空的 produceValue
          lossValue: [], // 设置空的 lossValue
          wasteValue: [], // 设置空的 wasteValue
          arr: [], // 设置空的 arr
        })
      })
  },

  init_price_echarts: function () {
    this.createSelectorQuery().select('#mychartTopPrice').boundingClientRect(res => {
      if (!res) return;
      const echartsComponnet = this.selectComponent('#mychartTopPrice');
      if (!echartsComponnet) {
        console.error('价格图表组件未找到');
        return;
      }
      echartsComponnet.init((canvas, width, height) => {
        const Chart = echarts.init(canvas, null, {
          width: width,
          height: height,
          devicePixelRatio: globalData.rpxR
        });
        Chart.setOption(this.getPriceOption());
        return Chart;
      });
    }).exec();
  },

  init_weight_echarts: function () {
    this.createSelectorQuery().select('#mychartTopWeight').boundingClientRect(res => {
      if (!res) return;
      const echartsWeightComponnet = this.selectComponent('#mychartTopWeight');
      if (!echartsWeightComponnet) {
        console.error('重量图表组件未找到');
        return;
      }
      echartsWeightComponnet.init((canvas, width, height) => {
        const Chart = echarts.init(canvas, null, {
          width: width,
          height: height,
          devicePixelRatio: globalData.rpxR
        });
        Chart.setOption(this.getWeightOption());
        return Chart;
      });
    }).exec();
  },

  init_produce_echarts: function () {
    this.createSelectorQuery().select('#mychartTopProduce').boundingClientRect(res => {
      if (!res) return;
      const echartsProduceComponnet = this.selectComponent('#mychartTopProduce');
      if (!echartsProduceComponnet) {
        console.error('制作图表组件未找到');
        return;
      }
      echartsProduceComponnet.init((canvas, width, height) => {
        const Chart = echarts.init(canvas, null, {
          width: width,
          height: height,
          devicePixelRatio: globalData.rpxR
        });
        Chart.setOption(this.getProduceOption());
        return Chart;
      });
    }).exec();
  },

  init_loss_echarts: function () {
    this.createSelectorQuery().select('#mychartTopLoss').boundingClientRect(res => {
      if (!res) return;
      const echartsLossComponnet = this.selectComponent('#mychartTopLoss');
      if (!echartsLossComponnet) {
        console.error('损耗图表组件未找到');
        return;
      }
      echartsLossComponnet.init((canvas, width, height) => {
        const Chart = echarts.init(canvas, null, {
          width: width,
          height: height,
          devicePixelRatio: globalData.rpxR
        });
        Chart.setOption(this.getLossOption());
        return Chart;
      });
    }).exec();
  },

  init_waste_echarts: function () {
    this.createSelectorQuery().select('#mychartTopWaste').boundingClientRect(res => {
      if (!res) return;
      const echartsWasteComponnet = this.selectComponent('#mychartTopWaste');
      if (!echartsWasteComponnet) {
        console.error('废弃图表组件未找到');
        return;
      }
      echartsWasteComponnet.init((canvas, width, height) => {
        const Chart = echarts.init(canvas, null, {
          width: width,
          height: height,
          devicePixelRatio: globalData.rpxR
        });
        Chart.setOption(this.getWasteOption());
        return Chart;
      });
    }).exec();
  },

  _generateDateRange(start, end) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const dateArr = [];
    while (startDate <= endDate) {
      dateArr.push(dateUtils.formatDate(new Date(startDate)));
      startDate.setDate(startDate.getDate() + 1);
    }
    return dateArr;
  },

  _getCommonXAxisConfig(options = {}) {
    const {
      dateList = this.data.xAxisDateList || [],
      boundaryGap
    } = options;
    
    console.log('[Debug] _getCommonXAxisConfig received dateList:', dateList);

    if (dateList.length === 0) {
      return {};
    }

    let lastMonth = '';
    const formattedLabels = dateList.map(dateStr => {
      const dateParts = dateStr.split('-');
      if (dateParts.length < 3) return dateStr; 

      const month = dateParts[1];
      const day = dateParts[2];
      
      let label;
      if (month !== lastMonth) {
        lastMonth = month;
        label = `${parseInt(month, 10)}/${parseInt(day, 10)}`;
      } else {
        label = parseInt(day, 10).toString();
      }
      // console.log(`[Debug] Formatting date: ${dateStr} -> ${label}`);
      return label;
    });

    const maxLabels = 10; 
    const step = dateList.length > maxLabels ? Math.ceil(dateList.length / maxLabels) : 1;

    const config = {
      type: 'category',
      data: formattedLabels,
      axisLine: {
        lineStyle: {
          color: '#ccc'
        }
      },
      axisLabel: {
        color: '#666',
        rotate: 30,
        interval: (index, value) => {
          if (dateList.length <= maxLabels) return true;
          if (typeof value === 'string' && value.includes('/')) {
            return true;
          }
          return index % step === 0;
        }
      },
      axisTick: {
        show: false,
        alignWithLabel: true
      }
    };

    if (boundaryGap === false) {
      config.boundaryGap = false;
    }
    return config;
  },

  getPriceOption() {
    const data = this._getEveryDayPriceValue();
    // 指定价格图表的配置项和数据
    var option = {
      color: ['#4A90E2'],
      grid: {
        left: 0,
        right: 40,
        bottom: 20,
        top: 20,
        containLabel: false
      },
      legend: {
        show: false,
      },
      xAxis: this._getCommonXAxisConfig(),
      yAxis: {
        type: 'value',
        position: 'right',
        axisLabel: {
          show: true,
          color: '#666'
        },
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        splitLine: {
          lineStyle: {
            color: ['#eee'],
            type: 'dashed'
          }
        }
      },
      series: [{
        type: 'line',
        name: '单价',
        data: data,
        symbol: 'circle',
        symbolSize: 6,
        label: {
          show: true,
          position: 'top',
          formatter: (params) => {
            return params.dataIndex === data.length - 1 ? params.value : '';
          }
        }
      }]
    };
    return option;
  },

  getWeightOption() {
    const data = this._getEveryDayWeightValue();
    // 指定重量图表的配置项和数据
    var option = {
      color: ['#50E3C2'],
      grid: {
        left: 0,
        right: 40,
        bottom: 20,
        top: 20,
        containLabel: false
      },
      legend: {
        show: false,
      },
      xAxis: this._getCommonXAxisConfig(),
      yAxis: {
        type: 'value',
        position: 'right',
        axisLabel: {
          show: true,
          color: '#666'
        },
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        splitLine: {
          lineStyle: {
            color: ['#eee'],
            type: 'dashed'
          }
        }
      },
      series: [{
        type: 'bar',
        name: '采购量',
        data: data,
        label: {
          show: true,
          position: 'top',
          color: '#50E3C2',
          formatter: (params) => {
            return params.dataIndex === data.length - 1 ? params.value : '';
          }
        }
      }]
    };
    return option;
  },

  _getEveryDayPriceValue() {
    return this.data.priceValue || [];
  },

  _getEveryDayWeightValue() {
    return this.data.weightValue || [];
  },

  _getEveryDayProduceValue() {
    return this.data.produceValue || [];
  },

  _getEveryDayLossValue() {
    return this.data.lossValue || [];
  },

  _getEveryDayWasteValue() {
    return this.data.wasteValue || [];
  },

  getProduceOption() {
    const data = this._getEveryDayProduceValue();
    // 指定制作图表的配置项和数据
    var option = {
      color: ['#4ECDC4'],
      grid: {
        left: 0,
        right: 40,
        bottom: 20,
        top: 20,
        containLabel: false
      },
      legend: {
        show: false,
      },
      xAxis: this._getCommonXAxisConfig({
        boundaryGap: false
      }),
      yAxis: {
        type: 'value',
        position: 'right',
        axisLabel: {
          show: true,
          color: '#666'
        },
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        splitLine: {
          lineStyle: {
            color: ['#eee'],
            type: 'dashed'
          }
        }
      },
      series: [{
        type: 'line',
        name: '制作',
        data: data,
        smooth: true,
        areaStyle: {},
        label: {
          show: true,
          position: 'top',
          formatter: (params) => {
            return params.dataIndex === data.length - 1 ? params.value : '';
          }
        }
      }]
    };
    return option;
  },

  getLossOption() {
    const data = this._getEveryDayLossValue();
    // 指定损耗图表的配置项和数据
    var option = {
      color: ['#F5A623'],
      grid: {
        left: 0,
        right: 40,
        bottom: 20,
        top: 20,
        containLabel: false
      },
      legend: {
        show: false,
      },
      xAxis: this._getCommonXAxisConfig({
        boundaryGap: false
      }),
      yAxis: {
        type: 'value',
        position: 'right',
        axisLabel: {
          show: true,
          color: '#666'
        },
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        splitLine: {
          lineStyle: {
            color: ['#eee'],
            type: 'dashed'
          }
        }
      },
      series: [{
        type: 'line',
        name: '损耗',
        data: data,
        smooth: true,
        areaStyle: {},
        label: {
          show: true,
          position: 'top',
          formatter: (params) => {
            return params.dataIndex === data.length - 1 ? params.value : '';
          }
        }
      }]
    };
    return option;
  },

  getWasteOption() {
    const data = this._getEveryDayWasteValue();
    // 指定废弃图表的配置项和数据
    var option = {
      color: ['#D0021B'],
      grid: {
        left: 0,
        right: 40,
        bottom: 20,
        top: 20,
        containLabel: false
      },
      legend: {
        show: false,
      },
      xAxis: this._getCommonXAxisConfig({
        boundaryGap: false
      }),
      yAxis: {
        type: 'value',
        position: 'right',
        axisLabel: {
          show: true,
          color: '#666'
        },
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        splitLine: {
          lineStyle: {
            color: ['#eee'],
            type: 'dashed'
          }
        }
      },
      series: [{
        type: 'line',
        name: '废弃',
        data: data,
        smooth: true,
        areaStyle: {},
        label: {
          show: true,
          position: 'top',
          formatter: (params) => {
            return params.dataIndex === data.length - 1 ? params.value : '';
          }
        }
      }]
    };
    return option;
  },

  toDatePage() {
    this.setData({
      update: true,
    })
    wx.navigateTo({
      url: '../../../../subPackage/pages/sel/date/date?startDate=' + this.data.startDate + '&stopDate=' + this.data.stopDate + '&dateType=' + this.data.dateType,
    })
  },


  showGoodStar(e) {
    this.setData({
      showStar: true,
      showGoods: e.currentTarget.dataset.item,
    })
  },

  showSearch() {
    this.setData({
      showSearch: true,
    })
  },


  searchData(e) {
    this.setData({
      showSearch: false,
      type: e.currentTarget.dataset.type,
      typeString: e.currentTarget.dataset.string
    })
    this._getInitData();

  },

  cancleSarch() {
    this.setData({
      type: "goods",
      typeString: ""
    })
    this._getInitData();
  },



  _getSearchDepIds() {
    var ids = "";
    var name = "";
    var selArr = [];
    var stockArr = this.data.stockDepartmentList;
    if (stockArr.length > 0) {
      for (var i = 0; i < stockArr.length; i++) {
        selArr.push(stockArr[i]);
        ids = ids + stockArr[i].gbDepartmentId + ",";
        name = name + stockArr[i].gbDepartmentName + ",";
      }
    }
    var kitchenArr = this.data.kitchenDepartmentList;
    if (kitchenArr.length > 0) {
      for (var i = 0; i < kitchenArr.length; i++) {
        selArr.push(kitchenArr[i]);
        ids = ids + kitchenArr[i].gbDepartmentId + ",";
        name = name + kitchenArr[i].gbDepartmentName + ",";
      }
    }

    this.setData({
      searchDepIds: ids,
      searchDepName: name,
    })
  },

  openOperation(e) {
    var detail = e.currentTarget.dataset.detail;
    if (detail != null) {
      this.setData({
        goodsDetail: detail
      })
    } else {
      this.setData({
        goodsDetail: ""
      })
    }
    this.setData({
      showOperation: true,
      goodsId: e.currentTarget.dataset.id,


    })
  },

  /**
   * 关闭操作面板
   */
  hideMask() {
    this.setData({
      showStar: false,
      showGoods: ""
    })
  },


  toOrderList(e) {
    wx.setStorageSync('disGoods', e.currentTarget.dataset.item);
    wx.navigateTo({
      url: '../jrdhOrderList/jrdhOrderList?disGoodsId=' + e.currentTarget.dataset.id +
        '&startDate=' + this.data.startDate + '&stopDate=' + this.data.stopDate + '&searchDepIds=' + this.data.searchDepIds + '&searchDepName=' + this.data.searchDepName +
        '&total=' + e.currentTarget.dataset.value,

    })
  },

  toDetail(e) {
    wx.setStorageSync('disGoods', e.currentTarget.dataset.item);
    wx.navigateTo({
      url: '../../goods/disGoodsPage/disGoodsPage?disGoodsId=' + e.currentTarget.dataset.item.gbDistributerGoodsId,
    })
  },






  delSearch() {
    wx.removeStorageSync('selDepList');;
    this.setData({
      searchDepIds: -1,
      searchDepName: ""
    })
    this._getInitData();

  },

  toBack() {
    wx.navigateBack({
      delta: 1,
    })
  },

  onUnload() {
    wx.removeStorageSync('myDate');
  }

})