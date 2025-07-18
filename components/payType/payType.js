
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
    scrollViewTop:{
      type: Number,
      value: ""
    },
    
    maskHeight:{
      type: Number,
      value: ""
    },
    
    url: {
      type: String,
      value: ""
    }
    
   
    
   
  },

  /**
   * 组件的初始数据
   */
  data: {
    showInput: false,
   
  },

  /**
   * 组件的方法列表
   */
  methods: {

    radioChange(e){
      console.log(e);
      var typeData = "item.gbDpbPayType";
      this.setData({
        [typeData]:  e.detail.value,
      })
      console.log(this.data.item)
    },


    clickMask() {
      this.setData({show: false})
    },

    cancle() {
      this.setData({ show: false ,})
      this.triggerEvent('cancle')
    },
   
    toSupplier(){
      var typeData = "item.gbDpbPayType";
      this.setData({
        [typeData]: 1,
      })
      this.triggerEvent('toSupplier')
    },
    
    confirm(e) {
      if(this.data.item.gbDpbPayType == 1){
        console.log(this.data.item);
        var supplierId = this.data.item.gbDpbSupplierId;
        if(supplierId !== null && supplierId > 0){
          this.triggerEvent('confirmPay', {
            item: this.data.item, 
          })
        }else{
          wx.showToast({
            title: '记账必须选择供货商',
            icon: 'none'
          })
        }
      }else{
        this.triggerEvent('confirmPay', {
          item: this.data.item, 
        })
      }
   
    },

  
   


  },
  

  
  
})
