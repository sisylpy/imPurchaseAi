const globalData = getApp().globalData;
var load = require('../../../../lib/load.js');
var dateUtils = require('../../../../utils/dateUtil');
import * as echarts from '../../../../ec-canvas/echarts'

import apiUrl from '../../../../config.js'

let windowWidth = 0;
let itemWidth = 0;
import {
  getDistributerGoodsPriceMangement
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


    if(this.data.update || this.data.updateSearch){
      this._initWasteData();

    }
   
    if(this.data.updateMyDate){
      var myDate = wx.getStorageSync('myDate');
      if(myDate){
        this.setData({
          startDate: myDate.startDate,
          stopDate: myDate.stopDate,
          dateType: myDate.dateType,
        })
      }
      this._initWasteData();
    }

   

  },


  
  data: {
   
    ec: {
      lazyLoad: true // 延迟加载
    },
  },

  onLoad() {


    this.setData({
      url: apiUrl.server,
      update: false,
      updateMyDate: false,
      filterShow:false,
      issueDepId: -1,
      nxDisId: -1,
    })

    var myDate  = wx.getStorageSync('myDate');
    if(myDate){
      this.setData({
        startDate: myDate.startDate,
        stopDate: myDate.stopDate,
        dateType: myDate.dateType,
        filterShow: true,
      })
    }else{
     this.setData({
       dateType:  'month',
       startDate: dateUtils.getFirstDateInMonth(),
       stopDate: dateUtils.getArriveDate(0),
       filterShow: false
     })
    }



    var disInfo = wx.getStorageSync('disInfo');
    if (disInfo) {
      this.setData({
        disInfo: disInfo,
        disId: disInfo.gbDistributerId,
      })
    }
   
   
    this._initWasteData();
  },


  _initWasteData() {
   
    load.showLoading("获取数据中")
    var data = {
      startDate: this.data.startDate,
      stopDate: this.data.stopDate,
      disId:  this.data.disId,
      depId: this.data.issueDepId,
      nxDisId: this.data.nxDisId
    }
    getDistributerGoodsPriceMangement(data)
      .then(res => {
        load.hideLoading();
        console.log(res.result.data);
        if(res.result.code == 0){
          this.setData({
            priceGoodsArr: res.result.data.arr,
            highTotal: res.result.data.highTotal,
            lowerTotal: res.result.data.lowerTotal,
          })
          this.init_echarts(); 
        }else{
          this.setData({
            priceGoodsArr: []
          })
        }
      

      })
  },

  //初始化图表
  init_echarts: function () {
    console.log("iniitititiit")
    this.echartsComponnet = this.selectComponent('#mychart');
    this.echartsComponnet.init((canvas, width, height) => {
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


  getOption() {
    var option = {
      title: {
              text: "超过最高价总额: " + this.data.highTotal + "元"  + '\n' + 
              "低于最低价总额: " + this.data.lowerTotal + "元" ,
              left: 'left',
              textStyle: {
                color: '#000',
                fontSize: 16
              },
            },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow' // 'shadow' as default; can also be 'line' or 'shadow'
        }
      },
      legend: {},
      grid: {
        top: '10%',
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'value'
      },
      yAxis: {
        type: 'category',
        data: this._getGoodsName()
      },
      series: [
        {
          // name: higherArr[i].gbDgGoodsName ,
          type: 'bar',
          stack: 'total',
          label: {
            show: true
          },
          
          emphasis: {
            focus: 'series'
          },

          itemStyle:{
           normal: {
            color:function(params) {
              var index_color = params.value;
              if(index_color > 0){
                return '#a50670';
              }else{
                return "#008000"
              }
  
            },
           }
          },
         
          data: this._getWasteTotal()
        }
      ]
    };
    return option;
  },


  _getGoodsName() {
    var temp = [];

    var priceGoodsArr = this.data.priceGoodsArr;
    if(priceGoodsArr.length > 0){
      for (var i = 0; i < priceGoodsArr.length; i++) {

        var name = priceGoodsArr[i].gbDgGoodsName + '\n' + priceGoodsArr[i].goodsAveragePrice + '元/' + priceGoodsArr[i].gbDgGoodsStandardname 
        +  '\n' + priceGoodsArr[i].goodsAveragePricePercentString ;
        temp.push(name);
      }
    }
 
    return temp;
  },

  _getWasteTotal() {
    var priceGoodsArr = this.data.priceGoodsArr;
    var temp = [];
    if(priceGoodsArr.length > 0){
      for (var i = 0; i < priceGoodsArr.length; i++) {
        var data = priceGoodsArr[i].goodsPriceTotalString;
        temp.push(data);
      }
    }
    
    return temp;
  },

  _getHigherData(j) {
    var higher = this.data.higherArr[j].goodsAveragePriceHigherPercentString;
    return higher;
  },
  _getPriceData(j) {
    var higher = this.data.higherArr[j].goodsAveragePriceString;
    return higher;
  },

  _getLowerData(j) {
    var higher = this.data.higherArr[j].goodsAveragePriceLowerPercentString;
    return higher;
  },





  toFilter(){
    wx.navigateTo({
      url: '../../../../pages/sel/filterDeliveryDepartment/filterDeliveryDepartment' ,
    })
  },

  delSearch(){
    this.setData({
      issueDepId: -1,
      nxDisId: -1,
      searchDepName : "",

    })
    this._initWasteData();

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
    wx.navigateBack({
      delta: 1,
    })
  }






})