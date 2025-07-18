const globalData = getApp().globalData;


Page({


  onShow: function () {

    // 推荐直接用新API
    let windowInfo = wx.getWindowInfo();
    let globalData = getApp().globalData;
    this.setData({
      windowWidth: windowInfo.windowWidth * globalData.rpxR,
      windowHeight: windowInfo.windowHeight * globalData.rpxR,
      navBarHeight: globalData.navBarHeight * globalData.rpxR,
    });


  },
  /**
   * 页面的初始数据
   */
  data: {
    selDepList: [],

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
   
   
    var searchDeps = wx.getStorageSync('selDepList');
    if (searchDeps) {
      this.setData({
        selDepList: searchDeps
      })
      if (searchDeps.length > 0) {
        var ids = "";
        var names = "";
        var selDepList = this.data.selDepList;
        for (var i = 0; i < selDepList.length; i++) {
          ids = ids + selDepList[i].gbDepartmentId + ","
          names = names + selDepList[i].gbDepartmentName + ",";
        }
        this.setData({
          searchDepIds: ids,
          searchDepName: names,
        })
        
      }
    }


    var disInfo = wx.getStorageSync('disInfo');
    if(disInfo){
      this.setData({
        disInfo: disInfo,
        mendianArr: disInfo.mendianDepartmentList,
        stockArr: disInfo.stockDepartmentList,
        kitchenArr: disInfo.kitchenDepartmentList,  
      })
    }
    var arr  =  this.data.mendianArr;
    // if(this.data.type == 1){
  
     if(arr.length > 0 && this.data.selDepList.length > 0){
      for(var i = 0; i < arr.length; i++){
        var id = arr[i].gbDepartmentId;
        for(var j = 0 ; j < this.data.selDepList.length; j++){
          var selId = this.data.selDepList[j].gbDepartmentId;
          if(id == selId){
            var data = "mendianArr["+ i +"].isSelected";
            this.setData({
              [data]: true,
            })
          }
        }
      }
    }
    // }else if(this.data.type == 3){
    //   arr = this.data.stockArr;
    // }else if(this.data.type == 5){
    //   arr = this.data.kitchenArr;
    // }

   
  },

  toSearch(){
    console.log("tosearchhchch")
    if(this.data.selDepList.length > 0){
      wx.setStorageSync('selDepList', this.data.selDepList);
      var pages = getCurrentPages();
      var prevPage = pages[pages.length - 2]; //上一个页面
      prevPage.setData({
        updateSearch: true,
        selDepList: this.data.selDepList,
      })
    }else{
      wx.removeStorageSync('selDepList')
    }
    
    wx.navigateBack({
      delta: 1
    })
  },

  selDep(e) {
   
    var index = e.currentTarget.dataset.index;
    var dep = e.currentTarget.dataset.dep;
    var selDepList = this.data.selDepList;
    var data = "mendianArr[" + index + "].isSelected";
    if(dep.isSelected){  
      var removeId = dep.gbDepartmentId;
      selDepList = selDepList.filter(item => item.gbDepartmentId !== removeId);
      this.setData({
        [data]: false,
        selDepList: selDepList,
      })
     
    }else{
      var item = this.data.mendianArr[index];
      selDepList.push(item);
      this.setData({
        [data]: true,
        selDepList: selDepList,
      })
    }

   
  },


  delDepartment(){
    console.log("deelelelel")
    wx.removeStorageSync('selDepList');;
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2]; //上一个页面
    prevPage.setData({
      updateSearch: true,
      searchDepIds: -1,
      searchDepName: "",
    })
    wx.navigateBack({
      delta: 1
    })
  },

  selectDepartment(e) {
    console.log("selellelelelel")
    var dep = e.currentTarget.dataset.dep;
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2]; //上一个页面
      var data = {
        depId: e.currentTarget.dataset.id,
        depName: e.currentTarget.dataset.name,
        stockType: this.data.type
      }
      wx.setStorageSync('searchDep', dep)
     
      //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
      prevPage.setData({
        updateSearch: true,
        searchDepIds: e.currentTarget.dataset.id,
        searchDepName: e.currentTarget.dataset.name,
      })
    
  
    wx.navigateBack({
      delta: 1
    })

  },


  toBack() {
    wx.navigateBack({
      delta: 1,
    })
  },

})