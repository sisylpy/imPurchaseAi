const globalData = getApp().globalData;
var dateUtils = require('../../../../utils/dateUtil');
import * as echarts from '../../../ec-canvas/echarts';

import apiUrl from '../../../../config.js'

import {

  getGbPurGoodsStatistics,
  getGbPurGoodsList
} from '../../../../lib/apiDepOrder.js'
import load from '../../../../lib/load';


Page({


  /**
   * 页面的初始数据
   */
  data: {
    greatId: -1,
    type: "money",
    typeString: "",
    showSearch: false,
    totalPage: 0,
    totalCount: 0,
    limit: 10,
    currentPage: 1,
    arr: [], // 初始化商品数组
    isLoading: false, // 防止重复请求
    ecT: {
      lazyLoad: false // 环形饼状图不使用延迟加载
    },
    ecDaily: {
      lazyLoad: false // 每日进货总额图表不使用延迟加载
    },
    eca: {
      lazyLoad: true // 延迟加载，用于已有的图表
    },
    chartDrawn: false, // 图表是否已绘制
    dailyChartDrawn: false, // 每日进货总额图表是否已绘制
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
      purUserId: -1,

    })

    var supplierItem = wx.getStorageSync('supplierItem');
    if(supplierItem){
      this.setData({
        supplierInfo: supplierItem,
       
      })
    }

    this._getSupplierStatistics();

  },



  // 获取供货商统计信息
  _getSupplierStatistics() {
    var data = {
      supplierId: this.data.supplierId,
      purUserId: this.data.purUserId,
      disId: this.data.disId,
      startDate: this.data.startDate,
      stopDate: this.data.stopDate,
      greatId: this.data.greatId,
    };
    
    // 调用新的统计接口
    return getGbPurGoodsStatistics(data)
      .then(res => {
        console.log('统计信息接口返回:', res);
        if (res.result.code == 0) {
          this.setData({
            supplierItem: res.result.data,
            mapEveryDay: res.result.data.mapEveryDay,
          });
        
         
          // 获取统计信息成功后，再获取商品列表
          this._getGoodsList();
          this.init_amount_chart();
          this.init_daily_chart(); // 调用新增的初始化函数
         
        } else {
          wx.showToast({
            title: res.result.msg || '获取统计信息失败',
            icon: 'none'
          });
        }
      })
  },

  // 获取商品列表
  _getGoodsList() {
    // 防止重复请求
    if (this.data.isLoading) {
      console.log('=== 防重复请求：当前正在加载中，跳过本次请求 ===');
      return;
    }
    
    console.log('=== _getGoodsList 开始 ===');
    console.log('请求参数:', {
      purUserId: this.data.purUserId,
      supplierId: this.data.supplierId,
      disId: this.data.disId,
      startDate: this.data.startDate,
      stopDate: this.data.stopDate,
      type: this.data.type,
      page: this.data.currentPage,
      limit: this.data.limit,
      greatId: this.data.greatId,
    });
    
    // 设置加载状态
    this.setData({
      isLoading: true
    });
    load.showLoading("获取数据中");
    var data = {
      purUserId: this.data.purUserId,
      supplierId: this.data.supplierId,
      disId: this.data.disId,
      startDate: this.data.startDate,
      stopDate: this.data.stopDate,
      type: this.data.type,
      page: this.data.currentPage,
      limit: this.data.limit,
      greatId: this.data.greatId,
    };
    
    // 调用新的商品列表接口
    getGbPurGoodsList(data)
      .then(res => {
        console.log('=== 商品列表接口返回 ===');
        console.log('当前页码:', this.data.currentPage);
        console.log('接口返回数据:', res);
        load.hideLoading();
        if (res.result.code == 0) {
          const result = res.result.data;
          console.log('解析后的数据:', result);
          console.log('商品列表长度:', result.goodsList ? result.goodsList.length : 0);
          console.log('商品列表内容:', result.goodsList);
          
          // 如果是第一页，直接替换数据；否则追加数据
          if (this.data.currentPage === 1) {
            console.log('设置第一页数据，商品数量:', result.goodsList ? result.goodsList.length : 0);
            this.setData({
              arr: result.goodsList || [],
              totalCount: result.totalCount || 0,
              totalPage: result.totalPages || 0
            });
          } else {
            const newArr = [...this.data.arr, ...(result.goodsList || [])];
            console.log('追加数据，总商品数量:', newArr.length);
            
            this.setData({
              arr: newArr,
              totalCount: result.totalCount || 0,
              totalPage: result.totalPages || 0
            });
          }
          
          console.log('setData完成，当前arr长度:', this.data.arr.length);
          console.log('前5个商品名称:', this.data.arr.slice(0, 5).map(item => item.gbDgGoodsName || item.goodsName));
          
          // 初始化图表
          if (this.data.arr.length > 0) {
            var arr = this.data.arr;
            for (var i = 0; i < arr.length; i++) {
              this.init_top_echarts(arr[i]);
            }
          }
        } else {
          wx.showToast({
            title: res.result.msg || '获取商品列表失败',
            icon: 'none'
          });
        }
        
        // 重置加载状态
        this.setData({
          isLoading: false
        });
      })
     
  },

  // 上拉加载更多
  onReachBottom() {
    console.log('=== onReachBottom 触发 ===');
    console.log('当前页码:', this.data.currentPage);
    console.log('总页数:', this.data.totalPage);
    console.log('当前商品数组长度:', this.data.arr ? this.data.arr.length : 0);
    console.log('当前商品数组内容:', this.data.arr);
    console.log('是否正在加载:', this.data.isLoading);
    
    // 防止重复请求
    if (this.data.isLoading) {
      console.log('=== 防重复请求：当前正在加载中，跳过上拉加载 ===');
      return;
    }
    
    if (this.data.currentPage < this.data.totalPage) {
      console.log('准备加载下一页，页码从', this.data.currentPage, '变为', this.data.currentPage + 1);
      
      this.setData({
        currentPage: this.data.currentPage + 1
      });
      
      console.log('页码已更新，准备调用 _getGoodsList');
      this._getGoodsList();
    } else {
      console.log('已到最后一页，不再加载');
    }
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.setData({
      currentPage: 1
    });
    this._getSupplierStatistics();
    wx.stopPullDownRefresh();
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

    // 初始化商品成本环形图
    // this.init_goods_cost_chart(goods);
  },

  // 初始化商品成本环形图
  init_goods_cost_chart: function (goods) {
    var id = goods.gbDistributerGoodsId;
    var that = this;
    console.log("初始化商品成本环形图，ID:", id);
    
    that.goodsCostChartComponent = that.selectComponent('#goodsCostChart' + id);
    console.log("获取到的商品成本环形图组件:", that.goodsCostChartComponent);
    
    if (!that.goodsCostChartComponent) {
      console.error("❌ 无法获取商品成本环形图组件 #goodsCostChart" + id);
      return;
    }
    
    that.goodsCostChartComponent.init((canvas, width, height) => {
      console.log("=== 商品成本环形图组件init回调执行 ===");
      console.log("canvas:", canvas);
      console.log("width:", width, "height:", height);
      
      // 初始化图表
      const Chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: globalData.rpxR
      });
      console.log("商品成本环形图ECharts实例创建成功:", Chart);
      
      const option = that.getGoodsCostChartOption(goods);
      console.log("商品成本环形图配置选项:", option);
      
      Chart.setOption(option);
      console.log("✅ 商品成本环形图配置设置成功");
      
      // 注意这里一定要返回 chart 实例，否则会影响事件处理等
      return Chart;
    });
  },

  // 获取商品成本环形图配置
  getGoodsCostChartOption(goods) {
    console.log("=== 开始获取商品成本环形图配置 ===");
    console.log("商品数据:", goods);
    
    // 获取5种重量数据
    const stockWeight = parseFloat(goods.goodsStockWeightTotalString) || 0;
    const produceWeight = parseFloat(goods.goodsProduceWeightTotalString) || 0;
    const lossWeight = parseFloat(goods.goodsLossWeightTotalString) || 0;
    const wasteWeight = parseFloat(goods.goodsWasteWeightTotalString) || 0;
    const returnWeight = parseFloat(goods.goodsReturnWeightTotalString) || 0;
    
    console.log("解析后的重量数据:");
    console.log("库存重量:", stockWeight, "原始值:", goods.goodsStockWeightTotalString);
    console.log("销售重量:", produceWeight, "原始值:", goods.goodsProduceWeightTotalString);
    console.log("损耗重量:", lossWeight, "原始值:", goods.goodsLossWeightTotalString);
    console.log("废弃重量:", wasteWeight, "原始值:", goods.goodsWasteWeightTotalString);
    console.log("退货重量:", returnWeight, "原始值:", goods.goodsReturnWeightTotalString);
    
    const totalWeight = stockWeight + produceWeight + lossWeight + wasteWeight + returnWeight;
    console.log("总重量:", totalWeight);
    
    if (totalWeight === 0) {
      console.log("⚠️ 总重量为0，显示空状态");
      return {
        title: {
          text: '暂无重量数据',
          left: 'center',
          top: 'center',
          textStyle: {
            color: '#999',
            fontSize: 14
          }
        }
      };
    }
    
    console.log("✅ 生成商品成本环形图配置");
    return {
      tooltip: {
        trigger: 'item',
        formatter: function(params) {
          return `${params.name}\n${params.value}${goods.gbDgGoodsStandardname} (${params.percent}%)`;
        },
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: '#fff',
        borderWidth: 1,
        textStyle: {
          color: '#fff',
          fontSize: 12,
          lineHeight: 18
        },
        extraCssText: 'max-width: 200px; word-wrap: break-word; padding: 8px 12px; min-height: 60px;'
      },
      legend: {
        show: false // 不显示图例，因为我们有自定义的图例
      },
      series: [
        {
          name: '重量统计',
          type: 'pie',
          radius: ['40%', '70%'], // 内外半径，形成环形
          center: ['50%', '50%'], // 居中
          silent: true, // 禁用点击功能
          avoidLabelOverlap: false,
          label: {
            show: false // 不显示标签，保持简洁
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '12',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: [
            {
              value: stockWeight,
              name: '库存',
              itemStyle: { color: '#007aff' }
            },
            {
              value: produceWeight,
              name: '销售',
              itemStyle: { color: '#66bb6a' }
            },
            {
              value: lossWeight,
              name: '损耗',
              itemStyle: { color: '#ffa726' }
            },
            {
              value: wasteWeight,
              name: '废弃',
              itemStyle: { color: '#ff6b6b' }
            },
            {
              value: returnWeight,
              name: '退货',
              itemStyle: { color: '#000' }
            }
          ]
        }
      ]
    };
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
        containLabel: true,
        show: false
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
        data: goods.purEveryDay ? goods.purEveryDay.dateList : [],
        splitLine: {
          show: false
        }
      },
      yAxis: {
        type: 'value',
        position: 'right',
        splitLine: {
          show: false
        }
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
    console.log("goods.lisrt", goods.purEveryDay ? goods.purEveryDay.dayValue : []);
    // 指定图表的配置项和数据
    var option = {
      color: ['#187e6e'],
      grid: {
        left: 10,
        right: 10,
        bottom: 15,
        top: 40,
        containLabel: true,
        show: false
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
        data: goods.purEveryDay ? goods.purEveryDay.dateList : [],
        splitLine: {
          show: false
        }
      },

      yAxis: {
        type: 'value',
        position: 'right',
        splitLine: {
          show: false
        }
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
    var arr = goods.purEveryDay ? goods.purEveryDay.dayValue : [];
    var temp = [];
    if (arr && arr.length > 0) {
      for (var i = 0; i < arr.length; i++) {
        var data = arr[i] ? arr[i].dayPrice : 0;
        temp.push(data);
      }
    }
    return temp;
  },


  _getEveryDayLoesetValue(goods) {
    var arr = goods.purEveryDay ? goods.purEveryDay.lowestList : [];
    var temp = [];
    if (arr && arr.length > 0) {
      for (var i = 0; i < arr.length; i++) {
        var data = arr[i] || 0;
        temp.push(data);
      }
    }
    return temp;
  },


  _getEveryDayHighestValue(goods) {
    var arr = goods.purEveryDay ? goods.purEveryDay.highestList : [];
    var temp = [];
    if (arr && arr.length > 0) {
      for (var i = 0; i < arr.length; i++) {
        var data = arr[i] || 0;
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
      typeString: e.currentTarget.dataset.string,
      currentPage: 1  // 重置分页
    });
    this._getGoodsList();
  },

  cancleSarch() {
    this.setData({
      type: "goods",
      typeString: "",
      currentPage: 1  // 重置分页
    });
    this._getSupplierStatistics();
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
      showSearch: false,
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
    this._getSupplierStatistics();

  },



  toFenxi(e) {
    var id = e.currentTarget.dataset.id;
    
    // 存储供货商信息到缓存
    var selectedSupplier = {
      supplierId: this.data.supplierId,
      supplierName: this.data.supplierInfo.nxJrdhsSupplierName
    };
    wx.setStorageSync('selectedSupplier', selectedSupplier);
    console.log("goods", e.currentTarget.dataset.goods)
    wx.navigateTo({
      url: '../../goods/goodsFenxi/goodsFenxi?id=' + id + '&supplierId=' + this.data.supplierId
      + '&supplierName=' + this.data.supplierInfo.nxJrdhsSupplierName,
    })
  },

  toGoods(e){
    wx.setStorageSync('disGoods', e.currentTarget.dataset.goods);
    console.log("goods",e)
    wx.navigateTo({
      url: '../../goods/disGoodsPage/disGoodsPage?disGoodsId=' + e.currentTarget.dataset.id,
    })
  },



  toBack() {
    wx.navigateBack({
      delta: 1,
    })
  },

  // 初始化环形饼状图
  init_amount_chart: function () {
   
    var that = this;
    that.echartsComponnet = that.selectComponent('#amountChart');
    
    if (!that.echartsComponnet) {      
      // 如果组件还没准备好，延迟重试
      if (!that.data.chartDrawn) {
        console.log("🔄 组件未准备好，延迟重试...");
        setTimeout(() => {
          that.init_amount_chart();
        }, 500);
      }
      return;
    }
    
    that.echartsComponnet.init((canvas, width, height) => {
    
      
      // 初始化图表
      const Chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: globalData.rpxR
      });
      
      const option = that.getAmountChartOption();
      
      Chart.setOption(option);
      
      // 设置图表已绘制状态
      that.setData({
        chartDrawn: true
      });
      
      // 注意这里一定要返回 chart 实例，否则会影响事件处理等
      return Chart;
    });
  },

  // 获取环形饼状图配置
  getAmountChartOption() {
    console.log("=== 开始获取环形饼状图配置 ===");
    
    // 获取5种金额数据
    const stockAmount = parseFloat(this.data.supplierItem?.stockGoodsTotalString) || 0;
    const produceAmount = parseFloat(this.data.supplierItem?.produceGoodsTotalString) || 0;
    const lossAmount = parseFloat(this.data.supplierItem?.lossGoodsTotalString) || 0;
    const wasteAmount = parseFloat(this.data.supplierItem?.wasteGoodsTotalString) || 0;
    const returnAmount = parseFloat(this.data.supplierItem?.returnGoodsTotalString) || 0;
    
    console.log("解析后的金额数据:");
    console.log("库存金额:", stockAmount, "原始值:", this.data.supplierItem?.stockGoodsTotalString);
    console.log("销售金额:", produceAmount, "原始值:", this.data.supplierItem?.produceGoodsTotalString);
    console.log("损耗金额:", lossAmount, "原始值:", this.data.supplierItem?.lossGoodsTotalString);
    console.log("废弃金额:", wasteAmount, "原始值:", this.data.supplierItem?.wasteGoodsTotalString);
    console.log("退货金额:", returnAmount, "原始值:", this.data.supplierItem?.returnGoodsTotalString);
    
    const totalAmount = stockAmount + produceAmount + lossAmount + wasteAmount + returnAmount;
    console.log("总金额:", totalAmount);
    
    if (totalAmount === 0) {
      console.log("⚠️ 总金额为0，显示空状态");
      // 如果没有数据，显示空状态
      return {
        title: {
          text: '暂无数据',
          left: 'center',
          top: 'center',
          textStyle: {
            color: '#999',
            fontSize: 16
          }
        }
      };
    }
    
    console.log("✅ 生成环形饼状图配置");
    // 配置环形饼状图
    return {
      tooltip: {
        trigger: 'item',
        formatter: function(params) {
          return `${params.name}\n${params.value}元 (${params.percent}%)`;
        },
        confine: true, // 限制在图表区域内
        position: function (point, params, dom, rect, size) {
          // 动态计算tooltip位置，避免超出屏幕
          const viewWidth = size.viewSize[0];
          const viewHeight = size.viewSize[1];
          const contentWidth = size.contentSize[0];
          const contentHeight = size.contentSize[1];
          
          let x = point[0];
          let y = point[1];
          
          // 如果右侧空间不够，则显示在左侧
          if (x + contentWidth > viewWidth) {
            x = x - contentWidth;
          }
          
          // 如果下方空间不够，则显示在上方
          if (y + contentHeight > viewHeight) {
            y = y - contentHeight;
          }
          
          // 确保不超出左边界和上边界
          x = Math.max(0, x);
          y = Math.max(0, y);
          
          return [x, y];
        },
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: '#fff',
        borderWidth: 1,
        textStyle: {
          color: '#fff',
          fontSize: 12,
          lineHeight: 18
        },
        extraCssText: 'max-width: 200px; word-wrap: break-word; padding: 8px 12px; min-height: 60px;'
      },
      legend: {
        show: false // 不显示图例，因为我们有自定义的图例
      },
      series: [
        {
          name: '金额统计',
          type: 'pie',
          radius: ['70%', '90%'], // 内外半径，形成环形
          center: ['50%', '50%'], // 居中
          silent: true, // 禁用点击功能
          avoidLabelOverlap: false,
          label: {
            show: false // 不显示标签，保持简洁
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '12',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: [
            {
              value: stockAmount,
              name: '库存金额',
              itemStyle: { color: '#007aff' }
            },
            {
              value: produceAmount,
              name: '销售金额',
              itemStyle: { color: '#66bb6a' }
            },
            {
              value: lossAmount,
              name: '损耗金额',
              itemStyle: { color: '#ffa726' }
            },
            {
              value: wasteAmount,
              name: '废弃金额',
              itemStyle: { color: '#ff6b6b' }
            },
            {
              value: returnAmount,
              name: '退货金额',
              itemStyle: { color: '#000' }
            }
          ]
        }
      ]
    };
  },

  // 初始化ECharts图表（保留原方法，但不再使用）
  _initEChartsChart(chart) {
    // 获取4种金额数据
    const produceAmount = parseFloat(this.data.supplierItem?.produceGoodsTotalString) || 0;
    const lossAmount = parseFloat(this.data.supplierItem?.lossGoodsTotalString) || 0;
    const returnAmount = parseFloat(this.data.supplierItem?.returnGoodsTotalString) || 0;
    const wasteAmount = parseFloat(this.data.supplierItem?.wasteGoodsTotalString) || 0;
    
    const totalAmount = produceAmount + lossAmount + returnAmount + wasteAmount;
    
    if (totalAmount === 0) {
      // 如果没有数据，显示空状态
      chart.setOption({
        title: {
          text: '暂无数据',
          left: 'center',
          top: 'center',
          textStyle: {
            color: '#999',
            fontSize: 16
          }
        }
      });
      return;
    }
    
    // 配置环形饼状图
    const option = {
      tooltip: {
        trigger: 'item',
        formatter: function(params) {
          return `${params.name}\n${params.value}元 (${params.percent}%)`;
        }
      },
      legend: {
        show: false // 不显示图例，因为我们有自定义的图例
      },
      series: [
        {
          name: '金额统计',
          type: 'pie',
          radius: ['40%', '70%'], // 内外半径，形成环形
          center: ['50%', '50%'], // 居中
          silent: true, // 禁用点击功能
          avoidLabelOverlap: false,
          label: {
            show: false // 不显示标签，保持简洁
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '14',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: [
            {
              value: produceAmount,
              name: '销售金额',
              itemStyle: { color: '#007aff' }
            },
            {
              value: lossAmount,
              name: '损耗金额',
              itemStyle: { color: '#ff6b6b' }
            },
            {
              value: returnAmount,
              name: '退货金额',
              itemStyle: { color: '#ffa726' }
            },
            {
              value: wasteAmount,
              name: '废弃金额',
              itemStyle: { color: '#66bb6a' }
            }
          ]
        }
      ]
    };
    
    chart.setOption(option);
    
    console.log('ECharts环形饼状图初始化完成:', {
      produceAmount, lossAmount, returnAmount, wasteAmount, totalAmount
    });
  },

  // 初始化每日进货总额图表
  init_daily_chart: function () {
    
    
    var that = this;
    that.dailyEchartsComponent = that.selectComponent('#dailyChart');    
    if (!that.dailyEchartsComponent) {
      
      // 如果组件还没准备好，延迟重试
      if (!that.data.dailyChartDrawn) {
        console.log("🔄 每日进货总额图表组件未准备好，延迟重试...");
        setTimeout(() => {
          that.init_daily_chart();
        }, 500);
      }
      return;
    }
    
    that.dailyEchartsComponent.init((canvas, width, height) => {
      console.log("=== 每日进货总额图表组件init回调执行 ===");
      console.log("canvas:", canvas);
      console.log("width:", width, "height:", height);
      
      // 初始化图表
      const Chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: globalData.rpxR
      });
      console.log("每日进货总额ECharts实例创建成功:", Chart);
      
      const option = that.getDailyChartOption();
      console.log("每日进货总额图表配置选项:", option);
      
      Chart.setOption(option);
      console.log("✅ 每日进货总额图表配置设置成功");
      
      // 设置图表已绘制状态
      that.setData({
        dailyChartDrawn: true
      });
      console.log("✅ 每日进货总额图表状态已更新: dailyChartDrawn = true");
      
      // 注意这里一定要返回 chart 实例，否则会影响事件处理等
      return Chart;
    });
  },

  // 获取每日进货总额图表配置
  getDailyChartOption() {
    console.log("=== 开始获取每日进货总额图表配置 ===");
    
    const mapEveryDay = this.data.mapEveryDay || {};
    console.log("mapEveryDay原始数据:", mapEveryDay);
    
    if (!mapEveryDay || !mapEveryDay.dateList || !mapEveryDay.dayValue || 
        mapEveryDay.dateList.length === 0 || mapEveryDay.dayValue.length === 0) {
      console.log("⚠️ 没有每日进货数据，显示空状态");
      return {
        title: {
          text: '暂无每日进货数据',
          left: 'center',
          top: 'center',
          textStyle: {
            color: '#999',
            fontSize: 16
          }
        }
      };
    }
    
    // 提取日期和金额数据
    const dates = mapEveryDay.dateList || [];
    const amounts = mapEveryDay.dayValue || [];
    
    console.log("解析后的日期数据:", dates);
    console.log("解析后的金额数据:", amounts);
    
    console.log("✅ 生成每日进货总额图表配置");
    return {
      // title: {
      //   text: '供货商每日进货总额',
      //   left: 'left', // 改为靠左对齐
      //   top: 20,
      //   textStyle: {
      //     color: '#666', // 改为深灰色
      //     fontSize: 14, // 改为更小的字体
      //     fontWeight: 'normal' // 改为正常字重
      //   }
      // },
      tooltip: {
        trigger: 'axis',
        formatter: function(params) {
          const data = params[0];
          return `${data.name}日进货总额\n${data.value}元`;
        },
        confine: true, // 限制在图表区域内
        position: function (point, params, dom, rect, size) {
          // 动态计算tooltip位置，避免超出屏幕
          const viewWidth = size.viewSize[0];
          const viewHeight = size.viewSize[1];
          const contentWidth = size.contentSize[0];
          const contentHeight = size.contentSize[1];
          
          let x = point[0];
          let y = point[1];
          
          // 如果右侧空间不够，则显示在左侧
          if (x + contentWidth > viewWidth) {
            x = x - contentWidth;
          }
          
          // 如果下方空间不够，则显示在上方
          if (y + contentHeight > viewHeight) {
            y = y - contentHeight;
          }
          
          // 确保不超出左边界和上边界
          x = Math.max(0, x);
          y = Math.max(0, y);
          
          return [x, y];
        },
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: '#fff',
        borderWidth: 1,
        textStyle: {
          color: '#fff',
          fontSize: 12,
          lineHeight: 18
        },
        extraCssText: 'max-width: 200px; word-wrap: break-word; padding: 8px 12px; min-height: 50px;'
      },
      grid: {
        left: '2%',
        right: '2%',
        bottom: '0',
        top: '20%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: dates,
        axisLine: {
          lineStyle: {
            color: '#999'
          }
        },
        axisLabel: {
          color: '#666',
          fontSize: 12,
          rotate: 45
        },
        splitLine: {
          show: false
        }
      },
      yAxis: {
        type: 'value',
        name: '金额(元)',
        position: 'right', // 将Y轴显示在右侧
        nameTextStyle: {
          color: '#666',
          fontSize: 12
        },
        axisLine: {
          lineStyle: {
            color: '#999'
          }
        },
        axisLabel: {
          color: '#666',
          fontSize: 12
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: '#f0f0f0',
            type: 'dashed'
          }
        }
      },
      series: [
        {
          name: '每日进货总额',
          type: 'bar',
          data: amounts,
          itemStyle: {
            color: '#007aff',
            borderRadius: [4, 4, 0, 0]
          },
          emphasis: {
            itemStyle: {
              color: '#0056b3'
            }
          },
          barWidth: '60%'
        }
      ]
    };
  },

  
  onUnload() {
    
    //  wx.removeStorageSync('selectedSupplier');
    //  wx.removeStorageSync('supplierList');
    //  


  }

})