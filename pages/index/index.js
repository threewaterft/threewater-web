//index.js
const app = getApp();

Page({
  data: {
    avatarUrl: './user-unlogin.png', 
    tipUrl: './tip.png',
    telUrl:'./tel.png',
    locationUrl: './location.png',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',
    current: 'homepage',
    array:[{},{},{},{},{},{},{},{},{},{},{},{},{}]
  },
  getUserInfo(e){
    console.log(JSON.stringify(e,null,'\t'));
    app.globalData.userInfo = e.detail.userInfo;
  },
  handleChange({ detail }) {
   
    if (detail.key == "publishgoods"){
      wx.redirectTo({
        url: '../shopCar/shopCar'
      })
    } else if (detail.key == "shop"){
      wx.redirectTo({
        url: '../index/index'
      }) 
    } else if (detail.key == "mine"){
      wx.redirectTo({
        url: '../mine/mine'
      }) 
    }
    // this.setData({
    //   current: detail.key
    // }); 
  },
  onLoad: function() {
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    }

    wx.login({
      success:function(res){
        console.log(JSON.stringify(res, null, '\t'));
        if(res.code){
           wx.request({ 
             url:'http://three-water.club:8080/login',
             method:"post",
             header:{
               'content-type':'application/x-ww-form-urlencoded'
             },
             data:{
               code:res.code
             }
           });
        }
      },
      fail:function(res){
        console.log(JSON.stringify(res,null,'\t'));
      }
    });

    // 获取用户信息
    wx.getSetting({ 
      success: res => {
        console.log(JSON.stringify(res,null,'\t'));
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo
              })
            }
          })
        }
      }
    })
  },

  onGetUserInfo: function(e) {
    if (!this.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  },

  onGetOpenid: function() {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.openid = res.result.openid
        wx.navigateTo({
          url: '../userConsole/userConsole',
        })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
        wx.navigateTo({
          url: '../deployFunctions/deployFunctions',
        })
      }
    })
  },

  // 上传图片
  doUpload: function () {
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {

        wx.showLoading({
          title: '上传中',
        })

        const filePath = res.tempFilePaths[0]
        
        // 上传图片
        const cloudPath = 'my-image' + filePath.match(/\.[^.]+?$/)[0]
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            console.log('[上传文件] 成功：', res)

            app.globalData.fileID = res.fileID
            app.globalData.cloudPath = cloudPath
            app.globalData.imagePath = filePath
            
            wx.navigateTo({
              url: '../storageConsole/storageConsole'
            })
          },
          fail: e => {
            console.error('[上传文件] 失败：', e)
            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
          },
          complete: () => {
            wx.hideLoading()
          }
        })

      },
      fail: e => {
        console.error(e)
      }
    })
  },

})
