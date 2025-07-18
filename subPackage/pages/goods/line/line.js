import * as echarts from '../../../../ec-canvas/echarts';

const globalData = getApp().globalData;
import load from '../../../../lib/load';

var dateUtils = require('../../../../utils/dateUtil');

import {
  getDisGoodsReceiveDayData,
  getDisGoodsPriceDayData
} from '../../../../lib/apiDistributer'

Page({
  data: {
    total: null,
    ec: {
      lazyLoad: true // 延迟加载
    },
     startDate: dateUtils.getFirstDateInMonth(),
    stopDate: dateUtils.getArriveDate(0),
    dayStyle: [{
        month: 'current',
        day: new Date().getDate(),
        color: 'white',
        background: '#AAD4F5'
      },
      {
        month: 'current',
        day: new Date().getDate(),
        color: 'white',
        background: '#AAD4F5'
      },
      {
        month: 'current',
        day: new Date().getDate(),
        color: 'white',
        background: '#AAD4F5'
      }
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      windowWidth: globalData.windowWidth * globalData.rpxR,
      windowHeight: globalData.windowHeight * globalData.rpxR,     
      navBarHeight: globalData.navBarHeight  * globalData.rpxR,
      disGoodsId: options.disGoodsId,
      goodsName: options.goodsName,
      type: options.type, 
      standard: options.standard
    })

    this.echartsComponnet = this.selectComponent('#mychart');

    var disInfo = wx.getStorageSync('disInfo');
    if (disInfo) {
      this.setData({
        disInfo: disInfo,
        mdArr: disInfo.mendianDepartmentList,
        kfArr: disInfo.stockDepartmentList,
        pdArr: disInfo.purDepartmentList,
        appDep: disInfo.appSupplierDepartment,
      })
    }
    var disGoodsValue = wx.getStorageSync('disGoods');
    if (disGoodsValue) {
      this.setData({
        disGoods: disGoodsValue
      })
    }
  },

  _initData() {
    var pdArr = this.data.pdArr;
    var kfArr = this.data.kfArr;
    var mdArr = this.data.mdArr;
    var ids = "";
    for (var i = 0; i < pdArr.length; i++) {
      var selected = pdArr[i].isSelected;
      if (selected) {
        var id = pdArr[i].gbDepartmentId;
        console.log(id);
        ids = ids + id + ",";
      }
    }

    for (var i = 0; i < mdArr.length; i++) {
      var selected = mdArr[i].isSelected;
      if (selected) {
        var id = mdArr[i].gbDepartmentId;
        console.log(id);
        ids = ids + id + ",";
      }
    }

    for (var i = 0; i < kfArr.length; i++) {
      var selected = kfArr[i].isSelected;
      if (selected) {
        var id = kfArr[i].gbDepartmentId;
        console.log(id);
        ids = ids + id + ",";
      }
    }

    var data = {
      disGoodsId: this.data.disGoodsId,
      startDate: this.data.startDate,
      stopDate: this.data.stopDate,
      ids: ids,
    }
    getDisGoodsReceiveDayData(data)
      .then(res => {
        if (res) {
          console.log(res.result.data);
          this.setData({
            list: res.result.data.list,
            arr: res.result.data.arr,
            total: res.result.data.total,
          })
          this.init_echarts(); //初始化图表

        }
      })
  },

  
  _getPrice() {
    var pdArr = this.data.pdArr;
    var kfArr = this.data.kfArr;
    var mdArr = this.data.mdArr;
    var ids = "";

    for (var i = 0; i < pdArr.length; i++) {
      var selected = pdArr[i].isSelected;
      if (selected) {
        var id = pdArr[i].gbDepartmentId;
        console.log(id);
        ids = ids + id + ",";
      }
    }

    for (var i = 0; i < mdArr.length; i++) {
      var selected = mdArr[i].isSelected;
      if (selected) {
        var id = mdArr[i].gbDepartmentId;
        console.log(id);
        ids = ids + id + ",";
      }
    }

    for (var i = 0; i < kfArr.length; i++) {
      var selected = kfArr[i].isSelected;
      if (selected) {
        var id = kfArr[i].gbDepartmentId;
        console.log(id);
        ids = ids + id + ",";
      }
    }

    var data = {
      disGoodsId: this.data.disGoodsId,
      startDate: this.data.startDate,
      stopDate: this.data.stopDate,
      ids: ids,
    }
    getDisGoodsPriceDayData(data)
      .then(res => {
        if (res) {
          console.log(res.result.data);
          this.setData({
            list: res.result.data.list,
            arr: res.result.data.arr,
          })
          this.init_echarts(); //初始化图表
        }
      })
  },



  //初始化图表
  init_echarts: function () {
    this.echartsComponnet.init((canvas, width, height) => {
      // 初始化图表
      const Chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: globalData.rpxR

      });
      if (this.data.type == 'dep' || this.data.type == 'purchaseWeight') {
        Chart.setOption(this.getOption());
        // 注意这里一定要返回 chart 实例，否则会影响事件处理等
      }
      if (this.data.type == 'price') {
        Chart.setOption(this.getOptionPrice());
        // 注意这里一定要返回 chart 实例，否则会影响事件处理等
      }
      // if (this.data.type == 'purchaseWeight') {
      //   Chart.setOption(this.getOptionPurchaseWeight());
      //   // 注意这里一定要返回 chart 实例，否则会影响事件处理等
      // }

      return Chart;
    });
  },


  getOption() {
    var option = {
      xAxis: {
        name: "日期",
        type: 'category',
        data: this.data.list
      },
      yAxis: {
        name: "数量(" + this.data.standard + ")",
        type: 'value'
      },
      series: this._getYData()
    };
    return option;
  },

  getOptionPrice() {
    var option = {
      xAxis: {
        name: "日期",
        type: 'category',
        data: this.data.list
      },
      yAxis: {
        name: "单价 元/" + this.data.standard,
        type: 'value',

      },

      series: this._getYData()
    };
    return option;
  },


  _getYData() {
    var arr = this.data.arr;
    var temp = [];
    var colorTemp = [];
    for (var i = 0; i < arr.length; i++) {
      var hex = Math.floor(Math.random() * 16777216).toString(16); //生成ffffff以内16进制数
      while (hex.length < 6) { //while循环判断hex位数，少于6位前面加0凑够6位
        hex = '0' + hex;
      }
      var color = "#" + hex;
      var depName = arr[i].gbDepartmentName;
      var item = {
        depName: depName,
        color: color
      }
      colorTemp.push(item);

      if (this.data.type == 'price') {
        // 价格控制item
        if (this.data.disGoods.gbDgControlPrice == 1) {
          var item = {
            data: arr[i].dayData,
            type: 'line',
            step: 'start',
            // smooth: true,
            emphasis: {
              focus: 'series'
            },
            name: arr[i].gbDepartmentName,
            showSymbol: true,
            // symbolSize: 4, //设定实心点的大小
            itemStyle: {
              normal: {
                color: color,
                lineStyle: {
                  color: color
                }
              }
            },
            markArea: {
              itemStyle: {
                color: '#f2f9fc'
              },
              data: [
                [{
                    itemStyle: {
                      color: '#f2f9fc'
                    },
                    yAxis: '11'
                  },
                  {
                    yAxis: '13'
                  }
                ],
              ]
            },

            endLabel: {
              show: true,
              position: 'inner',
              distance: 'insideBottom',
              align: 'left',
              verticalAlign: 'top',
              rotate: 90,
              formatter: '{c}  {name|{a}}',
              fontSize: 16,
            },
          };
        } else {
          var item = {
            data: arr[i].dayData,
            type: 'line',
            step: 'start',
            // smooth: true,
            emphasis: {
              focus: 'series'
            },
            name: arr[i].gbDepartmentName,
            showSymbol: true,
            // symbolSize: 4, //设定实心点的大小
            itemStyle: {
              normal: {
                color: color,
                lineStyle: {
                  color: color
                }
              }
            },
          };
        }
      } else {
        var item = {
          data: arr[i].dayData,
          type: 'line',
          // smooth: true,
          emphasis: {
            focus: 'series'
          },
          name: arr[i].gbDepartmentName,
          showSymbol: false,
          itemStyle: {
            normal: {
              lineStyle: {
                color: color
              }
            }
          },
          endLabel: {
            show: true,
            position: 'inner',
            distance: 'insideBottom',
            align: 'left',
            verticalAlign: 'top',
            rotate: 90,
            formatter: '{c}  {name|{a}}',
            fontSize: 16,
          },
        };
      }
      temp.push(item);
    }
    this.setData({
      colorArr: colorTemp
    })
    return temp;
  },


  _makePoint(data) {
    var temp = [];
    var pointColor = "#000";

    for (var i = 0; i < data.length; i++) {
      var number = data[i];
      if (number > 10) {
        pointColor = "#ff0000";
      }
      var item = {
        symbolSize: 20, // 标注大小，半宽（半径）参数，当图形为方向或菱形则总宽度为symbolSize * 2
        itemStyle: {
          normal: {
            borderColor: '#87cefa',
            borderWidth: 1, // 标注边线线宽，单位px，默认为1
            label: {
              show: false
            }
          }
        }
      };
      temp.push(item);

    }
    return temp;

  },





  // ///////

  choiceMendian(e) {
    var mdIndex = e.currentTarget.dataset.index;
    var selected = this.data.mdArr[mdIndex].isSelected;
    var mdData = "mdArr[" + mdIndex + "].isSelected";
    console.log(selected);
    if (selected) {
      this.setData({
        [mdData]: false
      })
    } else {
      this.setData({
        [mdData]: true
      })
    }
  },

  choiceKufang(e) {
    var kfIndex = e.currentTarget.dataset.index;
    var selected = this.data.kfArr[kfIndex].isSelected;
    var kfData = "kfArr[" + kfIndex + "].isSelected";
    if (selected) {
      this.setData({
        [kfData]: false
      })
    } else {
      this.setData({
        [kfData]: true
      })
    }
  },

  choicePurchase(e) {
    var purIndex = e.currentTarget.dataset.index;
    var selected = this.data.pdArr[purIndex].isSelected;
    var purData = "pdArr[" + purIndex + "].isSelected";
    if (selected) {
      this.setData({
        [purData]: false
      })
    } else {
      this.setData({
        [purData]: true
      })
    }
  },

  // 

  showCalender(e) {
    this.setData({
      showOperation: true,
      dateType: e.currentTarget.dataset.type
    })
  },

  dayClick(e) {
    console.log(e)
    if (this.data.dateType == 'start') {
      let clickDay = e.detail.day;
      let changeDay = `dayStyle[1].day`;
      let changeBg = `dayStyle[1].background`;
      this.setData({
        // [changeMonth]: clickMonth,
        [changeDay]: clickDay,
        [changeBg]: "#187e6e"
      })

      var year = e.detail.year;
      var month = e.detail.month;
      if (month < 10) {
        month = "0" + month
      }
      var day = e.detail.day;
      if (day < 10) {
        day = "0" + day
      }
      var date = year + "-" + month + "-" + day;
      this.setData({
        startDate: date
      })
    }
    if (this.data.dateType == 'stop') {
      let clickDay = e.detail.day;
      // let clickMonth = e.detail.month;
      let changeDay = `dayStyle[2].day`;
      let changeBg = `dayStyle[2].background`;
      this.setData({
        // [changeMonth]: clickMonth,
        [changeDay]: clickDay,
        [changeBg]: "#187e6e"
      })

      var year = e.detail.year;
      var month = e.detail.month;
      if (month < 10) {
        month = "0" + month
      }
      var day = e.detail.day;
      if (day < 10) {
        day = "0" + day
      }
      var date = year + "-" + month + "-" + day;
      this.setData({
        stopDate: date
      })
    }

    this.setData({
      showOperation: false
    })
  },

  prev(e) {
    console.log(e)
  },

  next(e) {
    console.log(e);
  },

  hideMask() {
    this.setData({
      showOperation: false,
      startDate: "",
      stopDate: ""
    })
  },

  //
  toBack() {
    wx.navigateBack({
      delta: 1,
    })
  }


});