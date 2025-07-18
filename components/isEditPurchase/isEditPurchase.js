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
    // consultItem: {
    //   type: Object,
    //   value: ""
    // },
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
    scrollViewTop: {
      type: Number,
      value: ""
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

    cancle() {
      this.setData({
        show: false,
        item: "",
      })
      this.triggerEvent('cancle')
    },


    toDeletePurchaseGoods() {
      this.triggerEvent('toDeletePurchaseGoods')
    },

    toEditPurchaseGoods() {
      this.triggerEvent('toEditPurchaseGoods')
    },

   

    getDateTimeString() {
      var dateOnly = new Date();
      dateOnly.setTime(dateOnly.getTime());
      var date = dateOnly.getDate();
      var month = dateOnly.getMonth() + 1;
     
      var s3 = month + "月" + date + "日" 
      return s3;
    },


    confirm(e) {
      this.triggerEvent('confirmPurGoods', {
        item: this.data.item,
      
      })
      this.setData({
        show: false,
        item : ""
      })
    },


    changePrice(e){
      console.log("changepricieee")
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

    },

   


    getPurchasePrice: function (e) {
      var numberStr = e.detail.value;
      var itemData = "item.nxDpgBuyPrice";
      //输入非空 
      if (e.detail.value.length > 0) {
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
    
    },


    _upeateDisGoodsPrice(data){
      console.log(data);
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











  },




})