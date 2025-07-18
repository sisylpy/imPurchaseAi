
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
    planOrder: {
      type: String,
      value: ""
    } ,
    priceLevel:{
      type: String,
      value: "-1"
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
        priceLevel: "-1",
        planOrder: ""
      })
      this.triggerEvent('cancle')
    },

    confirm(e) {
      if (this.data.planOrder.length > 0) {
        this.triggerEvent('confirm', {
          planOrder: this.data.planOrder,
          priceLevel: this.data.priceLevel,
        })
        this.setData({
          priceLevel: "-1",
          planOrder: "",
          show: false
        })
      }else{
        wx.showToast({
          title: '请输入进货数量',
          icon: 'none'
        })
      } 
    },

   
    getPlan: function (e) {
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

   
    getFocus: function(e){
      this.triggerEvent('getFocus', {
        keyboardHeight: e.detail.height,
      })
    }



  },










})