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
      value: {
        gbDgsStars: 3, // 默认值，外部传入
      },
    },
    modalHeight: {
      type: Number,
      value: ""
    },
    scrollViewTop: {
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

    consultItem: {
      type: Object,
      value: ""
    },
    canSure: {
      type: Boolean,
      value: true
    },
    nowTime: {
      type: String,
      value: ""
    },
    canWaste: {
      type: Boolean,
      value: false,
    },
    resWeight: {
      type: String,
      value: "0"
    },
    showType: {
      type: String,
      value: ""
    },
    resultTime: {
      type: String,
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
    
    greenStars: [], // 绿色星星数组
    grayStars: [],
    reason: "",
    src: "",
    srcLarge: ""
  },


  observers: {
    // 当 item.gbDgsStars 发生变化时触发
    'item.gbDgsStars': function (gbDgsStars) {
      const validStars = parseInt(gbDgsStars, 10);
      if (isNaN(validStars) || validStars < 0) {
        console.warn("Invalid gbDgsStars value:", gbDgsStars);
        return;
      }
      this.updateStars(validStars);
    },
  },
  /**
   * 组件的方法列表
   */
  methods: {

    onStarClick(e) {
      const totalStars = 5;
      const greenCount = this.data.greenStars.length;
      const index = e.currentTarget.dataset.index; // 获取点击的星星索引
      console.log("indeixxxxxx", index);
      // 判断点击的星星属于绿色还是灰色
      const isGreenStar = index < greenCount;
      let newStarCount;
      console.log("indeixxxxxx", isGreenStar);

      if (isGreenStar) {
        // 如果点击的是绿色星星，则减少到当前点击的星星数量
        newStarCount = index + 1;
      } else {
        // 如果点击的是灰色星星，则增加到当前点击的星星数量
        newStarCount = greenCount + (index - greenCount + 1);

      }

      // 限制星星数量范围
      newStarCount = Math.min(Math.max(newStarCount, 0), totalStars);

      // 更新数据
      this.setData({
        'item.gbDgsStars': newStarCount,
        gbDgsStars: newStarCount
      });
      // 强制调用更新星星数组
      //  this.updateStars(newStarCount);
      // 如果需要将新值传递给父组件，可以通过 triggerEvent 通知父组件
      // this.triggerEvent('updateStars', {
      //   gbDgsStars: newStarCount
      // });
    },



    updateStars(greenCount) {
      const totalStars = 5; // 总星星数量
      const grayCount = totalStars - greenCount; // 计算灰色星星数量
      this.setData({
        greenStars: new Array(greenCount).fill(1), // 用数组填充绿色星星
        grayStars: new Array(grayCount).fill(1), // 用数组填充灰色星星
      });
    },


    

    getStarsReason(e) {
      this.setData({
        reason: e.detail.value
      })
      this._checkStarsCanSure();
    },

    //选择图片
    choiceImg: function (e) {
      var _this = this;
      wx.chooseImage({
        count: 1, // 最多可以选择的图片张数，默认9
        sizeType: ['original', 'compressed'], // original 原图，compressed 压缩图，默认二者都有
        sourceType: ['album', 'camera'], // album 从相册选图，camera 使用相机，默认二者都有
        success: function (res) {
          _this.setData({
            src: res.tempFilePaths,
            isSelectImg: true,
          })
        },
        fail: function () {

        },

        complete: function () {
          _this._checkStarsCanSure(e)
        }
      })
    },

    delPic() {
      this.setData({
        src: ""
      })
      this._checkLossCanSure()
    },

    choiceImgLarge: function (e) {
      var _this = this;
      wx.chooseImage({
        count: 1, // 最多可以选择的图片张数，默认9
        sizeType: ['original', 'compressed'], // original 原图，compressed 压缩图，默认二者都有
        sourceType: ['album', 'camera'], // album 从相册选图，camera 使用相机，默认二者都有
        success: function (res) {
          _this.setData({
            srcLarge: res.tempFilePaths,
            isSelectImg: true,
          })
        },
        fail: function () {

        },
        complete: function () {
          // _this._checkStarsCanSure(e)
        }
      })
    },

    delPicLarge() {
      this.setData({
        srcLarge: ""
      })
      // this._checkLossCanSure()
    },

    

    _checkStarsCanSure(){
      console.log("canlosssosocansave")
     
      if (this.data.src.length > 0 && this.data.reason.length > 0) {
        this.setData({
          canSure: true
        })
      } else {
        this.setData({
          canSure: false
        })
      }
    },

    

    cancle() {
      this.setData({
        show: false,
        showType: 4,
        canSure: true,
        stockArr: [],
        resWeight: 0,
        reason: "",
        src: ""
      })
      this.triggerEvent('cancle')
    },
    del(){
      this.triggerEvent('delAttem')
    },

    confirm(e) {
      if (this.data.canSure) {
        this.triggerEvent('confirm', {
          item: this.data.item,
          showType: this.data.showType,
          src: this.data.src,
          srcLarge: this.data.srcLarge,
          reason: this.data.reason,
        })
        this.setData({
          show: false,
          showType: "1",
          canSure: true,
          reason: "",
          src: "",
          srcL: "",
          resWeight: "0"
        })
      }

    },
  },


  lifetimes: {
    attached() {

      // this.updateStars(this.data.item.gbDgsStars);

      // 初始化星星数据

    },
  },










})