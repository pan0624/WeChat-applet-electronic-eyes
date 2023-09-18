Page({
  data: {
    chargers: [],
  },
  onLoad: function () {
    // 页面加载时不运行脚本
  },
  runScript: function (deviceId) {
    const that = this;

    wx.request({
      url: 'https://api.power.powerliber.com/client/1/device/port-list',
      method: 'POST',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: {
        //2e0ae723ad54430d889a60a318aef85a
        token: "aaa",
        client_id: "1",
        app_id: "dd",
        device_id: deviceId // 使用传递的设备ID参数
      },
      success: function (res) {
        const response_data = res.data;
        const chargers = response_data.data.list.map((item, idx) => {
          const id = item.id;
          const charge_status = item.charge_status;
          const power = item.power;
          const time_consumed = item.time_consumed;

          const current_id = id - response_data.data.list[0].id + 1;

          if (charge_status == 0) {
            return {
              id: current_id,
            };
          }
        });

        // 检查充电桩区域是否有空桩
        const allChargersEmpty = chargers.every((charger) => charger === undefined);

        if (allChargersEmpty) {
          chargers.push({ id: '无可用充电桩' });
        }

        that.setData({
          chargers: chargers
        });
      },
      fail: function (res) {
        console.log("请求失败:", res);
      }
    });
  },
  runScript1: function () {
    this.runScript("242043"); // 调用runScript函数并传递不同的设备ID参数
  },
  runScript2: function () {
    this.runScript("268217"); // 调用runScript函数并传递不同的设备ID参数
  },
  runScript3: function () {
    this.runScript("409084"); // 调用runScript函数并传递不同的设备ID参数
  },
  runScript4: function () {
    this.runScript("409082"); // 调用runScript函数并传递不同的设备ID参数
  },
  runScript5: function () {
    this.runScript("409081"); // 调用runScript函数并传递不同的设备ID参数
  },
  runScript6: function () {
    this.runScript("240733"); // 调用runScript函数并传递不同的设备ID参数
  },
  runScript7: function () {
    this.runScript("240734"); // 调用runScript函数并传递不同的设备ID参数
  },
  runScript8: function () {
    this.runScript("228179"); // 调用runScript函数并传递不同的设备ID参数
  },
  runScript9: function () {
    this.runScript("228086"); // 调用runScript函数并传递不同的设备ID参数
  }
});
