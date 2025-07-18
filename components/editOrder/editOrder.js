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
      value: ""
    },
    showReason: {
      type: Boolean,
      value: ""
    }
    

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

    clickMask() {
      this.setData({
        show: false,
        showReason: false
      })
    },

    cancle() {
      this.setData({
        show: false,
        editApply: false,
        item: "",
        showReason: false
      })
      this.triggerEvent('cancle')
    },

    confirm(e) {
    
        if (this.data.item.nxDpgBuyPrice == null || !this.data.item.nxDpgBuyPrice > 0) {
          //pandan1
          var price = this.data.item.nxDpgBuyPrice;
          if (price.length == 0) {
            wx.showToast({
              title: '单价不能为空',
              icon: 'none'
            })
            return;
          }
        }
  
        //pandauan2
        var orderArr = this.data.item.nxDepartmentOrdersEntities;
        for (var j = 0; j < orderArr.length; j++) {
          var status = orderArr[j].nxDoStatus;
          if (status < 4) {
            var orderWeight = orderArr[j].nxDoWeight;
            if (orderWeight == null || orderWeight.length == 0) {
              wx.showToast({
                title: '订单重量不能为空',
                icon: 'none'
              })
              return;
            }
          }
        }
        this.triggerEvent('confirm', {
          item: this.data.item
        })
        this.setData({
          show: false,
          // showReason: false
        })
      
    },

    getPurchasePrice: function (e) {
      var itemData = "item.nxDpgBuyPrice";
      var numberStr = e.detail.value;
      //输入非空 
      if (e.detail.value.length > 0) {
        //0
        this.setData({
          [itemData]: numberStr,
        })

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
        }
        //2. 值大小判断
        if (numberStr > 99999) {
          wx.showToast({
            title: '最大不能超过九万九千九百九十九',
            icon: "none"
          })
          this.setData({
            [itemData]: numberStr.substring(0, numberStr.length - 1),
          })
        }
        this._countOrderData();

      } else {
        this._emptyInputPrice();
      }
    },

    getOrderWeight(e) {
      var index = e.currentTarget.dataset.index;
      var price = Number(this.data.item.nxDpgBuyPrice);
      var orderWeightData = "item.nxDepartmentOrdersEntities[" + index + "].nxDoWeight";
      var orderPriceData = "item.nxDepartmentOrdersEntities[" + index + "].nxDoCostPrice";
      var subData = "item.nxDepartmentOrdersEntities[" + index + "].nxDoCostSubtotal";
      var orderWeighValue = e.detail.value;
      //输入非空 
      if (orderWeighValue.length > 0) {
        //0
        var sub = (Number(price) * Number(orderWeighValue)).toFixed(1);
        this.setData({
          [orderWeightData]: orderWeighValue,
          [orderPriceData]: price,
          [subData]: sub
        })

        //1. 小数点
        var y = String(orderWeighValue).indexOf("."); //获取小数点的位置
        console.log(y);
        console.log("yisahgnshi yyy")
        if (y !== -1) {
          var count = String(orderWeighValue).length - y; //获取小数点后的个数
        }
        if (count > 2) {
          wx.showToast({
            title: '小数点只能保留一位',
          })
          console.log(orderWeighValue)
          console.log(count);
          var newWeight = Number(orderWeighValue.substring(0, orderWeighValue.length  - 1));
          var sub = (Number(price) * newWeight).toFixed(1);
          this.setData({
            [orderWeightData]: newWeight,
            [orderPriceData]: price,
            [subData]: sub
          })
        }
        //2. 值大小判断
        if (e.detail.value > 99999) {
          wx.showToast({
            title: '最大不能超过九万九千九百九十九',
            icon: "none"
          })
          var newWeight = Number(orderWeighValue.substring(0, orderWeighValue.length - 1));
          var sub = (Number(price) * newWeight).toFixed(1);
          this.setData({
            [orderWeightData]: newWeight,
            [orderPriceData]: price,
            [subData]: sub
          })
        }
      } else {
        this.setData({
          [orderWeightData]: "",
          [subData]: ""
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
      var weightData = "item.nxDpgBuyQuantity";
      var priceData = "item.nxDpgBuyPrice";
      this.setData({
        [subData]: "",
        [weightData]: "",
        [priceData]: "",
      })
    },

    _countOrderData() {
      var price = Number(this.data.item.nxDpgBuyPrice);
      var arr = this.data.item.nxDepartmentOrdersEntities;
      for (var i = 0; i < arr.length; i++) {
        var weight = arr[i].nxDoWeight;
        var orderPriceData = "item.nxDepartmentOrdersEntities[" + i + "].nxDoCostPrice";
        var subData = "item.nxDepartmentOrdersEntities[" + i + "].nxDoCostSubtotal";
        var sub = (Number(price) * weight).toFixed(1);
        this.setData({
          [orderPriceData]: price,
          [subData]: sub
        })
      }
      this._getBuySubtotal();

    },

    // _checkPrice(){
    //   if( this.data.item.nxDpgBuyPrice > 0){
    //     if(Number(this.data.item.nxDpgBuyPrice)  < Number(this.data.item.gbDistributerGoodsEntity.gbDgGoodsLowestPrice) || Number(this.data.item.nxDpgBuyPrice)  > Number(this.data.item.gbDistributerGoodsEntity.gbDgGoodsHighestPrice)){
    //       this.setData({
    //         showReason : true,
    //       })
    //     }else{
    //       this.setData({
    //         showReason : false,
    //       })
    //     }
    //   }
    // },

    // _checkPriceAndReason(e){
    //   if(this.data.item.gbDistributerGoodsEntity.gbDgControlPrice == 1 && this.data.item.nxDpgBuyPrice > 0){
    //     if(Number(this.data.item.nxDpgBuyPrice)  < Number(this.data.item.gbDistributerGoodsEntity.gbDgGoodsLowestPrice) || Number(this.data.item.nxDpgBuyPrice)  > Number(this.data.item.gbDistributerGoodsEntity.gbDgGoodsHighestPrice)){
    //       this.setData({
    //         showReason : true,
    //       })
    //       if(this.data.item.nxDpgBuyPriceReason == null ||  this.data.item.nxDpgBuyPriceReason.length == 0){
          
    //         return false
    //       }else{
    //         return true;
    //       }
    //     }else{
    //       this.setData({
    //         showReason : false,
    //       })
    //       return true;
    //     }
    //   }else{
    //     return true;
    //   }

    // },

    getPurchasePriceReason(e){
      console.log(e.detail.value.length);
      if(this.data.item.gbDistributerGoodsEntity.gbDgControlPrice == 1 && e.detail.value.length < 20){
        var itemData = "item.nxDpgBuyPriceReason";
      var resonStr = e.detail.value;
      this.setData({
        [itemData]: resonStr
      })
      }else{
        wx.showToast({
          title: '内容在20个汉字',
          icon: 'none'
        })
      }
    },

    _getBuySubtotal(e) {
      var arr = this.data.item.nxDepartmentOrdersEntities;
      var total = "";
      var weightTotal = "";
      for (var i = 0; i < arr.length; i++) {
        var sub = arr[i].nxDoCostSubtotal;
        var wei = arr[i].nxDoWeight;
        if (sub !== null) {
          weightTotal = Number(weightTotal) + Number(wei);
          total = Number(total) + Number(sub);
          total = total.toFixed(1);
        }
      }
      var data = "item.nxDpgBuySubtotal";
      var weightData = "item.nxDpgBuyQuantity";
      var ifTemp = ((weightTotal + '').indexOf('.') != -1) ? weightTotal.toFixed(1) : weightTotal;

      this.setData({
        [data]: total,
        [weightData]: ifTemp,
      })
    },

    getWeightScale(e){
      var value = e.detail.value;
      var orderIndex = e.currentTarget.dataset.index;
      var scale = this.data.item.nxDepartmentOrdersEntities[orderIndex].nxDoDsStandardScale;
      var orderWeight = Number(scale) * Number(value);
      var scarePrice = this.data.item.nxDpgBuyScalePrice;
      var orderSub = Number(scarePrice) * Number(value);

      var itemData = "item.nxDepartmentOrdersEntities[" + orderIndex + "].nxDoScaleWeight";
      var itemOrderData = "item.nxDepartmentOrdersEntities[" + orderIndex + "].nxDoWeight";
      var itemSubData = "item.nxDepartmentOrdersEntities[" + orderIndex + "].nxDoCostSubtotal";

      this.setData({
        orderIndex: orderIndex,
        [itemData]: value,
        [itemOrderData]: orderWeight,
        [itemSubData]: orderSub,
      })

     this._getBuySubtotalScale();
    },

    getOrderWeightScale(e){
      var index = e.currentTarget.dataset.index;
      var orderWeightData = "item.nxDepartmentOrdersEntities[" + index + "].nxDoWeight";
      var orderWeighValue = e.detail.value;
      //输入非空 
      if (orderWeighValue.length > 0) {
        //0
        this.setData({
          [orderWeightData]: orderWeighValue,
        })
        //1. 小数点
        var y = String(orderWeighValue).indexOf("."); //获取小数点的位置
        if (y !== -1) {
          var count = String(orderWeighValue).length - y; //获取小数点后的个数
        }
        if (count > 2) {
          wx.showToast({
            title: '小数点只能保留一位',
          })
          this.setData({
            [orderWeightData]: newWeight,
          })
        }
        //2. 值大小判断
        if (e.detail.value > 99999) {
          wx.showToast({
            title: '最大不能超过九万九千九百九十九',
            icon: "none"
          })
          this.setData({
            [orderWeightData]: newWeight,
          })
        }

        //update 
        var doWeight = Number(this.data.item.nxDepartmentOrdersEntities[index].nxDoWeight);
        var doSubtotal = Number(this.data.item.nxDepartmentOrdersEntities[index].nxDoCostSubtotal);
        var orderPrice = (Number(doSubtotal) / Number(doWeight)).toFixed(1);
        var orderPriceData = "item.nxDepartmentOrdersEntities[" + index + "].nxDoCostPrice";
        this.setData({
          [orderPriceData]: orderPrice
        })
      }else{
        this.setData({
          [orderWeightData]: "",
        })
      }
      this._getBuySubtotal();
    },

    _getBuySubtotalScale(e) {
      var arr = this.data.item.nxDepartmentOrdersEntities;
      var total = "";
      var weightTotal = "";
      var scaleTotal = "";
      for (var i = 0; i < arr.length; i++) {
        var subScale = arr[i].nxDoScaleWeight;    
        var sub = arr[i].nxDoCostSubtotal;
        var wei = arr[i].nxDoWeight;
        if (sub !== null) {
          weightTotal = Number(weightTotal) + Number(wei);
          total = Number(total) + Number(sub);
          total = total.toFixed(1);
          scaleTotal = Number(scaleTotal) + Number(subScale);
        }
      }

      var data = "item.nxDpgBuySubtotal";
      var weightData = "item.nxDpgBuyQuantity";
      var scaleData = "item.nxDpgBuyScaleQuantity"
      var ifTemp = ((weightTotal + '').indexOf('.') != -1) ? weightTotal.toFixed(1) : weightTotal;
      this.setData({
        [data]: total,
        [weightData]: ifTemp,
        [scaleData]: scaleTotal
      })
    },

    getPurchasePriceScale: function (e) {
      var itemData = "item.nxDpgBuyScalePrice";
      var numberStr = e.detail.value;
      //输入非空 
      if (e.detail.value.length > 0) {
        //0
        this.setData({
          [itemData]: numberStr,
        })
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
        }
        //2. 值大小判断
        if (numberStr > 99999) {
          wx.showToast({
            title: '最大不能超过九万九千九百九十九',
            icon: "none"
          })
          this.setData({
            [itemData]: numberStr.substring(0, numberStr.length - 1),
          })
        }

        var itemPriceData = "item.nxDpgBuyPrice";
        var scale = this.data.item.nxDpgBuyScale;
        var scalePrice = this.data.item.nxDpgBuyScalePrice;
        var orderPrice = (Number(scalePrice) / Number(scale)).toFixed(1);
        this.setData({
          [itemPriceData]: orderPrice
        })

        this._countOrderDataScale();
      } else {
        this._emptyInputPriceScale();
      }
    },

    _countOrderDataScale(e){
      var scalePrice = Number(this.data.item.nxDpgBuyScalePrice);
      var orderPrice = (Number(scalePrice) / Number(this.data.item.nxDpgBuyScale)).toFixed(1);
      var arr = this.data.item.nxDepartmentOrdersEntities;
      for (var i = 0; i < arr.length; i++) {
        var weight = arr[i].nxDoScaleWeight;
        var orderPriceData = "item.nxDepartmentOrdersEntities[" + i + "].nxDoCostPrice";
        var subData = "item.nxDepartmentOrdersEntities[" + i + "].nxDoCostSubtotal";
        var sub = (Number(scalePrice) * weight).toFixed(1);
        this.setData({
          [orderPriceData]: orderPrice,
          [subData]: sub
        })
      }
      this._getBuySubtotal();
    },

    _emptyInputPriceScale() {
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
      var weightData = "item.nxDpgBuyQuantity";
      var priceData = "item.nxDpgBuyPrice";
      var scalePrice = "item.nxDpgBuyScalePrice";
    
      this.setData({
        [subData]: "",
        [weightData]: "",
        [priceData]: "",
        [scalePrice] : "",
      })
    },





  },







})