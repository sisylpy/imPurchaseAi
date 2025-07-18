var load = require('../../../../lib/load.js');
const globalData = getApp().globalData;
import apiUrl from '../../../../config.js'


import {
  getDisPurchaseGoodsBatchGb,

  sellUserReadDisBatchGb,

  supplierEditBatchGb,

  supplierGetPrintBatchGb,

  sellerReceiveReturnBill
  
} from '../../../../lib/apiDepOrder'


import dateUtil from '../../../../utils/dateUtil';

Page({

  onShow() {

      // 推荐直接用新API
      let windowInfo = wx.getWindowInfo();
      let globalData = getApp().globalData;
      this.setData({
        windowWidth: windowInfo.windowWidth * globalData.rpxR,
      windowHeight: windowInfo.windowHeight * globalData.rpxR,
      statusBarHeight: globalData.statusBarHeight * globalData.rpxR,
      numWidth: (windowInfo.windowWidth / 4) * globalData.rpxR - 40,
      numContainerWidth: (windowInfo.windowWidth / 4) * globalData.rpxR - 20,
      numHeight: (windowInfo.windowWidth / 4) * globalData.rpxR - 40,
      numContainerHeight: (windowInfo.windowWidth / 4) * globalData.rpxR - 20,
      btnWidth: (windowInfo.windowWidth / 8) * globalData.rpxR - 20,
      btnWidthContainer: (windowInfo.windowWidth / 8) * globalData.rpxR,
      bigBtnWidth: (windowInfo.windowWidth / 6) * globalData.rpxR - 20,
      bigBtnWidthContainer: (globalDwindowInfoata.windowWidth / 6) * globalData.rpxR,
      });


    if (this.data.update) {
      this._getInitData();
    }
    
    // 2，打印初始化参数
    var list = []
    var numList = []
    var j = 0
    for (var i = 20; i < 200; i += 10) {
      list[j] = i;
      j++
    }
    for (var i = 1; i < 10; i++) {
      numList[i - 1] = i
    }
    this.setData({
      buffSize: list,
      oneTimeData: list[0],
      printNum: numList,
      printerNum: numList[0],
      looptime: 0,
      currentTime: 1,
      lastData: 0,
      returnResult: "",
      buffIndex: 0,
      printNumIndex: 0,
      currentPrint: 1,
      isReceiptSend: false,
      isLabelSend: false,

      printTimes: 0,
      canConnect: false,
      printOk: false
    })
  },

  data: {
    bottomHeight: 240,
    formHeight: 480,
    isTishi: false,
    isTishiSave: false,
    lastInput: true,
    focusIndex: -1,
    isSellRegiste: false,
    toPrice: false,
    saveBatch: false,
    retName: "",
    batchId: null,
    sendSuccess: false,
    helpWeight: "0",
    scaleInput: false,
    buyUser: false,
    canSave: false,
    nickName:"",
  },

  onLoad: function (options) {
    this.setData({
      windowWidth: globalData.windowWidth * globalData.rpxR,
      windowHeight: globalData.windowHeight * globalData.rpxR,
      statusBarHeight: globalData.statusBarHeight * globalData.rpxR,
      numWidth: (globalData.windowWidth / 4) * globalData.rpxR - 40,
      numContainerWidth: (globalData.windowWidth / 4) * globalData.rpxR - 20,
      numHeight: (globalData.windowWidth / 4) * globalData.rpxR - 40,
      numContainerHeight: (globalData.windowWidth / 4) * globalData.rpxR - 20,
      btnWidth: (globalData.windowWidth / 8) * globalData.rpxR - 20,
      btnWidthContainer: (globalData.windowWidth / 8) * globalData.rpxR,
      bigBtnWidth: (globalData.windowWidth / 6) * globalData.rpxR - 20,
      bigBtnWidthContainer: (globalData.windowWidth / 6) * globalData.rpxR,
      url: apiUrl.server,
      todayDate: dateUtil.getWhichOnlyDate(0),
      orderTime: dateUtil.getOnlyTime(0),

      batchId: options.batchId,
      retName: options.retName,
      disId: options.disId,
      buyerUserId: options.buyerUserId,
      fromBuyer: options.fromBuyer,
      depId: options.depId,
      purUserId: options.purUserId,
      supplierId: options.supplierId
    })
    
    var jrdhUserInfo = wx.getStorageSync('jrdhUserInfo');
    if(jrdhUserInfo){
      this.setData({
        jrdhUserInfo: jrdhUserInfo
      })
    }
    this._getInitData();
    
  },

  _getInitData() {
    var that = this;
    load.showLoading("获取订货商品")
    getDisPurchaseGoodsBatchGb(this.data.batchId)
      .then(res => {
        load.hideLoading();
        if (res.result.code == 0) {
          this.setData({
            batch: res.result.data,
            batchStatus: res.result.data.gbDpbStatus,
            disId: res.result.data.gbDpbDistributerId,
          }) 
          
          if (res.result.data.gbDpbStatus == -1) {
            that._shareUserRead();
          }         
        }else{
          this.setData({
            billCancle: true,
          })
        } 
      })
  },

  



  _shareUserRead() {
   
    var that = this;
    var batch = that.data.batch;
    batch.gbDpbSellUserId = that.data.jrdhUserInfo.nxJrdhUserId;
    batch.gbDpbSellUserOpenId = that.data.jrdhUserInfo.nxJrdhWxOpenId;
    batch.gbDpbSupplierId = that.data.supplierId;
    sellUserReadDisBatchGb(batch)
      .then(res => {
        if (res.result.code == 0) {
          this.setData({
            isTishi: false,
            batch: res.result.data,
            batchStatus: res.result.data.gbDpbStatus,
          })
          
        }
      })
  },


  getSupplierBatch(e) {
   
    wx.redirectTo({
      url: '../supplierBills/supplierBills?sellUserId=' + this.data.batch.gbDpbSellUserId + '&disId=' + this.data.disId,
    })

  },




  toEditOrders() {
    supplierEditBatchGb(this.data.batch.gbDistributerPurchaseBatchId)
      .then(res => {
        if (res.result.code == 0) {
          this.setData({
            bill: res.result.data,
            batchStatus: res.result.data.gbDpbStatus,
          })
        }
      })
  },

  toEditOrdersNo() {
    wx.showToast({
      title: '请采购员解锁',
      icon: 'none'
    })
  },

  
  
  //1
  startSearch: function () {
    console.log("startSearchstartSearch")
    if (this.data.deviceId !== "-1") {
      var that = this
      wx.openBluetoothAdapter({
        success: function (res) {
          wx.getBluetoothAdapterState({
            success: function (res) {
              console.log('openBluetoothAdapter success', res)
              if (res.available) {
                if (res.discovering) {
                  wx.stopBluetoothDevicesDiscovery({
                    success: function (res) {
                      console.log(res)
                    }
                  })
                } else {
                  // that.startBluetoothDevicesDiscovery()
                  that.getBluetoothDevices()
                }
                // that.checkPemission()
              } else {
                wx.showModal({
                  title: '提示',
                  content: '本机蓝牙不可用',
                  showCancel: false
                })
              }
            },
          })
        },
        fail: function (e) {
          console.log(e)
          if (e.errCode === 10001) {
            wx.onBluetoothAdapterStateChange(function (res) {
              console.log('onBluetoothAdapterStateChange', res)
              if (res.available) {
                this.startBluetoothDevicesDiscovery()
              }
            })
          }

          wx.showModal({
            title: '提示',
            content: '蓝牙初始化失败，请到设置打开蓝牙',
            showCancel: false
          })
        }
      })
    } else {
      wx.navigateTo({
        url: '../../pSearchPrinter/pSearchPrinter',
      })
    }
  },


  getBluetoothDevices: function () { //获取蓝牙设备信息
    var that = this
    this.setData({
      isScanning: true
    })
    wx.startBluetoothDevicesDiscovery({
      success: function (res) {
        console.log(res)
        setTimeout(function () {
          wx.getBluetoothDevices({
            success: function (res) {
              var devices = []
              var num = 0
              for (var i = 0; i < res.devices.length; ++i) {
                if (res.devices[i].name != "未知设备") {
                  devices[num] = res.devices[i]
                  num++
                }
              }
              that.setData({
                list: devices,
                isScanning: false
              })
              // load.hideLoading()
              wx.stopBluetoothDevicesDiscovery({
                success: function (res) {
                  console.log("停止搜索蓝牙")
                }
              })
            },
          })
        }, 5000)
        that._connn();
      },
    })
  },



  _connn() {
    var that = this;
    wx.stopBluetoothDevicesDiscovery({
      success: function (res) {
        console.log(res)
      },
    })
    this.setData({
      serviceId: 0,
      writeCharacter: false,
      readCharacter: false,
      notifyCharacter: false
    })
    wx.showLoading({
      title: '正在连接',
    })
    wx.createBLEConnection({
      deviceId: this.data.deviceId,
      success: function (res) {
        console.log(res)
        that.getSeviceId()
      },
      fail: function (e) {
        // wx.showModal({
        //   title: '提示',
        //   content: '连接失败',
        //   showCancel: false
        // })
        if (e.errno !== 1509007) {
          wx.navigateTo({
            url: '../../pSearchPrinter/pSearchPrinter',
          })
        }

        console.log(e)

      },
      complete: function (e) {
        console.log(e)
        if (e.errno == 1509007) {
          that.setData({
            printOk: true,
          })
          that.getSeviceId()
        }
      }
    })
  },


  getSeviceId: function () {
    var that = this

    wx.getBLEDeviceServices({
      deviceId: this.data.deviceId,
      success: function (res) {
        that.setData({
          services: res.services
        })
        that.getCharacteristics()
      },
      fail: function (e) {
        console.log(e)
        wx.navigateTo({
          url: '../../pSearchPrinter/pSearchPrinter',
        })
      },
      complete: function (e) {
        // console.log(e)
      }
    })
  },

  getCharacteristics: function () {
    var that = this
    var list = this.data.services
    var num = this.data.serviceId
    var write = this.data.writeCharacter
    var read = this.data.readCharacter
    var notify = this.data.notifyCharacter
    wx.getBLEDeviceCharacteristics({
      deviceId: this.data.deviceId,
      serviceId: list[num].uuid,
      success: function (res) {
        console.log(res)
        for (var i = 0; i < res.characteristics.length; ++i) {
          var properties = res.characteristics[i].properties
          var item = res.characteristics[i].uuid
          if (!notify) {
            if (properties.notify) {
              that.data.notifyCharaterId = item
              that.data.notifyServiceId = list[num].uuid
              notify = true
            }
          }
          if (!write) {
            if (properties.write) {
              that.data.writeCharaterId = item
              that.data.writeServiceId = list[num].uuid
              write = true
            }
          }
          if (!read) {
            if (properties.read) {
              that.data.readCharaterId = item
              that.data.readServiceId = list[num].uuid
              read = true
            }
          }
        }
        if (!write || !notify || !read) {
          num++
          that.setData({
            writeCharacter: write,
            readCharacter: read,
            notifyCharacter: notify,
            serviceId: num
          })
          if (num == list.length) {
            wx.showModal({
              title: '提示',
              content: '找不到该读写的特征值',
              showCancel: false
            })
          } else {
            that.getCharacteristics()
          }
        } else {
          wx.showToast({
            title: '连接成功',
          })
          that.setData({
            printOk: true
          })
          // if(that.data.batchStatus == 0){
          //   that.receiptTest();
          // }else{
          //   that.receiptTestBill();
          // }
          that.receiptTestBill();
          
        }
      },
      fail: function (e) {
        console.log(e)
      },
      complete: function (e) {
        console.log("write:" + that.data.writeCharaterId)
        console.log("read:" + that.data.readCharaterId)
        console.log("notify:" + that.data.notifyCharaterId)
      }
    })
  },



// 票据测试方法
receiptTestBill: function () {
  wx.showToast({
    title: '准备打印票据',
  });
  var that = this;

  // 调用获取打印数组的方法，传入回调函数
  that._getPrintArr(function() {
    // 在数据获取成功后执行打印逻辑
    var command = esc.jpPrinter.createNew();
    command.init();
    console.log("开始打印");
    command.setPrintAndFeedRow(5);
    command.setSelectJustification(1); // 居中
    command.setCharacterSize(17); // 设置倍高倍宽
    command.setText(that.data.disInfo.gbDistributerName + "退货单");
    command.setPrint(); // 打印并换行
    command.setPrint(); // 打印并换行
    command.setSelectJustification(0); // 设置居左
    command.setCharacterSize(0);
    command.setText("日期: " + that.data.todayDate);
    command.setPrint(); // 打印并换行
    command.setPrint();
    command.setSelectJustification(0); // 设置居左
    command.setText("   商品");
    command.setAbsolutePrintPosition(228);
    command.setText("数量");
    command.setAbsolutePrintPosition(324);
    command.setText("单价");
    command.setAbsolutePrintPosition(420);
    command.setText("小计");
    command.setPrint();
    command.setText("================================================");
    command.setPrint();
    console.log("打印订单项");

    // 打印订单项
    that._printOrderTime(command);

    command.setSelectJustification(0); // 设置居左
    command.setText("“" + that.data.batch.nxJrdhWxNickName + "”为您提供最优的产品！");
    command.setPrint();
    command.setPrint();
    command.setPrintAndFeedRow(5);

    // 准备发送数据
    that.prepareSend(command.getData());
  });
},

// 票据测试方法
receiptTestBill: function () {
  console.log("receiptTestBill");
  wx.showToast({
    title: '准备数据',
  });
  var that = this;

  // 调用获取打印数组的方法，传入回调函数
  that._getPrintArr(function() {
    // 在数据获取成功后执行打印逻辑
    var command = esc.jpPrinter.createNew();
    command.init();
    console.log("开始打印");
    command.setPrintAndFeedRow(5);
    command.setSelectJustification(1); // 居中
    command.setCharacterSize(17); // 设置倍高倍宽
    command.setText(that.data.disInfo.gbDistributerName);
    command.setPrint(); // 打印并换行
    command.setPrint(); // 打印并换行
    command.setSelectJustification(0); // 设置居左
    command.setCharacterSize(0);
    command.setText("日期: " + that.data.todayDate);
    command.setPrint(); // 打印并换行
    command.setPrint();
    command.setSelectJustification(0); // 设置居左
    command.setText("   商品");
    command.setAbsolutePrintPosition(228);
    command.setText("数量");
    command.setAbsolutePrintPosition(324);
    command.setText("单价");
    command.setAbsolutePrintPosition(420);
    command.setText("小计");
    command.setPrint();
    command.setText("================================================");
    command.setPrint();
    console.log("打印订单项");

    // 打印订单项
    that._printOrderTime(command);

    command.setSelectJustification(0); // 设置居左
    command.setText("“" + that.data.batch.nxJrdhSellerEntity.nxJrdhWxNickName + "”为您提供最优的产品！");
    command.setPrint();
    command.setPrint();
    command.setPrintAndFeedRow(5);

    // 准备发送数据
    that.prepareSend(command.getData());
  });
},

// 获取打印数组的方法，接受回调函数
_getPrintArr: function(callback) {
  var that = this;
  supplierGetPrintBatchGb(this.data.batch.gbDistributerPurchaseBatchId)
    .then(res => {
      if (res.result.code == 0) {
        that.setData({
          printArr: res.result.data,
        });
        // 数据设置成功后，执行回调函数
        if (typeof callback === 'function') {
          callback();
        }
      }
    });
},



  _printOrderTime(command) {

    
      var ordersArr = this.data.printArr;
       console.log("_printOrderTime", ordersArr.length);
       console.log("_printOrderTime", ordersArr);

      for (var j = 0; j < ordersArr.length; j++) {
        var standardName = ordersArr[j].gbDistributerGoodsEntity.gbDgGoodsStandardname;
        var goodsName = ordersArr[j].gbDistributerGoodsEntity.gbDgGoodsName;
        var weight = ordersArr[j].gbDoWeight;
        var price = ordersArr[j].gbDoPrice;
        var subtotal = ordersArr[j].gbDoSubtotal;
        command.setText(j + 1 + ", ")
        
        command.setText(goodsName);
        console.log("orderArr.goodsName", goodsName);
        command.setAbsolutePrintPosition(228)
        command.setText(weight + standardName);
        command.setAbsolutePrintPosition(324)
        command.setText(price);
        command.setAbsolutePrintPosition(420)
        command.setText(subtotal);
        command.setPrint();
        console.log("orderArr.goodsName", subtotal);

        var orderRemark = ordersArr[j].gbDoRemark;
        if (orderRemark !== "null" && orderRemark.length > 0) {
          command.setText("   备注:" + orderRemark + "");
          command.setPrint();
        }
        command.setText("-----------------------------------------------")
        command.setPrint();

        //
      }
    

    command.setSelectJustification(2);
    command.setCharacterSize(1);
    command.setText("总计:-" + this.data.batch.gbDpbSubtotal + "元");
    console.log("orderArr.goodsName", this.data.batch.gbDpbSubtotal);

    command.setPrint();
    command.setText("================================================")
    command.setPrint();
  },


  saveTuihuo() {

    sellerReceiveReturnBill(this.data.batch)
      .then(res => {
        if (res.result.code == 0) {
          wx.redirectTo({
            url: '../jinriListWithLogin/jinriListWithLogin',
          })

        } else {
          wx.showToast({
            title: res.result.msg,
            icon: 'none'
          })
        }
      })
  },

  
  receiptTest: function () { //票据测试
  console.log("receiptTestreceiptTestjianhuodan----")
    wx.showToast({
      title: '准备数据',
    })
    var that = this;

    var command = esc.jpPrinter.createNew();
    command.init()

    command.setPrintAndFeedRow(5);
    command.setSelectJustification(1) //居中
    command.setCharacterSize(17); //设置倍高倍宽
    command.setText("拣货单");
    command.setPrint(); //打印并换行
    command.setSelectJustification(0) //设置居左 
    command.setCharacterSize(0);
    command.setText("日期: " + that.data.todayDate);
    command.setPrint(); //打印并换行

    var depName = that.data.retName;
    command.setText("客户: " + depName);
    command.setPrint();
    command.setSelectJustification(0) //设置居左
    command.setText("   商品")
    command.setAbsolutePrintPosition(196)
    command.setText("订货")
    command.setAbsolutePrintPosition(276)
    command.setText("数量")
    command.setPrint();
    command.setText("------------------------------------------------")
    command.setPrint();
    var purGoodsArr = that.data.batch.gbDPGEntities;

    for (var j = 0; j < purGoodsArr.length; j++) {
      // var brand = purGoodsArr[j].gbDgGoodsBrand;
      var standardName = purGoodsArr[j].gbDistributerGoodsEntity.gbDgGoodsStandardname;
      var goodsName = purGoodsArr[j].gbDistributerGoodsEntity.gbDgGoodsName;
      command.setCharacterSize(1);
      // if (brand !== null && brand.length > 0) {
      //   command.setText(brand + "-");
      // }
      command.setText(j + 1 + ". ");
      command.setText(goodsName);
      if (standardName !== '斤') {
        command.setText("(" + standardName + ")");
      }
      command.setPrint();

      var orderArr = purGoodsArr[j].gbDepartmentOrdersEntities;
      if (orderArr.length > 0) {
        for (var m = 0; m < orderArr.length; m++) {
          var depName = "";
          //nxOrder
          var gbDepartment = purGoodsArr[j].gbDepartmentOrdersEntities[m].gbDepartmentEntity;
          if (gbDepartment !== null) {
            depName = purGoodsArr[j].gbDepartmentOrdersEntities[m].gbDepartmentEntity.gbDepartmentName;
          } 
        console.log("depnamee", depName);
          var orderQuantity = purGoodsArr[j].gbDepartmentOrdersEntities[m].gbDoQuantity;
          var orderStandard = purGoodsArr[j].gbDepartmentOrdersEntities[m].gbDoStandard;
          console.log("orderQuantity", orderQuantity + orderStandard);
          command.setText(" " + depName + "  " + orderQuantity + orderStandard);
          command.setPrint();

        }
      }

      command.setText("------------------------------------------------")
      command.setPrint();

    }

    command.setPrint();
    command.setPrint();
    command.setPrint();
    command.setPrint();
    command.setPrint();
    command.setPrint();

    that.prepareSend(command.getData()) //准备发送数据

  },


  prepareSend: function (buff) { //准备发送，根据每次发送字节数来处理分包数量

    var that = this
    var time = that.data.oneTimeData;

    var looptime = parseInt(buff.length / time);
    var lastData = parseInt(buff.length % time);
    that.setData({
      looptime: looptime + 1,
      lastData: lastData,
      currentTime: 1,
    })
    that.Send(buff)
  },

  queryStatus: function () { //查询打印机状态
    var that = this
    var buf;
    var dateView;
    /*
    n = 1：传送打印机状态
    n = 2：传送脱机状态
    n = 3：传送错误状态
    n = 4：传送纸传感器状态
    */
    buf = new ArrayBuffer(3)
    dateView = new DataView(buf)
    dateView.setUint8(0, 16)
    dateView.setUint8(1, 4)
    dateView.setUint8(2, 2)
    wx.writeBLECharacteristicValue({
      deviceId: this.data.deviceId,
      serviceId: this.data.writeServiceId,
      characteristicId: this.data.writeCharaterId,
      value: buf,
      success: function (res) {
        console.log("发送成功")
        that.setData({
          isQuery: true
        })
      },
      fail: function (e) {
        wx.showToast({
          title: '发送失败',
          icon: 'none',
        })
        console.log(e)
        return;
      },
      complete: function () {

      }
    })

    wx.notifyBLECharacteristicValueChange({
      deviceId: this.data.deviceId,
      serviceId: this.data.notifyServiceId,
      characteristicId: this.data.notifyCharaterId,
      state: true,
      success: function (res) {
        wx.onBLECharacteristicValueChange(function (r) {
          console.log(`characteristic ${r.characteristicId} has changed, now is ${r}`)
          var result = ab2hex(r.value)
          console.log("返回" + result)
          var tip = ''
          if (result == 12) { //正常
            tip = "正常"
          } else if (result == 32) { //缺纸
            tip = "缺纸"
          } else if (result == 36) { //开盖、缺纸
            tip = "开盖、缺纸"
          } else if (result == 16) {
            tip = "开盖"
          } else if (result == 40) { //其他错误
            tip = "其他错误"
          } else { //未处理错误
            tip = "未知错误"
          }
          wx.showModal({
            title: '打印机状态',
            content: tip,
            showCancel: false
          })
        })
      },
      fail: function (e) {
        wx.showModal({
          title: '打印机状态',
          content: '获取失败',
          showCancel: false
        })
        console.log(e)
      },
      complete: function (e) {
        that.setData({
          isQuery: false
        })
        console.log("执行完成")
      }
    })
  },


  Send: function (buff) { //分包发送
    var that = this
    var currentTime = that.data.currentTime
    var loopTime = that.data.looptime
    var lastData = that.data.lastData
    var onTimeData = that.data.oneTimeData
    var printNum = that.data.printerNum
    var currentPrint = that.data.currentPrint
    var buf
    var dataView
    if (currentTime < loopTime) {
      buf = new ArrayBuffer(onTimeData)
      dataView = new DataView(buf)
      for (var i = 0; i < onTimeData; ++i) {
        dataView.setUint8(i, buff[(currentTime - 1) * onTimeData + i])
      }
    } else {
      buf = new ArrayBuffer(lastData)
      dataView = new DataView(buf)
      for (var i = 0; i < lastData; ++i) {
        dataView.setUint8(i, buff[(currentTime - 1) * onTimeData + i])
      }
    }
    console.log("第" + currentTime + "次发送数据大小为：" + buf.byteLength)
    if (buf.byteLength > 0) {
      wx.writeBLECharacteristicValue({
        deviceId: this.data.deviceId,
        serviceId: this.data.writeServiceId,
        characteristicId: this.data.writeCharaterId,
        value: buf,
        success: function (res) {
          var times = that.data.printTimes;
          that.setData({
            showOperation: false,
            printTimes: times + 1,
          })

          if (currentTime == loopTime) {
            //最后一次，保存订单
            // that._closeBLE();
            that.setData({
              printTimes: 0
            })

          }
        },
        fail: function (e) {
          wx.showToast({
            title: '打印第' + currentPrint + '张失败',
            icon: 'none',
          })
        },
        complete: function () {
          currentTime++
          if (currentTime <= loopTime) {
            that.setData({
              currentTime: currentTime
            })
            that.Send(buff)
          } else {
            if (currentPrint == printNum) {
              that.setData({
                looptime: 0,
                lastData: 0,
                currentTime: 1,
                isReceiptSend: false,
                currentPrint: 1
              })

            } else {
              currentPrint++
              that.setData({
                currentPrint: currentPrint,
                currentTime: 1,
              })
              that.Send(buff)
            }
          }
        }
      })
    } else {
      // that._closeBLE();
      that.setData({
        printTimes: 0
      })
    }

  },




  toBack(){
    wx.redirectTo({
      url: '../jinriListWithLogin/jinriListWithLogin',
    })
  },

})