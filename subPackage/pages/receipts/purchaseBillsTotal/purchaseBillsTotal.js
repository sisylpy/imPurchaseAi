const globalData = getApp().globalData;

import apiUrl from '../../../../config.js'
var load = require('../../../../lib/load.js');
var dateUtils = require('../../../../utils/dateUtil')

let windowWidth = 0;
let itemWidth = 0;

import {

  getDisPurchaserDateJingjing

} from '../../../../lib/apiDepOrder'
//
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sliderOffset: 0,
    sliderOffsets: [],
    sliderLeft: 0,
    tab1Index: 0,
    itemIndex: 0,
    type: 2,
    tabs: ["1", "2"],
    isFirstLoadCost: true,

    searchDepList: [],
    itemIndexDep: 0,
    tab1IndexDep: 0,
    searchDepId: -1,
    searchDepIds: -1,
    update: false,

  },

  onShow() {

    // if (this.data.update) {

      var myDate = wx.getStorageSync('myDate');
      if (myDate) {
        this.setData({
          startDate: myDate.startDate,
          stopDate: myDate.stopDate,
          dateType: myDate.dateType,
        })
      }
      this._initListData();
      if(this.data.disInfo.nxDistributerEntity !== null){
        this.setData({
          tabs: ['1','2','3']
        })
      }

    // }

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
      dateType: 'month',
      startDate: dateUtils.getFirstDateInMonth(),
      stopDate: dateUtils.getArriveDate(0),
    })

    var value = wx.getStorageSync('userInfo');
    if (value) {
      this.setData({
        userInfo: value,

      })
    }
    var disInfo = wx.getStorageSync('disInfo');
    console.log(disInfo);
    if (disInfo) {
      this.setData({
        disInfo: disInfo,
        disId: disInfo.gbDistributerId,
      })
    }

    this._initListData();
    this.clueOffset();
  },





  onTab1ClickDep(event) {
    console.log("costcosotsto", event)
    let index = event.currentTarget.dataset.index;
    this.setData({
      itemIndex: 0,
      tab1Index: 0,
      tab1IndexDep: index,
      itemIndexDep: index,
    })
    if (index > 0) {
      this.setData({
        searchDepId: event.currentTarget.dataset.item.gbDepartmentId,
      })
    } else {
      this.setData({
        searchDepId: -1
      })
    }
    const depId = event.currentTarget.dataset.id === "-1" ? "dep_fixed" : `dep_${event.currentTarget.dataset.id}`;
    console.log("idididiidididii", depId);
    this.scrollToCenter(depId);
    this._initListData();

  },


  animationfinishDep(event) {


    console.log("thisdkadiifiaidftiememinss=====", this.data.itemIndexDep)
    if (event.detail.current > 0) {
      this.setData({
        searchDepId: this.data.searchDepList[event.detail.current - 1].gbDepartmentId,
      })
    } else {
      this.setData({
        searchDepId: -1
      })
    }

    var depId = "";
    if (this.data.tab1IndexDep == 0) {
      depId = "dep_fixed";
    } else {
      depId = "dep_" + this.data.searchDepId;
    }

    console.log("idididiidididii", depId);
    this.scrollToCenter(depId);

    this._initListData();

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


  // 1 swiper 

  _initListData() {
    load.showLoading("获取数据中")
    var data = {
      startDate: this.data.startDate,
      stopDate: this.data.stopDate,
      disId: this.data.disId,
      type: this.data.type,
      searchDepIds: this.data.searchDepIds,
      searchDepId: this.data.searchDepId,
    }
    getDisPurchaserDateJingjing(data)
      .then(res => {
        load.hideLoading();
        console.log(res.result.data);
        this.setData({
          purchaseTotal: res.result.data.purchaseTotal,
          orderTotal: res.result.data.orderTotal,
          appTotal: res.result.data.appTotal,
          arr: res.result.data.arr,
          // resultDepList: res.result.data.depArr,
          // billTotal: res.result.data.billTotal,
        })

      })
  },

  /**
   * tabItme点击
   */
  onTab1Click(event) {
    console.log(event)
    let index = event.currentTarget.dataset.index;
    this.setData({
      sliderOffset: this.data.sliderOffsets[index],
      tab1Index: index,
      itemIndex: index,
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
    if (this.data.itemIndex == 0) {
      this.setData({
        type: 2
      })
    } else if (this.data.itemIndex == 1) {
      this.setData({
        type: 21
      })
    } else if (this.data.itemIndex == 2) {
      this.setData({
        type: 5
      })
    }


    this._initListData();
    this.clueOffset();
  },



  /**
   * 动画结束时会触发 animationfinish 事件
   */
  animationfinishDepItem(event) {
    console.log("findiis")
    this.setData({
      sliderOffset: this.data.sliderOffsets[event.detail.current],
      tab1Index: event.detail.current,
      itemIndex: event.detail.current,

    })


    this.setData({
      type: this.data.tab1Index
    })

    this._initListData();
    this.clueOffset();
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
        windowWidth = res.windowWidth;
        that.setData({
          sliderOffsets: tempArr,
          sliderOffset: tempArr[that.data.itemIndex],
          // sliderLeft: globalData.windowWidth * globalData.rpxR / 12,
          windowWidth: globalData.windowWidth * globalData.rpxR,
          windowHeight: globalData.windowHeight * globalData.rpxR,
        });
      }
    });
  },

  toDatePage() {
    this.setData({
      update: true
    })
    wx.navigateTo({
      url: '../../sel/date/date?startDate=' + this.data.startDate +
        '&stopDate=' + this.data.stopDate + '&dateType=' + this.data.dateType,
    })
  },


  showCalender(e) {
    this.setData({
      showOperation: true,
    })
  },


  toDetailPage(e) {
    console.log(e);
    var day = e.currentTarget.dataset.date;
    var value = e.currentTarget.dataset.value;
    var ids = "";
    if (this.data.searchDepId !== -1) {
      ids = this.data.searchDepId;
    } else {
      ids = this.data.searchDepIds;
    }
    this.setData({
      isFirstLoadCost: false
    })
    wx.navigateTo({
      url: '../purchaseBillDeatilTotal/purchaseBillDeatilTotal?day=' + day + '&value=' + value + '&type=' + this.data.type + '&searchDepIds=' + ids
    })
  },









  toMyDate() {
    this.setData({
      isFirstLoadCost: false
    })
    wx.navigateTo({
      url: '../../sel/myDate/myDate?startDate=' + this.data.startDate +
        '&stopDate=' + this.data.stopDate + '&dateType=' + this.data.dateType,
    })
  },



  toFilter() {
    this.setData({
      isFirstLoadCost: false
    })
    wx.navigateTo({
      url: '../../../../pages/sel/filterStockDepartment/filterStockDepartment',
    })
  },



  delSearch() {
    this.setData({
      searchDepIds: -1,
      searchDepName: "",

    })
    this._initListData();


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