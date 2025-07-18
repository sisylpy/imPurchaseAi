const globalData = getApp().globalData;
var load = require('../../../../lib/load.js');
import * as echarts from '../../../../ec-canvas/echarts'
let windowWidth = 0;
let itemWidth = 0;
let sliderOffset = 0;
import apiUrl from '../../../../config.js'

import {
  getMendianStockTypePeriod,
  
} from '../../../../lib/apiDistributerGb.js'


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

},

  data: {
    tab1Index: 0,
    itemIndex: 0,
    tab1IndexDep: 0,
    itemIndexDep: 0,
    days: "全部",
    searchDepIds: -1,
    searchDepId: -1,
    sliderOffsets: [],
    ec: {
      lazyLoad: true // 延迟加载
    },
    windowWidth: 0,
    leftWidth: 0,
    leftWidthDep: 0,
    leftWidthDepDay: 0,
    itemIndexDep: 0,
    resultDepList: [],
    searchDepIdsArr: []
  },

  onLoad: function (options) {
    
    this.setData({
    
      // windowWidth: globalData.windowWidth * globalData.rpxR,
      // windowHeight: globalData.windowHeight * globalData.rpxR,
      // navBarHeight: globalData.navBarHeight * globalData.rpxR,
      url: apiUrl.server,
    })

    var value = wx.getStorageSync('disInfo');
    if (value) {
      this.setData({
        disInfo: value,
        disId: value.gbDistributerId,
        
      })
    
      console.log("init---------2222222")
      this._getInitData();

    }


  },
  

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
          searchDepIdsArr:[],
        })
      }
    },

   
    _getInitData() {
     
      load.showLoading("获取数据中")
      var data = {
        disId: this.data.disId,
        searchDepIds: this.data.searchDepIds,
        searchDepId: this.data.searchDepId,
        whichDay: this.data.itemIndex
      }
      getMendianStockTypePeriod(data)
        .then(res => {
          load.hideLoading();
          console.log("abc")
          console.log(res.result.data)
          if (res.result.code == 0) {
            if (res.result.data.total.restTotal > 0) {
              this.setData({
                total: res.result.data.total.restTotal,
                totalArr: res.result.data.arr,
                exceedThreeTotal: res.result.data.exceed.exceedThreeTotal,
                threeTotal: res.result.data.three.threeTotal,
                twoTotal: res.result.data.two.twoTotal,
                oneTotal: res.result.data.one.oneTotal,
                zeroTotal: res.result.data.in.zeroTotal,
                arr: res.result.data,
                resultDepList: res.result.data.depArr,

              })
              if (res.result.data.total.restTotal > 0) {
                this.init_echarts_total()
              }

            } else {
              this.setData({
                total: "0.0",
                totalArr: [],
                arr: [],
                exceedThreeTotal: "0.0",
                threeTotal: "0.0",
                twoTotal: "0.0",
                oneTotal: "0.0",
                zeroTotal: "0.0",
              })
            }
          } else {
            this.setData({
              totalArr: "0.0",
              arr: [],
              exceedThreeArr: [],
              exceedThreeTotal: "0.0",
              threeArr: [],
              threeTotal: "0.0",
              twoArr: [],
              twoTotal: "0.0",
              oneArr: [],
              oneTotal: "0.0",
              zeroArr: [],
              zeroTotal: "0.0",
            })
          }
        })
    },


    toStockPage(e) {
      var days = e.currentTarget.dataset.days;
      var dateDuring = e.currentTarget.dataset.dateduring;
      // wx.setStorageSync('itemIndex', this.data.itemIndex);
      // wx.setStorageSync('itemIndexDep', this.data.itemIndexDep);
      // wx.setStorageSync('itemIndexDepDay', this.data.itemIndexDepDay);
       var id = "";
       if(this.data.itemIndexDep == 0){
         id = this.data.searchDepIds;
       }else{
         id = this.data.searchDepId;
       }
      wx.navigateTo({
        url: '../stockEveryPage/stockEveryPage?fatherId=' + e.currentTarget.dataset.id + '&fatherName=' + e.currentTarget.dataset.name + '&days=' + days + '&color=' +
          e.currentTarget.dataset.color + '&fatherTotal=' + e.currentTarget.dataset.total + '&dateDuring=' + dateDuring + '&searchDepIds=' + id
      })
    },



    onTab1ClickDep(event) {
      let index = event.currentTarget.dataset.index;

      this.setData({
        sliderOffset: this.data.sliderOffsets[index],
        tab1IndexDep: index,
        itemIndexDep: index,
        searchDepId: event.currentTarget.dataset.id,
        tab1Index: 0,
        itemIndex: 0,
        days: "全部",
       
      })
      if (index > 0) {
        this.setData({
          depItem: event.currentTarget.dataset.item,
        })
      }
      const depId = event.currentTarget.dataset.id === "-1" ? "dep_fixed" : `dep_${event.currentTarget.dataset.id}`;
      console.log("idididiidididii", depId);
      this.scrollToCenter(depId);
    },

    scrollToCenter(depId) {
      setTimeout(() => {
        const query = wx.createSelectorQuery();

        // 查询点击的元素和 scroll-view 容器的尺寸
        query.select(`#${depId}`).boundingClientRect();
        query.select('.nav_dep').boundingClientRect();
        // query.selectViewport().scrollOffset(); // 获取 scroll-view 的滚动位置
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

    /**
     * tabItme点击
     */
    onTab1Click(event) {
      let index = event.currentTarget.dataset.index;
      console.log(event.currentTarget.dataset)
      this.setData({
        sliderOffset: this.data.sliderOffsets[index],
        tab1Index: index,
        itemIndex: index,
        days: event.currentTarget.dataset.days,
        depTotal: event.currentTarget.dataset.total,

      })

    },


    animationfinishDep(event) {
      console.log("amddddep")
      this.setData({
        tab1IndexDep: event.detail.current,
        itemIndexDep: event.detail.current,
       
      })
      if (this.data.tab1IndexDep == 0) {
        this.setData({
          searchDepId: -1,
        }) 
      } else {
        this.setData({
          searchDepId: this.data.resultDepList[event.detail.current - 1].gbDepartmentId,
        })
      }

      this._getInitData();

    },


    animationfinishZero(event) {
      console.log("findiis----zero");
      console.log(event)
      this.setData({
        tab1Index: event.detail.current,
        itemIndex: event.detail.current,
        itemIndexDep: 0,
        tab1IndexDep: 0, 
      })

      if (event.detail.current == 0) {
        this.setData({
          leftWidth: 0,
          sliderOffset: 0,
        })
      }
      if (event.detail.current == 1) {
        this.setData({
          leftWidth: 50,
          sliderOffset: this.data.sliderOffsets[event.detail.current] - 50,
        })
      }
      if (event.detail.current == 2) {
        this.setData({
          // leftWidth: 50,
          sliderOffset: this.data.sliderOffsets[event.detail.current] - 50,
        })
      }

      if (event.detail.current == 3) {
        this.setData({
          leftWidth: 100,
          sliderOffset: this.data.sliderOffsets[event.detail.current] - 100,
        })
      }
      if (event.detail.current == 4) {
        this.setData({
          leftWidth: 200,
          sliderOffset: this.data.sliderOffsets[event.detail.current] - 200,
        })
      }
      if (event.detail.current == 5 || event.detail.current == 5) {
        this.setData({
          // leftWidth: 200,
          sliderOffset: this.data.sliderOffsets[event.detail.current],
        })
      }
      console.log("init---------66666666666")
      this._getInitData();
    },

    animationfinishOne(event) {
      console.log("findiis----zero");
      console.log(event)
      this.setData({
        tab1Index: event.detail.current,
        itemIndex: event.detail.current,
       
      })

      if (event.detail.current == 0) {
        this.setData({
          leftWidth: 0,
          sliderOffset: 0,
        })
      }
      if (event.detail.current == 1) {
        this.setData({
          leftWidth: 50,
          sliderOffset: this.data.sliderOffsets[event.detail.current] - 50,
        })
      }
      if (event.detail.current == 2) {
        this.setData({
          // leftWidth: 50,
          sliderOffset: this.data.sliderOffsets[event.detail.current] - 50,
        })
      }

      if (event.detail.current == 3) {
        this.setData({
          leftWidth: 100,
          sliderOffset: this.data.sliderOffsets[event.detail.current] - 100,
        })
      }
      if (event.detail.current == 4) {
        this.setData({
          leftWidth: 200,
          sliderOffset: this.data.sliderOffsets[event.detail.current] - 200,
        })
      }
      if (event.detail.current == 5 || event.detail.current == 5) {
        this.setData({
          // leftWidth: 200,
          sliderOffset: this.data.sliderOffsets[event.detail.current],
        })
      }
      console.log("init---------66666666666")
      this._getInitData();
    },

    animationfinishDepTotal(event) {
      console.log("findiis--animationfinishDepTotal");
      console.log(event)
      this.setData({
        tab1Index: event.detail.current,
        itemIndex: event.detail.current,
      })

      if (event.detail.current == 0) {
        this.setData({
          leftWidth: 0,
          sliderOffset: 0,
        })
      }
      if (event.detail.current == 1) {
        this.setData({
          leftWidth: 50,
          sliderOffset: this.data.sliderOffsets[event.detail.current] - 50,
        })
      }
      if (event.detail.current == 2) {
        this.setData({
          // leftWidth: 50,
          sliderOffset: this.data.sliderOffsets[event.detail.current] - 50,
        })
      }

      if (event.detail.current == 3) {
        this.setData({
          leftWidth: 100,
          sliderOffset: this.data.sliderOffsets[event.detail.current] - 100,
        })
      }
      if (event.detail.current == 4) {
        this.setData({
          leftWidth: 200,
          sliderOffset: this.data.sliderOffsets[event.detail.current] - 200,
        })
      }
      if (event.detail.current == 5 || event.detail.current == 5) {
        this.setData({
          // leftWidth: 200,
          sliderOffset: this.data.sliderOffsets[event.detail.current],
        })
      }
      console.log("init---------66666666666")
      this._getInitData();
    },

    animationfinishDepFinish(event) {
      console.log("findiis--animationfinishDepFinish");
      console.log(event)
      this.setData({
        tab1Index: event.detail.current,
        itemIndex: event.detail.current,
      })

      if (event.detail.current == 0) {
        this.setData({
          leftWidth: 0,
          sliderOffset: 0,
        })
      }
      if (event.detail.current == 1) {
        this.setData({
          leftWidth: 50,
          sliderOffset: this.data.sliderOffsets[event.detail.current] - 50,
        })
      }
      if (event.detail.current == 2) {
        this.setData({
          // leftWidth: 50,
          sliderOffset: this.data.sliderOffsets[event.detail.current] - 50,
        })
      }

      if (event.detail.current == 3) {
        this.setData({
          leftWidth: 100,
          sliderOffset: this.data.sliderOffsets[event.detail.current] - 100,
        })
      }
      if (event.detail.current == 4) {
        this.setData({
          leftWidth: 200,
          sliderOffset: this.data.sliderOffsets[event.detail.current] - 200,
        })
      }
      if (event.detail.current == 5 || event.detail.current == 5) {
        this.setData({
          // leftWidth: 200,
          sliderOffset: this.data.sliderOffsets[event.detail.current],
        })
      }
      console.log("init---------66666666666")
      this._getInitData();
    },


    //初始化图表
    init_echarts_total: function () {
      if(this.data.resultDepList.length == 0 || this.data.tab1IndexDep == 0){
        if (this.data.itemIndex == '0') {
          this.echartsComponnet = this.selectComponent('#mychartTotalAll');
        } else if (this.data.itemIndex == '1') {
          this.echartsComponnet = this.selectComponent('#mychartTotalOne');
        } else if (this.data.itemIndex == '2') {
          this.echartsComponnet = this.selectComponent('#mychartTotalTwo');
        } else if (this.data.itemIndex == '3') {
          this.echartsComponnet = this.selectComponent('#mychartTotalThree');
        } else if (this.data.itemIndex == '4') {
          this.echartsComponnet = this.selectComponent('#mychartTotalFour');
        } else if (this.data.itemIndex == '5') {
          this.echartsComponnet = this.selectComponent('#mychartTotalFive');
        }
      }else{
        var depId = this.data.resultDepList[this.data.tab1IndexDep - 1].gbDepartmentId;
        var index = this.data.itemIndexDep;
        if (this.data.itemIndex == '0') {
          this.echartsComponnet = this.selectComponent('#mychartTotalAll'+depId + index);
        } else if (this.data.itemIndex == '1') {
          this.echartsComponnet = this.selectComponent('#mychartTotalOne'+depId  + index);
        } else if (this.data.itemIndex == '2') {
          this.echartsComponnet = this.selectComponent('#mychartTotalTwo'+depId  + index);
        } else if (this.data.itemIndex == '3') {
          this.echartsComponnet = this.selectComponent('#mychartTotalThree'+depId  + index);
        } else if (this.data.itemIndex == '4') {
          this.echartsComponnet = this.selectComponent('#mychartTotalFour'+depId  + index);
        } else if (this.data.itemIndex == '5') {
          this.echartsComponnet = this.selectComponent('#mychartTotalFive'+depId  + index);
        }
        console.log('#mychartTotalAll'+depId + index)

      }
      
     console.log("this.echartsComponnet", this.echartsComponnet);
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
          color: this._getAllDataColor(this.data.totalArr),
          center: ['50%', '50%'], // 设置饼图在画布中心
          radius: '40%', // 饼图的半径，内外半径
          avoidLabelOverlap: true,
          data: this._getAllData(this.data.totalArr),
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
    


    // getOptionTotal() {
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
    //       // radius: ['40%', '70%'],
    //       color: this._getAllDataColor(this.data.totalArr),
    //       top: '-20%',
    //       bottom: '10%',
    //       right: '50%',
    //       clickable: false,
    //       avoidLabelOverlap: true,
    //       data: this._getAllData(this.data.totalArr),

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

    // _getAllData(arr) {
    //   var temp = [];
    //   for (var j = 0; j < arr.length; j++) {
    //     var value = arr[j].fatherStockTotalString;
    //     var percent = arr[j].fatherStockTotalPercent;
    //     var name = arr[j].gbDfgFatherGoodsName
    //     var kucun = {
    //       value: value,
    //       name: name + '\n' +
    //         +value + "元 " + percent + "%",
    //     };
    //     temp.push(kucun);
    //   }

    //   this.setData({
    //     temp: temp
    //   })
    //   console.log("tieemeppeepe", temp);
    //   return temp;
    // },



    toFilter() {
      wx.removeStorageSync('tab1IndexDep');
      wx.navigateTo({
        url: '../../sel/filterStockDepartment/filterStockDepartment',
      })
    },



    toBack(){
      wx.navigateBack({delta: 1});
    },





})