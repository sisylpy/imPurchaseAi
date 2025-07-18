const globalData = getApp().globalData;
var load = require('../../../../lib/load.js');
var dateUtils = require('../../../../utils/dateUtil');
import apiUrl from '../../../../config.js'

import {
  updateOrderGbJj,
  deleteOrderGb,
  gbLogin,
  depGetApplyAiByTime,
  depGetApplyAiFather
} from '../../../../lib/apiDepOrder'

import {
  disSaveStandard,
  disDeleteStandard,
} from '../../../../lib/apiDepOrder'


Page({
  data: {
    showPage: false,
    popupAnimation: {},
   
    avatarUrl: '/images/User2.png',
    userName: '',
    nameError: '',
    isFormValid: false,

    resFatherId: -1,
    depRecord: false,



    showPopup: false,
    popupAnim: {},



    showDepSwitch: false,
    depSwitchAnim: null,

    // 新增：数据刷新控制
    lastRefreshTime: 0,
    refreshInterval: 30000, // 

    showSwitchMenu: false,
    showType: 'time',
    searchArr: null,  // 初始化为null，这样页面打开时不会显示搜索蒙版
    searchValue: '',
   


  },


  onShow() {

    this.setData({
      windowWidth: wx.getWindowInfo().windowWidth * globalData.rpxR,
      windowHeight: wx.getWindowInfo().windowHeight * globalData.rpxR,
      navBarHeight: globalData.navBarHeight * globalData.rpxR,
      url: apiUrl.server,
      todayDate: dateUtils.getArriveDateString(0),

    });
    if (this.data.showFab) {
      this.toggleFab();
    }
  
   
    this._initData();

  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

    var userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo: userInfo,
        disId: userInfo.gbDuDistributerId
      })
      // this._getAtrrName();
    
        var disInfo = wx.getStorageSync('disInfo');
        if(disInfo){
          this.setData({
            disInfo: disInfo,
          })
          console.log("yigedeiiinffnfofofo")
          if(disInfo.mendianDepartmentList[0].gbDepartmentEntityList.length == 1){
            console.log("yigedeiiinffnfofofo")
            wx.setStorageSync('orderDepInfo', disInfo.mendianDepartmentList[0].gbDepartmentEntityList[0])
            this.setData({
              depInfo: disInfo.mendianDepartmentList[0].gbDepartmentEntityList[0],
              depFatherId: disInfo.mendianDepartmentList[0].gbDepartmentEntityList[0].gbDepartmentFatherId,
              depId: disInfo.mendianDepartmentList[0].gbDepartmentEntityList[0].gbDepartmentId,
              depHasSubs: 0,
            })
          }else{
            this.setData({
              depInfo: disInfo.mendianDepartmentList[0],
              depHasSubs: disInfo.mendianDepartmentList[0].gbDepartmentEntityList.length,
            })
          }

        }
       
    
    } else{
      
      var that = this;
      wx.login({
        success: (res) => {
          load.showLoading("正在登录");
          gbLogin(res.code)
            .then((res) => {
              load.hideLoading();
              console.log(res.result.data)
              if (res.result.code !== -1) {
                //缓存用户信息
                //缓存用户id
                wx.setStorageSync('userInfo', res.result.data.depUserInfo);
                wx.setStorageSync('depInfo', res.result.data.depInfo);
                that.setData({
                  userInfo: res.result.data.depUserInfo,
                 
                  
                })
                // that._getAtrrName();
                that._initData();
                //跳转到首页
              } else {
                 wx.navigateTo({
                url: '../register/register',
                  
                }) 
               
              }
            })
        }
      })
    } 

    // var depInfo = wx.getStorageSync('depInfo');
    // if(depInfo){
    //   this.setData({
    //     depInfo: depInfo,

    //   })
    // }
    this._initData();
  
  },

  // 点击圆形按钮，弹窗动画展开
  onFabTap() {
    this.setData({ showPopup: true }, () => {
      // 动画初始化为缩小
      const anim = wx.createAnimation({ duration: 0, timingFunction: 'ease', transformOrigin: '100% 100%' });
      anim.scale(0.1).opacity(0.2).step();
      this.setData({ popupAnim: anim.export() }, () => {
        // 再展开
        setTimeout(() => {
          const anim = wx.createAnimation({ duration: 400, timingFunction: 'cubic-bezier(.21,1.02,.73,1)', transformOrigin: '100% 100%' });
          anim.scale(1).opacity(1).step();
          this.setData({ popupAnim: anim.export() });
        }, 20);
      });
    });
  },

  // 遮罩层/弹窗任意处点击，收起
  onMaskTap() {
    const animation = wx.createAnimation({
      duration: 320,
      timingFunction: 'cubic-bezier(.21,1.02,.73,1)',
      transformOrigin: '90% 90%',
    });
    animation
      .scale(0.1)
      .opacity(0.2)
      .step();
    this.setData({ popupAnim: animation.export() });
    setTimeout(() => {
      this.setData({ showPopup: false });
    }, 320);
  },



  onReady() {
    const anim = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease-in-out'
    });
    anim.scale(1.1).step({
      duration: 250
    }).scale(1).step({
      duration: 250
    });
    this.setData({
      fabMainAnimation: anim.export()
    });

    // const fabItemsRecord = this.data.fabItemsRecord.map((item) => {
    //   const anim = wx.createAnimation({
    //     duration: 0
    //   });
    //   anim.opacity(0).translateY(0).step();
    //   return {
    //     ...item,
    //     animation: anim.export()
    //   };
    // });
    // this.setData({
    //   fabItemsRecord
    // });



    const fabItems = this.data.fabItems.map((item, idx) => {
      const anim = wx.createAnimation({ duration: 0 });
      anim.opacity(0).translateY(40).step();
      return { ...item, animation: anim.export() };
    });
    this.setData({ fabItems });

    
  },


  toggleFab() {
    this.setData({
      showFab: true,
    })
   
  },

  // 如果弹窗点击 Message按钮，也可以收起
  onPopupTap() {
    // 这里可写 Message 业务逻辑
    this.onMaskTap();
  },


  _depFab() {
    const show = !this.data.showFab;
    if (show) {
      // 先全部隐藏
      const hiddenItems = this.data.fabItems.map(item => {
        const anim = wx.createAnimation({
          duration: 0
        });
        anim.opacity(0).translateY(0).step();
        return {
          ...item,
          animation: anim.export()
        };
      });
      this.setData({
        showFab: true,
        fabItems: hiddenItems,
        fabRotated: true
      }, () => {
        // 依次显示
        this.data.fabItems.forEach((item, idx) => {
          setTimeout(() => {
            const anim = wx.createAnimation({
              duration: 300,
              timingFunction: 'ease-out'
            });
            anim.opacity(1).translateY(item.top).step();
            const updatedItems = [...this.data.fabItems];
            updatedItems[idx] = {
              ...item,
              animation: anim.export()
            };
            this.setData({
              fabItems: updatedItems
            });
          }, idx * 80);
        });
      });
    } else {
      // 依次隐藏
      this.data.fabItems.forEach((item, idx) => {
        setTimeout(() => {
          const anim = wx.createAnimation({
            duration: 200,
            timingFunction: 'ease-in'
          });
          anim.opacity(0).translateY(0).step();
          const updatedItems = [...this.data.fabItems];
          updatedItems[idx] = {
            ...item,
            animation: anim.export()
          };
          this.setData({
            fabItems: updatedItems
          });
          // 最后一个隐藏后再关闭 showFab
          if (idx === this.data.fabItems.length - 1) {
            setTimeout(() => {
              this.setData({
                showFab: false,
                fabRotated: false
              });
            }, 200);
          }
        }, idx * 60);
      });
    }
  },


  _depRecordFab() {
    const show = !this.data.showFab;
    if (show) {
      // 先全部隐藏
      const hiddenItems = this.data.fabItemsRecord.map(item => {
        const anim = wx.createAnimation({
          duration: 0
        });
        anim.opacity(0).translateY(0).step();
        return {
          ...item,
          animation: anim.export()
        };
      });
      this.setData({
        showFab: true,
        fabItemsRecord: hiddenItems,
        fabRotated: true
      }, () => {
        // 依次显示
        this.data.fabItemsRecord.forEach((item, idx) => {
          setTimeout(() => {
            const anim = wx.createAnimation({
              duration: 300,
              timingFunction: 'ease-out'
            });
            anim.opacity(1).translateY(item.top).step();
            const updatedItems = [...this.data.fabItemsRecord];
            updatedItems[idx] = {
              ...item,
              animation: anim.export()
            };
            this.setData({
              fabItemsRecord: updatedItems
            });
          }, idx * 80);
        });
      });
    } else {
      // 依次隐藏
      this.data.fabItemsRecord.forEach((item, idx) => {
        setTimeout(() => {
          const anim = wx.createAnimation({
            duration: 200,
            timingFunction: 'ease-in'
          });
          anim.opacity(0).translateY(0).step();
          const updatedItems = [...this.data.fabItemsRecord];
          updatedItems[idx] = {
            ...item,
            animation: anim.export()
          };
          this.setData({
            fabItemsRecord: updatedItems
          });
          // 最后一个隐藏后再关闭 showFab
          if (idx === this.data.fabItemsRecord.length - 1) {
            setTimeout(() => {
              this.setData({
                showFab: false,
                fabRotated: false
              });
            }, 200);
          }
        }, idx * 60);
      });
    }
  },

  /**
   * 邀请采购员
   * @param {*} options 
   */
  onShareAppMessage: function (options) {
    return {
      title: this.data.depInfo.gbDepartmentName + '订货单', // 默认是小程序的名称(可以写slogan等)
      path: '/pages/ai/customer/chefOrder/chefOrder?depFatherId=' + this.data.depFatherId + '&disId=' +
        this.data.disId,
      imageUrl: this.data.url + this.data.imgUrl,
    }
  },





  _initData() {
    
    load.showLoading("获取数据中");
    depGetApplyAiByTime(this.data.depFatherId)
      .then(res => {
        load.hideLoading();
        console.log("_initData_initData", res.result.data);
        if (res.result.code == 0) {

          if (this.data.depHasSubs > 0) {
            this.setData({
              depArr: res.result.data.arr,
              bill: res.result.data.bill,
            })
          } else {
            this.setData({
              applyArr: res.result.data.arr[0].depOrders,
              bill: res.result.data.arr[0].bill,
              depInfo: res.result.data.arr[0].depInfo,
            })
            wx.setStorageSync('orderDepInfo', res.result.data.arr[0].depInfo);
          }

        } else {
          wx.showToast({
            title: res.result.msg,
            icon: "none"
          })
        }
      })
      .catch(() => {
        load.hideLoading();
        wx.showToast({
          title: '网络异常，请重试',
          icon: 'none'
        });
      });
  },


  _initDataByFather() {

    load.showLoading("获取数据中");
    return depGetApplyAiFather(this.data.depInfo.gbDepartmentId)
      .then(res => {
        load.hideLoading();
        console.log("_initData_initData", res.result.data);
        if (res.result.code == 0) {

          if (this.data.depHasSubs > 0) {
            // 计算全局序号
            // const depArrWithGlobalIndex = this._calculateGlobalOrderIndexForDepArr(res.result.data.arr);

            this.setData({
              depArr: res.result.data,
              bill: res.result.data.bill,
            })
          } else {
            // 计算全局序号
            const applyArrWithGlobalIndex = this._calculateGlobalOrderIndex(res.result.data.arr);

            this.setData({
              applyArr: applyArrWithGlobalIndex,
              bill: res.result.data.bill,
              depInfo: res.result.data.depInfo
            })
            wx.setStorageSync('depInfo', res.result.data.depInfo);
          }

        } else {
          wx.showToast({
            title: res.result.msg,
            icon: "none"
          })
        }
        return res;
      })
      .catch((error) => {
        load.hideLoading();
        wx.showToast({
          title: '网络异常，请重试',
          icon: 'none'
        });
        throw error;
      });

  },


  // // 计算多部门订单的部门内序号（每个部门下所有订单合并编号）
  // _calculateGlobalOrderIndexForDepArr(depArr) {
  //   if (!depArr || !Array.isArray(depArr)) return depArr;
  //   return depArr.map(dep => {
  //     let depOrderIndex = 1;
  //     if (dep.depOrders && Array.isArray(dep.depOrders)) {
  //       dep.depOrders = dep.depOrders.map(father => {
  //         if (father.fatherGoodsEntities && Array.isArray(father.fatherGoodsEntities)) {
  //           father.fatherGoodsEntities = father.fatherGoodsEntities.map(goods => {
  //             if (goods.nxDepartmentOrdersEntities && Array.isArray(goods.nxDepartmentOrdersEntities)) {
  //               goods.nxDepartmentOrdersEntities = goods.nxDepartmentOrdersEntities.map(order => {
  //                 order.globalOrderIndex = depOrderIndex++;
  //                 return order;
  //               });
  //             }
  //             return goods;
  //           });
  //         }
  //         return father;
  //       });
  //     }
  //     return dep;
  //   });
  // },

  delStandard(e) {
    this.setData({
      warnContent: e.detail.standardName,
      show: false,
      popupType: 'deleteSpec',
      showPopupWarn: true,
      disStandardId: e.detail.id,
    })
  },






  delApply() {

    this.setData({
      warnContent: this.data.goodsName + "  " + this.data.applyItem.gbDoQuantity + this.data.applyItem.gbDoStandard,
   
      show: false,
      popupType: 'deleteOrder',
      showPopupWarn: true,
      showOperationGoods: false,
      showOperationLinshi: false
    })

    this.hideModal();

  },


  confirmWarn() {
    if (this.data.popupType == 'deleteSpec') {
      this.deleteStandardApi()
    } else {
      this.deleteApplyApi()
    }
  },

  deleteStandardApi() {
    var that = this;
    disDeleteStandard(this.data.disStandardId).then(res => {
      if (res.result.code == 0) {
        this.setData({
          popupType: "",
          showPopupWarn: false,
          disStandardId: "",
        })

        that.setData({
          itemDis: res.result.data,
          item: res.result.data,
          editApply: true,
          show: true,

        })
        // this._initData();
      } else {
        wx.showToast({
          title: res.result.msg,
          icon: 'none'
        })
      }
    })
  },

  deleteApplyApi() {

    this.setData({
      popupType: "",
      showPopupWarn: false,
    })

    load.showLoading("删除订单");
    deleteOrderGb(this.data.applyItem.gbDepartmentOrdersId).then(res => {
      load.hideLoading();
      if (res.result.code == 0) {
        this._initData();
        this.setData({
          applyItem: "",
        })
      } else {
        wx.showToast({
          title: res.result.msg,
          icon: 'none'
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



  // new
  toOrder(e) {
    if (this.data.disInfo.mendianDepartmentList.length > 1) {
      this.setData({
        showChoice: true,
        toType: "order"
      })
    } else {
      this.setData({
        showOperation: true,
      })
    }
  },

  selectDepartment(e) {
    console.log(e.currentTarget.dataset.item);
    wx.setStorageSync('orderDepInfo', e.currentTarget.dataset.item);
    var dep = e.currentTarget.dataset.item;
    var depFatherId = dep.gbDepartmentId;
    if (dep.gbDepartmentFatherId > 0) {
      depFatherId = dep.gbDepartmentFatherId;
    }
    var depId = dep.gbDepartmentId;
    this.setData({
      dep: dep,
      depFatherId: depFatherId,
      depId: depId,
      e,
    })
    if (this.data.openType == 'paste') {
      wx.navigateTo({
        url: '../paste/paste?depFatherId=' + this.data.depFatherId +
          '&depId=' + this.data.depId + '&disId=' + this.data.disId,
      })
    } else if (this.data.openType == 'books') {
      if(this.data.disInfo.nxDistributerEntity !== null){
        wx.navigateTo({
          url: '../resGoodsLessCash/resGoodsLessCash',
        })
      }else{
        wx.navigateTo({
          url: '../resGoodsAi/resGoodsAi',
        })
      }
    
     

    } else if (this.data.openType == 'ai') {
      wx.navigateTo({
        url: '../customerGoodsAi/customerGoodsAi?depId=' + this.data.depId + '&disId=' + this.data.disId,
      })
    }
    
  },



  hideOperation() {
    this.setData({
      showOperation: false
    })
  },


  toAddOrder(e) {

    console.log(e.currentTarget.dataset.type)
    var type = e.currentTarget.dataset.type;
    if (this.data.depHasSubs > 0) {
      this.setData({
        showChoice: true,
        openType: type,
      })
    } else {

      wx.setStorageSync('orderDepInfo', this.data.depInfo)
      if (type == 'paste') {
        wx.navigateTo({
          url: '../paste/paste?depFatherId=' + this.data.depFatherId +
            '&depId=' + this.data.depId  + '&disId=' + this.data.disId,
        })

      } else if (type == 'ai') {
        wx.navigateTo({
          url: '../customerGoodsAi/customerGoodsAi?depId=' + this.data.depFatherId + '&disId=' + this.data.disId,
        })
      } else if (type == 'books') {
        if(this.data.disInfo.nxDistributerEntity !== null){
          wx.navigateTo({
            url: '../resGoodsLessCash/resGoodsLessCash',
          })
        }else{
          wx.navigateTo({
            url: '../resGoodsAi/resGoodsAi',
          })
        }
      } 
    }
  },



  toRecord() {
    this.hideOperation();
    wx.navigateTo({
      url: '../record/record?depFatherId=' + this.data.depFatherId +
        '&depId=' + this.data.depId + '&depName=' + this.data.depName +
        '&gbDepFatherId=-1&resFatherId=-1&depSettleType=' + this.data.depSettleType,
    })

  },


  toPasteFromGoods(e) {
    console.log("toPasteFromGoodstoPasteFromGoods")
    this.hideMaskLinshi();
    wx.navigateTo({
      url: '../paste/paste?depFatherId=' + this.data.depFatherId +
        '&depId=' + this.data.depId + '&depName=' + this.data.depName +
        '&gbDepFatherId=-1&resFatherId=-1&depSettleType=' + this.data.depSettleType + '&disId=' + this.data.disId,
    })

  },

  // /////
  chooseSezi: function (e) {
    // 用that取代this，防止不必要的情况发生
    var that = this;
    // 创建一个动画实例
    var animation = wx.createAnimation({
      // 动画持续时间
      duration: 100,
      // 定义动画效果，当前是匀速
      timingFunction: 'linear'
    })
    // 将该变量赋值给当前动画
    that.animation = animation
    // 先在y轴偏移，然后用step()完成一个动画
    animation.translateY(200).step()
    // 用setData改变当前动画
    that.setData({
      // 通过export()方法导出数据
      animationData: animation.export(),
      // 改变view里面的Wx：if
      chooseSize: true
    })
    // 设置setTimeout来改变y轴偏移量，实现有感觉的滑动
    setTimeout(function () {
      animation.translateY(0).step()
      that.setData({
        animationData: animation.export()
      })
    }, 20)
  },


  hideModal: function (e) {
    var that = this;
    var animation = wx.createAnimation({
      duration: 1000,
      timingFunction: 'linear'
    })
    that.animation = animation
    animation.translateY(200).step()
    that.setData({
      animationData: animation.export()
    })

    setTimeout(function () {
      animation.translateY(0).step()
      that.setData({
        animationData: animation.export(),
        chooseSize: false
      })
    }, 200)
  },



  delApplyPaste(e) {
    this.setData({
      applyItem: e.currentTarget.dataset.item
    })

    var that = this;

    load.showLoading("删除订单")
    deleteOrderGb(e.currentTarget.dataset.id).then(res => {
      load.hideLoading();
      if (res.result.code == 0) {

        var pasteDepList = wx.getStorageSync("pasteDepList");
        if (pasteDepList) {

          for (var i = 0; i < pasteDepList.length; i++) {
            var pDepId = pasteDepList[i].depId;
            var pDep = pasteDepList[i];

            if (pDepId == that.data.depId) {
              var orderArr = pasteDepList[i].arr;
              console.log("pasteDepList-pasteDepList", pasteDepList.length);
              console.log("depIdididiidiiid====", that.data.depId);
              var choicePrintArr = pasteDepList.filter(item => Number(item.depId) !== Number(that.data.depId));
              console.log("choicePrintArr-choicePrintArr", choicePrintArr.length);

              var choiceArr = orderArr.filter(item => item.gbDepartmentOrdersId !== this.data.applyItem.gbDepartmentOrdersId);
              console.log("choiceArr.length--0000000", choiceArr.length);
              console.log("filflflflflflfllflfl", choicePrintArr.length);
              if (choiceArr.length > 0) {
                console.log("choiceArr.length----1111", choiceArr.length);
                pDep.arr = choiceArr;
                choicePrintArr.push(pDep);
                wx.setStorageSync('pasteDepList', choicePrintArr);
              } else {
                console.log("choiceArr.length----2222222", choiceArr.length);
                if (choicePrintArr.length > 0) {
                  console.log("choicePrintArr.length----choicePrintArr000000", choicePrintArr.length);
                  wx.setStorageSync('pasteDepList', choicePrintArr);
                } else {
                  console.log("choicePrintArr.length----choicePrintArr111111", choicePrintArr.length);
                  wx.removeStorageSync('pasteDepList');
                }
              }

            }
          }

        }


        this._initData();
        this.setData({
          applyItem: "",
          showOperationLinshi: false
        })

      } else {
        wx.showToast({
          title: res.result.msg,
          icon: 'none'
        })
      }
    })

  },



  changeStandard: function (e) {
    this.setData({
      applyStandardName: e.detail.applyStandardName,
      priceLevel: e.detail.level,
    })
    var levelTwoStandard = this.data.applyItem.gbDistributerGoodsEntity.gbDgWillPriceTwoStandard;
    if (this.data.applyStandardName == levelTwoStandard) {
      this.setData({
        printStandard: levelTwoStandard
      })
    } else {
      this.setData({
        printStandard: this.data.applyItem.gbDistributerGoodsEntity.gbDgGoodsStandardname
      })
    }
    console.log("thisdaprinfir", this.data.printStandard)
  },

  hideMaskGoods() {
    this.hideModal();
    this.setData({
      showOperationGoods: false,
    })
  },

  hideChoiceMask() {
    this.setData({
      showChoice: false,
    })
  },



  /**
   * 修改配送商品申请
   */
  toEditApply(e) {
    var goodsId = e.currentTarget.dataset.id;
    var name = e.currentTarget.dataset.name;
    this.setData({
      showOperationGoods: true,
      goodsId: goodsId,
      goodsName: name,
      disGoods: e.currentTarget.dataset.goods,
      applyItem: e.currentTarget.dataset.order,
      depId: e.currentTarget.dataset.depid,
      subName: e.currentTarget.dataset.subname,
    })

    if (this.data.applyItem.gbDoBuyStatus < 3) {
      var applyItem = this.data.applyItem;
      this.setData({
        show: true
      })
     
      this.setData({
        applyStandardName: applyItem.gbDoStandard,
        printStandard: applyItem.gbDoPrintStandard,
        itemDis: this.data.applyItem.gbDistributerGoodsEntity,
        item: this.data.applyItem.gbDepartmentDisGoodsEntity,
        editApply: true,
        applyNumber: applyItem.gbDoQuantity,
        applyRemark: applyItem.gbDoRemark,
        priceLevel: applyItem.gbDoCostPriceLevel
      })
    } else {
      wx.showToast({
        title: '请供货商修改订单状态',
        icon: 'none'
      })

    }
    this.hideModal();
    this.setData({
      showOperationGoods: false
    })
  },


  
  toEditApplyDis(e) {
    console.log("contoEditApplytoEditApply")
    var applyItem = e.currentTarget.dataset.order;
    console.log("arritme", e)
    var itemStatus = applyItem.nxDoPurchaseStatus;
    applyItem.disgoods = e.currentTarget.dataset.disgoods;
    if (itemStatus > 2) {
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
        showCash: true,
        applyStandardName: applyItem.gbDoStandard,
        itemNxDis: e.currentTarget.dataset.item,
        itemDis: e.currentTarget.dataset.goods,
        editApply: true,
        applyNumber: applyItem.gbDoQuantity,
        applyRemark: applyItem.gbDoRemark,
        index: e.currentTarget.dataset.index,
        canSave: false,
        priceLevel: e.currentTarget.dataset.order.gbDoCostPriceLevel,
      })
     console.log("cansaveee", this.data.canSave)
      if (this.data.applyItem.gbDoSubtotal !== null) {
        console.log("eidididiiidid");
        this.setData({
          applySubtotal: applyItem.gbDoSubtotal + "元"
        })
      }
     
     

    }
  },



  confirmStandard(e) {
    var data = {
      gbDsDisGoodsId: this.data.itemDis.gbDistributerGoodsId,
      gbDsStandardName: e.detail.newStandardName,
    }
    disSaveStandard(data).
    then(res => {
      if (res.result.code == 0) {
        console.log(res)
        var standardArr = this.data.itemDis.gbDistributerStandardEntities;
        standardArr.push(res.result.data);
        var standards = "itemDis.gbDistributerStandardEntities"
        this.setData({
          [standards]: standardArr,
          applyStandardName: res.result.data.gbDsStandardName,
        })
      } else {
        wx.showToast({
          title: res.result.msg,
          icon: 'none'
        })
      }
    })
  },


  confirm: function (e) {
    if (this.data.editApply) {
      this._updateDisOrder(e);
    }

    this.setData({
      show: false,
      editApply: false,
      applyItem: "",
      item: "",
      applyNumber: "",
      applyStandardName: "",
      printStandard: "",
    })
  },



  /**
   * 修改配送申请
   * @param {} e 
   */
  _updateDisOrder(e) {

    var dg = {
      id: this.data.applyItem.gbDepartmentOrdersId,
      weight: e.detail.applyNumber,
      standard: e.detail.applyStandardName,
      remark: e.detail.applyRemark,
      printStandard: this.data.printStandard,
      priceLevel: this.data.priceLevel
    };
    updateOrderGbJj(dg).then(res => {
      load.showLoading("修改订单")
      if (res.result.code == 0) {
        load.hideLoading();
        this._initData();
      } else {
        load.hideLoading();
        wx.showToast({
          title: res.result.msg,
          icon: "none"
        })
      }

    })
  },



  // /////




  /**
   * 选择工作范围
   */
  selectWorkScope(e) {
    const scope = e.currentTarget.dataset.scope;
    this.setData({
      workScope: scope,
      // 如果选择负责所有部门，清空部门选择
      selDepId: scope === 'all' ? '' : this.data.selDepId,
      selDepartmentName: scope === 'all' ? '' : this.data.selDepartmentName
    }, () => {
      this.checkFormValid();
    });
  },

  onSortByChange(e) {
    console.log(e);
    const {
      type
    } = e.detail;
    this.setData({
      showType: type,
    })
    if (type === 'time') {
      // TODO: 按时间排序逻辑
      console.log('页面收到：按时间排序');
      if(this.data.isSubDep){
        this._initDataSub();
      }else{
        this._initData();
      }

      
    } else if (type === 'category') {
      // TODO: 按类别排序逻辑
      console.log('页面收到：按类别排序');
     
      if(this.data.isSubDep){
        this._initSubDepDataByFather();
      }else{
        this._initDataByFather();
      }
    }
  },


  onSearchInput(e) {
    const value = e.detail.value;
    console.log('[chefOrder] 收到输入内容:', value);
    console.log('[chefOrder] 事件详情:', e);
    
    this.setData({
      searchValue: value
    });
    
    if (!value) {
      console.log('[chefOrder] 搜索值为空，清空搜索结果');
      this.setData({
        searchArr: null  // 改为null，这样搜索蒙版会消失
      });
      return;
    }
    
    var depId = this.data.depId;
    if(this.data.depHasSubs > 0){
      depId = -1
    }
    // 实时搜索
    var data = {
      depFatherId: this.data.depFatherId,
      depId: depId,
      searchStr: value
    };
    console.log('[chefOrder] 搜索参数:', data);
    
    depSearchTodayOrders(data).then(res => {
      console.log('[chefOrder] 搜索API返回:', res);
      if (res.result.code == 0) {
        this.setData({
          searchArr: res.result.data || [],  // 确保返回空数组而不是null
        });
        console.log('[chefOrder] 搜索成功，结果数量:', res.result.data ? res.result.data.length : 0);
      } else {
        console.error('[chefOrder] 搜索失败:', res.result.msg);
        // 搜索失败时也显示空结果
        this.setData({
          searchArr: []
        });
      }
    }).catch(error => {
      console.error('[chefOrder] 搜索API异常:', error);
      // 搜索异常时也显示空结果
      this.setData({
        searchArr: []
      });
    });
  },

  
  reSearch() {
    console.log("重新搜索", this.data.searchValue)
    var depId = this.data.depId;
    if(this.data.depHasSubs > 0){
      depId = -1
    }
    // 实时搜索
    var data = {
      depFatherId: this.data.depFatherId,
      depId: depId,
      searchStr: this.data.searchValue
    };
    console.log("搜索参数:", data);
    
    // 同时执行搜索和页面数据更新
    Promise.all([
      depSearchTodayOrders(data),
      this.updatePageData()
    ]).then(([searchRes, pageRes]) => {
      console.log("搜索API返回:", searchRes);
      if (searchRes.result.code == 0) {
        this.setData({
          searchArr: searchRes.result.data || [],  // 确保返回空数组而不是null
        });
        console.log("搜索成功，结果数量:", searchRes.result.data ? searchRes.result.data.length : 0);
      } else {
        console.error("搜索失败:", searchRes.result.msg);
        // 搜索失败时也显示空结果
        this.setData({
          searchArr: []
        });
      }
    }).catch(error => {
      console.error("搜索API异常:", error);
      // 搜索异常时也显示空结果
      this.setData({
        searchArr: []
      });
    });
  },

  // 更新页面数据的方法
  updatePageData() {
    return new Promise((resolve) => {
      if (this.data.isSubDep) {
        if(this.data.showType == 'time'){
          this._initDataSub();
        }else if(this.data.showType =='category'){
          this._initSubDepDataByFather();
        }
      } else {
        if (this.data.showType === 'time') {
          this._initData();
        } else if (this.data.showType === 'category') {
          this._initDataByFather();
        }
      }
      resolve();
    });
  },

  onSearchCancel() {
    console.log('[chefOrder] 点击取消搜索');
    // 清空搜索结果，恢复原订单列表
    this.setData({
      searchArr: null,  // 改为null，这样搜索蒙版会消失
      searchValue: ''
    });
    
  },
  



  toBack(){
    wx.navigateBack({delta: 1});
  },







})