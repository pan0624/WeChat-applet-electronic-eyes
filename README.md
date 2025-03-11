

# 校园充电站嗅探项目
本项目文件位于example文件夹中，index.wxml即index.html index.js与web编程使用方法一致
## 来点电小程序分析及嗅探
### 分析抓包流量


https://api.power.powerliber.com/client/1/device/post-list
通过token，client_id，devices_id检验，
devices_id=242043 即充电桩群位置编号
暂时未知是否含其他校验方式

token无过期机制，新建用户获取永久token即可

token与ua数据不绑定

返回响应中获取相关信息如下
```js
"id":457800,充电桩号，顺序+1连接
"chargre_status":1,是否有设备在充电，1为由设备正在充电，0为充电桩空闲
"time_consumed":535,疑似已充电时间
"power":21.5，实时功率
```
## 小程序的搭建
## 核心集合功能的实现及图形化界面
- python脚本实现返回空闲桩信息
```python
import requests  
  
# powerliber返回充电桩数据固定网址  
url = 'https://api.power.powerliber.com/client/1/device/port-list'  
  
# 发送登录请求并返回不同充电桩的响应内容  
def login(num):  
    # 请求参数  
    url = "https://api.power.powerliber.com/client/1/device/port-list"  
    headers = {  
        "Content-Type": "application/x-www-form-urlencoded"  
    }  
  
    device_ids = [ "242043","268217"]  # 不同的 device_id  
  
    device_id_index = num-1  # 当前访问的 device_id 索引  
    device_id = device_ids[device_id_index]  
  
    data = {  
        "token": "2e0ae723ad54430d889a60a318aef85a",  
        "client_id": "1",  
        "app_id": "dd",  
        "device_id": device_id  
    }  
    response = requests.post(url, headers=headers, data=data)  
    return response.json()  
  
  
if __name__ == '__main__':  
  
    innum = input("please input number to choice which charge place ,3 left : 1,3 right: 2\n")  
    num = int(innum)  
    # 发送登录请求并解析响应内容  
    response_data = login(num)  
    for idx, item in enumerate(response_data["data"]["list"]):  
        id = item["id"]  
        charge_status = item["charge_status"]  
        power = item["power"]  
        time_consumed = item["time_consumed"]  
  
        if idx == 0:  
            first_id = id  # 记录第一个id的值  
  
        current_id = id - first_id + 1  # 计算当前id的值  
  
  
        if charge_status == 0:  
            print("empty 充电桩ID")  
            print(current_id)  
            print()  
  
  
    # print(response_text)
```
这样确认了后端api完全无验证，只需对应device_id即可，==token==无限制


### 充电桩信息获取
该脚本用于微信小程序中获取充电桩信息，通过调用后端接口并传递不同的充电桩设备ID，获取相应的充电桩数据。

#### 核心功能

##### 1. 页面数据初始化

```javascript
data: {
  chargers: [], // 存储充电桩信息的数组
  selectedButtonIndex: null // 当前选中的按钮索引
}
```

- `chargers`：用于存储从后端获取的充电桩信息列表。
- `selectedButtonIndex`：记录当前用户选中的按钮索引，用于界面交互。

##### 2. 获取充电桩信息

```javascript
runScript: function (deviceId) {
  const that = this;

  wx.request({
    url: 'https://api.power.powerliber.com/client/1/device/port-list',
    method: 'POST',
    header: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data: {
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
}
```

- **功能**：向后端接口发送POST请求，获取指定设备ID的充电桩信息。
- **参数**：`deviceId`（字符串）- 需要查询的充电桩设备ID。
- **流程**：
  1. 使用`wx.request`发起网络请求。
  2. 设置请求头为`application/x-www-form-urlencoded`。
  3. 在请求体中携带认证信息和设备ID。
  4. 接收后端返回的数据，对充电桩列表进行处理。
  5. 根据充电桩状态筛选出可用的充电桩。
  6. 更新页面数据，将处理后的充电桩信息存储到`chargers`数组中。

##### 3. 按钮点击事件处理

```javascript
runScript1: function () {
  this.setData({
    selectedButtonIndex: 1
  });
  this.runScript("242043");// 调用runScript函数并传递不同的设备ID参数
},
// 其他类似方法 runScript2 至 runScript9
```

- **功能**：处理用户点击不同按钮的事件，设置选中状态并获取对应充电桩信息。
- **实现**：
  - 设置`selectedButtonIndex`为当前按钮索引，更新界面选中状态。
  - 调用`runScript`方法，传递预设的设备ID，获取该充电桩的信息。

##### 补充

1. 在小程序页面中绑定按钮点击事件到`runScript1`至`runScript9`方法。
2. 点击按钮后，将触发对应的网络请求，获取指定充电桩设备的信息。
3. 获取到的数据将更新到页面的`chargers`数组中，可在界面上展示充电桩的可用状态。

### 小程序界面文件
实现充电桩查询的基本功能，通过按钮选择不同区域，动态展示空闲充电桩信息，为用户提供便捷的充电桩查询服务。后续可进一步优化界面样式和交互体验。
#### 界面布局

##### 按钮区域与事件绑定

```html
<view class="page__ft">
  <button size="mini" type="primary" plain="{{index !== selectedButtonIndex}}" data-index="{{index}}" bindtap="runScript1" style="background-color:{{1 === selectedButtonIndex ? 'green' : ''}}">三食堂左侧</button>
  <!-- 其他类似按钮 -->
</view>
```

- **功能**：提供多个迷你按钮，每个按钮对应一个充电桩区域。
- **样式**：按钮采用主色调，选中时背景色变为绿色。
- **事件绑定**：点击按钮时触发对应的`runScript`函数，并传递按钮索引。

##### 数据展示区域

```html
<view class="page__bd">
  <div class="weui-cells__title">空充电桩ID:</div>
  <div class="weui-cells">
    <block wx:for="{{chargers}}" wx:key="id">
      <block wx:if="{{item.id}}">
        <view class="weui-cell">
          <view class="weui-cells__title">{{item.id}}</view>
        </view>
      </block>
    </block>
  </div>
</view>
```

- **功能**：动态展示空闲充电桩的ID列表。
- **数据绑定**：通过`wx:for`循环渲染`chargers`数组。
- **条件渲染**：仅显示有空闲充电桩的ID。

#### 核心交互逻辑

##### 按钮点击处理

每个按钮点击时会设置当前选中的按钮索引，并调用获取充电桩信息的函数，传递相应的设备ID参数。

##### 充电桩信息获取与展示

1. **网络请求**：调用`wx.request`发送POST请求到后端接口，获取充电桩数据。
2. **数据处理**：根据返回的数据更新页面显示，筛选出空闲充电桩。
3. **界面更新**：将处理后的数据存储到`chargers`数组中，触发页面重新渲染。

![image.png](https://s2.loli.net/2025/03/11/TSLBxICiwDoJMFr.png)


### 目前完成了小程序的初步功能，实现了梅兰苑的查询，但是前端界面应该后期会重写，其他功能暂定，可能访问人数上来后会继续推进
![gh_b4b859c6df67_258 (1).jpg](https://s2.loli.net/2023/10/12/4yJcM2DoVz8UA1Y.jpg)

### 当设定充电站空闲时自动提醒
### 可能有的广告接口以及付费接口
### 源码
git上传到github
### 网站
重构项目，迁移到web网站，托管到在线网站平台
#### 结构
- 标题
- body中ui主体
- function.js 中书写主体函数内容，每个按键对应的函数以及参数
- `下拉列表选择参数，传递id属性，根据id传参确定函数`
- 不同按钮跳转到子界面
- 子界面 指定位置按钮执行不同查询函数
- 主函数为post请求传输模版，不同函数不同传参调用主函数，同时修改显示区标题内容
- 展示区上方标题
- 展示区 返回 空桩id 
- 空桩id显示 12个显示窗口 可用为白色 占用为绿色 正中显示id 
- example.css存储样式表
- 一个下拉列表表示一个区域
- 统一ui

## 后记
由于微信小程序目前的开发者身份需要交费获取，后续开发工作暂且搁置。