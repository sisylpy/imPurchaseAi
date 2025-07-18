var load = require('../../../../lib/load.js');

const globalData = getApp().globalData;
var dateUtils = require('../../../../utils/dateUtil');
import apiUrl from '../../../../config.js'

import {
  nxDepGetDisFatherGoodsGb,
} from '../../../../lib/apiDistributerGb';


import {
  
  depGetDepGoodsGbPage,
  depGetDepGoodsCataGb,

  saveGbOrderJj,
  
  saveOrdersGbJjAndSaveDepGoodsSx,
  saveOrdersGbJjAndSaveGoodsSx,
  saveGbOrderJjSx,

  updateOrderGbJj,
  updateOrderGbJjSx,
  deleteOrderGb,
  nxDepGetDisCataGoods,
  getNxDisGoodsIdsByGreatId,
  // 
  changeStockStars,
  //produce

  saveDepProduceGoodsStock,
  //loss
  saveDepLossGoodsStock,
  reduceAttachmentSaveWithFile,
  reduceAttachmentSaveWithFileStar,
  //return
  saveDepReturnGoodsStock,
  //waste 
  saveDepWasteGoodsStock,

} from '../../../../lib/apiDepOrder';


Page({


  onShow() {

    // 获取窗口真实宽高（px），并根据 rpxR 换算
    const windowInfo = wx.getWindowInfo();
    const {
      rpxR,
      navBarHeight,
      statusBarHeight
    } = globalData;

    const windowWidth = windowInfo.windowWidth * rpxR;
    const windowHeight = windowInfo.windowHeight * rpxR;
    const leftTopHeight = navBarHeight * rpxR + 80 * rpxR; // 80rpx 为左侧标题区高度

    this.setData({
      windowWidth,
      windowHeight,
      navBarHeight: navBarHeight * rpxR,
      statusBarHeight: statusBarHeight * rpxR,
      leftTopHeight,
      url: apiUrl.server,
    });

    // 检查是否有新保存的订单需要更新
    this._checkAndUpdateOrderData();

  },

  /**
   * 检查并更新订单数据
   * 如果页面保存了新订单，则根据nxDepartmentDisGoodsId更新对应商品的nxDepartmentOrdersEntity
   */
  
  _checkAndUpdateOrderData() {
    console.log('=== 开始检查订单数据更新 ===');

    // 从本地存储获取新保存的订单信息
    const newOrderInfo = wx.getStorageSync('newOrderInfo');
    console.log('从本地存储获取的订单信息:', newOrderInfo);

    if (newOrderInfo && newOrderInfo.nxDepartmentDisGoodsId) {
      const {
        nxDepartmentDisGoodsId,
        nxDistributerGoodsId,
        nxDepartmentOrdersEntity
      } = newOrderInfo;
      console.log('解析的订单信息:', {
        nxDepartmentDisGoodsId,
        nxDistributerGoodsId,
        nxDepartmentOrdersEntity
      });

      // 在depGoodsArrAi中查找对应的商品
      const depGoodsArrAi = this.data.depGoodsArrAi;


      const targetIndex = depGoodsArrAi.findIndex(goods =>
        goods.nxDepartmentDisGoodsId === nxDepartmentDisGoodsId
      );

      if (targetIndex !== -1) {
        // 找到商品，更新 depGoodsDepOrderList 里的对应订单
        const orderList = this.data.depGoodsArrAi[targetIndex].depGoodsDepOrderList || [];
        const updatedOrder = nxDepartmentOrdersEntity;
        const orderId = updatedOrder.nxDepartmentOrdersId;
        let found = false;
        for (let j = 0; j < orderList.length; j++) {
          if (orderList[j].nxDepartmentOrdersId === orderId) {
            const updatePath = `depGoodsArrAi[${targetIndex}].depGoodsDepOrderList[${j}]`;
            console.log('更新depGoodsArrAi路径:', updatePath);
            this.setData({
              [updatePath]: updatedOrder
            });
            found = true;
            break;
          }
        }
        if (!found) {
          // 如果没找到，说明是新增订单，直接 push
          const updatePath = `depGoodsArrAi[${targetIndex}].depGoodsDepOrderList`;
          orderList.push(updatedOrder);
          this.setData({
            [updatePath]: orderList
          });
          console.log('depGoodsArrAi 新增订单:', updatePath);
        }
      }

      if (nxDistributerGoodsId && this.data.goodsList && this.data.goodsList.length > 0) {
        this._updateGoodsListOrder(nxDistributerGoodsId, nxDepartmentOrdersEntity);
      }


      // 清除本地存储的订单信息
      wx.removeStorageSync('newOrderInfo');
    }

  },
  /**
   * 更新goodsList中对应商品的订单信息
   */
  _updateGoodsListOrder(nxDistributerGoodsId, nxDepartmentOrdersEntity) {

    const goodsList = this.data.goodsList;

    // 遍历goodsList中的所有商品
    for (let i = 0; i < goodsList.length; i++) {
      const goods = goodsList[i];
      console.log(`检查goodsList[${i}]:`, {
        goodsId: goods.nxDistributerGoodsId,
        goodsName: goods.nxDgGoodsName,
        currentOrder: goods.nxDepartmentOrdersEntity
      });

      if (goods.nxDistributerGoodsId === nxDistributerGoodsId) {
        // 找到对应商品，更新其nxDepartmentOrdersEntity
        const updatePath = `goodsList[${i}].nxDepartmentOrdersEntity`;

        this.setData({
          [updatePath]: nxDepartmentOrdersEntity
        });
        updated = true;
        break;
      }
    }


  },



  data: {
    priceLevel: "",
  
    url: "",

    editApply: false,
    editOrderIndex: "",
    applyNumber: "",
    applyRemark: "",
    applyStandardName: "",
    applySubtotal: "",
    depGoods: null,
    itemNxDis: null,
    itemGbDis: null,
    maskHeight: "",
    statusBarHeight: "",
    windowHeight: "",
    windowWidth: "",
    tab1Index: 0,
    itemIndex: 0,
    sliderOffset: 0,
    sliderOffsets: [],
    sliderLeft: 0,

    showInd: false,
   
    tabs: [{
      id: 0,
      words: "我的商品"
    }, {
      id: 1,
      words: "京京市场"
    }],


    totalPages: 0,
    totalCount: 0,
    limit: 15,
    currentPage: 1,
    fatherArr: [],
    scrollTopLeft: 0,
    depGoodsArrAi: [],
    selectedSub: 0, // 选中的分类

    totalPageDis: 0,
    totalCountDis: 0,
    limit: 15,
    currentPageDis: 1,
    grandList: [],
    fatherArrDis: [],
    sortDepGoodsArrDis: [],
    goodsList: [],
    leftGreatId: "",
    greatName: "",
    leftIndex: 0,

    isLoading: false,

    update: false,

    showAllSubCat: false,
    activeSubCatId: '', // 当前激活的分类ID
    scrollIntoView: '', // 滚动到指定分类
    categoryPositions: [], // 存储分类位置信息
    goodsListHeight: 0, // 新增内容区高度
    leftScrollTopNx: 0, // 左侧菜单 scroll-view 的 scrollTop

    // 新增的部门商品相关状态
    showAllSubCatDep: false, // 是否展开二级分类
    activeSubCatIdDep: '', // 当前选中的二级分类ID
    subcatScrollIntoViewDep: '', // 二级分类横向滚动位置
    scrollIntoViewDep: '', // 商品列表滚动位置
    priceLevel: 1

  },


  onLoad: function (options) {
    this.setData({
      url: apiUrl.server,
      nowTime: dateUtils.getNowTime(),
    })

    var value = wx.getStorageSync('disInfo');
    if (value) {
      this.setData({
        disInfo: value,
        disId: value.gbDistributerId,
        toDepId: value.appSupplierDepartment.gbDepartmentId
      })
    }
    var value = wx.getStorageSync('userInfo');
    if (value) {
      this.setData({
        userInfo: value,
        disId: value.gbDuDistributerId,
      })
    } else {
      this.setData({
        userInfo: null,
      })
    }


    var depValue = wx.getStorageSync('orderDepInfo');
    if (depValue) {
      this.setData({
        depInfo: depValue,
        depId: depValue.gbDepartmentId,
        disId: depValue.gbDepartmentDisId,
        depFatherId: depValue.gbDepartmentFatherId === 0 ?
          depValue.gbDepartmentId : depValue.gbDepartmentFatherId
      })

      if(depValue.gbDepartmentFatherId !== 0){
        console.log("duodudodo")
        var depName = '"' + depValue.gbDepartmentName +'"'+ '的商品';
         var data = "tabs";
        var dataItem =  
         [{
          id: 0,
          words:  depName
        }, {
          id: 1,
          words: "京京市场"
        }];
        this.setData({
          [data]: dataItem
        })
      }

    }

    this._getInitDataDep();

  },


  //部门商品
 
  _getInitDataDep() {
    load.showLoading("获取分类");
    var data = {
      disId: this.data.disId,
      depId: this.data.depInfo.gbDepartmentId
    }
    depGetDepGoodsCataGb(data).then(res => {
      load.hideLoading();
      console.log(res.result.data);
      if (res.result.code === 0 && res.result.data.cataArr.length > 0) {
        const firstSubCat = res.result.data.cataArr[0].fatherGoodsEntities[0];
        this.setData({
          
          depGoodsCataArr: res.result.data.cataArr,
          sortDepGoodsArr: res.result.data.depGoodsArr,
          lastQueryEndIndex: 0,
          hasMoreGoods: true,
          activeSubCatIdDep: firstSubCat.gbDistributerFatherGoodsId,
          subcatScrollIntoViewDep: `subcat-dep-${firstSubCat.gbDistributerFatherGoodsId}`,
          fatherArr: res.result.data.cataArr[0].fatherGoodsEntities,
          depGoodsArrAi: [],
        }, () => {
          this._getInitDataPageDep(true);
        });
      }
    });
  },


 // 全类别分页（跨分类补全）
 _getInitDataPageDep(isRefresh = false, callback) {
  if (this.data.isLoading) return;
  this.setData({
    isLoading: true
  });
  load.showLoading("加载商品…");

  depGetDepGoodsGbPage({
    limit: this.data.limit,
    page: this.data.currentPage,
    depId: this.data.depInfo.gbDepartmentId
  }).then(res => {
    load.hideLoading();
    this.setData({
      isLoading: false
    });

    if (res.result.code !== 0) {
      return wx.showToast({
        title: res.result.msg,
        icon: 'none'
      });
    }

    // 1) 拿到这一页数据
    const list = res.result.page.list || [];
    const totalPages = res.result.page.totalPage || 1;
    const totalCount = res.result.page.totalCount || 0;

    // 2) 生成 viewId，让 id 唯一且连续
    const base = isRefresh ? 0 : this.data.depGoodsArrAi.length;
    list.forEach((item, idx) => {
      item.viewId = 'goods_' + (base + idx);
    });


    // 3) 合并数据
    const merged = this.data.depGoodsArrAi.concat(list);

    // 4) 合并后按 sortDepGoodsArr 顺序排序
    const idOrder = (this.data.sortDepGoodsArr || []).map(String);
    // console.log('sortDepGoodsArr:', idOrder);
    // console.log('merged ids:', merged.map(i => i.gbDepartmentDisGoodsId));
    const sortedArr = merged.slice().sort((a, b) => {
      const idxA = idOrder.indexOf(String(a.gbDepartmentDisGoodsId));
      const idxB = idOrder.indexOf(String(b.gbDepartmentDisGoodsId));
      return (idxA === -1 ? 99999 : idxA) - (idxB === -1 ? 99999 : idxB);
    });

    // 5) 处理商品数据，添加 isFirstInCategory（对全量商品处理）
    const finalArr = this.processGoodsListDep(sortedArr);

    // 5) 写入并可回调滚动
    this.setData({
      depGoodsArrAi: finalArr,
      totalPages: totalPages,
      totalCount: totalCount,
      currentPage: this.data.currentPage,

    }, () => {
      this.calculateCategoryPositionsDep();
      if (typeof callback === 'function') {
        setTimeout(callback, 50);
      }
    });
  });
},


  /**
   * 
   */
  // 点击左侧分类
  leftMenuClickDep(e) {
    const idx = e.currentTarget.dataset.index;
    const firstSubCat = this.data.depGoodsCataArr[idx].fatherGoodsEntities[0];
    this.setData({
      selectedSub: idx,
      fatherArr: this.data.depGoodsCataArr[idx].fatherGoodsEntities,
      activeSubCatIdDep: firstSubCat.gbDistributerFatherGoodsId,
      subcatScrollIntoViewDep: `subcat-dep-${firstSubCat.gbDistributerFatherGoodsId}`,
    }, () => {
      // 检查当前已加载的商品中是否有该二级分类的商品
      const goodsArr = this.data.depGoodsArrAi;
      const hasGoods = goodsArr.some(
        item => String(item.gbDdgDisGoodsGrandId) === String(firstSubCat.gbDistributerFatherGoodsId)
      );
      
      if (hasGoods) {
        console.log('[leftMenuClickDep] 商品足够，直接滚动');
        this.setData({
          scrollIntoViewDep: `cat-dep-${firstSubCat.gbDistributerFatherGoodsId}`
        }, () => {
          console.log('[leftMenuClickDep] 滚动位置已设置:', {
            scrollIntoViewDep: `cat-dep-${firstSubCat.gbDistributerFatherGoodsId}`
          });
        });
      } else {
        console.log('[leftMenuClickDep] 商品不足，继续请求接口');
        // 直接调用loadGoodsBySubCatIdDep方法，请求特定分类的商品
        this.loadGoodsBySubCatIdDep(firstSubCat.gbDistributerFatherGoodsId, this.data.currentPage + 1, goodsArr);
      }
    });
  },


  // 滚动到底加载下一页（全类别模式）pages/resGoodsLess/resGoodsLess
  onReachBottomDep() {
    if (this.data.isLoading || this.data.currentPage >= this.data.totalPages) return;
    this.setData({
      currentPage: this.data.currentPage + 1
    }, () => {
      this._getInitDataPageDep(false);
    });
  },

  onSubCatTapDep(e) {
    const subCatId = e.currentTarget.dataset.id;
    this.setData({
      activeSubCatIdDep: subCatId,
      subcatScrollIntoViewDep: `subcat-dep-${subCatId}`,
      showAllSubCatDep: false,
    });

    // 修正：统计该二级分类商品数量
    const goodsArr = this.data.depGoodsArrAi;
    
    const hasGoods = goodsArr.some(
      item => String(item.gbDdgDisGoodsGrandId) === String(subCatId)
    );
    if (hasGoods) {
      console.log('[onSubCatTapDep] 商品足够，直接滚动');
    wx.createSelectorQuery()
        .select(`#cat-dep-${subCatId}`)
        .boundingClientRect(rect => {
          if (rect) {
            this.setData({
              scrollIntoViewDep: 'cat-dep-'+subCatId 
            });
          }
        })
        .exec();
    } else {
      console.log('[onSubCatTapDep] 商品不足，继续请求接口');
      // 递归请求接口，page 参数递增
      this.loadGoodsBySubCatIdDep(subCatId, this.data.currentPage + 1, goodsArr);
    }
  },

  // 加载指定二级分类的商品
  loadGoodsBySubCatIdDep(subCatId, page = 1, accumulatedGoods = []) {
    if (this.data.isLoading) return;

    this.setData({
      isLoading: true
    });
    load.showLoading("加载商品")
    depGetDepGoodsGbPage({
      depId: this.data.depId,
      limit: this.data.limit,
      page: page,
    }).then(res => {
      this.setData({
        isLoading: false
      });
      load.hideLoading();
      if (res.result.code == 0) {
        // 1) 拿到这一页数据
        const list = res.result.page.list || [];
        const totalPages = res.result.page.totalPage || 1;
        const totalCount = res.result.page.totalCount || 0;

        // 2) 生成 viewId，让 id 唯一且连续
        const base = this.data.depGoodsArrAi.length;
        list.forEach((item, idx) => {
          item.viewId = 'goods_' + (base + idx);
        });
        for(var i = 0 ; i < list.length ; i++){
          console.log("第" + page + "页面请求的数据是:" + list[i].gbDdgDepGoodsName);
        }

        // 3) 合并数据
        const merged = this.data.depGoodsArrAi.concat(list);

        // 4) 合并后按 sortDepGoodsArr 顺序排序
        const idOrder = (this.data.sortDepGoodsArr || []).map(String);
        console.log('sortDepGoodsArr:', idOrder);
        console.log('merged ids:', merged.map(i => i.gbDepartmentDisGoodsId));
        const sortedArr = merged.slice().sort((a, b) => {
          const idxA = idOrder.indexOf(String(a.gbDepartmentDisGoodsId));
          const idxB = idOrder.indexOf(String(b.gbDepartmentDisGoodsId));
          return (idxA === -1 ? 99999 : idxA) - (idxB === -1 ? 99999 : idxB);
        });

        // 5) 处理商品数据，添加 isFirstInCategory（对全量商品处理）
        const finalArr = this.processGoodsListDep(sortedArr);

        // 5) 写入并可回调滚动
        this.setData({
          depGoodsArrAi: finalArr,
          currentPage: page,
          totalPages: totalPages,
          totalCount: totalCount,
        }, () => {
          // 新增：数据加载后自动滚动到目标分类商品
          const goodsArr = this.data.depGoodsArrAi;
          const idx = goodsArr.findIndex(item => String(item.gbDdgDisGoodsGrandId) === String(subCatId));
          // let count = 0;
          // if (idx !== -1) {
          //   for (let i = idx; i < goodsArr.length; i++) {
          //     if (String(goodsArr[i].gbDdgDisGoodsGrandId) === String(subCatId)) {
          //       count++;
          //     }
          //   }
          // }
          // console.log('[loadGoodsBySubCatIdDep] subCatId:', subCatId, 'limit:', this.data.limit, 'idx:', idx, 'count:', count, 'depGoodsArrAi.length:', goodsArr.length);
          if (idx !== -1) {
            console.log('[loadGoodsBySubCatIdDep] 自动滚动到目标商品', subCatId);
            wx.createSelectorQuery()
              .select(`#cat-dep-${subCatId}`)
              .boundingClientRect(rect => {
                if (rect) {    
                  this.setData({
                    scrollIntoViewDep: 'cat-dep-'+subCatId 
                  }, () => {
                  
                  });
                } else {
                  console.warn('[loadGoodsBySubCatIdDep] 未找到目标商品锚点', subCatId);
                }
              })
              .exec();
          } else {
            console.log('[loadGoodsBySubCatIdDep] 商品数量不足，继续请求下一页', subCatId);
            // 如果还有下一页，继续请求
            if (page < totalPages) {
              // 递归调用自身，请求下一页
              this.loadGoodsBySubCatIdDep(subCatId, page + 1, goodsArr);
            } else {
              console.log('[loadGoodsBySubCatIdDep] 已加载所有页面，仍未找到目标分类商品', subCatId);
            }
          }
          this.calculateCategoryPositionsDep();
        });


      
      } else {
        wx.showToast({
          title: '商品加载失败',
          icon: 'none'
        });
      }
    }).catch(err => {
      this.setData({
        isLoading: false
      });
      wx.showToast({
        title: '加载错误，请稍后再试',
        icon: 'none'
      });
    });
  },

  // 处理商品数据，添加分类信息
  processGoodsListDep(list) {
    // 先按分类ID排序
    // list.sort((a, b) => a.gbDdgDisGoodsGrandId - b.gbDdgDisGoodsGrandId);
    let currentCategory = null;
    const result = list.map(item => {
      if (item.gbDdgDisGoodsGrandId !== currentCategory) {
        currentCategory = item.gbDdgDisGoodsGrandId;
        const obj = {
          ...item,
          isFirstInCategory: true,
          categoryName: this.getCategoryNameDep(item.gbDdgDisGoodsGrandId)
        };

        return obj;
      }
      const obj = {
        ...item,
        isFirstInCategory: false,
        categoryName: this.getCategoryNameDep(item.gbDdgDisGoodsGrandId)
      };

      return obj;
    });
    return result;
  },

  // 获取分类名称
  getCategoryNameDep(categoryId) {
    const category = this.data.fatherArr.find(item =>
      item.gbDistributerFatherGoodsId === categoryId
    );
    return category ? category.gbDfgFatherGoodsName : '';
  },

  // 切换二级分类展开/收起状态
  toggleSubCatDep() {
    this.setData({
      showAllSubCatDep: !this.data.showAllSubCatDep
    });
  },

  // 阻止遮罩层滚动
  stopScroll() {
    return false;
  },

  // 部门端商品滚动时联动二级分类高亮
  onGoodsScrollDep(e) {
    // console.log('[onGoodsScrollDep] 触发', e && e.detail && e.detail.scrollTop);
    // 精准高亮二级分类，并联动一级分类
    const scrollTop = e && e.detail && typeof e.detail.scrollTop === 'number' ? e.detail.scrollTop : 0;
    const positions = this.data.categoryPositionsDep || [];
    console.log('[onGoodsScrollDep] 当前 scrollTop:', scrollTop, 'positions:', positions);
    let activeId = '';
    const threshold = 100;
    for (let i = positions.length - 1; i >= 0; i--) {
      // console.log(`[onGoodsScrollDep] i=${i}, scrollTop=${scrollTop}, positions[i].top=${positions[i].top}, acid=${positions[i].id}`);
      if (scrollTop >= positions[i].top) {
        activeId = positions[i].id;
        // console.log('i======', i ,'========== scrollTop ',scrollTop ,'>= positions[i]positions[i].top:', positions[i].top, 'acid=',activeId );
        break;
      }
    }
    // 边界兜底：如果没找到，默认第一个
    if (!activeId && positions.length > 0) {
      activeId = positions[0].id;
      // console.log('[onGoodsScrollDep] 边界兜底，activeId 设为第一个:', activeId);
    }
    // 二级分类高亮
    if (activeId && activeId !== this.data.activeSubCatIdDep) {
      this.setData({
        activeSubCatIdDep: activeId,
        subcatScrollIntoViewDep: `subcat-dep-${activeId}`
      });
      // console.log('[onGoodsScrollDep] setData 精准高亮二级分类:', activeId);
    } else {
      // console.log('[onGoodsScrollDep] 未触发 setData，activeId 未变:', activeId);
    }
    // 联动一级分类高亮
    if (activeId && this.data.depGoodsCataArr) {
      // 找到当前二级分类对应的一级分类id
      let greatId = '';
      // depGoodsArrAi 里找第一个 grandId=activeId 的商品，取其 greatId
      const item = this.data.depGoodsArrAi.find(g => String(g.gbDdgDisGoodsGrandId) === String(activeId));
      if (item) {
        greatId = item.gbDdgDisGoodsGreatId;
      }
      // 在 depGoodsCataArr 里找 greatId 的索引
      const subIndex = this.data.depGoodsCataArr.findIndex(
        c => String(c.gbDistributerFatherGoodsId) === String(greatId)
      );
      // console.log('[onGoodsScrollDep] 联动一级分类 greatId:', greatId, '一级分类索引:', subIndex, '当前 selectedSub:', this.data.selectedSub);
      if (subIndex !== -1 && subIndex !== this.data.selectedSub) {
          this.setData({
            selectedSub: subIndex,
          fatherArr: this.data.depGoodsCataArr[subIndex].fatherGoodsEntities
        });
        // console.log('[onGoodsScrollDep] setData 联动一级分类 selectedSub', subIndex);
      } else {
        // console.log('[onGoodsScrollDep] 未触发 setData 联动一级分类');
      }
    }
  },

  // 1. 新增：部门端商品分类锚点位置缓存
  calculateCategoryPositionsDep() {
    // console.log('[calculateCategoryPositionsDep] 方法开始执行');
    const query = wx.createSelectorQuery();
    query.selectAll('.goods-category-title-dep').boundingClientRect();
    query.select('.goods-list-dep').boundingClientRect();
    query.exec((res) => {
      // console.log('[calculateCategoryPositionsDep] query.exec 回调，res:', res);
      if (res[0] && res[1]) {
        const listRect = res[1];
        // 先计算所有原始 top
        let rawPositions = res[0].map(item => ({
          id: item.id.replace('cat-dep-', ''),
          top: item.top - listRect.top
        }));
        // 取第一个的 top 作为基准
        const baseTop = rawPositions.length > 0 ? rawPositions[0].top : 0;
        // 重新计算所有 top，让第一个为 0
        let positions = rawPositions.map((item, idx) => ({
          id: item.id,
          top: item.top - baseTop
        }));
        // 按 top 从小到大排序
        positions.sort((a, b) => a.top - b.top);
        // console.log('[calculateCategoryPositionsDep] 归一化后 positions:', positions);
        this.setData({
          categoryPositionsDep: positions
        });
        const goodsOrder = (this.data.depGoodsArrAi || []).map(g => g.gbDdgDisGoodsGrandId);
        // console.log('[calculateCategoryPositionsDep] depGoodsArrAi 渲染顺序:', goodsOrder);
        // console.log('[calculateCategoryPositionsDep] 分类锚点位置(已排序):', positions);
      } else {
        // console.warn('[calculateCategoryPositionsDep] 未获取到有效的节点信息', res);
        }
      });
  },
  

  showDialogBtn: function (e) {
    this.setData({
      itemNxDis: e.currentTarget.dataset.item,
      showInd: true,
      windowHeight: this.data.windowHeight,
      windowWidth: this.data.windowWidth
    })
  },

  showDialogBtnDep: function (e) {
    this.setData({
      itemGbDis: e.currentTarget.dataset.item,
      showIndDep: true,
      windowHeight: this.data.windowHeight,
      windowWidth: this.data.windowWidth
    })
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
    })
  },

  swiperChange(event) {
    this.setData({
      sliderOffset: this.data.sliderOffsets[event.detail.current],
      tab1Index: event.detail.current,
      itemIndex: event.detail.current,
      itemGbDis: "",
      itemNxDis:"",
      itemNx: "",
      applyItem: "",
      searchId: "",
    })

    if (this.data.tab1Index == 0 && this.data.depGoodsArrAi.length == 0) {
      this._getInitDataDep();
    }
    if (this.data.tab1Index == 1 && this.data.goodsList.length == 0) {
      this.initDisData();

    }
  },

  /**
   * 配送申请，换订货规格
   * @param {*} e 
   */

  changeStandard: function (e) {

    this.setData({
      applyStandardName: e.detail.applyStandardName,
      priceLevel: e.detail.priceLevel,
    })
    var levelTwoStandard = "";
    if (this.data.itemDis != null) {
      levelTwoStandard = this.data.itemDis.nxDgWillPriceTwoStandard;
      if (this.data.applyStandardName == levelTwoStandard) {
        this.setData({
          printStandard: levelTwoStandard
        })
      } else {
        this.setData({
          printStandard: this.data.itemDis.nxDgGoodsStandardname
        })
      }
    } else {
      levelTwoStandard = this.data.depGoods.nxDgWillPriceTwoStandard;
      if (this.data.applyStandardName == levelTwoStandard) {
        this.setData({
          printStandard: levelTwoStandard
        })
      } else {
        this.setData({
          printStandard: this.data.depGoods.nxDdgDepGoodsStandardname
        })
      }
    }
  },


  // 
  applyGoodsDep(e) {

    console.log("applyGoodsDepapplyGoodsDep");
    this.setData({
      index: e.currentTarget.dataset.index,
      depGoods: e.currentTarget.dataset.depgoods,
      showDep: true,
      canSave: true,
      applyStandardName: e.currentTarget.dataset.depgoods.gbDdgOrderStandard,
      applyRemark: e.currentTarget.dataset.depgoods.gbDdgOrderRemark,
      printStandard: e.currentTarget.dataset.depgoods.gbDdgShowStandardName,

    })
    if (e.currentTarget.dataset.depgoods.gbDepartmentGoodsStockEntities.length > 0) {
      console.log(e.currentTarget.dataset.depgoods.gbDepartmentGoodsStockEntities.length);
      this.setData({
        hasStock: true
      })
    } else {
      this.setData({
        hasStock: false
      })
    }


  },



  // 
  applyGoods(e) {
     console.log("applyGoodsapplyGoods", e);
 
      if(e.currentTarget.dataset.depgoods !== null){
        this.setData({
          depGoods: e.currentTarget.dataset.depgoods,
        })
        if (e.currentTarget.dataset.depgoods.gbDepartmentGoodsStockEntities.length > 0) {
          console.log(e.currentTarget.dataset.depgoods.gbDepartmentGoodsStockEntities.length);
          this.setData({
            hasStock: true
          })
        } else {
          this.setData({
            hasStock: false
          })
        }
    
      }
      if(e.currentTarget.dataset.item.gbDisGoodsId !== -1){
        this.setData({
          itemGbDisId : e.currentTarget.dataset.item.gbDisGoodsId,
          gbDisGoodsFatherId: e.currentTarget.dataset.item.gbDisGoodsFatherId,
          gbDisGoodsType: e.currentTarget.dataset.item.gbDisGoodsType,
          gbDisToDepId: e.currentTarget.dataset.item.gbDisGoodsToDepId
        })
      }else{
        this.setData({
          itemGbDisId : -1,
        })
      }
    

    

    this.setData({     
      index: e.currentTarget.dataset.index,
      itemNxDis: e.currentTarget.dataset.item,
     
      itemNx: e.currentTarget.dataset.nxgoods,
      show: true,
      applyStandardName: e.currentTarget.dataset.standard,
      priceLevel: e.currentTarget.dataset.level,
      applySubtotal: "0.0元",
      canSave: false,
    })

  
  },


  
  toEditApplyDep(e) {
    var applyItem = e.currentTarget.dataset.order;
    var itemStatus = applyItem.gbDoBuyStatus;
    if (itemStatus > 3) {
      wx.showModal({
        title: "不能修改",
        content: "订单在配送中，如果有变化，请与采购员联系.",
        showCancel: false,
        confirmText: "知道了",
        success: function (res) {
          if (res.cancel) {
            //点击取消           
          } else if (res.confirm) {}
        }
      })
    } else {
      this.setData({
      
        index: e.currentTarget.dataset.index,
        applyItem: e.currentTarget.dataset.order,
        showDep: true,
        applyStandardName: applyItem.gbDoStandard,
        printStandard: applyItem.gbDoPrintStandard,
        editApply: true,
        applyNumber: applyItem.gbDoQuantity,
        applyRemark: applyItem.gbDoRemark,
        depGoods: e.currentTarget.dataset.depgoods,
      })


    }
  },


  toEditApply(e) {
    console.log("contoEditApplytoEditApply")
    var applyItem = e.currentTarget.dataset.order;
    console.log("arritme", e)
    var itemStatus = applyItem.nxDoPurchaseStatus;
    applyItem.disgoods = e.currentTarget.dataset.disgoods;
    if (itemStatus > 3) {
      wx.showModal({
        title: "不能修改",
        content: "订单在配送中，如果有变化，请与采购员联系.",
        showCancel: false,
        confirmText: "知道了",
        success: function (res) {
          if (res.cancel) {
            //点击取消           
          } else if (res.confirm) {}
        }
      })
    } else {
      this.setData({
        applyItem: e.currentTarget.dataset.order,
        show: true,
        applyStandardName: applyItem.nxDoStandard,
        itemNxDis: e.currentTarget.dataset.item,
        itemGbDis: e.currentTarget.dataset.disgoods,
        editApply: true,
        applyNumber: applyItem.nxDoQuantity,
        applyRemark: applyItem.nxDoRemark,
        index: e.currentTarget.dataset.index,
        canSave: false,
        priceLevel: e.currentTarget.dataset.level
      })
     console.log("cansaveee", this.data.canSave)
      if (this.data.applyItem.nxDoSubtotal !== null) {
        console.log("eidididiiidid");
        this.setData({
          applySubtotal: applyItem.nxDoSubtotal + "元"
        })
      }
     
     

    }
  },



  // 保存订货订单
 
  confirmDep(e){
    if (this.data.editApply) {
      this._updateDepOrder(e);
    } else {

      this._saveOrderDep(e);
      
    }
  },

  
  // 保存订货订单
  confirmCash: function (e) {
    if (this.data.editApply) {
      this._updateDisOrder(e);
    } else {
      this._saveOrder(e);
    }

    this.setData({
      show: false,
      editApply: false,
      applyItem: "",
      applyNumber: "",
      applyStandardName: "",
    })
  },




  _saveOrder: function (e) {
    var arriveDate = dateUtils.getArriveDate(0);
    var arriveOnlyDate = dateUtils.getArriveOnlyDate(0);
    var weekYear = dateUtils.getArriveWeeksYear(0);
    var week = dateUtils.getArriveWhatDay(0);
    var nxGoodsId = this.data.itemNxDis.nxDgNxGoodsId;
    var nxGoodsFatherId = this.data.itemNxDis.nxDgNxFatherId;
    var nxDisId = this.data.disInfo.nxDistributerEntity.nxDistributerId;
    var nxDisGoodsId = this.data.itemNxDis.nxDistributerGoodsId;
    var price = "";
   
    var weight = e.detail.applyNumber;
    var depDisGoodsId = -1;
    var gbDisGoodsId = -1;
    var gbDisGoodsFatherId = -1;
    var subtotal = "0.1";
    var goodsType = "";
    var printStandard = "";
    if(this.data.priceLevel == "1"){
      printStandard = this.data.itemNxDis.nxDgGoodsStandardname;
    }else{
      printStandard = this.data.itemNxDis.nxDgWillPriceTwoStandard;
    }

    if (e.detail.applyStandardName == this.data.itemNxDis.nxDgGoodsStandardname) {
      subtotal = (Number(weight) * Number(this.data.itemNxDis.nxDgWillPrice)).toFixed(1);
      price = this.data.itemNxDis.nxDgWillPrice;
    }else {
      if(this.data.itemNxDis.nxDgWillPriceTwo !== null && this.data.itemNxDis.nxDgWillPriceTwo > 0 && e.detail.applyStandardName == this.data.itemNxDis.nxDgWillPriceTwoStandard){
        subtotal = (Number(weight) * Number(this.data.itemNxDis.nxDgWillPriceTwo)).toFixed(1);
        price = this.data.itemNxDis.nxDgWillPriceTwo;
      }
    }

    if (this.data.itemGbDisId !== -1) {
      gbDisGoodsId = this.data.itemGbDisId;
      gbDisGoodsFatherId = this.data.gbDisGoodsFatherId;
      goodsType = this.data.gbDisGoodsType;
    } else {
      goodsType = 2;

    }

    var userId = "";
    if (this.data.userInfo !== null) {
      userId = this.data.userInfo.gbDepartmentUserId;
    }

    if (this.data.depGoods !== null) {
      depDisGoodsId = this.data.depGoods.gbDepartmentDisGoodsId;
    }

    var dg = {
      gbDoOrderUserId: userId,
      gbDoDepDisGoodsId: depDisGoodsId, //
      gbDoDisGoodsId: gbDisGoodsId, //
      gbDoDisGoodsFatherId: gbDisGoodsFatherId,
      gbDoDepartmentId: this.data.depId,
      gbDoToDepartmentId: this.data.gbDisToDepId,
      gbDoDistributerId: this.data.disId,
      gbDoDepartmentFatherId: this.data.depFatherId,
      gbDoQuantity: e.detail.applyNumber,
      gbDoPrice: price,
      gbDoWeight: weight,
      gbDoSubtotal: subtotal,
      gbDoStandard: e.detail.applyStandardName,
      gbDoRemark: e.detail.applyRemark,
      gbDoIsAgent: 3,
      gbDoNxGoodsId: nxGoodsId,
      gbDoNxGoodsFatherId: nxGoodsFatherId,
      gbDoNxDistributerGoodsId: nxDisGoodsId,
      gbDoNxDistributerId: nxDisId,
      gbDoGoodsType: goodsType,
      gbDoOrderType: 5,
      gbDoDsStandardScale: -1,
      stockIsZero: e.detail.stockIsZero,
      gbDoPrintStandard: printStandard,
      gbDoCostPriceLevel: this.data.priceLevel
    };

    console.log(dg);
    if (this.data.itemGbDisId == -1) {
      load.showLoading("保存订单");
      saveOrdersGbJjAndSaveGoodsSx(dg).then(res => {
        load.hideLoading();
        if (res.result.code == 0) {
          var newGoods = res.result.data.gbDistributerGoodsEntity;
          var data = "goodsList[" + this.data.index + "].nxDepartmentOrdersEntity";
          var dataDis = "goodsList[" + this.data.index + "].gbDistributerGoodsEntity";
          this.setData({
            [data]: res.result.data,
            [dataDis]: newGoods,
          })
      
        } else {
          wx.showToast({
            title: '订单保存失败',
            icon: 'none'
          })
        }
      })
    } else {
      if (this.data.depGoods == null) {
        load.showLoading("保存订单");
        saveOrdersGbJjAndSaveDepGoodsSx(dg).then(res => {
          load.hideLoading();
          if (res.result.code == 0) {
           
            var data = "goodsList[" + this.data.index + "].nxDepartmentOrdersEntity";
            this.setData({
              [data]: res.result.data
            })
          
          } else {
            wx.showToast({
              title: '订单保存失败',
              icon: 'none'
            })
          }
        })
      } else {
        load.showLoading("保存订单");
        saveGbOrderJjSx(dg).then(res => {
          load.hideLoading();
          if (res.result.code == 0) {
          
            var data = "goodsList[" + this.data.index + "].nxDepartmentOrdersEntity";
            this.setData({
              [data]: res.result.data
            })
            
          } else {
            wx.showToast({
              title: '订单保存失败',
              icon: 'none'
            })
          }
        })
      }

    }

  },


  /**
   * 修改配送申请
   * @param {} e 
   */
  _updateDepOrder(e) {
    var that = this;
    var dg = {
      id: that.data.applyItem.gbDepartmentOrdersId,
      weight: e.detail.applyNumber,
      standard: e.detail.applyStandardName,
      remark: e.detail.applyRemark,
    };

    updateOrderGbJj(dg).then(res => {
      load.showLoading("修改订单")
      if (res.result.code == 0) {
        load.hideLoading();
        var data = "depGoodsArrAi[" + this.data.index + "].gbDepartmentOrdersEntity";
        this.setData({
          [data]: res.result.data
        })
         
      } else {
        load.hideLoading();
        wx.showToast({
          title: res.result.msg,
          icon: "none"
        })
      }
    })
  },


  /**
   * 修改配送申请
   * @param {} e 
   */
  _updateDisOrder(e) {
    var that = this;
    var dg = {
      id: that.data.applyItem.nxDepartmentOrdersId,
      weight: e.detail.applyNumber,
      standard: e.detail.applyStandardName,
      remark: e.detail.applyRemark,
    };

    updateOrderGbJjSx(dg).then(res => {
      load.showLoading("修改订单")
      if (res.result.code == 0) {
        load.hideLoading();
      
          var data = "goodsList[" + this.data.index + "].nxDepartmentOrdersEntity";
          this.setData({
            [data]: res.result.data
          })
        
       
      } else {
        load.hideLoading();
        wx.showToast({
          title: res.result.msg,
          icon: "none"
        })
      }
    })
  },


  _saveOrderDep: function (e) {

    var dg = {
      gbDoOrderUserId: this.data.userInfo.gbDepartmentUserId,
      gbDoDepDisGoodsId: this.data.depGoods.gbDepartmentDisGoodsId, //
      gbDoDisGoodsId: this.data.depGoods.gbDdgDisGoodsId, //
      gbDoDisGoodsFatherId: this.data.depGoods.gbDdgDisGoodsFatherId,
      gbDoDepartmentId: this.data.depId,
      gbDoDistributerId: this.data.disId,
      gbDoDepartmentFatherId: this.data.depInfo.gbDepartmentFatherId,
      gbDoQuantity: e.detail.applyNumber,
      gbDoStandard: e.detail.applyStandardName,
      gbDoRemark: e.detail.applyRemark,
      gbDoIsAgent: 2, 
      stockIsZero: e.detail.stockIsZero,
      gbDoPrintStandard: this.data.printStandard,
      gbDoCostPriceLevel: this.data.depGoods.gbDdgOrderPriceLevel,
    };
    console.log(dg);
    load.showLoading("保存订单");
    saveGbOrderJj(dg).then(res => {
      load.hideLoading();
      if (res.result.code == 0) {
       load.hideLoading();
        if (this.data.tab1Index == 0) {
          console.log("depgodosoagupddpdd");
          var data = "depGoodsArrAi[" + this.data.index + "].gbDepartmentOrdersEntity";
        
          var dataGoods = "depGoodsArrAi[" + this.data.index + "].gbDistributerGoodsEntity";
          
      
          this.setData({
            [data]: res.result.data,
            [dataGoods]: res.result.data.gbDistributerGoodsEntity,
          })
          if (dg.stockIsZero) {
            var dataStock = "depGoodsArrAi[" + this.data.index + "].gbDepartmentGoodsStockEntities";
            this.setData({
              [dataStock]: ""
            })
          }
         
        }else{
          var data = "goodsList[" + this.data.index + "].gbDepartmentOrdersEntity";
          this.setData({
            [data]: res.result.data
          })
        }
    
      } else {
        wx.showToast({
          title: '订单保存失败',
          icon: 'none'
        })
      }
    })

  },




  


  //获取dis数据
  initDisData() {
    load.showLoading("获取商品")
    var that = this;
    var data = {
      nxDisId: this.data.disInfo.nxDistributerEntity.nxDistributerId,
      depId: this.data.depId,
    }
    nxDepGetDisCataGoods(data).then(res => {
      if (res.result.code == 0) {
        load.hideLoading();
        console.log(res.result.data);
        var newId = res.result.data.cataArr[0].fatherGoodsEntities[0].nxDistributerFatherGoodsId;
        this.setData({
          grandList: res.result.data.cataArr,
          sortDepGoodsArrDis: res.result.data.depGoodsArr,
          fatherArrDis: res.result.data.cataArr[0].fatherGoodsEntities,
          leftGreatId: res.result.data.cataArr[0].nxDistributerFatherGoodsId,
          selectedSubCategoryId: res.result.data.cataArr[0].fatherGoodsEntities[0].nxDistributerFatherGoodsId,
          greatName: res.result.data.cataArr[0].nxDfgFatherGoodsName,
          fatherSonsIndex: 0,
          activeSubCatId: newId,
        })
        that._getFatherGoodsDis();


      }
    })
  },


  _getFatherGoodsDis() {
    console.log('=== _getFatherGoodsDis 调试信息 ===');
    const data = {
      gbDisId: this.data.disId,
      gbDepId: this.data.depId,
      fatherId: this.data.leftGreatId,
      limit: this.data.limit,
      page: this.data.currentPageDis,
    };

    nxDepGetDisFatherGoodsGb(data).then(res => {
      if (res.result.code == 0) {
        console.log('_getFatherGoodsDis - API 返回数据长度:', res.result.page.list.length);
        console.log('_getFatherGoodsDis - API 返回数据 IDs:', res.result.page.list.map(item => item.nxDistributerGoodsId));

        const processedList = this.processGoodsListDis(res.result.page.list);
        console.log('_getFatherGoodsDis - processedList 长度:', processedList.length);
        console.log('_getFatherGoodsDis - processedList IDs:', processedList.map(item => item.nxDistributerGoodsId));

        // 检查是否有重复的 key 值
        const keys = processedList.map(item => item.nxDistributerGoodsId);
        const duplicateKeys = keys.filter((key, index) => keys.indexOf(key) !== index);
        if (duplicateKeys.length > 0) {
          console.error('_getFatherGoodsDis - 发现重复的 key:', duplicateKeys);
          console.error('_getFatherGoodsDis - 重复 key 的详细信息:', duplicateKeys.map(key => {
            const items = processedList.filter(item => item.nxDistributerGoodsId === key);
            return { key, count: items.length, items };
          }));
        }

        var subCatId = this.data.activeSubCatId;
        this.setData({
          goodsList: processedList,
          currentPageDis: this.data.currentPageDis,
          totalPageDis: res.result.page.totalPage,
          totalCountDis: res.result.page.totalCount,

          subcatScrollIntoView: `subcat-${subCatId}`,
          scrollIntoView: `cat-${subCatId}` // 右侧商品区锚点
        }, () => {
          // 数据更新后计算分类位置
          this.calculateCategoryPositionsDis();

        });
      }
    });
  },


  _getGoodsIdsByGreatId(){
    console.log("huoquxinidididiidssss")
     getNxDisGoodsIdsByGreatId(this.data.leftGreatId).then(res =>{
       if(res.result.code == 0){
         this.setData({
           sortDepGoodsArrDis: res.result.data
         })
       }
     })
 },


  changeGreatGrandDis(e) {
    const categoryId = e.currentTarget.dataset.id;
    this.setData({
      leftGreatId: categoryId,
      leftIndex: e.currentTarget.dataset.index,
      goodsList: [],
      currentPageDis: 1,
      totalPageDis: 0,
      isLoading: false,
      greatName: e.currentTarget.dataset.name,
      fatherArrDis: this.data.grandList[e.currentTarget.dataset.index].fatherGoodsEntities,
      selectedSubCategoryId: this.data.grandList[e.currentTarget.dataset.index].fatherGoodsEntities[0].nxDistributerFatherGoodsId,
      activeSubCatId: this.data.grandList[e.currentTarget.dataset.index].fatherGoodsEntities[0].nxDistributerFatherGoodsId,

    }, () => {
      // 用 this.createSelectorQuery() 保证作用域
      const query = this.createSelectorQuery();
      query.select(`#left-cat-${categoryId}`).boundingClientRect();
      query.select('#leftScroll').boundingClientRect(); // ← 改这里
      query.select('#leftScroll').scrollOffset(); // ← 和这里
      query.exec(res => {
        const [itemRect, scrollRect, scrollOffset] = res;
        const itemTop = itemRect.top;
        const itemH = itemRect.height;
        const listTop = scrollRect.top;
        const listH = scrollRect.height;
        const scrollTop0 = scrollOffset.scrollTop;

        const targetScrollTop = scrollTop0 + itemTop - listTop - (listH / 2) + (itemH / 2);
        this.setData({
          leftScrollTopNx: targetScrollTop
        });
      });
    });
     // 调用接口获取商品ID列表
     this._getGoodsIdsByGreatId();
    this._getFatherGoodsDis();
  },


  toBusiness(e) {
    console.log("toBusiness")
    var id = e.currentTarget.dataset.id;
    wx.setStorageSync('disGoods', e.currentTarget.dataset.goods);
    wx.navigateTo({
      url: '../stockGoodsBusiness/stockGoodsBusiness?depGoodsId=' + id,
    })
  },


  calculateSubCategoryHeightsDis() {
    const query = wx.createSelectorQuery();
    query.selectAll('.product-item').boundingClientRect();
    query.exec((res) => {
      if (res && res[0]) {
        const heights = [];
        let accumulatedHeight = 0;
        res[0].forEach((item) => {
          accumulatedHeight += item.height;
          heights.push(accumulatedHeight);
        });
        this.setData({
          subCategoryHeights: heights,
        });
      }
    });
  },

  onScrollToLowerDis: function () {
    // 防止重复请求
    if (this.data.isLoading || this.data.goodsList.length >= this.data.totalCountDis) return;

    console.log('=== onScrollToLowerDis 调试信息 ===');
    console.log('当前 goodsList 长度:', this.data.goodsList.length);
    console.log('当前 goodsList IDs:', this.data.goodsList.map(item => item.nxDistributerGoodsId));

    this.setData({
      isLoading: true
    });

    const {
      currentPageDis,
      totalPageDis,
      searchFather,
      leftGreatId,
      depId,
      limit
    } = this.data;

    // 确保非搜索模式，并且当前页数未超过总页数
    if (currentPageDis <= totalPageDis) {
      // 先设置下一页页码
      const nextPage = currentPageDis + 1;
      this.setData({
        currentPageDis: nextPage
      });

      const data = {
        gbDisId: this.data.disId,
        gbDepId: this.data.depId,
        fatherId: this.data.leftGreatId,
        limit: this.data.limit,
        page: nextPage,
      };


      nxDepGetDisFatherGoodsGb(data)
        .then((res) => {
          if (res.result.code == 0) {
            const newItems = res.result.page.list || [];
            console.log('onScrollToLowerDis - newItems 长度:', newItems.length);
            console.log('onScrollToLowerDis - newItems IDs:', newItems.map(item => item.nxDistributerGoodsId));
            
            const updatedGoodsList = [...this.data.goodsList, ...newItems];
            console.log('onScrollToLowerDis - updatedGoodsList 长度:', updatedGoodsList.length);
            console.log('onScrollToLowerDis - updatedGoodsList IDs:', updatedGoodsList.map(item => item.nxDistributerGoodsId));

            // 检查是否有重复的 key 值
            const keys = updatedGoodsList.map(item => item.nxDistributerGoodsId);
            const duplicateKeys = keys.filter((key, index) => keys.indexOf(key) !== index);
            if (duplicateKeys.length > 0) {
              console.error('onScrollToLowerDis - 发现重复的 key:', duplicateKeys);
              console.error('onScrollToLowerDis - 重复 key 的详细信息:', duplicateKeys.map(key => {
                const items = updatedGoodsList.filter(item => item.nxDistributerGoodsId === key);
                return { key, count: items.length, items };
              }));
            }

            // 更新商品列表和分页信息
            this.setData({
              goodsList: updatedGoodsList,
              totalPageDis: res.result.page.totalPage,
              totalCountDis: res.result.page.totalCount,
              isLoading: false,
            });

            // 如果已达到 totalCount，停止加载
            if (updatedGoodsList.length >= this.data.totalCount) {
              this.setData({
                isLoading: false
              });
            }

            // 重新计算右侧商品高度
            this.calculateSubCategoryHeightsDis();
          } else {
            wx.showToast({
              title: '获取商品失败',
              icon: 'none'
            });
            this.setData({
              isLoading: false
            });
          }
        })

    } else {
      this.setData({
        isLoading: false
      });
    }
  },


  onGoodsScrollDis(e) {
    // 节流略
    const query = wx.createSelectorQuery();
    query.selectAll('.product-item').boundingClientRect();
    query.select('.goods-list').boundingClientRect();
    query.exec((res) => {
      if (res[0] && res[1]) {
        const productRects = res[0];
        const listRect = res[1];
        // 找到第一个可见商品
        let minDiff = Infinity;
        let firstVisibleIndex = 0;
        for (let i = 0; i < productRects.length; i++) {
          const diff = productRects[i].top - listRect.top;
          if (diff >= 0 && diff < minDiff) {
            minDiff = diff;
            firstVisibleIndex = i;
          }
        }
        const firstVisibleItem = this.data.goodsList[firstVisibleIndex];
        if (firstVisibleItem) {
          const activeId = firstVisibleItem.nxDgDfgGoodsGrandId;
          if (activeId && activeId !== this.data.activeSubCatId) {
            this.setData({
              activeSubCatId: activeId,
              subcatScrollIntoView: `subcat-${activeId}`
            });
          }
        }
      }
    });
  },


  toggleSubCatDis() {
    this.setData({
      showAllSubCat: !this.data.showAllSubCat
    });
  },



  onSubCatTapDis(e) {
    const subCatId = e.currentTarget.dataset.id;

    const hasGoods = this.data.goodsList.some(item => String(item.nxDgDfgGoodsGrandId) === String(subCatId));
    

    this.setData({
      showAllSubCat: false,
      activeSubCatId: String(subCatId),
      subcatScrollIntoView: `subcat-${subCatId}`
    }, () => {
    });

    if (hasGoods) {
      this.setData({
        scrollIntoView: ''
      }, () => {
        setTimeout(() => {
          this.setData({
            scrollIntoView: `cat-${subCatId}`
          }, () => {
          });
        }, 50);
      });
    } else {
      this.startLoadingGoodsForSubCat(subCatId);
    }
  },

  async startLoadingGoodsForSubCat(subCatId) {
    if (this.data.isLoading) {
      return;
    }

    if (this.data.currentPageDis >= this.data.totalPageDis) {
      wx.showToast({
        title: '没有更多商品了',
        icon: 'none'
      });
      return;
    }

    this.setData({
      isLoading: true
    });

    wx.showLoading({
      title: '正在加载商品...',
      mask: true
    });

    try {
      await this.loadGoodsBySubCatIdDis(subCatId, this.data.currentPageDis + 1, this.data.goodsList);
    } catch (error) {
      console.error('[startLoadingGoodsForSubCat] 加载异常:', error);
    } finally {
      this.setData({
        isLoading: false
      });
      wx.hideLoading();
    }
  },

  async loadGoodsBySubCatIdDis(subCatId, page, loadedGoods) {
    const { limit, depId, leftGreatId } = this.data;
    const data = {
      gbDisId: this.data.disId,
      gbDepId: this.data.depId,
      fatherId: this.data.leftGreatId,
      limit: this.data.limit,
      page: page,
    };

    try {
      console.log('=== loadGoodsBySubCatIdDis 调试信息 ===');
      console.log('subCatId:', subCatId, 'page:', page);
      console.log('loadedGoods 长度:', loadedGoods.length);
      console.log('loadedGoods IDs:', loadedGoods.map(item => item.nxDistributerGoodsId));

      const res = await nxDepGetDisFatherGoodsGb(data);
      if (res.result.code === 0) {
        const newItems = res.result.page.list || [];
        console.log('newItems 长度:', newItems.length);
        console.log('newItems IDs:', newItems.map(item => item.nxDistributerGoodsId));
        
        const merged = loadedGoods.concat(newItems);
        console.log('merged 长度:', merged.length);
        console.log('merged IDs:', merged.map(item => item.nxDistributerGoodsId));

        // 排序
        const idOrder = (this.data.sortDepGoodsArrDis || []).map(String);
        const sortedArr = merged.slice().sort((a, b) => {
          const idxA = idOrder.indexOf(String(a.nxDistributerGoodsId));
          const idxB = idOrder.indexOf(String(b.nxDistributerGoodsId));
          return (idxA === -1 ? 99999 : idxA) - (idxB === -1 ? 99999 : idxB);
        });
        console.log('sortedArr 长度:', sortedArr.length);
        console.log('sortedArr IDs:', sortedArr.map(item => item.nxDistributerGoodsId));

        // 处理商品数据
        const processedGoods = this.processGoodsListDis(sortedArr);
        console.log('processedGoods 长度:', processedGoods.length);
        console.log('processedGoods IDs:', processedGoods.map(item => item.nxDistributerGoodsId));

        // 检查是否有重复的 key 值
        const keys = processedGoods.map(item => item.nxDistributerGoodsId);
        const duplicateKeys = keys.filter((key, index) => keys.indexOf(key) !== index);
        if (duplicateKeys.length > 0) {
          console.error('发现重复的 key:', duplicateKeys);
          console.error('重复 key 的详细信息:', duplicateKeys.map(key => {
            const items = processedGoods.filter(item => item.nxDistributerGoodsId === key);
            return { key, count: items.length, items };
          }));
        }

        const hasGoodsInNewItems = newItems.some(item => String(item.nxDgDfgGoodsGrandId) === String(subCatId));

        if (hasGoodsInNewItems) {
          this.setData({
            goodsList: processedGoods,
            currentPageDis: page,
            totalPageDis: res.result.page.totalPage,
            totalCountDis: res.result.page.totalCount,
            isLoading: false,
          }, () => {
            setTimeout(() => {
              this.setData({
                scrollIntoView: `cat-${subCatId}`
              }, () => {
              });
            }, 100);
          });
        } else if (page <= this.data.totalPageDis) {
          // 递归加载
          await this.loadGoodsBySubCatIdDis(subCatId, page + 1, sortedArr);
        } else {
          this.setData({
            goodsList: processedGoods,
            currentPageDis: page,
            totalPageDis: res.result.page.totalPage,
            totalCountDis: res.result.page.totalCount,
            isLoading: false,
          });
          wx.showToast({
            title: '未找到该分类商品',
            icon: 'none'
          });
        }
      } else {
        console.error(`[loadGoodsBySubCatIdDis] 第 ${page} 页商品获取失败:`, res.result.msg);
        this.setData({ isLoading: false });
        wx.showToast({ title: '获取商品失败', icon: 'none' });
      }
    } catch (error) {
      console.error(`[loadGoodsBySubCatIdDis] 请求第 ${page} 页商品时发生异常:`, error);
      this.setData({ isLoading: false });
      throw error;
    }
  },

  processGoodsListDis(list) {
    console.log('=== processGoodsListDis 调试信息 ===');
    console.log('输入 list 长度:', list.length);
    console.log('输入 list IDs:', list.map(item => item.nxDistributerGoodsId));
    
    // 排序
    list.sort((a, b) => {
      if (a.nxDgDfgGoodsGrandId === b.nxDgDfgGoodsGrandId) return 0;
      return a.nxDgDfgGoodsGrandId > b.nxDgDfgGoodsGrandId ? 1 : -1;
    });
    
    // 去重
    const goodsMap = new Map();
    list.forEach(item => {
      goodsMap.set(String(item.nxDistributerGoodsId), item);
    });
    const uniqueList = Array.from(goodsMap.values());
    console.log('uniqueList 长度:', uniqueList.length);
    console.log('uniqueList IDs:', uniqueList.map(item => item.nxDistributerGoodsId));
    
    let currentCategory = null;
    const result = uniqueList.map(item => {
      if (item.nxDgDfgGoodsGrandId !== currentCategory) {
        currentCategory = item.nxDgDfgGoodsGrandId;
      
        return {
          ...item,
          isFirstInCategory: true,
          categoryName: this.getCategoryNameDis(item.nxDgDfgGoodsGrandId)
        };
      }
      return {
        ...item,
        isFirstInCategory: false,
        categoryName: this.getCategoryNameDis(item.nxDgDfgGoodsGrandId)
      };
    });
 
    console.log('输出 result 长度:', result.length);
    console.log('输出 result IDs:', result.map(item => item.nxDistributerGoodsId));
    
    return result;
  },

  calculateCategoryPositionsDis() {
    const query = wx.createSelectorQuery();
    query.selectAll('.goods-category-title').boundingClientRect();
    query.select('.goods-list').boundingClientRect();

    query.exec((res) => {
      if (res[0] && res[1]) {
        const listRect = res[1];
        const positions = res[0].map(item => ({
          id: item.id.replace('cat-', ''),
          top: item.top - listRect.top
        }));

        this.setData({
          categoryPositions: positions
        });
      }
    });
  },

  getCategoryNameDis(categoryId) {
    const category = this.data.fatherArrDis.find(item =>
      item.nxDistributerFatherGoodsId === categoryId
    );
    return category ? category.nxDfgFatherGoodsName : '';
  },


  confirmStandardDep(e) {
    var data = {
      nxDsDisGoodsId: this.data.depGoods.nxDdgDisGoodsId,
      nxDsStandardName: e.detail.newStandardName,
    }
    disSaveStandard(data).
    then(res => {
      if (res.result.code == 0) {
        var standardArr = this.data.depGoods.nxDistributerStandardEntities;
        standardArr.push(res.result.data);
        var standards = "depGoods.nxDistributerStandardEntities";
        var goodsData = "depGoodsArrAi[" + this.data.editOrderIndex + "].nxDistributerStandardEntities";
        this.setData({
          [goodsData]: standardArr,
          [standards]: standardArr,
          applyStandardName: res.result.data.nxDsStandardName,
        })
      } else {
        wx.showToast({
          title: res.result.msg,
          icon: 'none'
        })
      }
    })
  },

  //编辑订单

  confirmStandard(e) {
    var data = {
      nxDsDisGoodsId: this.data.itemDis.nxDistributerGoodsId,
      nxDsStandardName: e.detail.newStandardName,
    }
    disSaveStandard(data).
    then(res => {
      if (res.result.code == 0) {
        var standardArr = this.data.itemDis.nxDistributerStandardEntities;
        standardArr.push(res.result.data);
        var standards = "itemDis.nxDistributerStandardEntities";
        var goodsData = "goodsList[" + this.data.editOrderIndex + "].nxDistributerStandardEntities";
        this.setData({
          [goodsData]: standardArr,
          [standards]: standardArr,
          applyStandardName: res.result.data.nxDsStandardName,
        })
      } else {
        wx.showToast({
          title: res.result.msg,
          icon: 'none'
        })
      }
    })
  },

  delDepGoods(e){
    console.log(e);
    
    var depGoods = e.currentTarget.dataset.item;
    if(depGoods.depGoodsDepOrderList.length == 0){
      this.setData({
        depGoods: depGoods,
        editOrderIndex: e.currentTarget.dataset.index,
        warnContent: depGoods.nxDdgDepGoodsName ,
        showDep: false,
        show: false,
        popupType: 'deleteGoods',
        showPopupWarn: true,
      })

    }else{
      wx.showModal({
        title: '不能删除商品',
        content: '有未完成订单，请等待订单完成配送后，如果您确定不需要此商品，再进行删除。',
        showCancel: false,
        confirmText: '好的',
        complete: (res) => {
          if (res.confirm) {
            
          }
        }
      })
    }
  },


  /**
   * 删除订货
   */
  delApplyDep() {
    this.setData({
      warnContent: this.data.depGoods.gbDdgDepGoodsName + "  " + this.data.applyItem.gbDoQuantity + this.data.applyItem.gbDoStandard,
      deleteShow: true,
      show: false,
      popupType: 'deleteOrder',
      showPopupWarn: true,
      showOperationGoods: false,
      showOperationLinshi: false
    })
   
    
  },

  /**
   * 删除订货
   */
  
    delApply() {
     
      console.log("dellapapally")
      var content = "";
      if(this.data.tab1Index == 0){
        content = this.data.itemGbDis.gbDgGoodsName + "  " + this.data.applyItem.gbDoQuantity + this.data.applyItem.gbDoStandard;
      }else{
        content = this.data.itemNxDis.nxDgGoodsName + "  " + this.data.applyItem.nxDoQuantity + this.data.applyItem.nxDoStandard;
      }
      this.setData({
        warnContent: content,
        deleteShow: true,
        show: false,
        popupType: 'deleteOrder',
        showPopupWarn: true,
      })
      this.setData({
        showOperationGoods: false,
        showOperationLinshi: false
      })
      // this.hideModal();
    
  
  },


  closeWarn() {
    this.setData({
      applyItem: "",
      warnContent: "",
      show: false,
      popupType: '',
      showPopupWarn: false,
    })
  },

  confirmWarn() {
    if(this.data.popupType == 'deleteOrder'){
      this.deleteYes()
    }else if(this.data.popupType == 'deleteGoods'){
     this._delteDepGoods();
    }
 
  },

  _delteDepGoods(){


   var id = this.data.depGoods.nxDepartmentDisGoodsId;
    deleteDepGoods(id).then(res =>{
      if(res.result.code == 0){
         var arr = this.data.depGoodsArrAi;
         wx.setStorageSync('needRefreshOrderData', true);
         arr.splice(this.data.editOrderIndex, 1);
         this.setData({
          depGoodsArrAi: arr
         })
      }
    })

  },


  closeWarn() {
    this.setData({

      warnContent: "",
      show: false,
      popupType: '',
      showPopupWarn: false,
    })
  },


  toSearchGoods() {
    wx.navigateTo({
      url: '../resGoodsCashSearch/resGoodsCashSearch',
    })
  },



  deleteYes() {

    var that = this;
    var id = "";
    if(this.data.tab1Index == 0){
      id = this.data.applyItem.gbDepartmentOrdersId;
    }else{
      id = this.data.applyItem.nxDoGbDepartmentOrderId;
    }
    deleteOrderGb(id).then(res => {
      if (res.result.code == 0) {
        
        
        if (that.data.tab1Index == 0) {

          var data = "depGoodsArrAi[" + this.data.index + "].gbDepartmentOrdersEntity";
          this.setData({
            [data]: null
          })
        }
        if (that.data.tab1Index == 1) {
          var data1 = "goodsList[" + this.data.index + "].nxDepartmentOrdersEntity";
          this.setData({
            [data1]: null
          })
        }

        that._cancle();

      }
    })
  },



  deleteNo() {
    this.setData({
      applyItem: "",
      deleteShow: false,
    })
  },





  _cancle() {
    this.setData({
      show: false,
      showDep: false,
      applyStandardName: "",
      editApply: false,
      applyNumber: "",
      applyRemark: "",
      applySubtotal: ""

    })
  },




  // stock business
  showStock(e) {
    var item = e.currentTarget.dataset.item;
    item.gbDistributerGoodsEntity = e.currentTarget.dataset.goods.gbDistributerGoodsEntity;
    console.log("sotscckcckkkkckc" ,item.gbDgsWasteFullTime )
    var goodsIndex = e.currentTarget.dataset.goodsindex;
    var stockIndex = e.currentTarget.dataset.stockindex;
    if (item.gbDgsWasteFullTime !== null && item.gbDgsWasteFullTime !== '') {
      var endTime = item.gbDgsWasteFullTime;
      var startTime = this.data.nowTime;
      var endTimeFormat = endTime.replace(/-/g, '/') //所有的- 都替换成/
      var endTimeDown = Date.parse(new Date(endTimeFormat));
      var startTimeFormat = startTime.replace(/-/g, '/') //所有的- 都替换成/
      var startTimeDown = Date.parse(new Date(startTimeFormat));
      var thisResult = Number(endTimeDown) - Number(startTimeDown);
      thisResult = Math.floor(thisResult / 1000 / 60 / 60);
      
      if (thisResult < 0) { // 超过废弃时间
        var restWeight = item.gbDgsRestWeight;
        item.gbDgsMyWasteWeight = restWeight;
        item.gbDgsMyProduceWeight = "0";
        this.setData({
          canWaste: true,
          canSure: true,
          showType: 4,
        })
      } else {
        item.gbDgsMyProduceWeight = item.gbDgsRestWeight;
        this.setData({
          canWaste: false,
          resultTime: thisResult,
          canSure: true,
          showType: 1
        })
      }
    } else {
      item.gbDgsMyProduceWeight = item.gbDgsRestWeight;
      this.setData({
       
        canWaste: false,
        canSure: true,
        showType: 1
      })
    }

    console.log("item.gbDgsRestWeight" + item.gbDgsRestWeight);
    this.setData({
      showStock: true,
      stockItem: item,
      consultItem: JSON.parse(JSON.stringify(item)),
      depGoods: e.currentTarget.dataset.goods,
      goodsIndex: goodsIndex,
      stockIndex: stockIndex,

    })
  },

  confirmStock(e) {
    var item = e.detail.item;
    var showType = e.detail.showType;
    if (this.data.transfer !== '1') {
      item.gbDgsReduceWeightUserId = this.data.userInfo.gbDepartmentUserId;
    }
    if (showType == 1) {
      load.showLoading("保存数据中")
      console.log(item);
      saveDepProduceGoodsStock(item)
        .then(res => {
          load.hideLoading();
          if (res.result.code == 0) {
            var data = "depGoodsArrAi[" + this.data.goodsIndex + "].gbDepartmentGoodsStockEntities["+ this.data.stockIndex +"]";
            this.setData({
              [data]: res.result.data,
            })
           
          }
        })
    } else if (showType == 2) {
      load.showLoading("保存数据中");
      this.setData({
        src: e.detail.src,
        reason: e.detail.reason,
      })

      saveDepLossGoodsStock(item)
        .then(res => {
          load.hideLoading();
          console.log(res.result.data);
          console.log("---==========")
          if (res.result.code == 0) {
            
            var data = "depGoodsArrAi[" + this.data.goodsIndex + "].gbDepartmentGoodsStockEntities["+ this.data.stockIndex +"]";
            this.setData({
              [data]: res.result.data.gbDepartmentGoodsStockEntity,
            })


            var that = this;
            var src = that.data.src;
            var reason = that.data.reason;
            var id = res.result.data.gbDepartmentGoodsStockReduceId;
            console.log(src + reason + id);
            reduceAttachmentSaveWithFile(src, reason, id).then((res) => {
              console.log(res);
              if (res.result == '{"code":0}') {
              
               
              } else {
                load.hideLoading();
                wx.showToast({
                  title: res.result.msg,
                  icon: 'none'
                })
              }

            })
         
          }
        })
    } else if (showType == 3) {
      if (this.data.transfer !== '1') {
        item.gbDgsReturnUserId = this.data.userInfo.gbDepartmentUserId;
      }
      console.log(item);
      load.showLoading("保存数据中")
      saveDepReturnGoodsStock(item)
        .then(res => {
          load.hideLoading();
          console.log(res.result.data);
          if (res.result.code == 0) {
            var data = "depGoodsArrAi[" + this.data.goodsIndex + "].gbDepartmentGoodsStockEntities["+ this.data.stockIndex +"]";
            this.setData({
              [data]: res.result.data.gbDepartmentGoodsStockEntity,
            })
          }else{
            wx.showToast({
              title: res.result.msg,
              icon: 'none'
            })
          }
        })
    } else if (showType == 4) {
      load.showLoading("保存数据中");

      console.log(stockItem);
      saveDepWasteGoodsStock(stockItem)
        .then(res => {
          load.hideLoading();
          if (res.result.code == 0) {
            var data = "depGoodsArrAi[" + this.data.goodsIndex + "].gbDepartmentGoodsStockEntities["+ this.data.stockIndex +"]";
            this.setData({
              [data]: res.result.data,
            })
          }
        })

    }
    else if(showType == 5){
      this.confirmStar(e);
    }

  },



  confirmStar(e){
    console.log("confirmStarconfirmStar")
    var that = this;
     var src = e.detail.src;
     var reason = e.detail.reason;
     var id = this.data.stockItem.gbDepartmentGoodsStockId;
     var userId = this.data.userInfo.gbDepartmentUserId;
     var stars = e.detail.item.gbDgsStars;
      load.showLoading("保存数据中")
      console.log("stars", stars)
     reduceAttachmentSaveWithFileStar(src, reason, id,stars, userId).then((res) => {
       console.log(res);
       load.hideLoading();
       console.log("resres", res.result)
       if (res.result == '{"code":0}') {
         that.setData({
           showStock: false
         })
         
       } else {
         load.hideLoading();
         wx.showToast({
           title: res.result.msg,
           icon: 'none',
         });
       }
     })
   },
 


  updateStars(e) {
    console.log(e);
    var data = {
      id: this.data.stockItem.gbDepartmentGoodsStockId,
      stars: e.detail.gbDgsStars,
      userId: this.data.userInfo.gbDepartmentUserId,
    }
    changeStockStars(data).then(res => {
      if (res.result.code == 0) {
        this.setData({
          showStock: false,
          stockItem: "",
        })
      
      }
    })
  },


  toBack() {
    
    wx.navigateBack({
      delta: 1
    })
  },


})