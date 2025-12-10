var load = require('../../../../lib/load.js');

let windowWidth = 0;
let itemWidth = 0;
const globalData = getApp().globalData;
var dateUtils = require('../../../../utils/dateUtil');

import {
  gbDisGetGoodsDetail,
  gbDisSaveStandard,
  gbDisUpdateStandard,
  updateGbGoods,
  updateGbGoodsPullOff,
  changeGbGoodsFresh,
  saveDisAlias,
  gbDisDeleteStandard,
  disDeleteAlias,
  updateDisAlias,
  
} from '../../../../lib/apiDistributer'

import {
  canclePostDgnGoodsGb
} from '../../../../lib/apiibook'


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

    this._getGoodsDetail();
  },

  onLoad: function (options) {
   var todayDate = dateUtils.getArriveDate(0);
    this.setData({
      disGoodsId: options.disGoodsId,
      goodsName: options.goodsName,
      todayDate: todayDate,
      updateTime: dateUtils.getDateTimeString()
    })

    var value = wx.getStorageSync('userInfo');
    if (value) {
      this.setData({
        userInfo: value,
      })
    }
    var disInfo = wx.getStorageSync('disInfo');
    if(disInfo){
      this.setData({
        disInfo: disInfo,
      })
    }
   
  },

  _getGoodsDetail() {
    load.showLoading("获取商品信息")
    gbDisGetGoodsDetail(this.data.disGoodsId).then(res => {
      load.hideLoading();
      if (res.result.code == 0) {
        console.log(res.result.data);
        this.setData({
          goods: res.result.data.goodsInfo,
          standard: res.result.data.goodsInfo.gbDgGoodsStandardname,
          depGoodArr: res.result.data.depGoodArr,
          orderArr: res.result.data.orderArr,
          purchaseArr: res.result.data.purchaseArr,
          depGoods: res.result.data.depGoods,
        })
      } else {
        wx.showToast({
          title: res.result.msg,
        })

      }
      // //创建节点选择器
      var that = this;
      var query = wx.createSelectorQuery();
      //选择id
      query.select('#mjltest0').boundingClientRect()
      query.exec(function (res) {
        that.setData({
          maskHeight: res[0].height * globalData.rpxR
        })
      })
    })
  },

  /////////
  /**
   * 显示操作面板，选择被操作商品
   * @param {}} e 
   */
  openOperationBtn(e) {
    this.setData({
      showOperationBtn: true,
      
    })
  },

  /**
   * 添加订货单位
   */
  addStandard(e) {
    this.setData({
      showAdd: true,
      goods: this.data.goods,
      depGoodsName: this.data.goods.gbDgGoodsName,
      standardName: "",
      standardScale: "-1"
    })
  },

  /**
   * 弹窗获取页面高度
   * @param {*} e 
   */
  getFocus(e) {
    var modalContentHeight = (globalData.windowHeight - e.detail.keyboardHeight) * globalData.rpxR;
    this.setData({
      modalContentHeight: modalContentHeight
    })
  },
  /**
   * 点击订货单位
   * @param {*} e 
   */
  clickItem(e) {
    console.log(e);
    this.setData({
      depGoodsName: this.data.goods.gbDgGoodsName,
    })

    if (e.currentTarget.dataset.type == "standard") {
      this.setData({
        choiceType: "standard",
        showChoice: true,
        showOperation: true,
        indexStandand: e.currentTarget.dataset.index,
        itemStandard: e.currentTarget.dataset.itemstandard,
        standardName: e.currentTarget.dataset.itemstandard.gbDsStandardName,
        standardScale: e.currentTarget.dataset.itemstandard.gbDsStandardScale
      })
    }
    if (e.currentTarget.dataset.type == "alias") {
      this.setData({
        choiceType: "alias",
        showChoice: true,
        showOperation: true,
        indexAlias: e.currentTarget.dataset.index,
        itemAlias: e.currentTarget.dataset.itemalias,
      })
    }

  },

  /**
   * 点击订货单位后，选择-“修改”
   * todo
   */
  edit() {
    if (this.data.choiceType == "standard") {
      this.setData({
        showAdd: true,
        editStandard: true,
        showChoice: false,
        showOperation: false,
      })
    }
    if (this.data.choiceType == "alias") {
      this.setData({
        editAlias: true,
        showAddAlias: true,
        showChoice: false,
        showOperation: false,
      })
    }
  },

  /**
   * 点击订货单位后，选择-“删除”
   * todo
   */
  delete() {
    if (this.data.choiceType == "standard") {
      var disStandardId = this.data.itemStandard.gbDistributerStandardId;
      gbDisDeleteStandard(disStandardId).then(res => {
        if (res.result.code == 0) {
          var standardArr = this.data.goods.gbDistributerStandardEntities;
          standardArr.splice(this.data.indexStandand, 1);
          var up = "goods.gbDistributerStandardEntities";
          this.setData({
            [up]: standardArr,
            itemStandard: "",
            showChoice: false,
            showOperation: false,

          })
        } else {
          wx.showToast({
            title: res.result.msg,
            icon: 'none'
          })
        }
      })
    }
    if (this.data.choiceType == "alias") {
      var disAliasId = this.data.itemAlias.gbDistributerAliasId;
      disDeleteAlias(disAliasId).then(res => {
        if (res.result.code == 0) {
          var aliasArr = this.data.goods.gbDistributerAliasEntities;
          aliasArr.splice(this.data.indexAlias, 1);
          var up = "goods.gbDistributerAliasEntities";
          this.setData({
            [up]: aliasArr,
            showChoice:false,
            showOperation: false,
            
          })
        } else {
          wx.showToast({
            title: res.result.msg,
            icon: 'none'
          })
        }
      })
    }

  },

  /**
   * 添加或修改订货单位
   * @param {}} e 
   */
  confirmStandard(e) {
    if (this.data.editStandard) {
      this._updateStandard(e);
    } else {
      this._saveStandard(e);
    }
    this.setData({
      standardName: "",
      depGoodsName: "",
      itemStandard: "",
      editStandard: false,
      showChoice: false,
    })
  },

  /**
   * 保存订货单位
   * @param {}} e 
   */
  _saveStandard(e) {
    var data = {
      gbDsDisGoodsId: this.data.goods.gbDistributerGoodsId,
      gbDsStandardName: e.detail.standardName,
      gbDsStandardScale: e.detail.standardScale,
    }
    load.showLoading("保存商品规格")
    gbDisSaveStandard(data).
    then(res => {
      load.hideLoading();
      if (res.result.code == 0) {
        var standardArr = this.data.goods.gbDistributerStandardEntities;
        standardArr.push(res.result.data);
        var standards = "goods.gbDistributerStandardEntities"
        this.setData({
          [standards]: standardArr,
          itemstandard: "",
        })
      }
    })
  },

  /**
   * 更新订货单位
   * @param {}} e 
   */
  _updateStandard(e) {
    var data = {
      gbDistributerStandardId: this.data.itemStandard.gbDistributerStandardId,
      gbDsStandardName: e.detail.standardName,
      gbDsStandardScale: e.detail.standardScale,
    }
    load.showLoading("修改商品规格")
    gbDisUpdateStandard(data).
    then(res => {
      load.hideLoading();
      if (res.result.code == 0) {
        var standard = "goods.gbDistributerStandardEntities[" + this.data.indexStandand + "]";
        this.setData({
          [standard]: data,
          itemstandard: "",
        })
      }
    })
  },

  /**
   * 添加Alias
   * @param {} e 
   */
  addAlias: function (e) {
    this.setData({
      editAlias: false,
      aliasName: "",
      showAddAlias: true,
      depGoodsName: this.data.goods.gbDgGoodsName,
    })
  },

  /**
   * 规格弹窗点击确认
   * @param {*} e 
   */
  confirmAlias: function (e) {
    if (this.data.editAlias) {
      this._updateAlias(e);
    } else {
      this._saveAlias(e);
    }
    this.setData({
      aliasName: "",
      depGoodsName: "",
      itemAlias: "",
      editAlias: false,
      showAlias: false,
    })
  },

  /**
   * 修改别名
   * @param {*} e 
   */
  _updateAlias(e) {
    var data = {
      gbDistributerAliasId: this.data.itemAlias.gbDistributerAliasId,
      gbDaAliasName: e.detail.aliasName,
    }
    load.showLoading("更新别名")
    updateDisAlias(data).then(res => {
      if (res.result.code == 0) {
        console.log(res)
        load.hideLoading();
        var alias = "goods.gbDistributerAliasEntities[" + this.data.indexAlias + "]";
        this.setData({
          [alias]: data,
          itemAlias: "",
        })

      } else {
        load.hideLoading();
        wx.showToast({
          title: '更新规格失败',
          icon: 'none'
        })
      }
    })
  },

  /**
   * 保存别名
   * @param {*} e 
   */
  _saveAlias(e) {
    var data = {
      gbDaDisGoodsId: this.data.goods.gbDistributerGoodsId,
      gbDaAliasName: e.detail.aliasName,
    }
    load.showLoading("保存别名")
    saveDisAlias(data).
    then(res => {
      load.hideLoading();
      if (res.result.code == 0) {
        var aliaslist = this.data.goods.gbDistributerAliasEntities;
        aliaslist.push(res.result.data);
        var up = "goods.gbDistributerAliasEntities"
        this.setData({
          [up]: aliaslist,
          itemAlias: "",
        })
      } else {
        load.hideLoading();
        wx.showToast({
          title: '获取商品失败',
          icon: 'none'
        })
      }
    })
  },

  /**
   * 关闭操作面板
   */
  hideMask() {
    this.setData({
      showOperation: false,
      showChoice: false,
      showFresh: false,
      showPrice: false,
      
    })
  },

  hideMaskBtn() {
    this.setData({
      showOperationBtn: false,
      showChoice: false,
      showFresh: false,
      showPrice: false,
    })
  },
  //删除商品
  deleteDisGoods(e) {
    var data = {
      disId: this.data.goods.gbDgDistributerId,
      disGoodsId: this.data.goods.gbDistributerGoodsId,
      disGoodsFatherId: this.data.goods.gbDgDfgGoodsFatherId,
    }
    load.showLoading("删除商品")
    canclePostDgnGoodsGb(data).then(res => {
      load.hideLoading();
      if (res.result.code == 0) {
        console.log(res);
        wx.navigateBack({
          delta: 1
        })
      } else {
        wx.showToast({
          title: res.result.msg,
          icon: "none"
        })
      }
    })

  },

  switchChangeAuto(e) {
    console.log(e)
    var pullOff = "goods.gbDgGoodsIsWeight"
    if (e.detail.value) {
      this.setData({
        [pullOff]: 1
      })
    } else {
      this.setData({
        [pullOff]: 0
      })
    }
    this._updateGoods();

  },



  

  //暂停订货
  switchChange(e) {
    var pullOff = "goods.gbDgPullOff"
    if (e.detail.value) {
      this.setData({
        [pullOff]: "1"
      })
    } else {
      this.setData({
        [pullOff]: "0"
      })
    }

    this._updateGoodsPullOff();
  },


  _updateGoodsPullOff(){

    updateGbGoodsPullOff(this.data.goods).then(res =>{
      if(res.result.code == 0){
        this.setData({
          goods: res.result.data
        })
      }else{
        var data = "goods.gbDgPullOff";
        this.setData({
          [data]: 0,
        })
        wx.showToast({
          title: res.result.msg,
          icon: 'none'
        })
      }
    })

  },

  
  toOpenDetail(e) {
    wx.setStorageSync('disGoods', this.data.goods)
    this.setData({
      showOperationBtn: false
    })
    wx.navigateTo({
      url: '../disGoodsDetail/disGoodsDetail?id='+ this.data.goods.gbDistributerGoodsId,
    })
  },

  

  editDisGoodsPrice() {
     if(this.data.goods.gbDgControlPrice == 1){
      this.setData({
        showPrice: true,
        showOperation: true,
        showOperationBtn: false,
      })
      this.hi
     }else{
       wx.showToast({
         title: '请先在参数设置',
         icon: 'none'
       })
       this.setData({
        itemIndex:0,
        showOperation: false,
      })
     }
  },

  // /??????
  editDisGoodsFresh() {
    if(this.data.goods.gbDgControlFresh == 1){
      this.setData({
        showFresh: true,
        showOperation: true,
        showOperationBtn: false,

      })
     }else{
       wx.showToast({
         title: '请先在参数设置',
         icon: 'none'
       })
       this.setData({
         itemIndex:0,
        showOperationBtn: false,
      })
     }
  },


  switchIsSelfControl(e) {
    if(this.data.disInfo.gbDistributerBusinessType == 21){
      wx.showToast({
        title: '不能修改',
        icon: 'none'
      })
      this.setData({
        ["goods.gbDgIsSelfControl"]: 1
      })

      return;
    }else{
      var controlData = "goods.gbDgIsSelfControl"

    if(e.detail.value == 1){
      this.setData({
        showOperation: true,
        showPrice: false,
        showFresh: false,
        showFranchisePrice: false,
        showIsSelfControl: true,
      })
    }else{
      
      var goodsData = "goods.gbDgSelfPrice";
      this.setData({
        [controlData]: 0,
        [goodsData]: null,
      
      })
    this._updateGoods();
    }
    }
  },


  switchIsFranchisePrice(e) {
    console.log(e)
    var pullOff = "goods.gbDgIsFranchisePrice"

    if(e.detail.value == 1){
      this.setData({
        showOperation: true,
        showPrice: false,
        showFresh: false,
        showIsSelfControl: false,
        showFranchisePrice: true,
      })
    }else{
      var goodsData = "goods.gbDgFranchisePriceOne";
      var warnHour = "goods.gbDgFranchisePriceTwo";
      var wasteHour = "goods.gbDgFranchisePriceThree";
      this.setData({
        [pullOff]: 0,
        [goodsData]: null,
        [warnHour]: null,
        [wasteHour]: null,
      })
    this._updateGoods();
    }

  },


  //设置商品废弃时间
  switchControlFresh(e) {
    if (e.detail.value == 1) {
      this.setData({
        showOperation: true,
        showPrice: false,
        showIsSelfControl:false,
        showFresh: true,
        showFranchisePrice: false,
      })
    } else {
      var goodsData = "goods.gbDgControlFresh";
      var warnHour = "goods.gbDgFreshWarnHour";
      var wasteHour = "goods.gbDgFreshWasteHour";
      this.setData({
        [goodsData]: 0,
        [warnHour]: "",
        [wasteHour]: ""
      })
      this._updateGoods();
    }

  },


  cancleFresh(e) {
    if (this.data.goods.gbDgControlFresh == 0) {
      var goodsData = "goods.gbDgControlFresh";
      this.setData({
        [goodsData]: 0,
      })
    }
    this.hideMask();
  },
  
  cancleContrl(e){
    console.log("cancleContrl")
    if (this.data.goods.gbDgIsSelfControl == 0) {
      var goodsData = "goods.gbDgIsSelfControl";
      this.setData({
        [goodsData]: 0,
      })
    }
    this.hideMask();
  },
  _updateGoodsFresh(e) {
    var warnHour = this.data.goods.gbDgFreshWasteHour;
    var wasteHour = this.data.goods.gbDgFreshWasteHour;
    var goodsData = "goods.gbDgControlFresh";    
    if (warnHour !== null && wasteHour !== null && warnHour.length > 0 && wasteHour.length > 0) {
      this.setData({
        [goodsData]: 1
      })
      this._updateGoodsFreshData();

    } else {
      wx.showToast({
        title: '时间输入不正确',
        icon: 'none'
      })
    }
  },
  
  _updateGoodsFreshData(){
    load.showLoading("修改商品")
    var goods = this.data.goods;
    // goods.gbDgFreshWarnHour = 1;
    changeGbGoodsFresh(goods)
      .then(res => {
        load.hideLoading();
        if (res.result.code == 0) {
          wx.showToast({
            title: '修改成功',
          })
          this.setData({
            showChoice: false,
            showFresh: false,
            showPrice: false,
            showFranchisePrice: false,
            showOperation: false,
            showIsSelfControl: false,
            goods: res.result.data
          })
          this._getGoodsDetail();
          }else{
            wx.showToast({
              title: res.result.msg,
              icon: 'none'
            })
          }
      })

  },

  // 设置采购价格
  switchControlPrice(e) {
    if (e.detail.value == 1) {
      this.setData({
        showOperation: true,
        showPrice: true,
        showFresh: false,
        showFranchisePrice: false,
      })
    } else {
      var goodsData = "goods.gbDgControlPrice";
      this.setData({
        [goodsData]: 0,
        
      })
      this._updateGoods();
    }
  },


  canclePrice(e) {
    if (this.data.goods.gbDgControlPrice == 0) {
      var goodsData = "goods.gbDgControlPrice";
      this.setData({
        [goodsData]: 0,
      })
    }
    this.hideMask();
  },

 

  getPrice(e) {
    console.log(e);
    var priceData = "goods." + e.currentTarget.dataset.type;
    if (e.detail.value.length > 0) {
      this.setData({
        [priceData]: e.detail.value
      })
    }else{
      this.setData({
        [priceData]: ""
      })
    }
  },

  editDisGoodsSelfPrice(){
    console.log("editselfproi")
    this.setData({
      showOperation: true,
      showOperationBtn: false,
        showIsSelfControl: true,
    })
    
  },

  getIsFranchisePrice(e){
    console.log(e);
    var priceData = "goods." + e.currentTarget.dataset.type;
    var priceTimeData = "goods." + e.currentTarget.dataset.typetime;
    if (e.detail.value.length > 0) {
      this.setData({
        [priceData]: e.detail.value,
        [priceTimeData]: this.data.updateTime
      })
    }else{
      this.setData({
        [priceData]: ""
      })
    }
  },
  
  getSelfPrice(e){
    console.log(e);
    var priceData = "goods.gbDgSelfPrice" ;
    if (e.detail.value.length > 0) {
      this.setData({
        [priceData]: e.detail.value,
      })
    }else{
      this.setData({
        [priceData]: ""
      })
    }
  },

  // 输入框帮助提示
  showFreshInputHint() {
    wx.showModal({
      title: '💡 输入说明',
      content: '请输入商品保鲜时间的小时数\n\n• 仅支持整数（如：24）\n• 不支持小数（如：24.5）\n• 建议范围：1-168小时\n• 单位：小时',
      showCancel: false,
      confirmText: '知道了',
      confirmColor: '#1989fa'
    });
  },

  getFresh(e) {
    console.log('保鲜时间输入事件:', e);
    
    var inputValue = e.detail.value;
    var freshData = "goods." + e.currentTarget.dataset.type;
    
    // 输入验证和格式化
    if (inputValue.length === 0) {
      // 空值处理
      this.setData({
        [freshData]: ""
      });
      return;
    }
    
    // 只允许输入数字
    var numericValue = inputValue.replace(/[^0-9]/g, '');
    
    // 如果输入了非数字字符，显示提示
    if (numericValue !== inputValue) {
      wx.showModal({
        title: '⚠️ 输入格式错误',
        content: '保鲜时间只能输入数字（小时）\n\n请输入有效的小时数，例如：24',
        showCancel: false,
        confirmText: '重新输入',
        confirmColor: '#ff4444'
      });
      // 使用清理后的数字值
      inputValue = numericValue;
    }
    
    // 检查是否输入了小数
    if (inputValue.indexOf('.') !== -1) {
      wx.showModal({
        title: '⚠️ 不支持小数',
        content: '保鲜时间请设置为整数小时\n\n例如：输入 24 而不是 24.5',
        showCancel: false,
        confirmText: '重新输入',
        confirmColor: '#ff4444'
      });
      // 移除小数点及之后的内容
      inputValue = inputValue.substring(0, inputValue.indexOf('.'));
    }
    
    // 设置合理的上限（比如999小时）
    var maxHours = 999;
    var numValue = parseInt(inputValue);
    if (numValue > maxHours) {
      wx.showModal({
        title: '⚠️ 输入超出范围',
        content: `保鲜时间不能超过${maxHours}小时\n\n请输入合理的数值，建议范围：1-168小时（1-7天）`,
        showCancel: false,
        confirmText: '重新输入',
        confirmColor: '#ff4444'
      });
      inputValue = maxHours.toString();
    }
    
    // 更新数据
    this.setData({
      [freshData]: inputValue
    });
    
    // 输入成功提示
    if (inputValue.length > 0 && numValue > 0) {
      var timeText = '';
      if (numValue < 24) {
        timeText = `${numValue}小时`;
      } else if (numValue < 168) {
        var days = Math.floor(numValue / 24);
        var hours = numValue % 24;
        timeText = days > 0 ? `${days}天${hours > 0 ? hours + '小时' : ''}` : `${numValue}小时`;
      } else {
        timeText = `${numValue}小时`;
      }
      
      // 只在输入有效值且不是通过错误处理自动修正的情况下显示成功提示
      if (inputValue === e.detail.value) {
        wx.showToast({
          title: `已设置：${timeText}`,
          icon: 'success',
          duration: 1500
        });
      }
    }
    
    console.log('保鲜时间已更新为:', inputValue, '小时');
  },

  _updateGoodsControlPrice(e) {
    var lowestPrice = this.data.goods.gbDgGoodsLowestPrice;
    var highestrPice = this.data.goods.gbDgGoodsHighestPrice;

    if (lowestPrice !== null && highestrPice !== null && lowestPrice.length > 0 && highestrPice.length > 0 ) {
        var goodsData = "goods.gbDgControlPrice";
        this.setData({
          [goodsData]: 1
        })
      this._updateGoods();
    } else {
      wx.showToast({
        title: '价格输入不正确',
        icon: 'none'
      })
    }
  },

  _updateGoodsPrice(e) {
    var price = this.data.goods.gbDgSelfPrice;

    if (price !== null  && price.length > 0) {
       var goodsData = "goods.gbDgIsSelfControl";
       this.setData({
         [goodsData]: 1
       }) 
      this._updateGoods();
    } else {
      wx.showToast({
        title: 'chengben价格输入不正确',
        icon: 'none'
      })
    }
  },

  _updateGoodsIsFranchisePrice(e) {
    var price = this.data.goods.gbDgFranchisePriceOne;
    var lowestPrice = this.data.goods.gbDgFranchisePriceTwo;
    var highestrPice = this.data.goods.gbDgFranchisePriceThree;

    if (price !== null && lowestPrice !== null && highestrPice !== null &&
      price.length > 0 && lowestPrice.length > 0 && highestrPice.length > 0 ) {
       var goodsData = "goods.gbDgIsFranchisePrice";
       this.setData({
         [goodsData]: 1
       }) 
      this._updateGoods();
    } else {
      wx.showToast({
        title: '加盟价格输入不正确',
        icon: 'none'
      })
    }
  },


  _updateGoods(e) {
    load.showLoading("修改商品")
    var goods = this.data.goods;
    updateGbGoods(goods)
      .then(res => {
        load.hideLoading();
        if (res.result.code == 0) {
          wx.showToast({
            title: '修改成功',
          })
          this.setData({
            showChoice: false,
            showFresh: false,
            showPrice: false,
            showFranchisePrice: false,
            showOperation: false,
            showOperationBtn: false,
            showIsSelfControl: false,
            goods: res.result.data
          })
          this._getGoodsDetail();
          }else{
            wx.showToast({
              title: res.result.msg,
              icon: 'none'
            })
          }
      })
  },

  
  toLine(e){
    wx.setStorageSync('disGoods', this.data.goods)
    wx.navigateTo({
      url: '../line/line?disGoodsId=' + this.data.goods.gbDistributerGoodsId
        + '&goodsName=' + this.data.goods.gbDgGoodsName + '&type=' + e.currentTarget.dataset.type + '&standard=' + this.data.goods.gbDgGoodsStandardname,
    })
  },


  // toMendianEveryDay(e){
  //   wx.navigateTo({
  //     url: '../../mendian/everyDay/everyDay?id=' +  + e.currentTarget.dataset.id + '&goodsName=' + this.data.goods.gbDgGoodsName + '&standard=' + this.data.goods.gbDgGoodsStandardname  + '&depName=' + e.currentTarget.dataset.name,
  //   })
  // },


  toOut(){
    wx.setStorageSync('disGoods', this.data.goods);
    var showType = this.data.tab1Index;
    wx.navigateTo({
      url: '../shelfGoodsBusiness/shelfGoodsBusiness?disGoodsId=' + this.data.goods.gbDistributerGoodsId + '&name=' + this.data.goods.gbDgGoodsName +'&type=' + showType,
    })
  },


  
  toDepartments(){
    if(this.data.disInfo.gbDistributerBusinessType  == 21 || this.data.disInfo.gbDistributerBusinessType  == 22){
      wx.navigateTo({
        url: '../../goods/selDepartment/selDepartment?disGoodsId=' + this.data.disGoodsId ,
      })
    }else{
      wx.navigateTo({
        url: '../../goods/addDepGoods/addDepGoods?disGoodsId=' + this.data.disGoodsId,
      })
    }  

  },



  toLiziMarket(e) {
    this.setData({
      showOperationBtn: false,
    })
    wx.navigateTo({
      url: '../../yishang/map/map?nxGoodsId=' + this.data.goods.gbDgNxGoodsId + '&nxGoodsName=' +  this.data.goods.gbDgGoodsName,
    })
  },

  

  toBack() {
    wx.navigateBack({
      delta: 1,
    })
  },

  
  onUnload(){
    wx.removeStorageSync('disGoods');
  }




})