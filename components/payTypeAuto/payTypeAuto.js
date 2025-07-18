
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
    },

   
   
    
   
  },

  /**
   * 组件的初始数据
   */
  data: {
    showInput: false,
    isAuto: false,
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
      this.setData({
        isAuto: false
      })
    },
   
    toSupplier(){
      var typeData = "item.gbDpbPayType";
      this.setData({
        [typeData]: 1,
      })
      this.triggerEvent('toSupplier')
    },
    
    confirm(e) {
      console.log("this.daisau", this.data.isAuto);
      console.log("this.daisau", this.data.item.gbDpbPayType);
        this.triggerEvent('confirmPayAuto', {
          item: this.data.item, 
          isAuto: this.data.isAuto
        })

        this.setData({
          isAuto: false
        })
   
    },

    changeIsAuto(e){
      console.log(e);
      this.setData({
        isAuto: e.detail.value
      })
    },
  
   


  },
  

  
  
})
