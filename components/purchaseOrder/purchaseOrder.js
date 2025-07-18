Component({
  /**
   * 组件的属性列表
   */
  properties: {
    //是否显示modal
    show: {
      type: Boolean,
      value: true
    },
    item: {
      type: Object,
      value: ""
    },
    maskHeight: {
      type: Number,
      value: ""
    },
    windowHeight: {
      type: Number,
      value: ""
    },
    windowWidth: {
      type: Number,
      value: ""
    },
    scaleInput: {
      type: Boolean,
      value: "false"
    },




  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {


    changePrice(e){
      var type = e.currentTarget.dataset.type;
      var itemData = "item.nxDpgBuyPrice";
      var price = this.data.item.nxDpgBuyPrice;
      var newPrice = "";
      if(type == 'add'){
        newPrice = (Number(price) + Number(0.1)).toFixed(1);
      }
      if(type == 'reduce'){
         newPrice = (Number(price) - Number(0.1)).toFixed(1);
      }
      this.setData({
        [itemData]: newPrice,
      })
      this._upeateDisGoodsPrice(newPrice);

      this._countOrderCostPrice();
      this._fillOrderCostPrice()

    },



    getPurchasePrice: function (e) {
     
      var numberStr = e.detail.value;
      var itemData = "item.nxDpgBuyPrice";

      //输入非空 
      if (e.detail.value.length > 0) {
        //0
        
        this.setData({
          [itemData]: numberStr,
        })
        this._upeateDisGoodsPrice(numberStr);


        //1. 小数点
        var y = String(numberStr).indexOf("."); //获取小数点的位置
        if (y !== -1) {
          var count = String(numberStr).length - y; //获取小数点后的个数
        }
        if (count > 2) {
          wx.showToast({
            title: '小数点只能保留一位',
          })
        
          this.setData({
            [itemData]: numberStr.substring(0, numberStr.length - 1),
          })
          this._upeateDisGoodsPrice(numberStr.substring(0, numberStr.length - 1));

        }
        // 2. 值大小判断
        if (numberStr > 99999) {
          wx.showToast({
            title: '最大不能超过九万九千九百九十九',
            icon: "none"
          })
         
          this.setData({
            [itemData]: numberStr.substring(0, numberStr.length - 1),
          })
          this._upeateDisGoodsPrice(numberStr.substring(0, numberStr.length - 1));
        }
      }

        this._fillOrderCostPrice()
    
    },
 

    _fillOrderCostPrice() {
      var arr = this.data.item.nxDepartmentOrdersEntities;
      if (arr.length > 0) {
        for (var i = 0; i < arr.length; i++) {
          var orderCostPriceData = "item.nxDepartmentOrdersEntities[" + i + "].nxDoCostPrice";
          var updateTime = "item.nxDepartmentOrdersEntities[" + i + "].nxDoCostPriceUpdate";
          this.setData({
            [orderCostPriceData]: this.data.item.nxDpgBuyPrice,
            [updateTime]: this.getDateTimeString()
          })
        }
      }
    },


    // /////////////////////////////////
    clickMask() {
      this.setData({
        show: false,
      })
    },

    cancle() {
      this.setData({
        show: false,
        editApply: false,
        item: "",
      })
      this.triggerEvent('cancle')
    },

    
    confirm(e) {
        
      var orderArr = this.data.item.nxDepartmentOrdersEntities;
      for (var j = 0; j < orderArr.length; j++) {
        var orderWeight = orderArr[j].nxDoWeight;
        if (orderWeight == null || orderWeight.length == 0) {
          wx.showToast({
            title: '有未完成的订单',
            icon: 'none'
          })
          return;
        }
      }
     
      this.triggerEvent('confirmorder', {
        item: this.data.item,
      })
      this.setData({
        show: false,

      })

    },



    getOrderWeight(e) {
      var index = e.currentTarget.dataset.index;
      var doWeightData = "item.nxDepartmentOrdersEntities[" + index + "].nxDoWeight";
      var costSubtotalData = "item.nxDepartmentOrdersEntities[" + index + "].nxDoCostSubtotal";
      var orderWeighValue = e.detail.value;
      var costPrice = this.data.item.nxDepartmentOrdersEntities[index].nxDoCostPrice;
      var costSubtotal = (Number(costPrice) * Number(orderWeighValue)).toFixed(1);

      //输入非空 
      if (orderWeighValue.length > 0) {
        this.setData({
          [doWeightData]: orderWeighValue,
          [costSubtotalData]: costSubtotal
        })
        var doPrice = this.data.item.nxDepartmentOrdersEntities[index].nxDoPrice;
        if (doPrice !== null) {
          var orderSubtotalData = "item.nxDepartmentOrdersEntities[" + index + "].nxDoSubtotal";
          var doSubtotal = (Number(doPrice) * Number(orderWeighValue)).toFixed(1);
          var profitSubtotal = (Number(doSubtotal) - Number(costSubtotal)).toFixed(1);
          var profitScale = (Number(profitSubtotal) / Number(doSubtotal) * 100).toFixed(2);
          var profitSubData = "item.nxDepartmentOrdersEntities[" + index + "].nxDoProfitSubtotal";
          var profitScaleData = "item.nxDepartmentOrdersEntities[" + index + "].nxDoProfitScale";
          var statusData = "item.nxDepartmentOrdersEntities[" + index + "].nxDoStatus";
          this.setData({
            [orderSubtotalData]: doSubtotal,
            [profitSubData]: profitSubtotal,
            [profitScaleData]: profitScale,
            [statusData]: 2
          })
        }


        //1. 小数点
        var y = String(orderWeighValue).indexOf("."); //获取小数点的位置
        console.log(y);
        if (y !== -1) {
          var count = String(orderWeighValue).length - y; //获取小数点后的个数
        }
        if (count > 2) {
          wx.showToast({
            title: '小数点只能保留一位',
          })

          var newWeight = Number(orderWeighValue.substring(0, orderWeighValue.length - 1));
          var costSubtotal = (Number(costPrice) * newWeight).toFixed(1);
          this.setData({
            [doWeightData]: newWeight,
            [costSubtotalData]: costSubtotal
          })
          if (doPrice !== null) {
            var orderSubtotalData = "item.nxDepartmentOrdersEntities[" + index + "].nxDoSubtotal";
            var doSubtotal = (Number(doPrice) * Number(newWeight)).toFixed(1);
            var profitSubtotal = (Number(doSubtotal) - Number(costSubtotal)).toFixed(1);
            var profitScale = (Number(profitSubtotal) / Number(doSubtotal) * 100).toFixed(2);
            var profitSubData = "item.nxDepartmentOrdersEntities[" + index + "].nxDoProfitSubtotal";
            var profitScaleData = "item.nxDepartmentOrdersEntities[" + index + "].nxDoProfitScale";
            var statusData = "item.nxDepartmentOrdersEntities[" + index + "].nxDoStatus";

            this.setData({
              [orderSubtotalData]: doSubtotal,
              [profitSubData]: profitSubtotal,
              [profitScaleData]: profitScale,
              [statusData]: 2

            })
          }
        }
        //2. 值大小判断
        if (e.detail.value > 99999) {
          wx.showToast({
            title: '最大不能超过九万九千九百九十九',
            icon: "none"
          })
          var newWeight = Number(orderWeighValue.substring(0, orderWeighValue.length - 1));
          var costSubtotal = (Number(price) * newWeight).toFixed(1);
          this.setData({
            [orderWeightData]: newWeight,
            [costSubtotalData]: costSubtotal
          })
          if (doPrice !== null) {
            var orderSubtotalData = "item.nxDepartmentOrdersEntities[" + index + "].nxDoSubtotal";
            var doSubtotal = (Number(doPrice) * Number(newWeight)).toFixed(1);
            var profitSubtotal = (Number(doSubtotal) - Number(costSubtotal)).toFixed(1);
            var profitScale = (Number(profitSubtotal) / Number(doSubtotal) * 100).toFixed(2);
            var profitSubData = "item.nxDepartmentOrdersEntities[" + index + "].nxDoProfitSubtotal";
            var profitScaleData = "item.nxDepartmentOrdersEntities[" + index + "].nxDoProfitScale";
            var statusData = "item.nxDepartmentOrdersEntities[" + index + "].nxDoStatus";
            this.setData({
              [orderSubtotalData]: doSubtotal,
              [profitSubData]: profitSubtotal,
              [profitScaleData]: profitScale,
              [statusData]: 2
            })
          }
        }

      } else {
        this.setData({
          [doWeightData]: "",
          [costSubtotalData]: "",
          [orderSubtotalData]: "",
          [profitSubData]: "",
          [profitScaleData]: ""

        })
      }
      this._getBuySubtotal();
    },

    _emptyInputPrice() {
      var arr = this.data.item.nxDepartmentOrdersEntities;
      for (var i = 0; i < arr.length; i++) {
        var orderPriceData = "item.nxDepartmentOrdersEntities[" + i + "].nxDoCostPrice";
        var subData = "item.nxDepartmentOrdersEntities[" + i + "].nxDoCostSubtotal";
        this.setData({
          [orderPriceData]: "",
          [subData]: ""
        })
      }
      var subData = "item.nxDpgBuySubtotal";
      var priceData = "item.nxDpgBuyPrice";
      this.setData({
        [subData]: "",
        [priceData]: "",
      })
    },


    _countOrderCostPrice() {
      var buyPrice = Number(this.data.item.nxDpgBuyPrice);
      var arr = this.data.item.nxDepartmentOrdersEntities;
      for (var i = 0; i < arr.length; i++) {
        var costPriceData = "item.nxDepartmentOrdersEntities[" + i + "].nxDoCostPrice";
        this.setData({
          [costPriceData]: buyPrice,
        })
        var doWeight = this.data.item.nxDepartmentOrdersEntities[i].nxDoWeight;
        if (doWeight !== null && doWeight > 0) {
          var costSubtotalData = "item.nxDepartmentOrdersEntities[" + i + "].nxDoCostSubtotal";
          var costSubtotal = (Number(buyPrice) * Number(doWeight)).toFixed(1);
          this.setData({
            [costSubtotalData]: costSubtotal,
          })
        }
      }
      this._getBuySubtotal();
    },

    _getBuySubtotal(e) {
      var arr = this.data.item.nxDepartmentOrdersEntities;
      var purGoodsBuyQuantity = "";
      var buyPrice = this.data.item.nxDpgBuyPrice;

      for (var i = 0; i < arr.length; i++) {
        var doWeight = arr[i].nxDoWeight;
        purGoodsBuyQuantity = (Number(purGoodsBuyQuantity) + Number(doWeight)).toFixed(1);
      }
      var purGoodsBuySubtotal = (Number(purGoodsBuyQuantity) * Number(buyPrice)).toFixed(1);
      var purGoodsBuySubtotalData = "item.nxDpgBuySubtotal";
      var purGoodsBuyQuantityData = "item.nxDpgBuyQuantity";
      this.setData({
        [purGoodsBuySubtotalData]: purGoodsBuySubtotal,
        [purGoodsBuyQuantityData]: purGoodsBuyQuantity,
      })
    },


    _countOrderSubtotal() {
      var doPrice = this.data.item.nxDpgBuyPrice;
      var arr = this.data.item.nxDepartmentOrdersEntities;
      for (var i = 0; i < arr.length; i++) {
        var priceData = "item.nxDepartmentOrdersEntities[" + i + "].nxDoCostPrice";
        this.setData({
          [priceData]: doPrice,
        })
      }
    },


    _upeateDisGoodsPrice(data){
      console.log(data);
      console.log("_upeateDisGoodsPrice_upeateDisGoodsPrice")
      var itemData = "";
      var itemTimeData = "";
      if (this.data.item.nxDpgCostLevel == 0) {
        itemData = "item.gbDistributerGoodsEntity.nxDgBuyingPrice";
        itemTimeData = "item.gbDistributerGoodsEntity.nxDgBuyingPriceUpdate";
      }
      if (this.data.item.nxDpgCostLevel == 1) {
        itemData = "item.gbDistributerGoodsEntity.nxDgBuyingPriceOne";
        itemTimeData = "item.gbDistributerGoodsEntity.nxDgBuyingPriceOneUpdate";
      }
      if (this.data.item.nxDpgCostLevel == 2) {
        itemData = "item.gbDistributerGoodsEntity.nxDgBuyingPriceTwo";
        itemTimeData = "item.gbDistributerGoodsEntity.nxDgBuyingPriceTwoUpdate";
      }
      if (this.data.item.nxDpgCostLevel == 3) {
        itemData = "item.gbDistributerGoodsEntity.nxDgBuyingPriceThree";
        itemTimeData = "item.gbDistributerGoodsEntity.nxDgBuyingPriceThreeUpdate";
      }
      this.setData({
        [itemData]:data,
        [itemTimeData]: this.getDateTimeString()
      })
    },



    getDateTimeString() {
      var dateOnly = new Date();
      dateOnly.setTime(dateOnly.getTime());
      var date = dateOnly.getDate();
      var month = dateOnly.getMonth() + 1;
      var s3 = month + "月" + date + "日" 
      return s3;
    },








  },




})