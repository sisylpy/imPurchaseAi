var load = require('../../../../lib/load.js');
const globalData = getApp().globalData;
var dateUtils = require('../../../../utils/dateUtil');
import * as echarts from '../../../../ec-canvas/echarts';

import apiUrl from '../../../../config.js'

import {
  getJrdhGoodsFenxi
} from '../../../../lib/apiDepOrder.js'


Page({

  onShow() {
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
    ec: {
      // onInit: initChart
      lazyLoad: true // 延迟加载

    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      windowWidth: globalData.windowWidth * globalData.rpxR,
      windowHeight: globalData.windowHeight * globalData.rpxR,
      navBarHeight: globalData.navBarHeight * globalData.rpxR,
      url: apiUrl.server,
      supplierId: options.id,
      disId: options.disId,
      startDate: dateUtils.getFirstDateInMonth(),
      stopDate: dateUtils.getArriveDate(0),
      dateType: "month",

    })

    this._getInitData();

  },

  _getInitData() {
    var data = {
      startDate: this.data.startDate,
      stopDate: this.data.stopDate,
      supplierId: this.data.supplierId,
      type: this.data.type,
      gbDisId: this.data.disId,
      page: this.data.currentPage,
      limit: this.data.limit,
    }
    load.showLoading("获取数据中");
    getJrdhGoodsFenxi(data)
      .then(res => {
        load.hideLoading();
        console.log(res.result.data)
        if (res.result.code == 0) {
          this.setData({
            arr: res.result.data.arr,
            supplierItem: res.result.data.item,

          })
          if (res.result.data.arr.length > 0) {
            var arr = this.data.arr;
            for (var i = 0; i < arr.length; i++) {
              this.init_top_echarts(arr[i]);
            }
          }
        }
      })
  },

  init_top_echarts: function (goods) {
    var id = goods.gbDistributerGoodsId;
    var that = this;
    console.log("idididiidi", '#mychartTop' + id)
    that.echartsComponnet = that.selectComponent('#mychartTop' + id);

    that.echartsComponnet.init((canvas, width, height) => {
      // 初始化图表
      const Chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: globalData.rpxR


      });
      Chart.setOption(this.getOption(goods));
      // 注意这里一定要返回 chart 实例，否则会影响事件处理等
      return Chart;
    });
  },

  getOption(goods) {
    console.log("goodos", goods);
    console.log("goods.lisrt", goods.purEveryDay.dayValue);
  
    // 指定图表的配置项和数据
    var option = {
      color: ['#187e6e', 'blue', 'red'], // 设置全局颜色，确保与 series 中的颜色一致
      grid: {
        left: 10,
        right: 10,
        bottom: 35,
        top: 40,
        containLabel: true
      },
      legend: {
        show: true, // 显示图例
        data: ['价格', '最低参考单价', '最高参考单价'], // 图例名称，与 series 中的 name 对应
        bottom: 0, // 将图例放在底部
        textStyle: {
          color: '#666' // 图例文字颜色
        }
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
        data: goods.purEveryDay.dateList,
      },
      yAxis: {
        type: 'value',
        position: 'right',
      },
      series: [
        {
          label: {
            normal: {
              show: true,
              // position: 'inside'
            }
          },
          type: 'line',
          name: '单价', // 对应图例中的名称
          data: this._getEveryDayValue(goods),
        },
        // {
        //   label: {
        //     normal: {
        //       show: true,
        //       // position: 'inside'
        //     }
        //   },
        //   type: 'line',
        //   name: '最低参考单价', // 对应图例中的名称
        //   data: this._getEveryDayLoesetValue(goods),
        //   lineStyle: {
        //     normal: {
        //       color: 'blue', // 设置线条颜色为蓝色
        //       type: 'dashed' // 设置线条为虚线
        //     }
        //   },
        //   itemStyle: {
        //     normal: {
        //       color: 'blue' // 设置数据点的颜色为蓝色
        //     }
        //   }
        // },
        // {
        //   label: {
        //     normal: {
        //       show: true,
        //       // position: 'inside'
        //     }
        //   },
        //   type: 'line',
        //   name: '最高参考单价', // 对应图例中的名称
        //   data: this._getEveryDayHighestValue(goods),
        //   lineStyle: {
        //     normal: {
        //       color: 'red', // 设置线条颜色为红色
        //       type: 'dashed' // 设置线条为虚线
        //     }
        //   },
        //   itemStyle: {
        //     normal: {
        //       color: 'red' // 设置数据点的颜色为红色
        //     }
        //   }
        // }
      ]
    };
    return option;
  },

  getOption1(goods) {
    console.log("goodos", goods);
    console.log("goods.lisrt", goods.purEveryDay.dayValue);
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
        data: goods.purEveryDay.dateList,
      },

      yAxis: {
        type: 'value',
        position: 'right',
        // splitArea : {show : true},
      },
      series: [
        {
          label: {
            normal: {
              show: true,
              // position: 'inside'
            }
          },
          type: 'line',
          name: '价格',
          data: this._getEveryDayValue(goods),
        },
        // {
        //   label: {
        //     normal: {
        //       show: true,
        //       // position: 'inside'
        //     }
        //   },
        //   type: 'line',
        //   name: '最低单价',
        //   data: this._getEveryDayLoesetValue(goods),
        //   lineStyle: {
        //     normal: {
        //       color: 'blue', // 设置线条颜色为红色
        //       type: 'dashed' // 设置线条为虚线
        //     }
        //   },
        //   itemStyle: {
        //     normal: {
        //       color: 'blue' // 设置数据点的颜色为红色
        //     }
        //   }
        // },
        // {
        //   label: {
        //     normal: {
        //       show: true,
        //       // position: 'inside'
        //     }
        //   },
        //   type: 'line',
        //   name: '最高单价',
        //   data: this._getEveryDayHighestValue(goods),
        //   lineStyle: {
        //     normal: {
        //       color: 'red', // 设置线条颜色为红色
        //       type: 'dashed' // 设置线条为虚线
        //     }
        //   },
        //   itemStyle: {
        //     normal: {
        //       color: 'red' // 设置数据点的颜色为红色
        //     }
        //   }
        // },

      ]
    }
    return option;

  },

  _getEveryDayValue(goods) {
    var arr = goods.purEveryDay.dayValue;
    var temp = [];
    if (arr.length > 0) {
      for (var i = 0; i < arr.length; i++) {
        var data = arr[i].dayPrice;
        temp.push(data);
      }
    }
    return temp;
  },


  _getEveryDayLoesetValue(goods) {
    var arr = goods.purEveryDay.lowestList;
    var temp = [];
    if (arr.length > 0) {
      for (var i = 0; i < arr.length; i++) {
        var data = arr[i];
        temp.push(data);
      }
    }
    return temp;
  },


  _getEveryDayHighestValue(goods) {
    var arr = goods.purEveryDay.highestList;
    var temp = [];
    if (arr.length > 0) {
      for (var i = 0; i < arr.length; i++) {
        var data = arr[i];
        temp.push(data);
      }
    }
    return temp;
  },

  toDatePage() {
    this.setData({
      update: true,
    })
    wx.navigateTo({
      url: '../../sel/date/date?startDate=' + this.data.startDate + '&stopDate=' + this.data.stopDate + '&dateType=' + this.data.dateType,
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