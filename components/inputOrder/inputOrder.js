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
    scrollViewTop: {
      type: Number,
      value: ""
    },
    foucusWeight:{
      type: Boolean,
      value: "false"
    },
    foucusPrice:{
      type: Boolean,
      value: "false"
    },
    canSave:{
      type: Boolean,
      value: "false"
    },
    
    disInfo:{
      type: Object,
      value: ""
    }

    
  },

  /**
   * 组件的初始数据
   */
  data: {
    showReason: false,
    isClosing: false,
  },

  /**
   * 组件的方法列表
   */
  methods: {

    // 关闭动画方法
    closeWithAnimation() {
      this.setData({
        isClosing: true
      });
      
      // 等待动画完成后关闭
      setTimeout(() => {
        this.setData({
          show: false,
          showReason: false,
          scaleInput: false,
          isClosing: false
        });
      }, 300);
    },

    clickMask() {
      this.closeWithAnimation();
    },

    cancle() {
      this.setData({
        isClosing: true
      });
      
      setTimeout(() => {
        this.setData({
          show: false,
          editApply: false,
          item: "",
          showReason: false,
          scaleInput: false,
          isClosing: false
        });
        this.triggerEvent('cancle');
      }, 300);
    },
    finish(e){
      this.setData({
        isClosing: true
      });
      
      setTimeout(() => {
        this.setData({
          show: false,
          editApply: false,
          item: "",
          showReason: false,
          scaleInput: false,
          isClosing: false
        });
        this.triggerEvent('finish');
      }, 300);
    },
    confirm(e) {
     var aaa =   this._checkPriceAndReason();
      console.log(aaa);
      if(aaa){
        if (this.data.item.gbDpgBuyPrice == null || !this.data.item.gbDpgBuyPrice > 0) {
          //panduan1
          var price = this.data.item.gbDpgBuyPrice;
          if (price.length == 0) {
            wx.showToast({
              title: '单价不能为空',
              icon: 'none'
            })
            return;
          }
        }
        //panduan2
        var orderArr = this.data.item.gbDistributerGoodsEntity.gbDepartmentOrdersEntities;
        for (var j = 0; j < orderArr.length; j++) {
          var choice = orderArr[j].hasChoice;
          if (choice) {
            var orderWeight = orderArr[j].gbDoWeight;
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
          isClosing: true
        });
        
        setTimeout(() => {
          this.setData({
            show: false,
            showReason: false,
            scaleInput: false,
            isClosing: false
          });
        }, 300);
      }else{
        wx.showToast({
          title: '请输入价格异常原因',
          icon: 'none'
        })
        this.setData({
          showReason: true
        })
        return;
      }
    },

    getPurchasePrice: function (e) {
      console.log("getPurchasePrice")
      var itemData = "item.gbDpgBuyPrice";
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
        if (count > 3) {
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

    getPurchasePriceScale: function (e) {
      console.log("getPurchasePriceScale")
      var itemData = "item.gbDpgBuyScalePrice";
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
        if (count > 3) {
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

        var itemPriceData = "item.gbDpgBuyPrice";
        var scale = this.data.item.gbDpgBuyScale;
        var buyPrice = (Number(this.data.item.gbDpgBuyScalePrice) / Number(scale)).toFixed(2);
        this.setData({
          [itemPriceData]: buyPrice
        })

       this._getBuySubtotalScale();
        this._getOrderSubtotalScale();
      } else {
        this._emptyInputPriceScale();
      }
    },

    getOrderWeight(e) {
      var index = e.currentTarget.dataset.index;
      var price = Number(this.data.item.gbDpgBuyPrice);
      var orderWeightData = "item.gbDistributerGoodsEntity.gbDepartmentOrdersEntities[" + index + "].gbDoWeight";
      var orderPriceData = "item.gbDistributerGoodsEntity.gbDepartmentOrdersEntities[" + index + "].gbDoPrice";
      var subData = "item.gbDistributerGoodsEntity.gbDepartmentOrdersEntities[" + index + "].gbDoSubtotal";
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
        if (count > 3) {
          wx.showToast({
            title: '小数点只能保留一位',
          })
          var newWeight = Number(orderWeighValue.substring(0, orderWeighValue.length - 1));
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

    _checkPrice() {
      console.log("check" + this.data.item.gbDpgBuyPrice)
      if (this.data.item.gbDistributerGoodsEntity.gbDgControlPrice == 1 && this.data.item.gbDpgBuyPrice > 0) {
        if (Number(this.data.item.gbDpgBuyPrice) < Number(this.data.item.gbDistributerGoodsEntity.gbDgGoodsLowestPrice) || Number(this.data.item.gbDpgBuyPrice) > Number(this.data.item.gbDistributerGoodsEntity.gbDgGoodsHighestPrice)) {
          this.setData({
            showReason: true,
          })
        } else {
          this.setData({
            showReason: false,
          })
        }
      }
    },

    getPurchasePriceReason(e) {
      console.log(e.detail.value.length);
      if ( e.detail.value.length < 20 && e.detail.value.length > 0) {
        var itemData = "item.gbDpgBuyPriceReason";
        var resonStr = e.detail.value;
        this.setData({
          [itemData]: resonStr,
        })
      } else {
        wx.showToast({
          title: '内容在20个汉字',
          icon: 'none'
        })
      }
    },

    _emptyInputPrice() {
      var arr = this.data.item.gbDistributerGoodsEntity.gbDepartmentOrdersEntities;
      for (var i = 0; i < arr.length; i++) {
        var orderPriceData = "item.gbDistributerGoodsEntity.gbDepartmentOrdersEntities[" + i + "].gbDoPrice";
        var subData = "item.gbDistributerGoodsEntity.gbDepartmentOrdersEntities[" + i + "].gbDoSubtotal";
        this.setData({
          [orderPriceData]: "",
          [subData]: ""
        })
      }
      var subData = "item.gbDpgBuySubtotal";
      var priceData = "item.gbDpgBuyPrice";
      this.setData({
        [subData]: "",
        [priceData]: "",
        canSave: false
      })
    },
    
    _emptyInputPriceScale() {
      var arr = this.data.item.gbDistributerGoodsEntity.gbDepartmentOrdersEntities;
      for (var i = 0; i < arr.length; i++) {
        var orderPriceData = "item.gbDistributerGoodsEntity.gbDepartmentOrdersEntities[" + i + "].gbDoPrice";
        var subData = "item.gbDistributerGoodsEntity.gbDepartmentOrdersEntities[" + i + "].gbDoSubtotal";
        var sellingSubData = "item.gbDistributerGoodsEntity.gbDepartmentOrdersEntities[" + i +"].gbDoSellingSubtotal";
        this.setData({
          [orderPriceData]: "",
          [subData]: "",
          [sellingSubData]: ""
        })
      }

      var subData = "item.gbDpgBuySubtotal";
      var priceData = "item.gbDpgBuyPrice";
      var scalePrice = "item.gbDpgBuyScalePrice";
    
      this.setData({
        [subData]: "",
        [priceData]: "",
        [scalePrice] : "",
      })
    },

    _countOrderData() {
      console.log(this.data.item)
      var price = Number(this.data.item.gbDpgBuyPrice);
      var arr = this.data.item.gbDistributerGoodsEntity.gbDepartmentOrdersEntities;
      for (var i = 0; i < arr.length; i++) {
        if(arr[i].isNotice){
          var weight = arr[i].gbDoWeight;
          var orderPriceData = "item.gbDistributerGoodsEntity.gbDepartmentOrdersEntities[" + i + "].gbDoPrice";
          var subData = "item.gbDistributerGoodsEntity.gbDepartmentOrdersEntities[" + i + "].gbDoSubtotal";
          var sub = (Number(price) * weight).toFixed(1);
         
          this.setData({
            [orderPriceData]: price,
            [subData]: sub,
           
          })
        }
        
      }
      this._getBuySubtotal();

    },

    _getBuySubtotal(e) {
      var arr = this.data.item.gbDistributerGoodsEntity.gbDepartmentOrdersEntities;
      var total = "";
      var weightTotal = "";
      for (var i = 0; i < arr.length; i++) {
        if(arr[i].isNotice){
          var sub = arr[i].gbDoSubtotal;
          var wei = arr[i].gbDoWeight;
          if (sub !== null) {
            weightTotal = Number(weightTotal) + Number(wei);
            total = Number(total) + Number(sub);
            total = total.toFixed(1);
          }
        }
        
      }
      var data = "item.gbDpgBuySubtotal";
      var weightData = "item.gbDpgBuyQuantity";
      var ifTemp = ((weightTotal + '').indexOf('.') != -1) ? weightTotal.toFixed(1) : weightTotal;
      this.setData({
        [data]: total,
        [weightData]: ifTemp,
      })
      if(total > 0){
        this.setData({
          canSave: true,
        })
      }else{
        this.setData({
          canSave: false,
        })
      }
      console.log("infoorororoorrr", this.data.canSave)

    },

    // 88888
    getScaleWeight(e) {
      var value = e.detail.value;
      var orderIndex = e.currentTarget.dataset.index;
      var scale = this.data.item.gbDistributerGoodsEntity.gbDepartmentOrdersEntities[orderIndex].gbDoDsStandardScale;
      var orderWeight = Number(scale) * Number(value);

      var itemData = "item.gbDistributerGoodsEntity.gbDepartmentOrdersEntities[" + orderIndex + "].gbDoScaleWeight";
      var itemOrderData = "item.gbDistributerGoodsEntity.gbDepartmentOrdersEntities[" + orderIndex + "].gbDoWeight";
      this.setData({
        orderIndex: orderIndex,
        [itemData]: value,
        [itemOrderData]: orderWeight
      })

      //核算小计

      //统计采购商品的全部重量
      this._getTotalWeightScale();
      this._getOrderSubtotalScale();
    },

    _getTotalWeightScale() {
      var arr = this.data.item.gbDistributerGoodsEntity.gbDepartmentOrdersEntities;
      var scaleQuantityTotal = 0;
      var scaleOrderQuantityTotal = 0;
      for (var i = 0; i < arr.length; i++) {
        var scaleWeight = arr[i].gbDoScaleWeight;
        scaleQuantityTotal = Number(scaleQuantityTotal) + Number(scaleWeight);
        var scareOrderWeight = arr[i].gbDoWeight;
        scaleOrderQuantityTotal = Number(scaleOrderQuantityTotal) + Number(scareOrderWeight);
      }
      
      var scaleWeightTotal = "item.gbDpgBuyScaleQuantity";
      var buyQuantity = "item.gbDpgBuyQuantity";
      this.setData({
        [scaleWeightTotal]: scaleQuantityTotal,
        [buyQuantity]: scaleOrderQuantityTotal
      })
     
      this._getBuySubtotalScale();
    },

    _getOrderSubtotalScale(){
      var arr = this.data.item.gbDistributerGoodsEntity.gbDepartmentOrdersEntities;
      for(var i = 0; i < arr.length; i++){
        var subData = "item.gbDistributerGoodsEntity.gbDepartmentOrdersEntities[" + i +"].gbDoSubtotal";
        var weight = arr[i].gbDoScaleWeight;
        var price = arr[i].gbDoScalePrice;
        var subtotal = (Number(weight) * Number(price)).toFixed(1);
        this.setData({
          [subData]: subtotal,
          
        })
      }
    },

    _getBuySubtotalScale() {
      //核算订单规格单位的单价
      var buyPrice = this.data.item.gbDpgBuyScalePrice;
      if (buyPrice !== null && buyPrice > 0) {
        var subData = "item.gbDpgBuySubtotal";
       var scaleWeight = this.data.item.gbDpgBuyScaleQuantity;
       var sub = Number(scaleWeight) * Number(buyPrice);

       this.setData({
        [subData]: sub.toFixed(1)
       })
      }
      this._countOrderPrice();
    },

    _countOrderPrice(){
      var doPrice = this.data.item.gbDpgBuyPrice;
      var scalePrice = this.data.item.gbDpgBuyScalePrice;
      var arr = this.data.item.gbDistributerGoodsEntity.gbDepartmentOrdersEntities;
      for(var i = 0; i < arr.length; i++){
        var priceData = "item.gbDistributerGoodsEntity.gbDepartmentOrdersEntities[" + i +"].gbDoPrice";
        var scalePriceData = "item.gbDistributerGoodsEntity.gbDepartmentOrdersEntities[" + i +"].gbDoScalePrice";

        this.setData({
          [priceData]: doPrice,
          [scalePriceData]: scalePrice
        })
      }
    },

    _checkPriceAndReason(){
      console.log(this.data.item.gbDpgBuyPrice);
      console.log("--------buyprice???????")
      if(this.data.item.gbDistributerGoodsEntity.gbDgControlPrice == 1 && this.data.item.gbDpgBuyPrice > 0){

        if(Number(this.data.item.gbDpgBuyPrice)  < Number(this.data.item.gbDistributerGoodsEntity.gbDgGoodsLowestPrice) || Number(this.data.item.gbDpgBuyPrice)  > Number(this.data.item.gbDistributerGoodsEntity.gbDgGoodsHighestPrice)){
          this.setData({
            showReason : true,
          })
          if(this.data.item.gbDpgBuyPriceReason == null || this.data.item.gbDpgBuyPriceReason.length == 0){
            return false;
          }else{
            return true;
          }
        }else{
          console.log("budabuxiaoxiaooa")
          return true;
        }
      }else{
        return true;
      }
    },











  },




})