
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
   
    
    maskHeight:{
      type: Number,
      value: ""
    },
    
    payType: {
      type: Number,
      value: ""
    },
    windowHeight: {
      type: Number,
      value:""
    },
    windowWidth:{
      type: Number,
      value: ""
    }
    
   
   
    
   
  },

  /**
   * 组件的初始数据
   */
  data: {
    showInput: false,
    items:[
      {
        checked: true,
        value: 0,
        str: "记账"
      },
      {
        checked: false,
        value: 1,
        str: "现金"
      }
    ],
  },

  /**
   * 组件的方法列表
   */
  methods: {

  

    clickMask() {
      this.setData({show: false})
    },

    cancle() {
      this.triggerEvent('cancle')
    },
    
    confirm(e) {

      this.triggerEvent('confirmCorrect', {
         
        item: this.data.item,
       
      })
      
      // if(this.data.applyNumber  > 0){
      //   var regex=/^[0]+/; //整数验证正则        
      //   var apply = "";
      //   if(this.data.applyNumber.indexOf(".") !== -1){
      //     apply = this.data.applyNumber;
      //   }else{
      //     apply = this.data.applyNumber.replace(regex, "");
      //   }
       

      //   this.setData({
      //     show: false,
      //     applyNumber: "",
      //     applyRemark: "",
      //     remarkContent: "",
      //     goodsStandard: "",
      //     isNotice: false,
      //     editApply: false,
      //     arriveDate: 1
      //   })
      // }else{
      //   wx.showToast({
      //     title: '数量只能填写数字',
      //     icon: "none"
      //   })
      // }
     
     
    },

   

   





  },
  

  
  
})
