var load = require('../../../../lib/load.js');
const globalData = getApp().globalData;
var dateUtils = require('../../../../utils/dateUtil');
import apiUrl from '../../../../config.js'

import {


  getGbGoodsCostStatistics,
  getGoodsCostBySearchDate
} from '../../../../lib/apiDepOrder.js'


Page({

  onShow() {

    // 推荐直接用新API
    let windowInfo = wx.getWindowInfo();
    let globalData = getApp().globalData;

    // 详细计算过程
    const totalHeight = windowInfo.windowHeight * globalData.rpxR;
    const navBarHeight = globalData.navBarHeight * globalData.rpxR;
    const topAreaHeight = 200; // 200rpx为顶部区域、搜索区域、筛选区域和间距的预估高度
    const scrollViewHeight = totalHeight - navBarHeight - topAreaHeight;

    // 滚动状态下的高度计算（隐藏日期选择行后）
    const scrollViewHeightCollapsed = totalHeight - navBarHeight - 0; // 滚动时顶部区域为0

    console.log('=== 高度计算详情 ===');
    console.log('原始窗口高度:', windowInfo.windowHeight);
    console.log('rpxR 比例:', globalData.rpxR);
    console.log('总高度 (rpx):', totalHeight);
    console.log('导航栏高度 (rpx):', navBarHeight);
    console.log('顶部区域高度 (rpx):', topAreaHeight);
    console.log('计算出的 scrollViewHeight (rpx):', scrollViewHeight);
    console.log('scrollViewHeight 像素值:', scrollViewHeight / globalData.rpxR);
    console.log('=== 高度计算完成 ===');

    // 获取状态栏高度和胶囊按钮信息
    const statusBarHeight = windowInfo.statusBarHeight || 44;
    const menuButtonInfo = wx.getMenuButtonBoundingClientRect();
    const capsuleHeight = menuButtonInfo.height || 32;
    const capsuleTop = menuButtonInfo.top || statusBarHeight + 4;

    wx.setStorageSync('statusBarHeight', statusBarHeight);
    wx.setStorageSync('menuButtonInfo', menuButtonInfo);

    // 从本地存储恢复滚动状态，避免从其他页面返回时丢失
    const savedScrollState = wx.getStorageSync('costGoodsByDate_scrollState') || {};
    const currentIsScrolled = savedScrollState.isScrolled || false;
    const currentScrollTop = savedScrollState.scrollTop || 0;

    this.setData({
      windowWidth: windowInfo.windowWidth * globalData.rpxR,
      windowHeight: windowInfo.windowHeight * globalData.rpxR,
      navBarHeight: globalData.navBarHeight * globalData.rpxR,
      scrollViewHeight: scrollViewHeight,
      scrollViewHeightCollapsed: scrollViewHeightCollapsed,
      statusBarHeight: statusBarHeight,
      menuButtonInfo: menuButtonInfo,
      capsuleHeight: capsuleHeight,
      capsuleTop: capsuleTop,
      // 滚动状态管理
      isScrolled: currentIsScrolled,
      scrollTop: currentScrollTop,
      scrollThreshold: 200, // 滚动阈值，超过200rpx时触发收缩
    });


    if (this.data.update) {
    
    
      // 重新请求接口
      this._getGoodsCostStatistics();
    }



  },

  onHide() {
    // 页面隐藏时保存滚动状态到本地存储
    wx.setStorageSync('costGoodsByDate_scrollState', {
      isScrolled: this.data.isScrolled,
      scrollTop: this.data.scrollTop
    });
  },

  /**
   * 页面的初始数据
   */
  data: {
    update: false, // 默认值
    tabs: ["1", "2", "3"],
    tab1Index: 0,
    itemIndex: 0,
    scrollViewHeight: 600, // 默认滚动视图高度
    
    // 分页相关字段
    totalPage: 0,
    totalCount: 0,
    limit: 10,
    currentPage: 1,
    isLoading: false,
  
    // 展开状态控制
    expandedRows: {}, // 控制展开状态的对象
  },

  /**
   * 生命周期函数--监听页面加载disId=2&startDate=2025-09-01&stopDate=2025-09-01&dateType=month&fenxiType=costEcharts&searchDepId=-1&value=9999.5&allCostTotal=9999.5&id=-1&type=sales&hanzi=星期一
   */
  onLoad: function (options) {
    this.setData({
      name: options.name,
      disId: options.disId,
      greatId: options.id,
      startDate: options.startDate,
      stopDate: options.stopDate,
      hanzi: options.hanzi,
      dateType: options.dateType,
      allCostTotal: options.allCostTotal,
      value: options.value,
      type: options.type,
      fenxiType: options.fenxiType,
      searchDepId: options.searchDepId,
      url: apiUrl.server,
    })


    if (this.data.type == 'sales') {
      this.setData({
        tab1Index: 0,
        itemIndex: 0,
      })
    }
    if (this.data.type == 'loss') {
      this.setData({
        tab1Index: 1,
        itemIndex: 1,
      })
    }
    if (this.data.type == 'waste') {
      this.setData({
        tab1Index: 2,
        itemIndex: 2,
      })
    }
   

    this._getGoodsCostStatistics();

  },


  // 获取采购员统计信息
  _getGoodsCostStatistics() {
    var data = {
      startDate: this.data.startDate,
      stopDate: this.data.stopDate,
      searchDepId: this.data.searchDepId,
      startDate: this.data.startDate,
      disId: this.data.disId,
      greatId: this.data.greatId,

    };

    // 调用新的统计接口
    getGbGoodsCostStatistics(data)
      .then(res => {
        if (res.result.code == 0) {
          console.log("getGbGoodsCostStatistics......", res.result.data);

          this.setData({

            value: res.result.data.allTotal,

            salesTotal: res.result.data.salesTotal,
            lossTotal: res.result.data.lossTotal,
            wasteTotal: res.result.data.wasteTotal,
            produceCount: res.result.data.produceCount,
            lossCount: res.result.data.lossCount,
            wasteCount: res.result.data.wasteCount,

          });


          this._getInitData();


        } else {
          load.hideLoading();
          wx.showToast({
            title: res.result.msg || '获取统计信息失败',
            icon: 'none'
          });
        }
      })

  },



  //
  _getInitData() {
    console.log('=== _getInitData 开始 ===');
    console.log('当前 scrollViewHeight:', this.data.scrollViewHeight);
    console.log('当前 tab1Index:', this.data.tab1Index);
    console.log('当前 type:', this.data.type);
    console.log('请求参数:', {
      startDate: this.data.startDate,
      type: this.data.type,
      startDate: this.data.startDate,
      stopDate: this.data.stopDate,
      disId: this.data.disId,
      searchDepId: this.data.searchDepId,
      page: this.data.currentPage,
      limit: this.data.limit
    });

    // 设置加载状态
    this.setData({
      isLoading: true
    });

    var data = {
      type: this.data.type,
      startDate: this.data.startDate,
      stopDate: this.data.stopDate,
      disId: this.data.disId,
      searchDepId: this.data.searchDepId,
      page: this.data.currentPage,
      limit: this.data.limit,
      greatId: this.data.greatId,
    }
    load.showLoading("获取数据中");
    getGoodsCostBySearchDate(data)
      .then(res => {
        load.hideLoading();
        console.log(res.result.data);
        console.log("abc")
        if (res.result.code == 0) {
          const result = res.result.data;

          console.log('✅ 商品数据获取成功');
          console.log('接口返回数据：', {
            currentPage: this.data.currentPage,
            arrLength: result.arr ? result.arr.length : 0,
            totalCount: result.totalCount,
            totalPages: result.totalPages
          });

          // 如果是第一页，直接替换数据；否则追加数据
          if (this.data.currentPage === 1) {
            console.log('🔄 第一页数据，替换商品列表');
            console.log('🔄 准备 setData，数据:', result.arr);
            // 为每个商品添加独立的显示状态
            const goodsList = (result.arr || []).map(goods => ({
              ...goods,
              showCostList: false // 每个商品独立的成本详情显示状态
            }));

            this.setData({
              produceArr: goodsList,
              totalCount: result.totalCount || 0,
              totalPage: result.totalPages || 0,
            }, () => {
              // console.log('✅ setData 回调执行成功！');
              // console.log('✅ 商品列表更新完成，商品数量:', result.arr ? result.arr.length : 0);
              // console.log('✅ setData 后 produceArr 长度:', this.data.produceArr.length);
              // console.log('✅ setData 后 totalCount:', this.data.totalCount);
              // console.log('✅ setData 后 totalPage:', this.data.totalPage);
            });
            console.log('🔄 setData 调用完成，等待回调...');
          } else {
            console.log('🔄 追加数据到现有列表');
            // 为新增的商品添加独立的显示状态
            const newGoodsList = (result.arr || []).map(goods => ({
              ...goods,
              showCostList: false // 每个商品独立的成本详情显示状态
            }));

            this.setData({
              produceArr: [...this.data.produceArr, ...newGoodsList],
              totalCount: result.totalCount || 0,
              totalPage: result.totalPages || 0,
            });
            console.log('✅ 数据追加完成，总商品数量:', this.data.produceArr.length);
          }

          console.log('更新后的数据状态：', {
            produceArrLength: this.data.produceArr.length,
            totalCount: this.data.totalCount,
            totalPage: this.data.totalPage,
            currentPage: this.data.currentPage
          });


          // 设置加载状态为false
          this.setData({
            isLoading: false
          });

        } else {
          this.setData({
            produceArr: [],
            oneTotal: 0,
            salesTotal: 0,
            lossTotal: 0,
            wasteTotal: 0,
            isLoading: false
          })

          wx.showToast({
            title: res.result.msg,
            icon: 'none'
          })

        }


      })
  },

  /**
   * tabItme点击
   */
  onTab1Click(event) {
    let index = event.currentTarget.dataset.index;
    console.log('=== 标签页点击事件 ===');
    console.log('点击的索引:', index);
    console.log('事件目标:', event.currentTarget);
    console.log('数据类型:', event.currentTarget.dataset.type);
    console.log('切换前 tab1Index:', this.data.tab1Index);
    console.log('当前 scrollViewHeight:', this.data.scrollViewHeight);
    console.log('当前 windowHeight:', this.data.windowHeight);
    console.log('当前 navBarHeight:', this.data.navBarHeight);

    this.setData({
      tab1Index: index,
      itemIndex: index,
      type: event.currentTarget.dataset.type,
      // 重置分页相关状态
      currentPage: 1,
      totalPage: 0,
      totalCount: 0,
      isLoading: false,
      // 重置商品数据
      produceArr: [],
      // 重置当前标签页的初始化状态
    }, () => {
      console.log('切换后 tab1Index:', this.data.tab1Index);
      console.log('切换后 scrollViewHeight:', this.data.scrollViewHeight);
      console.log('切换后 type:', this.data.type);
      console.log('切换后 produceArr 长度:', this.data.produceArr.length);
      console.log('=== 标签页切换完成 ===');
    });

    this._getInitData();


    // 延迟检查 swiper-item 位置
    setTimeout(() => {
      this.checkSwiperItemPosition();
    }, 500);
  },

  /**
   * swiper切换完成事件 - 统一处理标签页切换逻辑
   */
  animationfinish(event) {
    const currentIndex = event.detail.current;
    const typeMap = ['sales', 'loss', 'waste'];
    const currentType = typeMap[currentIndex];

    console.log('=== swiper切换完成 ===');
    console.log('切换到索引:', currentIndex, '类型:', currentType);

    // 一次性更新所有状态
    this.setData({
      tab1Index: currentIndex,
      itemIndex: currentIndex,
      type: currentType,
      currentPage: 1, // 重置分页
      // 重置当前标签页的初始化状态
    }, () => {
      console.log('状态更新完成，开始加载数据...');
      this._getInitData();


      // 延迟检查 swiper-item 位置
      setTimeout(() => {
        this.checkSwiperItemPosition();
      }, 500);
    });
  },

  // 滚动监听事件
  onScroll(event) {
    const scrollTop = event.detail.scrollTop;
    const threshold = this.data.scrollThreshold;
    const isScrolled = scrollTop > threshold;

    console.log('=== 滚动事件触发 (costGoodsByDate) ===');
    console.log('scrollTop:', scrollTop);
    console.log('threshold:', threshold);
    console.log('isScrolled:', isScrolled);
    console.log('当前 isScrolled 状态:', this.data.isScrolled);

    // 清除之前的防抖定时器
    if (this.scrollDebounceTimer) {
      console.log('清除之前的防抖定时器');
      clearTimeout(this.scrollDebounceTimer);
    }

    // 设置防抖延迟，避免频繁处理
    this.scrollDebounceTimer = setTimeout(() => {
      console.log('防抖定时器执行，更新状态并调用检测方法');
      
      // 只有当状态改变时才更新setData，避免频繁setData
      if (isScrolled !== this.data.isScrolled) {
        console.log('滚动状态发生变化，更新状态');
        this.setData({
          isScrolled: isScrolled,
          scrollTop: scrollTop
        });
      } else {
        console.log('滚动状态未变化，只更新scrollTop');
        this.setData({
          scrollTop: scrollTop
        });
      }

      console.log('滚动状态变化:', {
        scrollTop: scrollTop,
        isScrolled: isScrolled,
        threshold: threshold
      });

      // 每次滚动都检测并关闭超出屏幕的展开内容
      this.checkAndCloseOverflowOnScroll();
    }, 50); // 50ms防抖延迟
  },

  // 导航栏按钮点击事件
  onNavTabClick(event) {
    const {
      index,
      type
    } = event.detail;
    console.log('导航栏按钮点击:', {
      index,
      type
    });

    // 调用原有的标签页点击方法
    this.onTab1Click({
      currentTarget: {
        dataset: {
          index: index,
          type: type
        }
      }
    });
  },

  // 检查 swiper-item 位置信息
  checkSwiperItemPosition() {
    console.log('=== 检查 swiper-item 位置信息 ===');

    // 查询 swiper 容器
    const swiperQuery = wx.createSelectorQuery().in(this);
    swiperQuery.select('.swiper-box').boundingClientRect();

    // 查询所有 swiper-item
    const swiperItemQuery = wx.createSelectorQuery().in(this);
    swiperItemQuery.selectAll('swiper-item').boundingClientRect();

    // 查询当前激活的 swiper-item
    const currentSwiperItemQuery = wx.createSelectorQuery().in(this);
    currentSwiperItemQuery.select(`swiper-item:nth-child(${this.data.tab1Index + 1})`).boundingClientRect();

    // 查询第二个 swiper-item 的具体位置
    const secondSwiperItemQuery = wx.createSelectorQuery().in(this);
    secondSwiperItemQuery.select('swiper-item:nth-child(2)').boundingClientRect();

    // 执行查询
    swiperQuery.exec((swiperRes) => {
      console.log('swiper 容器位置:', swiperRes[0]);
    });

    swiperItemQuery.exec((itemsRes) => {
      console.log('所有 swiper-item 位置:', itemsRes);
      itemsRes.forEach((item, index) => {
        console.log(`swiper-item ${index + 1} 位置:`, {
          top: item.top,
          left: item.left,
          width: item.width,
          height: item.height,
          bottom: item.bottom,
          right: item.right
        });
      });
    });

    currentSwiperItemQuery.exec((currentRes) => {
      console.log(`当前激活的 swiper-item (索引${this.data.tab1Index}) 位置:`, currentRes[0]);
    });

    secondSwiperItemQuery.exec((secondRes) => {
      console.log('第二个 swiper-item 位置:', secondRes[0]);
      if (secondRes[0]) {
        console.log('第二个 swiper-item 距离顶部:', secondRes[0].top, 'px');
        console.log('第二个 swiper-item 高度:', secondRes[0].height, 'px');
        console.log('第二个 swiper-item 是否可见:', secondRes[0].top >= 0 && secondRes[0].top < wx.getSystemInfoSync().windowHeight);
      }
    });

    console.log('=== swiper-item 位置检查完成 ===');
  },








  toStatistics(e) {
    console.log("toStatistics", e);
    var item = e.currentTarget.dataset.item;
    this.setData({
      item: e.currentTarget.dataset.item,
      goodsId: item.gbDistributerGoodsId,
      goodsName: item.gbDgGoodsName,
      standard: item.gbDgGoodsStandardname,
    })

    wx.setStorageSync('disGoods', item)

    var type = e.currentTarget.dataset.type;
    wx.navigateTo({
      url: '../../../../subPackage-goods/pages/goods/goodsFenxiCost/goodsFenxiCost?disGoodsId=' + this.data.goodsId + '&startDate=' + this.data.startDate + '&stopDate=' + this.data.stopDate + '&dateType=' + this.data.dateType + '&searchType=' + type + '&fenxiType=costEcharts&searchDepId=-1',
    })
  },


  toFilterType() {
    wx.navigateTo({
      url: '../../sel/filterDataType/filterDataType?searchType=mendian',
    })
  },


  toDatePageSearch() {
    this.setData({
      update: true,
      totalPage: 0,
    totalCount: 0,
    limit: 10,
    currentPage: 1,
    })
    wx.navigateTo({
      url: '../../sel/searchDate/searchDate?startDate=' + this.data.startDate +
        '&stopDate=' + this.data.stopDate + '&dateType=' + this.data.dateType,
    })
  },

  toBack() {

    wx.navigateBack({
      delta: 1,
    })

  },

  // 带页码参数的数据获取方法
  _getInitDataWithPage(page) {
    // 设置加载状态
    this.setData({
      isLoading: true
    });

    var data = {
      startDate: this.data.startDate,
      stopDate: this.data.stopDate,
      type: this.data.type,
      startDate: this.data.startDate,
      stopDate: this.data.stopDate,
      disId: this.data.disId,
      searchDepId: this.data.searchDepId,
      page: page,
      limit: this.data.limit,
      greatId: this.data.greatId,
    }
    getGoodsCostBySearchDate(data)
      .then(res => {
        console.log(res.result.data);
        console.log("abc")
        if (res.result.code == 0) {
          const result = res.result.data;

          console.log('接口返回数据：', {
            currentPage: page,
            arrLength: result.arr ? result.arr.length : 0,
            totalCount: result.totalCount,
            totalPages: result.totalPages
          });

          // 如果是第一页，直接替换数据；否则追加数据
          if (page === 1) {
            this.setData({
              produceArr: result.arr || [],
              totalCount: result.totalCount || 0,
              totalPage: result.totalPages || 0,
            })
          } else {
            this.setData({
              produceArr: [...this.data.produceArr, ...(result.arr || [])],
              totalCount: result.totalCount || 0,
              totalPage: result.totalPages || 0,
            });
          }

          console.log('更新后的数据状态：', {
            produceArrLength: this.data.produceArr.length,
            totalCount: this.data.totalCount,
            totalPage: this.data.totalPage,
            currentPage: this.data.currentPage
          });


          // 设置加载状态为false
          this.setData({
            isLoading: false
          });

        } else {
          this.setData({
            produceArr: [],
            oneTotal: 0,
            salesTotal: 0,
            lossTotal: 0,
            wasteTotal: 0,
            isLoading: false
          })

          wx.showToast({
            title: res.result.msg,
            icon: 'none'
          })

        }


      })
  },



  // 上拉加载更多 (支持scroll-view的bindscrolltolower事件)
  onReachBottom(e) {
    console.log('=== onReachBottom触发 ===', {
      eventType: e ? 'scroll-view' : 'page',
      isLoading: this.data.isLoading,
      currentPage: this.data.currentPage,
      totalPage: this.data.totalPage,
      produceArrLength: this.data.produceArr.length,
      totalCount: this.data.totalCount
    });

    // 防止重复请求
    const shouldBlock = this.data.isLoading || this.data.produceArr.length >= this.data.totalCount;
    console.log('是否阻止加载：', shouldBlock, {
      isLoading: this.data.isLoading,
      dataLength: this.data.produceArr.length,
      totalCount: this.data.totalCount,
      condition1: this.data.isLoading,
      condition2: this.data.produceArr.length >= this.data.totalCount
    });

    if (shouldBlock) {
      console.log('❌ 阻止加载');
      return;
    }

    // 检查是否还有更多页
    const canLoadMore = this.data.currentPage < this.data.totalPage;
    console.log('是否可以加载更多：', canLoadMore, {
      currentPage: this.data.currentPage,
      totalPage: this.data.totalPage,
      comparison: `${this.data.currentPage} < ${this.data.totalPage}`
    });

    if (canLoadMore) {
      const nextPage = this.data.currentPage + 1;
      console.log('✅ 开始加载下一页：', nextPage);
      // 直接使用nextPage作为参数，不依赖this.data.currentPage
      this._getInitDataWithPage(nextPage);
      this.setData({
        currentPage: nextPage
      });
    } else {
      // 已经到最后一页，显示提示
      console.log('❌ 已到最后一页，无法继续加载');
      wx.showToast({
        title: '已加载全部数据',
        icon: 'none'
      });
    }
  },

  // 展开/收起详情信息
  showOne(e) {
    const {
      itemIndex: goodsIndex,
      dayIndex: depIndex,
      index: reduceIndex
    } = e.currentTarget.dataset;
    
    const currentKey = `${goodsIndex}_${depIndex}_${reduceIndex}`;
    
    console.log('=== showOne 点击事件 ===');
    console.log('点击参数:', {
      goodsIndex,
      depIndex,
      reduceIndex,
      currentKey
    });
    console.log('当前展开状态:', this.data.expandedRows);

    // 切换展开状态
    const newExpandedRows = { ...this.data.expandedRows };
    newExpandedRows[currentKey] = !newExpandedRows[currentKey];

    this.setData({
      expandedRows: newExpandedRows
    });
    
    console.log('✅ 展开状态更新完成:', newExpandedRows);
  },

  // 控制成本详情列表的显示/隐藏
  showList(e) {
    const goodsIndex = e.currentTarget.dataset.index;
    
    // 检查索引是否有效
    if (goodsIndex === undefined || goodsIndex < 0 || goodsIndex >= this.data.produceArr.length) {
      console.error('无效的商品索引:', goodsIndex);
      return;
    }
    
    // 创建新的数组，避免直接修改原数据
    const newProduceArr = [...this.data.produceArr];
    
    // 确保商品对象有 showCostList 属性
    if (!newProduceArr[goodsIndex].hasOwnProperty('showCostList')) {
      newProduceArr[goodsIndex].showCostList = false;
    }
    
    // 切换指定商品的成本详情显示状态
    newProduceArr[goodsIndex].showCostList = !newProduceArr[goodsIndex].showCostList;
    
    // 更新数据
    this.setData({
      produceArr: newProduceArr
    });
  },

  // 滚动时检测并关闭超出屏幕的展开内容
  checkAndCloseOverflowOnScroll() {
    console.log('=== checkAndCloseOverflowOnScroll 开始执行 (costGoodsByDate) ===');
    
    // 检查所有展开的商品
    const newProduceArr = [...this.data.produceArr];
    const expandedGoods = newProduceArr.filter((goods, index) => goods.showCostList);
    
    console.log('当前数据数组长度:', newProduceArr.length);
    console.log('展开的商品数量:', expandedGoods.length);
    console.log('展开的商品索引:', expandedGoods.map((goods, index) => {
      const actualIndex = newProduceArr.findIndex(item => item === goods);
      return actualIndex;
    }));
    
    if (expandedGoods.length === 0) {
      console.log('没有展开的商品，直接返回');
      return;
    }
    
    expandedGoods.forEach((goods, goodsIndex) => {
      const actualIndex = newProduceArr.findIndex(item => item === goods);
      console.log(`处理商品 ${actualIndex}，showCostList:`, goods.showCostList);
      
      if (goods.showCostList) {
        // 使用setTimeout确保DOM已更新
        setTimeout(() => {
          console.log(`开始查询商品 ${actualIndex} 的位置信息`);
          
          const query = wx.createSelectorQuery();
          query.select(`#goods-container-${actualIndex}`).boundingClientRect();
          query.selectViewport().scrollOffset();
          
          query.exec((res) => {
            console.log(`商品 ${actualIndex} 查询结果:`, res);
            
            if (res[0] && res[1]) {
              const containerRect = res[0];
              const scrollInfo = res[1];
              
              // 计算容器是否在可视区域内
              const containerTop = containerRect.top;
              const containerBottom = containerRect.bottom;
              const viewportHeight = wx.getWindowInfo().windowHeight;
              
              console.log(`商品 ${actualIndex} 位置信息:`);
              console.log('- containerTop:', containerTop);
              console.log('- containerBottom:', containerBottom);
              console.log('- viewportHeight:', viewportHeight);
              console.log('- scrollTop:', scrollInfo.scrollTop);
              
              // 修复判断逻辑：如果容器顶部超出屏幕上方或底部超出屏幕下方，则关闭
              const isTopOut = containerTop < 0;  // 顶部超出屏幕上方
              const isBottomOut = containerBottom > viewportHeight;  // 底部超出屏幕下方
              
              console.log(`商品 ${actualIndex} 超出判断:`);
              console.log('- isTopOut:', isTopOut);
              console.log('- isBottomOut:', isBottomOut);
              
              if (isTopOut || isBottomOut) {
                console.log(`滚动检测：商品 ${actualIndex} 超出屏幕，自动关闭`);
                
                const newArr = [...this.data.produceArr];
                newArr[actualIndex].showCostList = false;
                
                this.setData({
                  produceArr: newArr
                });
                
                console.log(`商品 ${actualIndex} 已关闭展开状态`);
              } else {
                console.log(`商品 ${actualIndex} 仍在可视区域内，保持展开状态`);
              }
            } else {
              console.log(`商品 ${actualIndex} 查询失败，res[0]:`, res[0], 'res[1]:', res[1]);
            }
          });
        }, 100);
      } else {
        console.log(`商品 ${actualIndex} 未展开，跳过处理`);
      }
    });
    
    console.log('=== checkAndCloseOverflowOnScroll 执行完毕 (costGoodsByDate) ===');
  },


  toFenxi(e) {
    var item = e.currentTarget.dataset.item;
    var purId = e.currentTarget.dataset.purgoods.gbDistributerPurchaseGoodsId;
    var purchaseDate = e.currentTarget.dataset.purgoods.gbDpgPurchaseDate;
    wx.setStorageSync('disGoods', item);
    wx.navigateTo({
      url: '../../../../subPackage-goods/pages/goods/goodsFenxiPurchase/goodsFenxiPurchase?disGoodsId=' + item.gbDistributerGoodsId  + '&purGoodsId=' + purId + '&purchaseDate=' + purchaseDate
      , 

    })

  },

  toCost(e) {
    var item = e.currentTarget.dataset.item;
    wx.setStorageSync('disGoods', e.currentTarget.dataset.item);

    wx.navigateTo({
      url: '../../../../subPackage-goods/pages/goods/stockGoodsList/stockGoodsList?disGoodsId=' + item.gbDistributerGoodsId,
    })

  },


  onUnload() {
    // 清理滚动防抖定时器
    if (this.scrollDebounceTimer) {
      clearTimeout(this.scrollDebounceTimer);
    }

    // 清除缓存
    wx.removeStorageSync('selectedSupplier');
    wx.removeStorageSync('selectedPurUser');
    wx.removeStorageSync('costGoodsByDate_scrollState');
  }





})