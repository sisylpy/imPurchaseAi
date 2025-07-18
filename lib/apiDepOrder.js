import Promise from './bluebird'
import apiUrl from '../config.js'

var load = require('./load.js');


//





export const getNxGoodsIdsByGreatId = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'nxgoods/getNxGoodsIdsByGreatId/' +data,
      method: 'GET',
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
          icon: 'none'
        })
        
      }
    })
  })
}

export const getNxDisGoodsIdsByGreatId = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'nxdistributerfathergoods/getNxDisGoodsIdsByGreatId/' +data,
      method: 'GET',
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
          icon: 'none'
        })
        
      }
    })
  })
}



export const depGetTodayRecordSeconds = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'nxdistributerpaylist/depGetTodayRecordSeconds/' + data,
      method: 'GET',
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
          icon: 'none'
        })
      }
    })
  })
}


export const getBooks = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'nxdepartmentorders/getBooks',
      method: 'GET',
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
          icon: 'none'
        })
      }
    })
  })
}



/**
 * 批发商商品类别列表
 * @param {*} data 
 */
export const nxDepGetDisCataGoods = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'nxdistributerfathergoods/nxDepGetDisCataGoods' ,
      method: 'POST',
      data:{
        nxDisId: data.nxDisId,
        depId: data.depId,
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
      },
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
        })
       
      }
    })
  })
}



export const disGetDepGoodsCataGb = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdepartmentdisgoods/disGetDepGoodsCataGb' ,
      method: 'POST',
      data:{
        disId: data.disId,
        depId: data.depId
     },
     header: {
       "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
     },
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
          icon: 'none'
        })
      }
    })
  })
}


export const depGetDepGoodsCataGb = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdepartmentdisgoods/depGetDepGoodsCataGb' ,
      method: 'POST',
      data:{
        disId: data.disId,
        depId: data.depId
     },
     header: {
       "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
     },
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
          icon: 'none'
        })
      }
    })
  })
}



/**
 * 打印销售单据
 * @param {*} data 
 */
export const depPasteSearchGoods = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdepartmentorders/depPasteSearchGoods',
      method: 'POST',
      data,
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
          icon: 'none'
        })
      }
    })
  })
}


export const queryDepDisGoodsByQuickSearchJj = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'nxdistributergoods/queryDepDisGoodsByQuickSearchJj',
      method: 'POST',
      data: {
        disId: data.disId,
        searchStr: data.searchStr,
        depId: data.depId,
        gbDisId: data.gbDisId
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
      },
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
          icon: 'none',
        })
      }
    })
  })
}



export const getAccountApplysGb = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdepartmentbill/getAccountApplysGb' ,
      method: 'POST',
      data: {
        depFatherId: data.depFatherId,
        billId: data.billId
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
      },
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
          icon: 'none',
        })
      }
    })
  })
}

export const finishShixianBill = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdistributerpurchasebatch/finishShixianBill' ,
      method: 'POST',
      data,
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
      }
    })
  })
}


export const deleteDisBatchGb = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdistributerpurchasebatch/deleteDisBatchGb/' + data,
      method: 'GET',
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
        })
      }
    })
  })
}




/**
 * 获取订货组部门
 * @param {*} data 
 */
export const getSubDepartmentsGb = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdepartment/getSubDepartmentsGb/' + data,
      method: 'GET',
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
      }
    })
  })
}

export const sellerReceiveReturnBill = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdistributerpurchasebatch/sellerReceiveReturnBill',
      method: 'POST',
      data,
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
        })
      }
    })
  })
}




export const getJrdhUser = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'nxjrdhuser/getJrdhUser/' + data,
      method: 'GET',
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
        })
      }
    })
  })
}


export const updateJrdhUser = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'nxjrdhuser/updateJrdhUser',
      method: 'POST',
      data:{
        userName: data.userName,
        userId: data.userId,
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
      },
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
        })
      }
    })
  })
}


export const updateJrdhUserWithFile = (filePathList, userName,userId ) => { 
  return new Promise((resolve, reject) => {
     wx.uploadFile({
       url: apiUrl.apiUrl + 'nxjrdhuser/updateJrdhUserWithFile',//演示域名、自行配置
       filePath: filePathList[0],
       name: 'file',
       header: {
         "Content-Type": "multipart/form-data"
       },
       formData: {
        userName: userName,
        userId: userId,
       },
       success: function (res) {
         resolve({ result: res.data })
        
      
       },
       fail: function (e) {
         reject(e);
         load.hideLoading();
       },
 
     })
   })
 }




export const supplierEditBatchGb = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdistributerpurchasebatch/supplierEditBatchGb/' + data,
      method: 'GET',
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
        })
      }
    })
  })
}



export const finishPayPurchaseBatchGb = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdistributerpurchasebatch/finishPayPurchaseBatchGb',
      method: 'POST',
      data,
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
        })
      }
    })
  })
}


export const disCheckUnPayBillsGb = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdistributerpurchasebatch/disCheckUnPayBillsGb',
      method: 'POST',
      data:{
        disId: data.disId,
        supplierId: data.supplierId,
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
      },
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
        })
      }
    })
  })
}



export const sellerDistributerPurchaseBatchsGb = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdistributerpurchasebatch/sellerDistributerPurchaseBatchsGb',
      method: 'POST',
      data:{
        disId: data.disId,
        supplierId: data.supplierId,
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
      },
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
        })
      }
    })
  })
}


export const indexJrdhUserLoginJj = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'nxjrdhuser/indexJrdhUserLoginJj/' + data,   
      method: 'GET',
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
        })
      }
    })
  })
}


export const sellerFinishPurchaseGoodsBatchGb = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdistributerpurchasebatch/sellerFinishPurchaseGoodsBatchGb' ,
      method: 'POST',
      data,
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
        })
      }
    })
  })
}




export const sellerUpdatePurGoods = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdistributerpurchasegoods/sellerUpdatePurGoods' ,
      method: 'POST',
      data,
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
        })
      }
    })
  })
}




export const sellUserReadDisBatchGb = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdistributerpurchasebatch/sellUserReadDisBatchGb',
      method: 'POST', 
      data,   
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
          icon: 'none'
        })
      }
    })
  })
}


export const jrdhSellerRegisterWithFileGbJj = (filePathList, userName, code,admin,gbDisId,buyerUserId, gbDepId, purUserId) => { 
  return new Promise((resolve, reject) => {
     wx.uploadFile({
       url: apiUrl.apiUrl + 'nxjrdhuser/jrdhSellerRegisterWithFileGbJj',//演示域名、自行配置
       filePath: filePathList[0],
       name: 'file',
       header: {
         "Content-Type": "multipart/form-data"
       },
       formData: {
        userName: userName,
        code: code,
        admin: admin,
        gbDisId: gbDisId,
        buyerUserId: buyerUserId,
        gbDepId: gbDepId,
        purUserId: purUserId
       },
       success: function (res) {
         resolve({ result: res.data })
        
      
       },
       fail: function (e) {
         reject(e);
         load.hideLoading();
       },
 
     })
   })
 }




export const getDisPurchaseGoodsBatchGb = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdistributerpurchasebatch/getDisPurchaseGoodsBatchGb/' + data ,
      method: 'GET',
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
      }
    })
  })
}


export const whichJrdhUserLoginGbJj = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdepartmentuser/whichJrdhUserLoginGbJj',  
      method: 'POST',    
      data: {
        gbDisId: data.gbDisId,
        code: data.code,
        batchId: data.batchId,
        gbDepId: data.gbDepId,
        purUserId: data.purUserId
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
      },  
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
        })
      }
    })
  })
}


export const delAttem = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdepartmentgoodsstock/delAttem/' +data  ,
      method: 'GET',
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
          icon: 'none',
        })
      }
    })
  })
}



export const supplierGetStars = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdepartmentgoodsstock/supplierGetStars' ,
      method: 'POST',
      data: {
        supplierId: data.supplierId,
        goodsId: data.goodsId,
        startDate: data.startDate,
        stopDate: data.stopDate,
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
      },
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
          icon: 'none',
        })
      }
    })
  })
}


export const puraserReturnPurGoods = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdistributerpurchasegoods/puraserReturnPurGoods'  ,
      method: 'POST',
      data,
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
          icon: 'none',
        })
      }
    })
  })
}

export const finishSharePurGoodsBatchReturn = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdistributerpurchasebatch/finishSharePurGoodsBatchReturn/' + data ,
      method: 'GET',
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
          icon: 'none',
        })
      }
    })
  })
}
export const deleteReduceItem = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdepartmentgoodsstockreduce/deleteReduceItem/' + data ,
      method: 'GET',
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
          icon: 'none',
        })
      }
    })
  })
}



export const getDisGoodsBusiness = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdepartmentgoodsstock/getDisGoodsBusiness' ,
      method: 'POST',
      data: {
        disGoodsId: data.disGoodsId,
        startDate: data.startDate,
        stopDate: data.stopDate,
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
      },
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
          icon: 'none',
        })
      }
    })
  })
}



export const getDepGoodsBusiness = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdepartmentgoodsstock/getDepGoodsBusiness' ,
      method: 'POST',
      data: {
        depGoodsId: data.depGoodsId,
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
      },
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
          icon: 'none',
        })
      }
    })
  })
}
export const getDepGoodsBusinessDate = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdepartmentgoodsstock/getDepGoodsBusinessDate' ,
      method: 'POST',
      data: {
        depGoodsId: data.depGoodsId,
        startDate: data.startDate,
        stopDate: data.stopDate,
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
      },
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
          icon: 'none',
        })
      }
    })
  })
}

export const getDepGoodsOrderHistory = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdepartmentdisgoods/getDepGoodsOrderHistory' ,
      method: 'POST',
      data: {
        depGoodsId: data.depGoodsId,
        startDate: data.startDate,
        stopDate: data.stopDate,
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
      },
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
          icon: 'none',
        })
      }
    })
  })
}


export const getWhichDayReduce = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdepartmentgoodsstockreduce/getWhichDayReduce',
      method: 'POST',
      data: {
        startDate: data.startDate,
        stopDate: data.stopDate,
        searchDepIds: data.searchDepIds,
        disGoodsId: data.disGoodsId,
        type: data.type,
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
      },
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
          icon: 'none',
        })
      }
    })
  })
}




export const getGoodsEchartsByGoodsGrandId = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdepartmentgoodsdaily/getGoodsEchartsByGoodsGrandId' ,
      method: 'POST',
      data: {    
        startDate: data.startDate,
        stopDate: data.stopDate,       
        disGoodsGrandId: data.disGoodsGrandId,
        type: data.type,
       disId: data.disId,
       echartsType: data.echartsType,
       searchDepIds: data.searchDepIds,
       searchDepId: data.searchDepId
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
      },
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
          icon: 'none',
        })
      }
    })
  })
}




export const disGetDepGoodsDailyTotal = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdepartmentgoodsdaily/disGetDepGoodsDailyTotal' ,
      method: 'POST',
      data: {
        disId: data.disId,
        startDate: data.startDate,
        stopDate: data.stopDate,
        type: data.type,
        fenxiType: data.fenxiType,
        searchDepIds: data.searchDepIds,
        searchDepId: data.searchDepId,
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
      },
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
          icon: 'none',
        })
      }
    })
  })
}




export const getDistributerGoodsPriceMangement = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdepartmentgoodsstock/getDistributerGoodsPriceMangement' ,
      method: 'POST',
      data: {
        startDate: data.startDate,
        stopDate: data.stopDate,
        disId: data.disId,
        depId: data.depId,
        nxDisId: data.nxDisId
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
      },
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
      }
    })
  })
}





export const saveReportCost = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbreport/saveReportCost' ,
      method: 'POST',
      data,
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
          icon: 'none',
        })
      }
    })
  })
}


export const delteReport = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbreport/delteReport/' + data ,
      method: 'GET',
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
          icon: 'none',
        })
      }
    })
  })
}


export const getDisUserReports = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbreport/getDisUserReports' ,
      method: 'POST',
      data: {    
        startDate: data.startDate,
        stopDate: data.stopDate,
        disId: data.disId,
        userId: data.userId,
      
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
      },
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
          icon: 'none',
        })
      }
    })
  })
}





export const getDisPurchaserDateJingjing = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdistributerpurchasegoods/getDisPurchaserDateJingjing',
      method: 'POST',
      data: {
        startDate: data.startDate,
        stopDate: data.stopDate,
        disId: data.disId,
        type: data.type,
        searchDepIds: data.searchDepIds,
        searchDepId: data.searchDepId
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
      },
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
        })
      }
    })
  })
}


//



export const disGetNxDistributerPurGoodsDate = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdistributerpurchasegoods/disGetNxDistributerPurGoodsDate',
      method: 'POST',
      data: {
        startDate: data.startDate,
        stopDate: data.stopDate,
        disId: data.disId,
        
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
      },
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
          icon: 'none',
        })
      }
    })
  })
}


export const disGetDinghuoByDate = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdistributerpurchasebatch/disGetDinghuoByDate',
      method: 'POST',
      data: {
        startDate: data.startDate,
        stopDate: data.stopDate,
        disId: data.disId,
        searchDepIds: data.searchDepIds,
        searchDepId: data.searchDepId,
        type: data.type
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
      },
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
          icon: 'none',
        })
      }
    })
  })
}




export const disGetPurchaserGoodsByDate = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdistributerpurchasegoods/disGetPurchaserGoodsByDate',
      method: 'POST',
      data: {
        date: data.date,
        searchDepIds: data.searchDepIds,
        searchDepId: data.searchDepId,
        disId: data.disId
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
      },
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
          icon: 'none',
        })
      }
    })
  })
}

export const getNxGoodsFenxi = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdistributerpurchasegoods/getNxGoodsFenxi' ,
      method: 'POST',
      data: {
        gbDisId: data.gbDisId,
        nxDisId: data.nxDisId,
        startDate: data.startDate,
        stopDate: data.stopDate,
        type: data.type
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
      },
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
          icon: 'none',
        })
      }
    })
  })
}


//



export const getGbPurGoodsFenxi = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdistributerpurchasegoods/getGbPurGoodsFenxi' ,
      method: 'POST',
      data: {
        disGoodsId: data.disGoodsId,
        startDate: data.startDate,
        stopDate: data.stopDate,
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
      },
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
          icon: 'none',
        })
      }
    })
  })
}

export const getJrdhGoodsFenxi = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdistributerpurchasegoods/getJrdhGoodsFenxi' ,
      method: 'POST',
      data: {
        gbDisId: data.gbDisId,
        supplierId: data.supplierId,
        startDate: data.startDate,
        stopDate: data.stopDate,
        type: data.type,
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
      },
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
          icon: 'none',
        })
      }
    })
  })
}


export const changeStockStars = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdepartmentgoodsstock/changeStockStars' ,
      method: 'POST',
      data: {
        id: data.id,
        stars: data.stars,
        userId: data.userId
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
      },
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
          icon: 'none',
        })
      }
    })
  })
}


export const reduceAttachmentSaveWithFileStar000 = (filePathList, userName, id, stars ) => { 
  return new Promise((resolve, reject) => {
     wx.uploadFile({
       url: apiUrl.apiUrl + 'gbdepartmentgoodsstockreduceattachment/reduceAttachmentSaveWithFile',//演示域名、自行配置
       filePath: filePathList[0],
       name: 'file',
       formData: {
        userName: userName,
        id: id,
        stars: stars
       },
       success: function (res) {
         resolve({ result: res.data })
        
      
       },
       fail: function (e) {
         reject(e);
         load.hideLoading();
       },
 
     })
   })
 }

export const reduceAttachmentSaveWithFile = (filePathList, userName, id ) => { 
  return new Promise((resolve, reject) => {
     wx.uploadFile({
       url: apiUrl.apiUrl + 'gbdepartmentgoodsstockreduceattachment/reduceAttachmentSaveWithFile',//演示域名、自行配置
       filePath: filePathList[0],
       name: 'file',
       formData: {
        userName: userName,
        id: id,
       },
       success: function (res) {
         resolve({ result: res.data })
        
      
       },
       fail: function (e) {
         reject(e);
         load.hideLoading();
       },
 
     })
   })
 }


 export const reduceAttachmentSaveWithFileStar = (filePathList, userName, id,stars, userId ) => { 
  return new Promise((resolve, reject) => {
     wx.uploadFile({
       url: apiUrl.apiUrl + 'gbdepartmentgoodsstock/reduceAttachmentSaveWithFileStar',//演示域名、自行配置
       filePath: filePathList[0],
       name: 'file',
       formData: {
        userName: userName,
        id: id,
        stars,
        userId
       },
       success: function (res) {
         resolve({ result: res.data })
       },
       fail: function (e) {
         reject(e);
         load.hideLoading();
       },
 
     })
   })
 }



export const reduceAttachmentSaveWithFileStar1 = (filePathList, userName, id, stars, userId) => {
  return new Promise((resolve, reject) => {
    const uploadPromises = filePathList.map((filePath) => {
      return new Promise((resolveUpload, rejectUpload) => {
        wx.uploadFile({
          url: apiUrl.apiUrl + 'gbdepartmentgoodsstock/reduceAttachmentSaveWithFileStar',
          filePath,         // One image path at a time
          name: 'file',
          formData: {
            userName,
            id,
            stars,
            userId
          },
          success: function(res) {
            resolveUpload(res.data);  // Collect upload response
          },
          fail: function(err) {
            rejectUpload(err);
          }
        });
      });
    });

    // Wait for all file uploads to finish
    Promise.all(uploadPromises)
      .then(results => {
        // Each item in 'results' is res.data from the corresponding upload
        resolve({ result: results });
      })
      .catch(error => {
        reject(error);
      });
  });
};



 export const saveDepWasteGoodsStock = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdepartmentgoodsstock/saveDepWasteGoodsStock' ,
      method: 'POST',
      data,
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
          icon: 'none',
        })
      }
    })
  })
}

 export const saveDepReturnGoodsStock = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdepartmentgoodsstock/saveDepReturnGoodsStock' ,
      method: 'POST',
      data,
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
          icon: 'none',
        })
      }
    })
  })
}





export const saveDepProduceGoodsStock = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdepartmentgoodsstock/saveDepProduceGoodsStock' ,
      method: 'POST',
      data,
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
          icon: 'none',
        })
      }
    })
  })
}

export const saveDepLossGoodsStock = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdepartmentgoodsstock/saveDepLossGoodsStock' ,
      method: 'POST',
      data,
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
          icon: 'none',
        })
      }
    })
  })
}


export const getDisGoodsStock = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdepartmentgoodsstock/getDisGoodsStock/' + data ,
      method: 'GET',
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
          icon: 'none',
        })
      }
    })
  })
}




export const getDisGoodsOutEveryDay = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdepartmentgoodsstock/getDisGoodsOutEveryDay' ,
      method: 'POST',
      data: {
        disGoodsId: data.disGoodsId,
        startDate: data.startDate,
        stopDate: data.stopDate,
        depId: data.depId,
        searchDepIds: data.searchDepIds
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
      },
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
          icon: 'none',
        })
      }
    })
  })
}



//

export const getDisGoodsPurList = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdistributerpurchasegoods/getDisGoodsPurList' ,
      method: 'POST',
      data: {
        disGoodsId: data.disGoodsId,
        startDate: data.startDate,
        stopDate: data.stopDate,
        depId: data.depId
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
      },
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
          icon: 'none',
        })
      }
    })
  })
}



export const getDisGoodsBusinessTypeJj = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdepartmentgoodsstock/getDisGoodsBusinessTypeJj' ,
      method: 'POST',
      data: {
        disGoodsId: data.disGoodsId,
        startDate: data.startDate,
        stopDate: data.stopDate,
        disId: data.disId,
        searchDepIds: data.searchDepIds
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
      },
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
          icon: 'none',
        })
      }
    })
  })
}


/**
 * 删除批发商订货规格
 * @param {*} data 
 */
export const gbDisDeleteStandard = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdistributerstandard/gbDisDeleteStandard/' + data ,
      method: 'GET',
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
        })
      }
    })
  })
}





export const getDate = () => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdistributer/getDate' ,
      method: 'GET',
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
          icon: 'none',
        })
      }
    })
  })
}



export const saveNxStandard = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'nxstandard/saveNxStandard',
      method: 'POST',
      data,
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
          icon: 'none',
        })
      }
    })
  })
}

export const purUserSaveMendain = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdepartment/purUserSaveMendain',
      method: 'POST',
      data,
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
          icon: 'none',
        })
      }
    })
  })
}






export const saveGbDisGoodsLinshi = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdistributergoods/saveGbDisGoodsLinshi',
      method: 'POST',
      data,
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
          icon: 'none',
        })
      }
    })
  })
}




export const saveLinshiGoodsGb = (filePathList, goodsName,standard, detail,disId, toDepId, depId ) => { 
  return new Promise((resolve, reject) => {
     wx.uploadFile({
       url: apiUrl.apiUrl + 'gbdistributergoods/saveLinshiGoodsGb',//演示域名、自行配置
       filePath: filePathList[0],
       name: 'file',
       header: {
         "Content-Type": "multipart/form-data"
       },
       formData: {
        goodsName: goodsName,
        standard: standard,
        detail: detail,
        disId: disId,
        toDepId: toDepId,
        depId: depId
       },
       success: function (res) {
         resolve({ result: res.data })
        
      
       },
       fail: function (e) {
         reject(e);
         load.hideLoading();
       },
 
     })
   })
 }



export const queryDepDisGoodsByQuickSearchGb = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'nxgoods/queryDepDisGoodsByQuickSearchGb',
      method: 'POST',
      data: {
        disId: data.disId,
        searchStr: data.searchStr,
        depId: data.depId
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
      },
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
          icon: 'none',
        })
      }
    })
  })
}




/**
 * 部门获取订货群配送商品
 * @param {*} data 
 */
export const depGetDepGoodsGbCata = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdepartmentdisgoods/depGetDepGoodsGbCata'  ,
      method: 'POST',
      data: {
        depId: data.depId,
        fatherId: data.fatherId,
        controlString: data.controlString,
        isPrice: data.isPrice,
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
      },
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
      }
    })
  })
}


/**
 * 部门获取订货群配送商品
 * @param {*} data 
 */
export const depGetDepGoodsByFatherId = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdepartmentdisgoods/depGetDepGoodsByFatherId'  ,
      method: 'POST',
      data: {
        depId: data.depId,
        fatherId: data.fatherId,
        controlString: data.controlString,
        isPrice: data.isPrice,
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
      },
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
      }
    })
  })
}

export const gbDepGetNxFatherGoods = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'nxgoods/gbDepGetNxFatherGoods' ,
      method: 'POST',
      data:{
        depId: data.depId,
        fatherId: data.fatherId,
        limit: data.limit,
        page: data.page,
        disId: data.disId
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
      },
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
      }
    })
  })
}


export const saveGbOrderJj = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdepartmentorders/saveOrdersGbJj' ,
      method: 'POST',
      data: data,
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
      }
    })
  })
}


export const saveGbOrderJjSx = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdepartmentorders/saveOrdersGbJjSx' ,
      method: 'POST',
      data: data,
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
      }
    })
  })
}

export const saveOrdersGbJjAndSaveDepGoods = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdepartmentorders/saveOrdersGbJjAndSaveDepGoods' ,
      method: 'POST',
      data: data,
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
      }
    })
  })
}



export const saveOrdersGbJjAndSaveDepGoodsSx = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdepartmentorders/saveOrdersGbJjAndSaveDepGoodsSx' ,
      method: 'POST',
      data: data,
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
      }
    })
  })
}

export const saveOrdersGbJjAndSaveGoodsSx = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdistributergoods/saveOrdersGbJjAndSaveGoodsSx' ,
      method: 'POST',
      data: data,
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
      }
    })
  })
}


export const saveOrdersGbJjAndSaveGoods = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdistributergoods/saveOrdersGbJjAndSaveGoods' ,
      method: 'POST',
      data: data,
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
      }
    })
  })
}



/**
 * 删除订货申请
 * @param {*} data 
 */
export const deleteOrderGb = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdepartmentorders/deleteOrderGb/' + data ,
      method: 'GET',
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
      }
    })
  })
}



/**
 * 批发商商品类别列表
 * @param {*} data 
 */
export const gbDepGetNxFatherGoodsByGrandId = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'nxgoods/gbDepGetNxFatherGoodsByGrandId' ,
      method: 'POST',
      data:{
        depId: data.depId,
        fatherId: data.fatherId,
        disId: data.disId
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
      },
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
        })
       
      }
    })
  })
}


/**
 * 添加批发商订货规格
 * @param {*} data 
 */
export const gbDisSaveStandard = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdistributerstandard/gbDisSaveStandard' ,
      method: 'POST',
      data,
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
        })
      }
    })
  })
}

//
/**
 * 修改订货申请
 * @param {*} data 
 */
export const updateOrderGbJjSx = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdepartmentorders/updateOrderGbJjSx' ,
      method: 'POST',
      data:{
        id: data.id,
        standard: data.standard,
        weight: data.weight,
        remark: data.remark
     },
     header: {
       "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
     },
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
      }
    })
  })
}



//
/**
 * 修改订货申请
 * @param {*} data 
 */
export const updateOrderGbJj = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdepartmentorders/updateOrderGbJj' ,
      method: 'POST',
      data:{
        id: data.id,
        standard: data.standard,
        weight: data.weight,
        remark: data.remark
     },
     header: {
       "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
     },
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
      }
    })
  })
}




export const giveGreatGrandId = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'nxgoods/giveGreatGrandId/' + data ,
      method: 'GET',
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
      }
    })
  })
}


export const gbDepGetNxCataGoods = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'nxgoods/gbDepGetNxCataGoods' ,
      method: 'POST',
      data:{
        gbDisId: data.gbDisId,
        depId: data.depId,
     },
     header: {
       "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
     },
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
      }
    })
  })
}



/**
 * 新首页
 * @param {*} data 
 */
export const depGetApplyGb = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdepartmentorders/depGetApplyGb/' +data ,
      method: 'GET',
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
      }
    })
  })
}

//

export const depGetApplyAiFather = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdepartmentorders/depGetApplyAiFather/' +data ,
      method: 'GET',
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
      }
    })
  })
}

export const depGetApplyAiByTime = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdepartmentorders/depGetApplyAiByTime/' +data ,
      method: 'GET',
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
      }
    })
  })
}

export const finishSelfPurGoodsOrdersCostBundle = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdistributerpurchasegoods/finishSelfPurGoodsOrdersCostBundle'  ,
      method: 'POST',
      data,
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
          icon: 'none'
        })
      }
    })
  })
}


//


// export const depGetDepGoodsByCategory = (data) => {
//   return new Promise((resolve, reject) => {
//     wx.request({
//       url: apiUrl.apiUrl + 'gbdepartmentdisgoods/depGetDepGoodsByCategory' ,
//       method: 'POST',
//       data:{
//         depId: data.depId,
//         limit: data.limit,
//         page: data.page,
//         greatId: data.greatId
//       },
//       header: {
//         "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
//       },
      
//       success: (res) => {
//         resolve({ result: res.data })
//       },
//       fail: (e) => {
//         reject(e);
//         load.hideLoading();
//       }
//     })
//   })
// }



export const depGetDepGoodsGbPage = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdepartmentdisgoods/depGetDepGoodsGbPage' ,
      method: 'POST',
      data:{
        depId: data.depId,
        limit: data.limit,
        page: data.page,
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
      },
      
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
      }
    })
  })
}

export const disGetDepGoodsGbPage = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdepartmentdisgoods/disGetDepGoodsGbPage' ,
      method: 'POST',
      data:{
        disId: data.disId,
        limit: data.limit,
        page: data.page,
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
      },
      
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
      }
    })
  })
}

/**
 * 部门获取订货群配送商品
 * @param {*} data 
 */
export const depGetDepGoodsGb = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdepartmentdisgoods/depGetDepGoodsGb' ,
      method: 'GET',
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
      }
    })
  })
}




export const getBillApplysGbDep = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'nxdepartmentbill/getBillApplysGbDep' ,
      method: 'POST',
      data:{
        billId: data.billId,
        depFatherId: data.depFatherId,
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
      },
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
          icon: 'none'
        })
      }
    })
  })
}


export const searchYishangGoods = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'nxdistributer/searchYishangGoods' ,
      method: 'POST',
      data:{
        disId: data.disId,
        searchStr: data.searchStr,
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
      },

      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
        })
      }
    })
  })
}



export const searchYishangGoodsByNxGoods = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'nxdistributer/searchYishangGoodsByNxGoods' ,
      method: 'POST',
      data:{
        disId: data.disId,
        nxGoodsId: data.nxGoodsId,
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
      },

      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
        })
      }
    })
  })
}






export const finishSharePurGoodsBatchIsAuto = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdistributerpurchasebatch/finishSharePurGoodsBatchIsAuto',
      method: 'POST',
      data:{
        batchId: data.batchId,
        isAuto: data.isAuto,
        payType: data.payType
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
      },
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
        })
      }
    })
  })
}
export const finishSharePurGoodsBatch = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdistributerpurchasebatch/finishSharePurGoodsBatch',
      method: 'POST',
      data,
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
        })
      }
    })
  })
}


//



export const shixianGetAppOrders = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdepartmentorders/shixianGetAppOrders',
      method: 'POST',
      data:{
        disId: data.disId,
        depId: data.depId,
        appDepId: data.appDepId,
        nxDisId: data.nxDisId
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
      },
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
        })
      }
    })
  })
}


export const gbGetAppOrders = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdepartmentorders/gbGetAppOrders',
      method: 'POST',
      data:{
        disId: data.disId,
        depId: data.depId,
        appDepId: data.appDepId,
        nxDisId: data.nxDisId
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
      },
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
        })
      }
    })
  })
}

//


export const deleteDisPurAndNxDataItem = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdistributerpurchasegoods/deleteDisPurAndNxDataItem/' + data,
      method: 'GET',
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
        })
      }
    })
  })
}
export const deleteDisPurBatchGbItem = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdistributerpurchasebatch/deleteDisPurBatchGbItem/' + data,
      method: 'GET',
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
        })
      }
    })
  })
}

export const jingjingGetBuyingGoodsGb = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdistributerpurchasebatch/jingjingGetBuyingGoodsGb' ,
      method: 'POST',
      data:{
        disId: data.disId,
        depId: data.depId,
        appDepId: data.appDepId
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
      },

      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
        })
      }
    })
  })
}





export const getPurchaseGoodsGb = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdistributerpurchasegoods/getPurchaseGoodsGb/' +data,
      method: 'GET',
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
        })
      }
    })
  })
}



/**
 * 批发商管理员注册
 * @param {} data 
 */
export const saveDisPurGoodsBatchGb = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdistributerpurchasebatch/saveDisPurGoodsBatchGb',
      method: 'POST',
      data,
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
        })
      }
    })
  })
}

//


export const getPurchaseGoodsGbWithTabCountWithNxDisId = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdistributerpurchasegoods/getPurchaseGoodsGbWithTabCountWithNxDisId',
      method: 'POST',
      data:{
        depId: data.depId,
        disId: data.disId,
        appDepId: data.appDepId,
        nxDisId: data.nxDisId
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
      },
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
        })
      }
    })
  })
}


export const getPurchaseGoodsGbWithTabCount = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdistributerpurchasegoods/getPurchaseGoodsGbWithTabCount',
      method: 'POST',
      data:{
        depId: data.depId,
        disId: data.disId,
        appDepId: data.appDepId,
        nxDisId: data.nxDisId
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
      },
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
        })
      }
    })
  })
}




export const getDepBills = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiUrl.apiUrl + 'gbdepartmentbill/getDepBills'  ,
      method: 'POST',
      data: {
        depFatherId: data.depFatherId,
        startDate: data.startDate,
        stopDate: data.stopDate,
        issueDepId: data.issueDepId,
        nxDisId: data.nxDisId
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
      },
      success: (res) => {
        resolve({ result: res.data })
      },
      fail: (e) => {
        reject(e);
        load.hideLoading();
        wx.showToast({
          title: '请检查网络',
        })
      }
    })
  })
}


export const disGetPayListDetail = (data) => { 
  return new Promise((resolve, reject) => {
     wx.request({
       url: apiUrl.apiUrl + 'gbdistributerpaylist/disGetPayListDetail' ,//演示域
       method: 'POST',
       data:{
         disId: data.disId,
         limit: data.limit,
         page: data.page,
       },
       header: {
         "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
       },
       success: function (res) {
         resolve({ result: res.data })
       },
       fail: function (e) {
         reject(e);
         load.hideLoading();
       },
 
     })
   })
 }



export const disPayUser = (data) => { 
  return new Promise((resolve, reject) => {
     wx.request({
       url: apiUrl.apiUrl + 'gbdistributerpay/disPayUser',//演示域
       method: 'POST',
       data: {
        payId: data.payId,
        openId: data.openId,
        subtotal: data.subtotal
       },
       header: {
         "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
       },
       success: function (res) {
         resolve({ result: res.data })

       },
       fail: function (e) {
         reject(e);
         load.hideLoading();
       },
 
     })
   })
 }