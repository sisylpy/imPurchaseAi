var load = require('../../../../lib/load.js');
const globalData = getApp().globalData;
var dateUtils = require('../../../../utils/dateUtil');
import * as echarts from '../../../ec-canvas/echarts';

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

    // 检查是否有日期更新
   
    if(this.data.update){
     
      this._loadFilterDataFromCache();
    }

  
  },

  /**
   * 页面的初始数据
   */
  data: {

    type: "goods",
    typeString: "",
   
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
    ecs: {
      // onInit: initChart
      lazyLoad: true // 延迟加载

    },

    produceValue: [], // 初始化 produceValue
    lossValue: [], // 初始化 lossValue
    wasteValue: [], // 初始化 wasteValue
    supplierListValue: [], // 初始化供货商数据
    purUserListValue: [], // 初始化采购员数据
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({

      url: apiUrl.server,
      purGoodsId: options.purGoodsId,
      disGoodsId: options.id,
      supplierId: -1,
      selectedSupplierName: "",
      purUserId: -1,

    })
    var myDate = wx.getStorageSync('myDate');
    if(myDate){
      // 如果是自定义日期，传递具体的开始和结束日期
      var dateRange;
      if (myDate.name === 'custom' ) {
        dateRange = dateUtils.getDateRange(myDate.name, myDate.startDate, myDate.stopDate);
      } else {
        dateRange = dateUtils.getDateRange(myDate.name);
      }
    
      this.setData({
        startDate: dateRange.startDate,
        stopDate: dateRange.stopDate,
        dateType: myDate.dateType,
        hanzi: myDate.hanzi || dateRange.name,
      })
    }else{
      this.setData({
        dateType: 'month',
        startDate: dateUtils.getFirstDateInMonth(),
        stopDate: dateUtils.getArriveDate(0),
        hanzi:  "本月",
      })
    }

    this._loadFilterDataFromCache();


  },


  _getInitData() {
    var data = {
      startDate: this.data.startDate,
      stopDate: this.data.stopDate,
      disGoodsId: this.data.disGoodsId,
      supplierId: this.data.supplierId,
      purUserId: this.data.purUserId
    }
    load.showLoading("获取数据中");
    getGbPurGoodsFenxi(data)
      .then(res => {
        load.hideLoading();
        console.log(res.result.data)
        console.log("searittem",res.result.data.goodsData)
        if (res.result.code == 0) {
          var goodsCode = Number(res.result.data.goodsData.code);
          var goodsData = res.result.data;
          this.setData({
            goods: goodsData,
            searchItem: goodsData.goodsData.searchItem,
            goodsCode: goodsCode,
            supplierList: res.result.data.goodsData.supplierList,
            purUserList: res.result.data.goodsData.purUserList,
            arr: (goodsData && goodsData.gbDgGoodsName) ? [goodsData] : []
          });

          wx.setStorageSync('supplierList', res.result.data.goodsData.supplierList);
          wx.setStorageSync('purUserList', res.result.data.goodsData.purUserList);
          if (goodsCode == 0) {
            var dateList = [];
            var produceValue = [];
            var lossValue = [];
            var wasteValue = [];

            var searchProduceValue = [];
            var searchLossValue = [];
            var searchWasteValue = [];

            var supplierListValue = [];
            var purUserListValue = [];

            if (goodsData && goodsData.purEveryDay) {
              dateList = goodsData.purEveryDay.dateList || [];
              produceValue = goodsData.purEveryDay.produceValue || [];
              lossValue = goodsData.purEveryDay.lossValue || [];
              wasteValue = goodsData.purEveryDay.wasteValue || [];

              //供货商或采购员的数据
              searchProduceValue = goodsData.purEveryDay.searchProduceValue || [];
              searchLossValue = goodsData.purEveryDay.searchLossValue || [];
              searchWasteValue = goodsData.purEveryDay.searchWasteValue || [];

              supplierListValue = goodsData.purEveryDay.supplierListValue || [];
              purUserListValue = goodsData.purEveryDay.purUserListValue || [];
              // 获取供货商数据
              // var supplierListValue = goodsData.purEveryDay.supplierListValue || [];

            }
            console.log('[Debug] API dateList:', dateList);

            const xAxisDateList = this._generateDateRange(this.data.startDate, this.data.stopDate);
            console.log('[Debug] Generated xAxisDateList:', xAxisDateList);

            this.setData({
              dateList: dateList,
              produceValue: produceValue,
              lossValue: lossValue,
              wasteValue: wasteValue,
              searchProduceValue: searchProduceValue,
              searchLossValue: searchLossValue,
              searchWasteValue: searchWasteValue,
              xAxisDateList: xAxisDateList,
              supplierListValue: supplierListValue, // 添加供货商数据
              purUserListValue: purUserListValue, // 添加采购员数据
            });

            if (xAxisDateList.length > 0) {
              // 初始化合并的价格图表（包含供货商和采购员数据）
              if ((supplierListValue && supplierListValue.length > 0) || (purUserListValue && purUserListValue.length > 0)) {
                this.init_combined_price_echarts();
              }
              // 初始化合并的采购量图表（包含供货商和采购员数据）
              if ((supplierListValue && supplierListValue.length > 0) || (purUserListValue && purUserListValue.length > 0)) {
                this.init_combined_weight_echarts();
              }
              if (produceValue.length > 0) this.init_produce_echarts();
              if (lossValue.length > 0) this.init_loss_echarts();
              if (wasteValue.length > 0) this.init_waste_echarts();
              // 初始化日小计图表
              this.init_subtotal_echarts();
            }
          }
        } else {
          this.setData({
            goods: {},
            dateList: [],
            produceValue: [], // 设置空的 produceValue
            lossValue: [], // 设置空的 lossValue
            wasteValue: [], // 设置空的 wasteValue
            searchProduceValue: [], // 设置空的 searchProduceValue
            searchLossValue: [], // 设置空的 searchLossValue
            searchWasteValue: [], // 设置空的 searchWasteValue
            supplierListValue: [], // 设置空的供货商数据
            purUserListValue: [], // 设置空的采购员数据
            arr: [], // 设置空的 arr
          });
        }
      })

  },

  /**
   * 从缓存加载筛选数据
   */
  _loadFilterDataFromCache() {
    // 从缓存获取供货商信息
    var supplierItem = wx.getStorageSync('selectedSupplier');
    if (supplierItem) {
      this.setData({
        supplierId: supplierItem.supplierId,
        selectedSupplierName: supplierItem.supplierName,
        purUserId: -1,
        selectedPurUserName: ""
      });
    }
    
    // 从缓存获取采购员信息
    var purUserItem = wx.getStorageSync('selectedPurUser');
    if (purUserItem) {
      this.setData({
        purUserId: purUserItem.purUserId,
        selectedPurUserName: purUserItem.purUserName,
        supplierId: -1,
        selectedSupplierName: ""

      });
    }
    this._getInitData();

  },

  init_combined_price_echarts: function () {
    this.createSelectorQuery().select('#mychartCombinedPrice').boundingClientRect(res => {
      if (!res) return;
      const echartsComponnet = this.selectComponent('#mychartCombinedPrice');
      if (!echartsComponnet) {
        console.error('合并价格图表组件未找到');
        return;
      }
      echartsComponnet.init((canvas, width, height) => {
        const Chart = echarts.init(canvas, null, {
          width: width,
          height: height,
          devicePixelRatio: globalData.rpxR
        });
        Chart.setOption(this.getCombinedPriceOption());
        return Chart;
      });
    }).exec();
  },

  init_combined_weight_echarts: function () {
    this.createSelectorQuery().select('#mychartCombinedWeight').boundingClientRect(res => {
      if (!res) return;
      const echartsWeightComponnet = this.selectComponent('#mychartCombinedWeight');
      if (!echartsWeightComponnet) {
        console.error('合并重量图表组件未找到');
        return;
      }
      echartsWeightComponnet.init((canvas, width, height) => {
        const Chart = echarts.init(canvas, null, {
          width: width,
          height: height,
          devicePixelRatio: globalData.rpxR
        });
        Chart.setOption(this.getCombinedWeightOption());
        return Chart;
      });
    }).exec();
  },

  init_produce_echarts: function () {
    this.createSelectorQuery().select('#mychartTopProduce').boundingClientRect(res => {
      if (!res) return;
      const echartsProduceComponnet = this.selectComponent('#mychartTopProduce');
      if (!echartsProduceComponnet) {
        console.error('销售图表组件未找到');
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

  init_subtotal_echarts: function () {
    this.createSelectorQuery().select('#mychartSubtotal').boundingClientRect(res => {
      if (!res) return;
      const echartsSubtotalComponnet = this.selectComponent('#mychartSubtotal');
      if (!echartsSubtotalComponnet) {
        console.error('日小计图表组件未找到');
        return;
      }
      echartsSubtotalComponnet.init((canvas, width, height) => {
        const Chart = echarts.init(canvas, null, {
          width: width,
          height: height,
          devicePixelRatio: globalData.rpxR
        });
        Chart.setOption(this.getSubtotalOption());
        return Chart;
      });
    }).exec();
  },



  _generateDateRange(start, end) {
    const startDate = new Date(start);
    const stopDate = new Date(end);
    const dateArr = [];
    while (startDate <= stopDate) {
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

  getCombinedPriceOption() {
    const supplierData = this.data.supplierListValue || [];
    const purUserData = this.data.purUserListValue || [];

    // 为供货商和采购员生成不同的颜色
    const supplierColors = ['#4A90E2', '#50E3C2', '#4ECDC4', '#5B9BD5', '#70AD47', '#9B59B6', '#3498DB', '#1F4E79'];
    const purUserColors = ['#FF6B6B', '#FFA500', '#32CD32', '#FF1493', '#00CED1', '#FF6347', '#9370DB', '#20B2AA'];

    // 获取当前选中的筛选条件（单选）
    const selectedSupplierId = this.data.supplierId !== -1 ? this.data.supplierId : null;
    const selectedPurUserId = this.data.purUserId !== -1 ? this.data.purUserId : null;

    // 生成系列数据
    const series = [];

    // 添加供货商的价格数据
    supplierData.forEach((supplier, index) => {
      if (supplier.supplierPriceValue && supplier.supplierPriceValue.length > 0) {
        // 检查是否为选中的供货商（单选）
        const isSelected = selectedSupplierId && supplier.supplierId == selectedSupplierId;

        // 处理数据点，保留0值但转换为null以显示断点
        const processedData = supplier.supplierPriceValue.map(value => {
          const numValue = parseFloat(value);
          return numValue === 0 ? null : numValue; // 0值显示为断点
        });

        // 检查是否有非null的数据点
        const hasValidData = processedData.some(value => value !== null);

        if (hasValidData) {
          series.push({
            type: 'line',
            name: `供货商-${supplier.supplierName}${isSelected ? ' (已选中)' : ''}`,
            data: processedData,
            symbol: 'circle',
            symbolSize: isSelected ? 8 : 4, // 选中的供货商使用更大的点
            lineStyle: {
              width: isSelected ? 4 : 2, // 选中的供货商使用更粗的线
              color: supplierColors[index % supplierColors.length],
              opacity: isSelected ? 1 : 0.6 // 选中的供货商完全不透明，未选中的半透明
            },
            itemStyle: {
              color: supplierColors[index % supplierColors.length], // 点的颜色
              opacity: isSelected ? 1 : 0.6
            },
            label: {
              show: false
            },
            connectNulls: true // 连接null值，跳过中间的0值点
          });
        }
      }
    });

    // 添加采购员的价格数据
    purUserData.forEach((purUser, index) => {
      if (purUser.supplierPriceValue && purUser.supplierPriceValue.length > 0) {
        // 检查是否为选中的采购员（单选）
        const isSelected = selectedPurUserId && purUser.purUserId == selectedPurUserId;

        // 处理数据点，保留0值但转换为null以显示断点
        const processedData = purUser.supplierPriceValue.map(value => {
          const numValue = parseFloat(value);
          return numValue === 0 ? null : numValue; // 0值显示为断点
        });

        // 检查是否有非null的数据点
        const hasValidData = processedData.some(value => value !== null);

        if (hasValidData) {
          series.push({
            type: 'line',
            name: `采购员-${purUser.puUserName}${isSelected ? ' (已选中)' : ''}`,
            data: processedData,
            symbol: 'diamond',
            symbolSize: isSelected ? 10 : 6, // 选中的采购员使用更大的点
            lineStyle: {
              width: isSelected ? 4 : 2, // 选中的采购员使用更粗的线
              color: purUserColors[index % purUserColors.length],
              opacity: isSelected ? 1 : 0.6 // 选中的采购员完全不透明，未选中的半透明
            },
            itemStyle: {
              color: purUserColors[index % purUserColors.length], // 点的颜色
              opacity: isSelected ? 1 : 0.6
            },
            label: {
              show: false
            },
            connectNulls: true // 连接null值，跳过中间的0值点
          });
        }
      }
    });

    // 指定合并价格图表的配置项和数据
    var option = {
      grid: {
        left: 0,
        right: 40,
        bottom: 40,
        top: series.length > 4 ? 100 : 60, // 当系列数量超过4个时，大幅增加顶部空间
        containLabel: false
      },
      legend: {
        show: series.length > 0, // 当有数据时显示图例
        top: 10,
        left: 'center', // 改为居中显示
        orient: 'horizontal', // 改回水平排列
        textStyle: {
          fontSize: 9, // 进一步减小字体大小
          color: '#666'
        },
        itemWidth: 8,
        itemHeight: 8,
        itemGap: 15, // 增加图例项之间的间距
        formatter: function (name) {
          // 为选中的项目添加特殊标记
          if (name.includes('(已选中)')) {
            return '★ ' + name;
          }
          // 如果名称太长，截断显示
          if (name.length > 8) {
            return name.substring(0, 8) + '...';
          }
          return name;
        }
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
      series: series
    };
    return option;
  },

  getCombinedWeightOption() {
    const supplierData = this.data.supplierListValue || [];
    const purUserData = this.data.purUserListValue || [];

    // 为供货商和采购员生成不同的颜色
    const supplierColors = ['#4A90E2', '#50E3C2', '#4ECDC4', '#5B9BD5', '#70AD47', '#9B59B6', '#3498DB', '#1F4E79'];
    const purUserColors = ['#FF6B6B', '#FFA500', '#32CD32', '#FF1493', '#00CED1', '#FF6347', '#9370DB', '#20B2AA'];

    // 获取当前选中的筛选条件（单选）
    const selectedSupplierId = this.data.supplierId !== -1 ? this.data.supplierId : null;
    const selectedPurUserId = this.data.purUserId !== -1 ? this.data.purUserId : null;

    // 生成系列数据
    const series = [];

    // 添加供货商的采购量数据
    supplierData.forEach((supplier, index) => {
      if (supplier.supplierWeightValue && supplier.supplierWeightValue.length > 0) {
        // 检查是否为选中的供货商（单选）
        const isSelected = selectedSupplierId && supplier.supplierId == selectedSupplierId;

        // 过滤掉值为0的数据点
        const processedData = supplier.supplierWeightValue.map(value => {
          return parseFloat(value) === 0 ? null : parseFloat(value);
        });

        // 检查是否有非null的数据点
        const hasValidData = processedData.some(value => value !== null);

        if (hasValidData) {
          series.push({
            type: 'line',
            name: `供货商-${supplier.supplierName}${isSelected ? ' (已选中)' : ''}`,
            data: processedData,
            symbol: 'circle',
            symbolSize: isSelected ? 8 : 4, // 选中的供货商使用更大的点
            lineStyle: {
              width: isSelected ? 4 : 2, // 选中的供货商使用更粗的线
              color: supplierColors[index % supplierColors.length],
              opacity: isSelected ? 1 : 0.6 // 选中的供货商完全不透明，未选中的半透明
            },
            itemStyle: {
              color: supplierColors[index % supplierColors.length], // 点的颜色
              opacity: isSelected ? 1 : 0.6
            },
            label: {
              show: false
            },
            connectNulls: true // 连接null值，跳过中间的0值点
          });
        }
      }
    });

    // 添加采购员的采购量数据
    purUserData.forEach((purUser, index) => {
      if (purUser.supplierWeightValue && purUser.supplierWeightValue.length > 0) {
        // 检查是否为选中的采购员（单选）
        const isSelected = selectedPurUserId && purUser.purUserId == selectedPurUserId;

        // 过滤掉值为0的数据点
        const processedData = purUser.supplierWeightValue.map(value => {
          return parseFloat(value) === 0 ? null : parseFloat(value);
        });

        // 检查是否有非null的数据点
        const hasValidData = processedData.some(value => value !== null);

        if (hasValidData) {
          series.push({
            type: 'line',
            name: `采购员-${purUser.puUserName}${isSelected ? ' (已选中)' : ''}`,
            data: processedData,
            symbol: 'diamond',
            symbolSize: isSelected ? 10 : 6, // 选中的采购员使用更大的点
            lineStyle: {
              width: isSelected ? 4 : 2, // 选中的采购员使用更粗的线
              color: purUserColors[index % purUserColors.length],
              opacity: isSelected ? 1 : 0.6 // 选中的采购员完全不透明，未选中的半透明
            },
            itemStyle: {
              color: purUserColors[index % purUserColors.length], // 点的颜色
              opacity: isSelected ? 1 : 0.6
            },
            label: {
              show: false
            },
            connectNulls: true // 连接null值，跳过中间的0值点
          });
        }
      }
    });

    // 指定合并采购量图表的配置项和数据
    var option = {
      grid: {
        left: 0,
        right: 40,
        bottom: 40,
        top: series.length > 4 ? 100 : 60, // 当系列数量超过4个时，大幅增加顶部空间
        containLabel: false
      },
      legend: {
        show: series.length > 0, // 当有数据时显示图例
        top: 10,
        left: 'center', // 改为居中显示
        orient: 'horizontal', // 改回水平排列
        textStyle: {
          fontSize: 9, // 进一步减小字体大小
          color: '#666'
        },
        itemWidth: 8,
        itemHeight: 8,
        itemGap: 15, // 增加图例项之间的间距
        formatter: function (name) {
          // 为选中的项目添加特殊标记
          if (name.includes('(已选中)')) {
            return '★ ' + name;
          }
          // 如果名称太长，截断显示
          if (name.length > 8) {
            return name.substring(0, 8) + '...';
          }
          return name;
        }
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
      series: series
    };
    return option;
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

  _getSupplierData() {
    return this.data.supplierListValue || [];
  },

  getProduceOption() {
    const data = this._getEveryDayProduceValue();
    const searchData = this.data.searchProduceValue || [];
    
    // 检查是否有筛选条件（供货商或采购员）
    const hasFilter = (this.data.supplierId !== -1) || (this.data.purUserId !== -1);
    
    // 构建系列数据
    const series = [
      {
        type: 'line',
        name: '全部销售',
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
      }
    ];
    
    // 只有在有筛选条件时才添加查询数据
    if (hasFilter && searchData && searchData.length > 0) {
      series.push({
        type: 'line',
        name: '查询销售',
        data: searchData,
        smooth: true,
        areaStyle: {},
        label: {
          show: true,
          position: 'top',
          formatter: (params) => {
            return params.dataIndex === searchData.length - 1 ? params.value : '';
          }
        }
      });
    }
    
    // 指定销售图表的配置项和数据
    var option = {
      color: ['#4ECDC4', '#FF6B6B'],
      grid: {
        left: 0,
        right: 40,
        bottom: 20,
        top: 20,
        containLabel: false
      },
      legend: {
        show: true,
        top: 5,
        right: 10,
        textStyle: {
          fontSize: 12,
          color: '#666'
        }
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
      series: series
    };
    return option;
  },

  getLossOption() {
    const data = this._getEveryDayLossValue();
    const searchData = this.data.searchLossValue || [];
    
    // 检查是否有筛选条件（供货商或采购员）
    const hasFilter = (this.data.supplierId !== -1) || (this.data.purUserId !== -1);
    
    // 构建系列数据
    const series = [
      {
        type: 'line',
        name: '全部损耗',
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
      }
    ];
    
    // 只有在有筛选条件时才添加查询数据
    if (hasFilter && searchData && searchData.length > 0) {
      series.push({
        type: 'line',
        name: '查询损耗',
        data: searchData,
        smooth: true,
        areaStyle: {},
        label: {
          show: true,
          position: 'top',
          formatter: (params) => {
            return params.dataIndex === searchData.length - 1 ? params.value : '';
          }
        }
      });
    }
    
    // 指定损耗图表的配置项和数据
    var option = {
      color: ['#F5A623', '#FF6B6B'],
      grid: {
        left: 0,
        right: 40,
        bottom: 20,
        top: 20,
        containLabel: false
      },
      legend: {
        show: true,
        top: 5,
        right: 10,
        textStyle: {
          fontSize: 12,
          color: '#666'
        }
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
      series: series
    };
    return option;
  },

  getWasteOption() {
    const data = this._getEveryDayWasteValue();
    const searchData = this.data.searchWasteValue || [];
    
    // 检查是否有筛选条件（供货商或采购员）
    const hasFilter = (this.data.supplierId !== -1) || (this.data.purUserId !== -1);
    
    // 构建系列数据
    const series = [
      {
        type: 'line',
        name: '全部废弃',
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
      }
    ];
    
    // 只有在有筛选条件时才添加查询数据
    if (hasFilter && searchData && searchData.length > 0) {
      series.push({
        type: 'line',
        name: '查询废弃',
        data: searchData,
        smooth: true,
        areaStyle: {},
        label: {
          show: true,
          position: 'top',
          formatter: (params) => {
            return params.dataIndex === searchData.length - 1 ? params.value : '';
          }
        }
      });
    }
    
    // 指定废弃图表的配置项和数据
    var option = {
      color: ['#D0021B', '#FF6B6B'],
      grid: {
        left: 0,
        right: 40,
        bottom: 20,
        top: 20,
        containLabel: false
      },
      legend: {
        show: true,
        top: 5,
        right: 10,
        textStyle: {
          fontSize: 12,
          color: '#666'
        }
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
      series: series
    };
    return option;
  },

  getSubtotalOption() {
    const purEveryDay = this.data.goods && this.data.goods.purEveryDay;
    if (!purEveryDay || !purEveryDay.purchaseValue || !purEveryDay.purchaseValue.length) {
      return {
        title: {
          text: '暂无数据',
          left: 'center',
          top: 'middle',
          textStyle: {
            color: '#999',
            fontSize: 14
          }
        }
      };
    }

    const purchaseData = purEveryDay.purchaseValue;
    
    // 提取日期和金额数据
    const dateList = purchaseData.map(item => item.date);
    const subtotalData = purchaseData.map(item => parseFloat(item.purSubtotal) || 0);
    
    // 格式化日期显示（只显示日期部分）
    const formattedDates = dateList.map(dateStr => {
      const dateParts = dateStr.split('-');
      if (dateParts.length >= 3) {
        return `${parseInt(dateParts[1], 10)}/${parseInt(dateParts[2], 10)}`;
      }
      return dateStr;
    });

    // 指定日小计图表的配置项和数据
    var option = {
      color: ['#007aff'],
      grid: {
        left: 0,
        right: 40,
        bottom: 20,
        top: 20,
        containLabel: false
      },
      legend: {
        show: false
      },
      xAxis: {
        type: 'category',
        data: formattedDates,
        axisLine: {
          lineStyle: {
            color: '#ccc'
          }
        },
        axisLabel: {
          color: '#666',
          rotate: 30,
          fontSize: 12
        },
        axisTick: {
          show: false,
          alignWithLabel: true
        }
      },
      yAxis: {
        type: 'value',
        position: 'right',
        axisLabel: {
          show: true,
          color: '#666',
          formatter: function(value) {
            return '¥' + value.toFixed(0);
          }
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
      series: [
        {
          type: 'bar',
          name: '日小计',
          data: subtotalData,
          barWidth: '60%',
          itemStyle: {
            color: '#007aff'
          },
          label: {
            show: true,
            position: 'top',
            formatter: function(params) {
              return '¥' + params.value.toFixed(0);
            },
            fontSize: 10,
            color: '#666'
          }
        }
      ]
    };
    return option;
  },

  // 根据筛选条件更新图表，不重新请求接口
  _updateChartsWithFilter() {
    console.log('根据筛选条件更新图表，当前筛选条件:', {
      supplierIds: this.data.supplierIds,
      purUserIds: this.data.purUserIds
    });

    // 直接使用现有数据更新图表
    if (this.data.xAxisDateList && this.data.xAxisDateList.length > 0) {
      // 更新合并的价格图表
      if ((this.data.supplierListValue && this.data.supplierListValue.length > 0) ||
        (this.data.purUserListValue && this.data.purUserListValue.length > 0)) {
        this.init_combined_price_echarts();
      }

      // 更新合并的采购量图表
      if ((this.data.supplierListValue && this.data.supplierListValue.length > 0) ||
        (this.data.purUserListValue && this.data.purUserListValue.length > 0)) {
        this.init_combined_weight_echarts();
      }

      // 更新其他图表
      if (this.data.produceValue && this.data.produceValue.length > 0) {
        this.init_produce_echarts();
      }
      if (this.data.lossValue && this.data.lossValue.length > 0) {
        this.init_loss_echarts();
      }
      if (this.data.wasteValue && this.data.wasteValue.length > 0) {
        this.init_waste_echarts();
      }
    }
  },

  toDatePageSearch() {
    this.setData({
      update: true,
    })
    wx.navigateTo({
      url: '../../sel/searchDate/searchDate?startDate=' + this.data.startDate + '&stopDate=' + this.data.stopDate + '&dateType=' + this.data.dateType,
    })
  },



  toFilter() {
   
    // 传递当前的筛选条件
    var url = '../../sel/filterData/filterData';
    if (this.data.supplierId !== -1 || this.data.purUserId !== -1) {
      var params = [];
      if (this.data.supplierId !== -1) {
        params.push(`supplierIds=${this.data.supplierId}`);
      }
      if (this.data.purUserId !== -1) {
        params.push(`purUserIds=${this.data.purUserId}`);
      }
      if (params.length > 0) {
        url += '?' + params.join('&');
      }
    }

    wx.navigateTo({
      url: url,
    })
  },


 

  // 删除采购员选择
  delSearch() {
    this.setData({
      purUserId: -1,
      selectedPurUserName: "",
      supplierId: -1,
      selectedSupplierName: ""
    });
    // 直接更新图表，不需要重新请求接口
    // this._updateChartsWithFilter();
    wx.removeStorageSync('selectedSupplier');
    wx.removeStorageSync('selectedPurUser');
    this._getInitData()
  },


  toPurchase() {
    console.log("goodsPurList");
    wx.setStorageSync('disGoods', this.data.goods);
    wx.navigateTo({
      url: '../goodsFenxiPurchase/goodsFenxiPurchase?disGoodsId=' + this.data.goods.gbDistributerGoodsId,
    })

  },


  toCost() {
    wx.setStorageSync('disGoods', this.data.goods);
    wx.navigateTo({
      url: '../goodsFenxiCost/goodsFenxiCost?disGoodsId=' + this.data.goods.gbDistributerGoodsId+ '&startDate=' + this.data.startDate + '&stopDate=' + this.data.stopDate + '&dateType=' + this.data.dateType + '&searchType=total&fenxiType=weightEcharts' +  '&searchDepId=-1' ,
    })

  },

  toBack() {
    wx.navigateBack({
      delta: 1,
    })
  },

  onUnload() {
    // 页面退出时清除筛选缓存
    wx.removeStorageSync('disGoods');
    wx.removeStorageSync('selectedSupplier');
    wx.removeStorageSync('selectedPurUser');
    wx.removeStorageSync('supplierList');
    wx.removeStorageSync('purUserList');
    wx.removeStorageSync('supplierItem');
    wx.removeStorageSync('purUserItem');
  }

})