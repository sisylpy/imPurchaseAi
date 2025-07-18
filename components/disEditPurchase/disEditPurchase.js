
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
    modalHeight: {
      type: Number,
      value: ""
    },
    scrollViewTop: {
      type: Number,
      value: ""
    },
    modalContentHeight: {
      type: Number,
      value: ""
    },
    windowHeight: {
      type: Number,
      value: ""
    },
   
    ids: {
      type: Array,
      value: []
    },
    planOrder: {
      type: String,
      value: ""
    },
    
    puringIndex: {
      type: Number,
      value: ""
    },
    priceLevel:{
      type: Number,
      value: 0,
    },
    purchaseGoods:{
      type: Object,
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
   

    getPlanOrder: function(e){
      if (e.detail.value.length > 0) {
        this.setData({
          planOrder: e.detail.value
        })
      }
    },

    radioChange(e){ 
    
      this.setData({
        priceLevel: e.detail.value
      })
},

    cancle() {
      this.setData({
        show: false,
      })
      this.triggerEvent('cancle')
    },
    delete(){
      this.setData({
        show: false,
      })
      this.triggerEvent('delPurGoods')
    },

    confirmEdit(e) {
    
        this.triggerEvent('confirmEditGoods', {
          ids: this.data.ids,
          planOrder: this.data.planOrder,
          priceLevel: this.data.priceLevel

        })

        this.setData({
          show: false,
          ids: [],
          planOrder: ""
        })
    

     
    },

   

   



  },










})