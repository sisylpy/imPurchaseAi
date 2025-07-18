var load = require('../../../lib/load.js');

const globalData = getApp().globalData;
var dateUtils = require('../../../utils/dateUtil');
import apiUrl from '../../../config.js'


import {
  disGetDepGoodsGbPage,
  disGetDepGoodsCataGb,
 

} from '../../../lib/apiDepOrder';


Page({

  

  onShow() {
      // 推荐直接用新API
  let windowInfo = wx.getWindowInfo();
  let globalData = getApp().globalData;
  this.setData({
    windowWidth: windowInfo.windowWidth * globalData.rpxR,
    windowHeight: windowInfo.windowHeight * globalData.rpxR,
    navBarHeight: globalData.navBarHeight * globalData.rpxR,
    statusBarHeight: globalData.statusBarHeight * globalData.rpxR,
    leftTopHeight: globalData.navBarHeight * globalData.rpxR + 80 * globalData.rpxR 
  });

  },


  data: {
    editApply: false,
    editOrderIndex: "",
    applyNumber: "",
    applyRemark: "",
    applyStandardName: "",
    applySubtotal: "",
    item: {},
    maskHeight: "",
    statusBarHeight: "",
    windowHeight: "",
    windowWidth: "",
    tab1Index: 0,
    itemIndex: 0,
    // sliderOffset: 0,
    // sliderOffsets: [],
    sliderLeft: 0,
  
    deleteShow: false,
    showInd: false,
    item: "",
    depGoods: null,

    tabs: [{
      id: 0,
      words: "常订商品"
    }, {
      id: 1,
      words: "配送商品"
    }],


    totalPages: 0,
    totalCount: 0,
    limit: 15,
    currentPage: 1,
    fatherArr: [],
    scrollTopLeft: 0,
    disGoodsArrAi: [],
    selectedSub: 0, // 选中的分类

   
    isLoading: false,
    

  

    update: false,
  
    
    // 新增的部门商品相关状态
    showAllSubCatDep: false, // 是否展开二级分类
    activeSubCatIdDep: '', // 当前选中的二级分类ID
    subcatScrollIntoViewDep: '', // 二级分类横向滚动位置
    scrollIntoViewDep: '', // 商品列表滚动位置

    depId: "-1",
    depFatherId: "-1",


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
        
      })
    }
    var userValue = wx.getStorageSync('userInfo');
    if (userValue) {
      this.setData({
        userInfo: userValue
      })
    }


    this._getInitDataDep();


  },



  showDialogBtn: function (e) {
    this.setData({
      item: e.currentTarget.dataset.item,
      showInd: true,
      showIndNx: false,
    })
  },

  showDialogBtnNx: function (e) {
    this.setData({
      item: e.currentTarget.dataset.item,
      showIndNx: true,
      showInd: false,
    })
  },

  hideModal: function () {
    this.setData({
      showGoodsModal: false
    });
  },


  toBusiness(e) {
    var id = e.currentTarget.dataset.id;
    wx.setStorageSync('disGoods', e.currentTarget.dataset.goods);
    wx.navigateTo({
      url: '../stockGoodsList/stockGoodsList?disGoodsId=' + id,
    })
  },

  toFenxi(e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../goodsFenxi/goodsFenxi?id=' + id,
    })
  },

  toGoods(e){
    wx.setStorageSync('disGoods', e.currentTarget.dataset.goods);
    console.log("goods",e)
    wx.navigateTo({
      url: '../../../subPackage/pages/goods/disGoodsPage/disGoodsPage?disGoodsId=' + e.currentTarget.dataset.id,
    })
  },


  _getInitDataDep() {
    load.showLoading("获取分类");
    var data = {
      disId: this.data.disId,
    }
    disGetDepGoodsCataGb(data).then(res => {
      load.hideLoading();
      if (res.result.code === 0 && res.result.data.cataArr.length > 0) {
        const firstSubCat = res.result.data.cataArr[0].fatherGoodsEntities[0];
        this.setData({
          
          depGoodsCataArr: res.result.data.cataArr,
          sortDisGoodsArr: res.result.data.disGoodsArr,
          lastQueryEndIndex: 0,
          hasMoreGoods: true,
          activeSubCatIdDep: firstSubCat.gbDistributerFatherGoodsId,
          subcatScrollIntoViewDep: `subcat-dep-${firstSubCat.gbDistributerFatherGoodsId}`,
          fatherArr: res.result.data.cataArr[0].fatherGoodsEntities,
          disGoodsArrAi: [],
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

  disGetDepGoodsGbPage({
    limit: this.data.limit,
    page: this.data.currentPage,
    disId: this.data.disId
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
    const base = isRefresh ? 0 : this.data.disGoodsArrAi.length;
    list.forEach((item, idx) => {
      item.viewId = 'goods_' + (base + idx);
    });


    // 3) 合并数据
    const merged = this.data.disGoodsArrAi.concat(list);

    // 4) 合并后按 sortDisGoodsArr 顺序排序
    const idOrder = (this.data.sortDisGoodsArr || []).map(String);
    // console.log('sortDisGoodsArr:', idOrder);
    // console.log('merged ids:', merged.map(i => i.gbDistributerGoodsId));
    const sortedArr = merged.slice().sort((a, b) => {
      const idxA = idOrder.indexOf(String(a.gbDistributerGoodsId));
      const idxB = idOrder.indexOf(String(b.gbDistributerGoodsId));
      return (idxA === -1 ? 99999 : idxA) - (idxB === -1 ? 99999 : idxB);
    });

    // 5) 处理商品数据，添加 isFirstInCategory（对全量商品处理）
    const finalArr = this.processGoodsListDep(sortedArr);

    // 5) 写入并可回调滚动
    this.setData({
      disGoodsArrAi: finalArr,
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
    const firstSubCat = this.data.depGoodsCataArr[idx].nxGoodsEntityList[0];
    this.setData({
      selectedSub: idx,
      fatherArr: this.data.depGoodsCataArr[idx].nxGoodsEntityList,
      activeSubCatIdDep: firstSubCat.gbDistributerFatherGoodsId,
      subcatScrollIntoViewDep: `subcat-dep-${firstSubCat.gbDistributerFatherGoodsId}`,
    }, () => {
      // 检查当前已加载的商品中是否有该二级分类的商品
      const goodsArr = this.data.disGoodsArrAi;
      const hasGoods = goodsArr.some(
        item => String(item.gbDgDfgGoodsGrandId) === String(firstSubCat.gbDistributerFatherGoodsId)
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
    const goodsArr = this.data.disGoodsArrAi;
    
    const hasGoods = goodsArr.some(
      item => String(item.gbDgDfgGoodsGrandId) === String(subCatId)
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
    disGetDepGoodsGbPage({
      disId: this.data.disId,
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
        const base = this.data.disGoodsArrAi.length;
        list.forEach((item, idx) => {
          item.viewId = 'goods_' + (base + idx);
        });
        for(var i = 0 ; i < list.length ; i++){
          console.log("第" + page + "页面请求的数据是:" + list[i].gbDdgDepGoodsName);
        }

        // 3) 合并数据
        const merged = this.data.disGoodsArrAi.concat(list);

        // 4) 合并后按 sortDisGoodsArr 顺序排序
        const idOrder = (this.data.sortDisGoodsArr || []).map(String);
        console.log('sortDisGoodsArr:', idOrder);
        console.log('merged ids:', merged.map(i => i.gbDistributerGoodsId));
        const sortedArr = merged.slice().sort((a, b) => {
          const idxA = idOrder.indexOf(String(a.gbDistributerGoodsId));
          const idxB = idOrder.indexOf(String(b.gbDistributerGoodsId));
          return (idxA === -1 ? 99999 : idxA) - (idxB === -1 ? 99999 : idxB);
        });

        // 5) 处理商品数据，添加 isFirstInCategory（对全量商品处理）
        const finalArr = this.processGoodsListDep(sortedArr);

        // 5) 写入并可回调滚动
        this.setData({
          disGoodsArrAi: finalArr,
          currentPage: page,
          totalPages: totalPages,
          totalCount: totalCount,
        }, () => {
          // 新增：数据加载后自动滚动到目标分类商品
          const goodsArr = this.data.disGoodsArrAi;
          const idx = goodsArr.findIndex(item => String(item.gbDgDfgGoodsGrandId) === String(subCatId));
          // let count = 0;
          // if (idx !== -1) {
          //   for (let i = idx; i < goodsArr.length; i++) {
          //     if (String(goodsArr[i].gbDgDfgGoodsGrandId) === String(subCatId)) {
          //       count++;
          //     }
          //   }
          // }
          // console.log('[loadGoodsBySubCatIdDep] subCatId:', subCatId, 'limit:', this.data.limit, 'idx:', idx, 'count:', count, 'disGoodsArrAi.length:', goodsArr.length);
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
    // list.sort((a, b) => a.gbDgDfgGoodsGrandId - b.gbDgDfgGoodsGrandId);
    let currentCategory = null;
    const result = list.map(item => {
      // 为每个商品项添加默认的展开状态属性
      const baseItem = {
        ...item,
        isSelected: false, // 默认收起状态
        arrowRotated: false, // 默认箭头不旋转
        animation: null // 动画对象
      };

      if (item.gbDgDfgGoodsGrandId !== currentCategory) {
        currentCategory = item.gbDgDfgGoodsGrandId;
        const obj = {
          ...baseItem,
          isFirstInCategory: true,
          categoryName: this.getCategoryNameDep(item.gbDgDfgGoodsGrandId)
        };

        return obj;
      }
      const obj = {
        ...baseItem,
        isFirstInCategory: false,
        categoryName: this.getCategoryNameDep(item.gbDgDfgGoodsGrandId)
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
      // disGoodsArrAi 里找第一个 grandId=activeId 的商品，取其 greatId
      const item = this.data.disGoodsArrAi.find(g => String(g.gbDgDfgGoodsGrandId) === String(activeId));
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
          fatherArr: this.data.depGoodsCataArr[subIndex].nxGoodsEntityList
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
        const goodsOrder = (this.data.disGoodsArrAi || []).map(g => g.gbDgDfgGoodsGrandId);
        // console.log('[calculateCategoryPositionsDep] disGoodsArrAi 渲染顺序:', goodsOrder);
        // console.log('[calculateCategoryPositionsDep] 分类锚点位置(已排序):', positions);
      } else {
        // console.warn('[calculateCategoryPositionsDep] 未获取到有效的节点信息', res);
        }
      });
  },
  


  /**
   * tabItme点击
   */
  onTab1Click(event) {
    let index = event.currentTarget.dataset.index;
    this.setData({
      // sliderOffset: this.data.sliderOffsets[index],
      tab1Index: index,
      itemIndex: index,
    })
  },


  // 
  applyGoods(e) {

    console.log("applyGoodos", e);

    this.setData({
      index: e.currentTarget.dataset.index,
      applySubtotal: "0.0元",
      canSave: false,
      itemDis: e.currentTarget.dataset.disgoods,
      gbGoods: e.currentTarget.dataset.gbgoods,
      depGoods: e.currentTarget.dataset.depgoods,
    })

    if (e.currentTarget.dataset.disgoods == null) {

      this.setData({
        showNx: true,
        applyStandardName: e.currentTarget.dataset.gbgoods.gbGoodsStandardname,
      })
    } else {
      console.log("currentTarget.dataset.disgood!!!!", e.currentTarget.dataset.disgoods.gbDgPullOff);
      if (e.currentTarget.dataset.disgoods.gbDgPullOff == 1) {
        wx.showToast({
          title: '停止订货',
          icon: 'none'
        })

      } else {
        this.setData({
          show: true,
          applyStandardName: e.currentTarget.dataset.disgoods.gbDgGoodsStandardname,

        })
      }

    }



  },


  toEditApplyDep(e) {
    var applyItem = e.currentTarget.dataset.order;
    var itemStatus = applyItem.gbDoBuyStatus;
    if (itemStatus > 1) {
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
        greatIndex: e.currentTarget.dataset.greatindex,
        grandIndex: e.currentTarget.dataset.grandindex,
        fatherIndex: e.currentTarget.dataset.fatherindex,
        index: e.currentTarget.dataset.index,
        applyItem: e.currentTarget.dataset.order,
        show: true,
        applyStandardName: applyItem.gbDoStandard,
        itemDis: e.currentTarget.dataset.disgoods,
        editApply: true,
        applyNumber: applyItem.gbDoQuantity,
        applyRemark: applyItem.gbDoRemark,
        depgoods: e.currentTarget.dataset.depgoods,
      })


    }
  },

  toEditApply(e) {
    var applyItem = e.currentTarget.dataset.order;
    var itemStatus = applyItem.gbDoBuyStatus;
    if (itemStatus > 1) {
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
        applyStandardName: applyItem.gbDoStandard,
        itemDis: e.currentTarget.dataset.disgoods,
        editApply: true,
        applyNumber: applyItem.gbDoQuantity,
        applyRemark: applyItem.gbDoRemark,
        index: e.currentTarget.dataset.index,
        fatherIndex: e.currentTarget.dataset.fatherindex,
      })

      if (this.data.applyItem.gbDoSubtotal !== null) {
        console.log("eidididiiidid");
        this.setData({
          applySubtotal: applyItem.gbDoSubtotal + "元"
        })
      }
    }
  },


  // 保存订货订单
  confirm: function (e) {
    if (this.data.editApply) {
      this._updateDisOrder(e);
    } else {
      this._saveOrder(e);
    }

    this.setData({
      show: false,
      editApply: false,
      applyItem: "",
      item: "",
      applyNumber: "",
      applyStandardName: "",
    })
  },

  showTishi() {
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
  },


  _saveOrder: function (e) {

    var arriveDate = dateUtils.getArriveDate(0);
    var arriveOnlyDate = dateUtils.getArriveOnlyDate(0);
    var weekYear = dateUtils.getArriveWeeksYear(0);
    var week = dateUtils.getArriveWhatDay(0);
    var depDisGoodsId = -1;
    var gbDisGoodsId = -1;
    var gbDisGoodsFatherId = -1;
    var gbGoodsId = "";
    var gbGoodsFatherId = "";
    var gbDisId = -1;
    var gbDisGoodsId = -1;
    var price = null;
    var weight = null;
    var subtotal = 0;
    var goodsType = "";
    var toDepId = "";
    var printStandard = "";

    
    if (this.data.itemDis !== null) {
      gbDisGoodsId = this.data.itemDis.gbDistributerGoodsId;
      gbDisGoodsFatherId = this.data.itemDis.gbDgDfgGoodsFatherId;
      gbGoodsId = this.data.itemDis.gbDgNxGoodsId;
      gbGoodsFatherId = this.data.itemDis.gbDgNxFatherId;
      gbDisId = this.data.itemDis.gbDgNxDistributerId;
      gbDisGoodsId = this.data.itemDis.gbDgNxDistributerGoodsId;
      toDepId = this.data.itemDis.gbDgGbDepartmentId;
      goodsType = this.data.itemDis.gbDgGoodsType;
      printStandard = this.data.itemDis.gbDgGoodsStandardname;
      console.log("itemmdddd" + gbDisGoodsId);
      //是否给weight赋值
      if (e.detail.applyStandardName == this.data.itemDis.gbGoodsStandardname) {
        weight = e.detail.applyNumber;
      }
    } else {
      gbGoodsId = this.data.gbGoods.gbGoodsId;
      gbGoodsFatherId = this.data.gbGoods.gbGoodsFatherId;
      goodsType = 2;
      toDepId = this.data.disInfo.purDepartmentList[0].gbDepartmentId;
    }

    var userId = "";
    if (this.data.userInfo !== null) {
      userId = this.data.userInfo.gbDepartmentUserId;
    }

    if (this.data.depGoods !== null) {
      depDisGoodsId = this.data.depGoods.gbDepartmentDisGoodsId;
      printStandard = this.data.depGoods.gbDdgPrintStandard;
    }

    var dg = {
      gbDoOrderUserId: userId,
      gbDoDepDisGoodsId: depDisGoodsId, //
      gbDoDisGoodsId: gbDisGoodsId, //
      gbDoDisGoodsFatherId: gbDisGoodsFatherId,
      gbDoDepartmentId: this.data.depId,
      gbDoToDepartmentId: toDepId,
      gbDoDistributerId: this.data.disId,
      gbDoDepartmentFatherId: this.data.depFatherId,
      gbDoQuantity: e.detail.applyNumber,
      gbDoPrice: price,
      gbDoWeight: weight,
      gbDoSubtotal: subtotal,
      gbDoStandard: e.detail.applyStandardName,
      gbDoRemark: e.detail.applyRemark,
      gbDoIsAgent: 0,
      gbDoArriveDate: arriveDate,
      gbDoArriveWeeksYear: weekYear,
      gbDoArriveOnlyDate: arriveOnlyDate,
      gbDoArriveWhatDay: week,
      gbDoNxGoodsId: gbGoodsId,
      gbDoNxGoodsFatherId: gbGoodsFatherId,
      gbDoNxDistributerGoodsId: gbDisGoodsId,
      gbDoNxDistributerId: gbDisId,
      gbDoGoodsType: goodsType,
      gbDoOrderType: goodsType,
      gbDoDsStandardScale: -1,
      stockIsZero: e.detail.stockIsZero,
      gbDoPrintStandard: printStandard,

    };
    console.log(dg);
    if (this.data.itemDis == null) {
      load.showLoading("保存订单");
      saveOrdersGbJjAndSaveGoods(dg).then(res => {
        load.hideLoading();
        if (res.result.code == 0) {
          load.hideLoading();
          var newGoods = res.result.data.gbDistributerGoodsEntity;
          var data = "goodsList[" + this.data.index + "].gbDepartmentOrdersEntity";
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
        saveOrdersGbJjAndSaveDepGoods(dg).then(res => {
          load.hideLoading();
          if (res.result.code == 0) {
            var data = "goodsList[" + this.data.index + "].gbDepartmentOrdersEntity";
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
        saveGbOrderJj(dg).then(res => {
          load.hideLoading();
          if (res.result.code == 0) {
           load.hideLoading();
            if (this.data.tab1Index == 0) {
              console.log("depgodosoagupddpdd");
              var data = "depGoodsArr[" + this.data.greatIndex + "].nxGoodsEntityList[" + this.data.grandIndex + "].nxGoodsEntityList[" + this.data.fatherIndex + "].gbDepartmentDisGoodsEntities[" + this.data.index + "].gbDepartmentOrdersEntity";
            
              var dataGoods = "depGoodsArr[" + this.data.greatIndex + "].nxGoodsEntityList[" + this.data.grandIndex + "].nxGoodsEntityList[" + this.data.fatherIndex + "].gbDepartmentDisGoodsEntities[" + this.data.index + "].gbDistributerGoodsEntity";
              
          
              this.setData({
                [data]: res.result.data,
                [dataGoods]: res.result.data.gbDistributerGoodsEntity,
              })
              if (dg.stockIsZero) {
                var dataStock = "depGoodsArr[" + this.data.greatIndex + "].nxGoodsEntityList[" + this.data.grandIndex + "].nxGoodsEntityList[" + this.data.fatherIndex + "].gbDepartmentDisGoodsEntities[" + this.data.index + "].gbDepartmentGoodsStockEntities";
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
      }

    }

  },

  /**
   * 修改配送申请
   * @param {} e 
   */
  _updateDisOrder(e) {
    var that = this;
    var dg = {
      id: that.data.applyItem.gbDepartmentOrdersId,
      weight: e.detail.applyNumber,
      standard: e.detail.applyStandardName,
      remark: e.detail.applyRemark,
    };
    load.showLoading("修改订单");
    updateOrderGbJj(dg).then(res => {
      load.hideLoading();
      if (res.result.code == 0) {
        load.hideLoading();
        if (this.data.tab1Index == 0) {
          var data = "depGoodsArr[" + this.data.greatIndex + "].nxGoodsEntityList[" + this.data.grandIndex + "].nxGoodsEntityList[" + this.data.fatherIndex + "].gbDepartmentDisGoodsEntities[" + this.data.index + "].gbDepartmentOrdersEntity";
          var dataGoods = "depGoodsArr[" + this.data.greatIndex + "].nxGoodsEntityList[" + this.data.grandIndex + "].nxGoodsEntityList[" + this.data.fatherIndex + "].gbDepartmentDisGoodsEntities[" + this.data.index + "].gbDistributerGoodsEntity";
         
          this.setData({
            [data]: res.result.data,
            [dataGoods]: res.result.data.gbDistributerGoodsEntity,
            itemDis: res.result.data.gbDistributerGoodsEntity,
          })
        }
        if (this.data.tab1Index == 1) {
          var data = "goodsList[" + this.data.index + "].gbDepartmentOrdersEntity";
          this.setData({
            [data]: res.result.data
          })
        }
        this.cancle();
      } else {
        load.hideLoading();
        wx.showToast({
          title: res.result.msg,
          icon: "none"
        })
      }
    })
  },



  // 

  initDisData() {
    load.showLoading("获取商品")
    var that = this;
    var data = {
      gbDisId: this.data.disId,
      depId: this.data.depId,
    }
    console.log("dataaaaa", data)
    gbDepGetNxCataGoods(data).then(res => {
      if (res.result.code == 0) {
        load.hideLoading();
        var newId = res.result.data[0].nxGoodsEntityList[0].nxGoodsId;

        this.setData({
          grandList: res.result.data,
          fatherArr: res.result.data[0].nxGoodsEntityList,
          leftGreatId: res.result.data[0].nxGoodsId,
          selectedSubCategoryId: res.result.data[0].nxGoodsEntityList[0].nxGoodsId,
          greatName: res.result.data[0].nxGoodsName,
          fatherSonsIndex: 0,
          activeSubCatId: newId,
        })
        that._getFatherGoodsDis();
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
      totalPageDis: 1,
      isLoading: false,
      greatName: e.currentTarget.dataset.name,
      fatherArr: this.data.grandList[e.currentTarget.dataset.index].nxGoodsEntityList,
      selectedSubCategoryId: this.data.grandList[e.currentTarget.dataset.index].nxGoodsEntityList[0].nxGoodsId,
      activeSubCatId: this.data.grandList[e.currentTarget.dataset.index].nxGoodsEntityList[0].nxGoodsId,

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
    this._getFatherGoodsDis();
  },


  _getFatherGoodsDis() {
    const data = {
      depId: this.data.depId,
      fatherId: this.data.leftGreatId,
      limit: this.data.limit,
      page: this.data.currentPage,
      disId: this.data.disId,
    };

    gbDepGetNxFatherGoods(data).then(res => {
      if (res.result.code == 0) {
        const processedList = this.processGoodsListDis(res.result.page.list);
        var subCatId = this.data.activeSubCatId;
        this.setData({
          goodsList: processedList,
          currentPageDis: this.data.currentPageDis + 1,
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
    console.log("onScrollToLowerDisonScrollToLowerDis")
    // 防止重复请求
    if (this.data.isLoading || this.data.goodsList.length >= this.data.totalCountDis) return;

    this.setData({
      isLoading: true
    });

    const {
      currentPageDis,
      totalPageDis,
      searchFather,
      leftGreatId,
      depFatherId,
      disId,
      limit
    } = this.data;

    // 确保非搜索模式，并且当前页数未超过总页数
    if (currentPageDis <= totalPageDis) {
      const data = {
        limit: limit,
        page: currentPageDis,
        depId: depFatherId,
        fatherId: leftGreatId,
        disId: disId,
      };
      console.log("datatt", data);
      gbDepGetNxFatherGoods(data)
        .then((res) => {
          if (res.result.code == 0) {
            const newItems = res.result.page.list || [];
            const updatedGoodsList = [...this.data.goodsList, ...newItems];

            // 更新当前页和商品列表
            this.setData({
              goodsList: updatedGoodsList,
              currentPageDis: currentPageDis + 1,
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
        // .catch(() => {
        //   wx.showToast({
        //     title: '加载错误，请稍后再试',
        //     icon: 'none'
        //   });
        //   this.setData({
        //     isLoading: false
        //   });
        // });
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
          const activeId = firstVisibleItem.nxGoodsGrandId;
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


  // Dis点击标签事件
  onSubCatTapDis(e) {
    const subCatId = e.currentTarget.dataset.id;
    const hasGoods = this.data.goodsList.some(item => String(item.nxDgDfgGoodsGrandId) === String(subCatId));
    this.setData({
      showAllSubCat: false,
      activeSubCatId: String(subCatId),
      subcatScrollIntoView: `subcat-${subCatId}`
    });
    if (hasGoods) {
      // 已有商品，直接滚动
      this.setData({
        scrollIntoView: `cat-${subCatId}`
      });
    } else {

      this.loadGoodsBySubCatIdDis(subCatId, this.data.currentPageDis, this.data.goodsList);

    }
  },


  loadGoodsBySubCatIdDis(subCatId, page = 1, accumulatedGoods = []) {
    gbDepGetNxFatherGoods({
      depId: this.data.depId,
      fatherId: this.data.leftGreatId,
      limit: this.data.limit,
      disId: this.data.disId,
      page: page
    }).then(res => {

      if (res.result.code == 0) {
        const newGoods = res.result.page.list || [];
        const allGoods = accumulatedGoods.concat(newGoods);
        // 累计目标父类商品
        const targetGoods = allGoods.filter(item => String(item.nxDgDfgGoodsGrandId) === String(subCatId));
        const hasEnough = targetGoods.length >= this.data.limit;


        if (hasEnough) {
          // 拉够一页，渲染并滚动
          const processed = this.processGoodsListDis(allGoods);
          this.setData({
            goodsList: processed,
            currentPageDis: page + 1,
            totalPageDis: res.result.page.totalPage,
            totalCountDis: res.result.page.totalCount,
            scrollIntoView: `cat-${subCatId}`
          });
          setTimeout(() => this.calculateCategoryPositionsDis(), 100);
        } else if (page < res.result.page.totalPage) {
          // 没拉够且还有下一页，递归拉取
          this.loadGoodsBySubCatIdDis(subCatId, page + 1, allGoods);
        } else {
          // 全部拉完也没拉够
          this.setData({
            goodsList: this.processGoodsListDis(allGoods),
            currentPageDis: page + 1,
            totalPageDis: res.result.page.totalPage,
            totalCountDis: res.result.page.totalCount
          });
          wx.showToast({
            title: '该分类下商品不足一页',
            icon: 'none'
          });
        }
      } else {
        wx.showToast({
          title: '商品加载失败',
          icon: 'none'
        });
      }
    });
  },


  // 处理商品数据，添加分类信息
  processGoodsListDis(list) {
    // 先按分类ID排序
    list.sort((a, b) => a.nxDgDfgGoodsGrandId - b.nxDgDfgGoodsGrandId);
    let currentCategory = null;
    return list.map(item => {
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
  },

  // 计算分类位置
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

  // 获取分类名称
  getCategoryNameDis(categoryId) {
    const category = this.data.fatherArr.find(item =>
      item.nxGoodsId === categoryId
    );
    return category ? category.nxGoodsName : '';
  },

//olddddd
  // initDisData() {
  //   load.showLoading("获取商品")
  //   var that = this;
  //   var data = {
  //     gbDisId: this.data.disId,
  //     depId: this.data.depId,
  //   }
  //   gbDepGetNxCataGoods(data).then(res => {
  //     if (res.result.code == 0) {
  //       console.log(res.result.data);
  //       load.hideLoading();
  //       this.setData({
  //         grandList: res.result.data,
  //         // fatherArr: res.result.data[0].gbGoodsEntityList,
  //         // leftGreatId: res.result.data[0].gbGoodsId,
  //         // selectedSubCategoryId: res.result.data[0].gbGoodsEntityList[0].gbGoodsId,
  //         // greatName: res.result.data[0].gbDfgFatherGoodsName,
  //         fatherSonsIndex: 0,
  //       })
  //       // that._getFatherGoods();
  //     }
  //   })
  // },





  changeGreatGrand(e) {
    console.log(e);
    const categoryId = e.currentTarget.dataset.id;
    if (categoryId !== this.data.leftGreatId) {
      this.setData({
        leftGreatId: categoryId,
        leftIndex: e.currentTarget.dataset.index,
        goodsList: [],
        currentPage: 1,
        totalPage: 1,
        isLoading: false,
        toTop: 0,
        greatName: e.currentTarget.dataset.name,
        fatherArr: this.data.grandList[e.currentTarget.dataset.index].gbGoodsEntityList,
        selectedSubCategoryId: this.data.grandList[e.currentTarget.dataset.index].gbGoodsEntityList[0].gbGoodsId,
        searchFather: false,
        searchId: "",
      });
      this._getFatherGoods();

    }

  },




  _getFatherGoods() {

    var data = {
      depId: this.data.depId,
      fatherId: this.data.leftGreatId,
      limit: this.data.limit,
      page: this.data.currentPage,
      disId: this.data.disId
    }
    gbDepGetNxFatherGoods(data).then(res => {
      if (res.result.code == 0) {
        console.log(res.result.page);

        this.setData({
          goodsList: res.result.page.list,
          selectedSubCategoryId: this.data.grandList[this.data.leftIndex].gbGoodsEntityList[0].gbGoodsId,
          currentPage: this.data.currentPage + 1,
          totalPage: res.result.page.totalPage,
          totalCount: res.result.page.totalCount,
        })

        var that = this;
        var query = wx.createSelectorQuery();
        //选择id
        query.select('#miltest').boundingClientRect()
        query.exec(function (res) {
          //res就是 所有标签为miltest的元素的信息 的数组
          //取高度
          that.setData({
            topHeight: res[0].height * globalData.rpxR
          })
        })
        if (!this.data.searchFather) {
          this.calculateSubCategoryHeights();
        }
      }
    })
  },

  


  calculateSubCategoryHeights() {
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



  onScroll(e) {
    const scrollTop = e.detail.scrollTop;
    this.updateSubCategorySelection(scrollTop);

  },

  updateSubCategorySelection(scrollTop) {
    // console.log("scorlro" , scrollTop);
    const {
      subCategoryHeights,
      goodsList,
      selectedSubCategoryId
    } = this.data;

    for (let i = 0; i < subCategoryHeights.length; i++) {
      if (scrollTop < subCategoryHeights[i]) {
        const newSubCategoryId = goodsList[i].gbGoodsGrandId;
        // 如果当前滚动到的商品所属二级目录不是选中的，则更新
        if (newSubCategoryId !== selectedSubCategoryId) {
          this.setData({
            selectedSubCategoryId: newSubCategoryId
          });
        }
        break;
      }
    }
  },


  onScrollToLower: function () {
    // 防止重复请求
    if (this.data.isLoading || this.data.goodsList.length >= this.data.totalCount) return;

    this.setData({
      isLoading: true
    });

    const {
      currentPage,
      totalPage,
      searchFather,
      leftGreatId,
      depId,
      limit,
      disId
    } = this.data;

    // 确保非搜索模式，并且当前页数未超过总页数
    if (!searchFather && currentPage <= totalPage) {
      const data = {
        limit: limit,
        page: currentPage,
        depId: depId,
        fatherId: leftGreatId,
        disId: disId,
      };

      gbDepGetNxFatherGoods(data)
        .then((res) => {
          if (res.result.code == 0) {
            const newItems = res.result.page.list || [];
            const updatedGoodsList = [...this.data.goodsList, ...newItems];

            // 更新当前页和商品列表
            this.setData({
              goodsList: updatedGoodsList,
              currentPage: currentPage + 1,
              totalPage: res.result.page.totalPage,
              totalCount: res.result.page.totalCount,
              isLoading: false,
            });

            // 如果已达到 totalCount，停止加载
            if (updatedGoodsList.length >= this.data.totalCount) {
              this.setData({
                isLoading: false
              });
            }

            // 重新计算右侧商品高度
            this.calculateSubCategoryHeights();
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
        .catch(() => {
          wx.showToast({
            title: '加载错误，请稍后再试',
            icon: 'none'
          });
          this.setData({
            isLoading: false
          });
        });
    } else {
      this.setData({
        isLoading: false
      });
    }
  },



  confirmWarn() {
    if (this.data.popupType == 'deleteSpec') {
      this.deleteStandardApi()
    } else {
      this.deleteApplyApi()
    }
  },


  delStandard(e) {
    this.setData({
      warnContent: e.detail.standardName,
      show: false,
      popupType: 'deleteSpec',
      showPopupWarn: true,
      disStandardId: e.detail.id,
    })

  },


  deleteApplyApi() {

    this.setData({
      popupType: "",
      showPopupWarn: false,
    })

    var that = this;
    deleteOrderGb(this.data.applyItem.gbDepartmentOrdersId).then(res => {
      if (res.result.code == 0) {
        if (that.data.tab1Index == 0) {

          var data = "depGoodsArr[" + this.data.greatIndex + "].nxGoodsEntityList[" + this.data.grandIndex + "].nxGoodsEntityList[" + this.data.fatherIndex + "].gbDepartmentDisGoodsEntities[" + this.data.index + "].gbDepartmentOrdersEntity";
          this.setData({
            [data]: null
          })
        }
        if (that.data.tab1Index == 1) {
          var data1 = "goodsList[" + this.data.index + "].gbDepartmentOrdersEntity";
          this.setData({
            [data1]: null
          })
        }
        that.cancle()

      }
    })
  },

  deleteStandardApi() {

    gbDisDeleteStandard(this.data.disStandardId).then(res => {
      if (res.result.code == 0) {
        if (this.data.tab1Index == 0) {
          var dataGoods = "depGoodsArr[" + this.data.greatIndex + "].nxGoodsEntityList[" + this.data.grandIndex + "].nxGoodsEntityList[" + this.data.fatherIndex + "].gbDepartmentDisGoodsEntities[" + this.data.index + "].gbDistributerGoodsEntity";
          this.setData({
            [dataGoods]: res.result.data,
          })
        }
        if (this.data.tab1Index == 1) {
          var dataGoods = "goodsList[" + this.data.index + "].gbDistributerGoodsEntity";
          this.setData({
            [dataGoods]: res.result.data,
          })
        }

        this.setData({
          popupType: "",
          showPopupWarn: false,
          disStandardId: "",
          itemDis: "",
          item: "",
          editApply: false,
          show: false,
        })

      } else {
        wx.showToast({
          title: res.result.msg,
          icon: 'none'
        })
      }
    })
  },

  confirmStandardNx(e) {
    console.log(e);
    console.log("confirmStandardconfirmStandardconfirmStandard")
    var data = {
      gbSGoodsId: this.data.gbGoods.gbGoodsId,
      gbStandardName: e.detail.newStandardName,
    }
    saveNxStandard(data).
    then(res => {
      if (res.result.code == 0) {
        var standardArr = this.data.gbGoods.gbGoodsStandardEntities;
        standardArr.push(res.result.data);
        var standards = "gbGoods.gbGoodsStandardEntities";
        var data = "goodsList[" + this.data.index + "].gbGoodsStandardEntities"
        this.setData({
          [standards]: standardArr,
          [data]: standardArr,
          applyStandardName: res.result.data.gbStandardName,

        })
      } else {
        wx.showToast({
          title: res.result.msg,
          icon: 'none'
        })
      }
    })
  },

  confirmStandard(e) {
    var data = {
      gbDsDisGoodsId: this.data.itemDis.gbDistributerGoodsId,
      gbDsStandardName: e.detail.newStandardName,
    }
    gbDisSaveStandard(data).
    then(res => {
      if (res.result.code == 0) {
        var standardArr = this.data.itemDis.gbDistributerStandardEntities;
        standardArr.push(res.result.data);
        var standards = "itemDis.gbDistributerStandardEntities"
        this.setData({
          [standards]: standardArr,
          applyStandardName: res.result.data.gbDsStandardName,
        })
        if (this.data.tab1Index == 0) {
          var dataGoods = "depGoodsArr[" + this.data.greatIndex + "].nxGoodsEntityList[" + this.data.grandIndex + "].nxGoodsEntityList[" + this.data.fatherIndex + "].gbDepartmentDisGoodsEntities[" + this.data.index + "].gbDistributerGoodsEntity.gbDistributerStandardEntities";
          this.setData({
            [dataGoods]: standardArr,
          })
        }
        if (this.data.tab1Index == 1) {
          var dataGoods = "goodsList[" + this.data.index + "].gbDistributerGoodsEntity.gbGoodsStandardEntities";
          var itemData = "itemDis.gbGoodsStandardEntities"
          this.setData({
            [dataGoods]: standardArr,
            [itemData]: standardArr
          })
        }
      } else {
        wx.showToast({
          title: res.result.msg,
          icon: 'none'
        })
      }
    })
  },

  /**
   * 删除订货
   */
  delApply() {
    this.setData({
      warnContent: this.data.itemDis.gbDgGoodsName + "  " + this.data.applyItem.gbDoQuantity + this.data.applyItem.gbDoStandard,
      deleteShow: true,
      show: false,
      popupType: 'deleteOrder',
      showPopupWarn: true,
      showOperationGoods: false,
      showOperationLinshi: false
    })
    this.setData({
      showOperationGoods: false,
      showOperationLinshi: false
    })
    this.hideModal();
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



  toSearchGoods() {
    this.setData({
      update: true
    })
    wx.navigateTo({
      url: '../resGoodsSearch/resGoodsSearch',
    })
  },



  deleteNo() {
    this.setData({
      applyItem: "",
      deleteShow: false,
    })
  },



  cancle() {
    this.setData({
      show: false,
      applyItem: "",
      applyStandardName: "",
      editApply: false,
      applyNumber: "",
      applyRemark: "",
      applySubtotal: "",
      itemDis: null,
      item: null,

    })
  },


  hideMask() {
    this.setData({
      showOperation: false,
    })
  },



  showStock(e) {
    var item = e.currentTarget.dataset.item;
    item.gbDistributerGoodsEntity = e.currentTarget.dataset.goods.gbDistributerGoodsEntity;

    if (item.gbDgsWasteFullTime !== null) {
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
      item: item,
      consultItem: JSON.parse(JSON.stringify(item)),
      disGoods: e.currentTarget.dataset.goods,

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
            if(this.data.isSearching){
              this._searchGoods();
            }else{
              this._updateData();
            }
           
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
            var that = this;
            var src = that.data.src;
            var reason = that.data.reason;
            var id = res.result.data.gbDepartmentGoodsStockReduceId;
            console.log(src + reason + id);
            reduceAttachmentSaveWithFile(src, reason, id).then((res) => {
              console.log(res);
              if (res.result == '{"code":0}') {
                if(that.data.isSearching){
                  that._searchGoods();
                }else{
                  that._updateData();
                }
               
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
          if (res.result.code == 0) {
            if(this.data.isSearching){
              this._searchGoods();
            }else{
              this._updateData();
            }
          }else{
            wx.showToast({
              title: res.result.msg,
              icon: 'none'
            })
          }
        })
    } else if (showType == 4) {
      load.showLoading("保存数据中");

      console.log(item);
      saveDepWasteGoodsStock(item)
        .then(res => {
          load.hideLoading();
          if (res.result.code == 0) {
            if(this.data.isSearching){
              this._searchGoods();
            }else{
              this._updateData();
            }
          }
        })

    }
  },



  toBack() {
    wx.navigateBack({
      delta: 1
    })
  },

  /**
   * 展开/收起商品详情数据
   * @param {Object} e 事件对象
   */
  showData(e) {
    const index = e.currentTarget.dataset.index;
    const currentSelected = this.data.disGoodsArrAi[index].isSelected;
    
    // 创建动画实例
    const animation = wx.createAnimation({
      duration: 300,
      timingFunction: 'ease-in-out',
    });

    if (currentSelected) {
      // 收起动画：从展开状态到收起状态
      animation.height(0).opacity(0).step();
    } else {
      // 展开动画：从收起状态到展开状态
      animation.height('auto').opacity(1).step();
    }

    // 更新数据
    const dataKey = `disGoodsArrAi[${index}].isSelected`;
    const animationKey = `disGoodsArrAi[${index}].animation`;
    
    this.setData({
      [dataKey]: !currentSelected,
      [animationKey]: animation.export()
    });

    // 如果是展开操作，延迟一下再设置高度为auto，确保动画效果
    if (!currentSelected) {
      setTimeout(() => {
        const autoAnimation = wx.createAnimation({
          duration: 0,
        });
        autoAnimation.height('auto').step();
        this.setData({
          [animationKey]: autoAnimation.export()
        });
      }, 300);
    }

    // 添加箭头旋转效果
    const arrowKey = `disGoodsArrAi[${index}].arrowRotated`;
    this.setData({
      [arrowKey]: !currentSelected
    });
  },

})
