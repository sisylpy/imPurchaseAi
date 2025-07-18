var load = require('../../../../lib/load.js');
const globalData = getApp().globalData;
import apiUrl from '../../../../config.js'
var dateUtils = require('../../../../utils/dateUtil');


import {
  getDisUserReports,
  delteReport
} from '../../../../lib/apiDepOrder.js'


Page({

  onShow() {


    // 推荐直接用新API
    let windowInfo = wx.getWindowInfo();
    let globalData = getApp().globalData;
    this.setData({
      windowWidth: windowInfo.windowWidth * globalData.rpxR,
      windowHeight: windowInfo.windowHeight * globalData.rpxR,
      navBarHeight: globalData.navBarHeight * globalData.rpxR,
    });


    if(this.data.update){
      this._getInitData();
    }
   
  },
  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      url: apiUrl.server,
      update: false,
      showOperation: false,
      chooseSize: false,
      animationData: {},
      startDate: dateUtils.getFirstDateInMonth(),
      stopDate: dateUtils.getArriveDate(0),
      dateType: 'month'
      

    })

    var disUserInfo = wx.getStorageSync('userInfo');
    if(disUserInfo){
      this.setData({
        userInfo: disUserInfo
      })
    }

    var disInfo = wx.getStorageSync('disInfo');
    if(disInfo){
      this.setData({
        disInfo: disInfo
      })
    }


    this._getInitData();
  },


  _getInitData() {
    var data = {
      userId: this.data.userInfo.gbDepartmentUserId,
      disId: this.data.userInfo.gbDuDistributerId,
      startDate: this.data.startDate,
      stopDate: this.data.stopDate,
    }
     load.showLoading("查询报表中");
    getDisUserReports(data)
      .then(res => {
        load.hideLoading();
        console.log(res.result)
        if (res.result.code == 0) {
          this.setData({
            reportArr: res.result.data,
          })
          
        }
      })
  },

  openOperation(e) {
    this.setData({
      showOperation: true,
      repId: e.currentTarget.dataset.id,
      depName: e.currentTarget.dataset.name,
      type:  e.currentTarget.dataset.type,
      code: e.currentTarget.dataset.code
    })

    this.chooseSezi();

  },

  chooseSezi: function (e) {
    // 用that取代this，防止不必要的情况发生
    var that = this;
    // 创建一个动画实例
    var animation = wx.createAnimation({
      // 动画持续时间
      duration: 100,
      // 定义动画效果，当前是匀速
      timingFunction: 'linear'
    })
    // 将该变量赋值给当前动画
    that.animation = animation
    // 先在y轴偏移，然后用step()完成一个动画
    animation.translateY(200).step()
    // 用setData改变当前动画
    that.setData({
      // 通过export()方法导出数据
      animationData: animation.export(),
      // 改变view里面的Wx：if
      chooseSize: true
    })
    // 设置setTimeout来改变y轴偏移量，实现有感觉的滑动
    setTimeout(function () {
      animation.translateY(0).step()
      that.setData({
        animationData: animation.export()
      })
    }, 20)
  },

  hideMask() {

    this.hideModal();
    this.setData({
      showOperation: false,
    })
  },

  hideModal: function (e) {
    var that = this;
    var animation = wx.createAnimation({
      duration: 1000,
      timingFunction: 'linear'
    })
    that.animation = animation
    animation.translateY(200).step()
    that.setData({
      animationData: animation.export()

    })
    setTimeout(function () {
      animation.translateY(0).step()
      that.setData({
        animationData: animation.export(),
        chooseSize: false
      })
    }, 200)
  },

  deleteReport(e) {
    delteReport(this.data.repId).then(res => {
      if (res.result.code == 0) {
        this._getInitData();
      }
    })
  },



  testPdf(){
    var that = this;
      load.showLoading("下载PDF....")
      wx.downloadFile({
        url: apiUrl.apiUrl + 'reportPDF/downloadReportPdfGb?id=1'+'&startDate=' + this.data.startDate + '&stopDate=' + this.data.stopDate,
        header: {},
        success(res) {
          if (res.statusCode === 200) {
            console.log('下载成功，临时文件路径：', res.tempFilePath);
            console.log('文件大小：', res.tempFileSize);
      
            wx.openDocument({
              filePath: res.tempFilePath,
              fileType: 'pdf',
              success: function () {
                console.log('打开 PDF 成功');
              },
              fail: function (err) {
                console.error('打开 PDF 失败：', err);
              }
            });
          } else {
            console.error('下载失败，状态码：', res.statusCode);
          }
        },
        fail(err) {
          console.error('下载失败：', err);
          wx.showToast({
            title: '下载失败',
            icon: 'none'
          });
        },
        complete() {
          load.hideLoading();
        }
      });


  },


  
  creatExcel() {
    if(this.data.code !== -1){
      var that = this;
      load.showLoading("下载Excel表中....")
      wx.downloadFile({
        url: apiUrl.apiUrl + 'gbreport/downloadReportExcelGb?id=' + this.data.repId
        +'&startDate=' + this.data.startDate + '&stopDate=' + this.data.stopDate, //仅为示例，并非真实的资源
        header: {},
        success(res) {
          // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
          // getFileSystemManager().
          if (res.statusCode === 200) {
            console.log(res);
            var tempFilePath = res.tempFilePath;
            var path = wx.env.USER_DATA_PATH + "/" + that.data.depName + that.data.startDate +"-" + that.data.stopDate+ that.data.type +  ".xls"
            wx.saveFile({
              tempFilePath: tempFilePath,
              filePath: path,
              fileType: 'xls',
              success(sRes) {
                wx.openDocument({
                  filePath: sRes.savedFilePath,
                  showMenu: true,
                  fileType: 'xls',
                  success: function (oRes) {
                    console.log("open")
                    that.hideMask();
                  }
                })
              },
              fail(sF) {
                console.log(sF);
                wx.showToast({
                  title: '保存失败',
                })
              }
  
            })
          }
        },
        fail() {
          wx.showToast({
            title: '下载失败',
            icon: 'none'
          })
  
        },
        complete() {
          load.hideLoading();
  
        }
      })
    }else{
      wx.showModal({
        title: '没必要生成表',
        content: '没有数据',
        showCancel: false,
        complete: (res) => {
         
      
        }
      })
    }
  },

  

   toDate(){
    wx.navigateTo({
      url: '../../sel/date/date?startDate=' + this.data.startDate
       + '&stopDate=' + this.data.stopDate + '&dateType=' + this.data.dateType,
    })
   },


  toOnePage1() {

    wx.navigateTo({
      url: '../dateReport/dateReport?startDate=' + this.data.startDate + '&stopDate=' + this.data.stopDate + '&dateType=' + this.data.dateType + '&userId=' + this.data.userInfo.gbDepartmentUserId,
    })
    
  },


  toOnePage() {
    var disInfo = this.data.disInfo;
    wx.navigateTo({
      url: '../reportTwoPage/reportTwoPage?type=dis&startDate=' + this.data.startDate +
            '&stopDate=' + this.data.stopDate + '&dateType=' + this.data.dateType
    })


    // if(disInfo.mendianDepartmentList.length == 1){
    //   wx.navigateTo({
    //     url: '../reportTwoPage/reportTwoPage?id=' + this.data.disInfo.mendianDepartmentList[0].gbDepartmentId +
    //       '&type=dep'  + '&name=' + this.data.disInfo.mendianDepartmentList[0].gbDepartmentName + '&startDate=' + this.data.startDate +
    //       '&stopDate=' + this.data.stopDate + '&dateType=' + this.data.dateType,
    //   })
    // }else{
    //   wx.navigateTo({
    //     url: '../reportOnePage/reportOnePage?id=' + this.data.disInfo.mendianDepartmentList[0].gbDepartmentId +
    //       '&type=dep'  + '&name=' + this.data.disInfo.mendianDepartmentList[0].gbDepartmentName + '&startDate=' + this.data.startDate +
    //       '&stopDate=' + this.data.stopDate + '&dateType=' + this.data.dateType,
    //   })
    // }
    
    
  },



  toBack() {
    wx.navigateBack({
      delta: 1,
    })
  },

})