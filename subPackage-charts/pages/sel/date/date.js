var load = require('../../../../lib/load.js');
const globalData = getApp().globalData;

let windowWidth = 0;
let itemWidth = 0;

import {
  getDate
} from '../../../../lib/apiDepOrder.js'


Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabs: [
      "日期",
      "星期",
      "月份",
      "自定义"
    ],


    sliderOffset: 0,
    sliderOffsets: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      windowWidth: globalData.windowWidth * globalData.rpxR,
      windowHeight: globalData.windowHeight * globalData.rpxR,
      navBarHeight: globalData.navBarHeight  * globalData.rpxR,
      startDate: options.startDate,
      stopDate: options.stopDate,
      dateType: options.dateType,

    })
    var datetype = this.data.dateType;
    if (datetype != null) {

      if (datetype == 'day') {
        this.setData({
          tab1Index: 0,
          itemIndex: 0,
        })
      }
      if (datetype == 'week') {
        this.setData({
          tab1Index: 1,
          itemIndex: 1,
        })
      }
      if (datetype == 'month') {
        this.setData({
          tab1Index: 2,
          itemIndex: 2,
        })
      }
    } if (datetype == 'customer')  {
      this.setData({
        tab1Index: 3,
        itemIndex: 3,

      })
    }



    this._initData();
    this.clueOffset();

  },

  _initData() {
    getDate().then(res => {
      if (res.result.code == 0) {
        console.log(res.result.data)
        this.setData({
          dayMap: res.result.data.day,
          weekMap: res.result.data.week,
          monthArr: res.result.data.month,
        })
      }
    })
  },

  selectDay(e) {
  
    var pages = getCurrentPages();
  
    var prevPage = pages[pages.length - 2]; //上一个页面
    
    // 获取选择的日期类型和名称
    var dateType = e.currentTarget.dataset.type;
    var dateName = e.currentTarget.dataset.name || '';
    var hanzi = e.currentTarget.dataset.hanzi || '';
    
    var startDate, stopDate;
    
    // 如果是 lastThirtyDays，使用客户端计算
    if (dateName === 'lastThirtyDays') {
      var dateUtils = require('../../../../utils/dateUtil');
      var dateRange = dateUtils.getDateRange('lastThirtyDays');
      startDate = dateRange.startDate;
      stopDate = dateRange.stopDate;
      console.log('使用客户端计算的 lastThirtyDays:', startDate, '到', stopDate);
    } else {
      // 其他情况使用服务器数据
      startDate = e.currentTarget.dataset.startdate;
      stopDate = e.currentTarget.dataset.stopdate;
    }
    
    //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
    prevPage.setData({
      update: true,
      updateMyDate: false,
      dateType: dateType,
      startDate: startDate,
      stopDate: stopDate,
    })
    
  
    console.log("selectDayselectDay")
    var myDate = {
      dateType: dateType,
      name: dateName,
      hanzi: hanzi,
    }
    wx.setStorageSync('myDate', myDate)
    wx.navigateBack({
      delta: 1,
    })
  },

  _countCompareData(e) {
    var startData = e.currentTarget.dataset.startdate;
    var newDate = new Date(startData);
    newDate.setTime(newDate.getTime() - 24 * 60 * 60 * 1000);
    var weeks = new Array("星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六");
    var day = newDate.getDay();
    var week = "";
    if (day == 7) {
      week = "星期日"
    } else {
      week = weeks[day];
    }

    var year = newDate.getFullYear()
    var date = newDate.getDate();
    var month = newDate.getMonth() + 1;
    if (date < 10) {
      date = '0' + date;
    }
    if (month < 10) {
      month = '0' + month;
    }
    var s3 = year + "-" + month + "-" + date
    var lastWeek = new Date(startData);
    lastWeek.setTime(newDate.getTime() - 24 * 60 * 60 * 1000 * 6);

    var weeks = new Array("星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六");
    var day = lastWeek.getDay();
    var weekLast = "";
    if (day == 7) {
      weekLast = "星期日"
    } else {
      weekLast = weeks[day];
    }

    var year = lastWeek.getFullYear()
    var date = lastWeek.getDate();
    var month = lastWeek.getMonth() + 1;
    if (date < 10) {
      date = '0' + date;
    }
    if (month < 10) {
      month = '0' + month;
    }
    var s3lastWeekDate = year + "-" + month + "-" + date
    this.setData({
      lastDate: s3,
      lastWeek: week,
      lastWeekSameDate: s3lastWeekDate,
      lastWeekSameDay: weekLast
    })

  },


  _countComareDataWeek(e) {
    var startData = e.currentTarget.dataset.startdate;
    var stopDate = e.currentTarget.dataset.stopdate;
    var newDate = new Date(startData);
    newDate.setTime(newDate.getTime() - 24 * 60 * 60 * 1000);

    var weeks = new Array("星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六");
    var day = newDate.getDay();
    var week = "";
    if (day == 7) {
      week = "星期日"
    } else {
      week = weeks[day];
    }

    var year = newDate.getFullYear()
    var date = newDate.getDate();
    var month = newDate.getMonth() + 1;
    if (date < 10) {
      date = '0' + date;
    }
    if (month < 10) {
      month = '0' + month;
    }
    var s3 = year + "-" + month + "-" + date
    var lastWeek = new Date(startData);
    lastWeek.setTime(newDate.getTime() - 24 * 60 * 60 * 1000 * 6);

    var weeks = new Array("星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六");
    var day = lastWeek.getDay();
    var weekLast = "";
    if (day == 7) {
      weekLast = "星期日"
    } else {
      weekLast = weeks[day];
    }

    var year = lastWeek.getFullYear()
    var date = lastWeek.getDate();
    var month = lastWeek.getMonth() + 1;
    if (date < 10) {
      date = '0' + date;
    }
    if (month < 10) {
      month = '0' + month;
    }
    var s3lastWeekDate = year + "-" + month + "-" + date
    this.setData({
      lastDate: s3,
      lastWeek: week,
      lastWeekSameDate: s3lastWeekDate,
      lastWeekSameDay: weekLast
    })
  },



  _countComareDataMonth(e) {
    var startData = e.currentTarget.dataset.startdate;
    var stopDate = e.currentTarget.dataset.stopdate;
    var newDate = new Date(startData);
    newDate.setTime(newDate.getTime() - 24 * 60 * 60 * 1000);

    var weeks = new Array("星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六");
    var day = newDate.getDay();
    var week = "";
    if (day == 7) {
      week = "星期日"
    } else {
      week = weeks[day];
    }

    var year = newDate.getFullYear()
    var date = newDate.getDate();
    var month = newDate.getMonth() + 1;
    if (date < 10) {
      date = '0' + date;
    }
    if (month < 10) {
      month = '0' + month;
    }
    var s3 = year + "-" + month + "-" + date
    var lastWeek = new Date(startData);
    lastWeek.setTime(newDate.getTime() - 24 * 60 * 60 * 1000 * 6);

    var weeks = new Array("星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六");
    var day = lastWeek.getDay();
    var weekLast = "";
    if (day == 7) {
      weekLast = "星期日"
    } else {
      weekLast = weeks[day];
    }

    var year = lastWeek.getFullYear()
    var date = lastWeek.getDate();
    var month = lastWeek.getMonth() + 1;
    if (date < 10) {
      date = '0' + date;
    }
    if (month < 10) {
      month = '0' + month;
    }
    var s3lastWeekDate = year + "-" + month + "-" + date
    this.setData({
      lastDate: s3,
      lastWeek: week,
      lastWeekSameDate: s3lastWeekDate,
      lastWeekSameDay: weekLast
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
          tempArr.push(itemWidth * i);
        }
        // tab 样式初始化
        var index = that.data.tab1Index;
        windowWidth = res.windowWidth;
        that.setData({
          sliderOffsets: tempArr,
          sliderOffset: tempArr[index],
          sliderLeft: 0,

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
      inventoryType: index + 1,
    })
  },


  /**
   * 动画结束时会触发 animationfinish 事件
   */
  animationfinish(event) {
    console.log("findiis")
    this.setData({
      sliderOffset: this.data.sliderOffsets[event.detail.current],
      tab1Index: event.detail.current,
      itemIndex: event.detail.current,
    })
  },


  bindChange(e) {
    this.setData({
      startDate: e.detail.value
    })
  },

  bindChangeStop(e) {
    this.setData({
      stopDate: e.detail.value
    })
  },

  // 快速选择日期范围
  quickSelect(e) {
    var type = e.currentTarget.dataset.type;
    var today = new Date();
    var startDate, stopDate, hanzi;
    
    // 格式化日期为 YYYY-MM-DD
    function formatDate(date) {
      var year = date.getFullYear();
      var month = date.getMonth() + 1;
      var day = date.getDate();
      return year + '-' + (month < 10 ? '0' + month : month) + '-' + (day < 10 ? '0' + day : day);
    }
    
    switch (type) {
      case 'last7days':
        var sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 6); // 包含今天，所以是-6
        startDate = formatDate(sevenDaysAgo);
        stopDate = formatDate(today);
        hanzi = '最近7天';
        break;
        
      case 'last15days':
        var fifteenDaysAgo = new Date(today);
        fifteenDaysAgo.setDate(today.getDate() - 14);
        startDate = formatDate(fifteenDaysAgo);
        stopDate = formatDate(today);
        hanzi = '最近15天';
        break;
        
      case 'last30days':
        var thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 29);
        startDate = formatDate(thirtyDaysAgo);
        stopDate = formatDate(today);
        hanzi = '最近30天';
        break;
        
      case 'thisMonth':
        var firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        startDate = formatDate(firstDay);
        stopDate = formatDate(today);
        hanzi = '本月';
        break;
        
      default:
        return;
    }
    
    console.log('快速选择:', type, startDate, '到', stopDate);
    
    this.setData({
      startDate: startDate,
      stopDate: stopDate
    });
    
    // 显示选择结果
    wx.showToast({
      title: hanzi + '已选择',
      icon: 'success',
      duration: 1500
    });
  },


  selectSelfDate() {
    console.log("自定义日期选择:", this.data.startDate, "到", this.data.stopDate);
    
    // 验证日期范围
    if (!this.data.startDate || !this.data.stopDate) {
      wx.showToast({
        title: '请选择开始和结束日期',
        icon: 'none'
      });
      return;
    }
    
    // 验证开始日期不能晚于结束日期
    var startDate = new Date(this.data.startDate);
    var stopDate = new Date(this.data.stopDate);
    
    if (startDate > stopDate) {
      wx.showToast({
        title: '开始日期不能晚于结束日期',
        icon: 'none'
      });
      return;
    }
    
   
    
    var myDate = {
      startDate: this.data.startDate,
      stopDate: this.data.stopDate,
      dateType: "customer",
      name: "custom",
      hanzi: "自定义",
    }
 
    wx.setStorageSync('myDate', myDate)
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2];
    prevPage.setData({
      startDate: this.data.startDate,
      stopDate: this.data.stopDate,
      dateType: "customer",
      update: true,
    })
    
    // 给所有前面的页面都设置 update: true
    // 确保至少有3个页面（当前页面、上一个页面、再前面的页面）
    if (pages.length >= 3) {
      for (let i = 0; i < pages.length - 2; i++) {
        pages[i].setData({
          update: true
        });
      }
    }
    
    wx.navigateBack({
      delta: 1,
    })
  },




  toBack() {
    wx.navigateBack({
      delta: 1,
    })
  },

})