import { apiConfig } from '../config/config';
const sign = require('../utils/sign');

// 生成图片
export async function generateDreamImage(text: string): Promise<string> {
  try {
    console.log('\n=== 开始生成图片 ===')
    console.log('输入参数:', text)
    
    const requestData = {
      model: 'flux-schnell',
      input: {
        prompt: text
      },
      parameters: {
        size: '768*512',
        steps: 4  // flux-schnell 模型官方默认 steps 为4
      }
    }
    
    console.log('请求数据:', JSON.stringify(requestData, null, 2))

    // 获取认证信息
    const auth = {
      'Authorization': sign.getAuth().Authorization,
      'Content-Type': 'application/json',
      'X-DashScope-Async': 'enable'  // 必需的异步调用标识
    }
    
    // 第一步：提交任务
    const taskId = await new Promise((resolve, reject) => {
      wx.request({
        url: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis',
        method: 'POST',
        header: auth,
        data: requestData,
        success: (res: any) => {
          console.log('\n=== 收到任务提交响应 ===')
          console.log('响应数据:', JSON.stringify(res.data, null, 2))
          
          if (res.data && res.data.output && res.data.output.task_id) {
            console.log('任务已提交:', res.data.output.task_id)
            resolve(res.data.output.task_id)
          } else if (res.data && res.data.code) {
            console.error('提交失败:', res.data.message || res.data.code)
            wx.showToast({
              title: '生成失败: ' + (res.data.message || res.data.code),
              icon: 'none',
              duration: 2000
            })
            reject(new Error(res.data.message || res.data.code))
          } else {
            console.error('提交失败:', res.data)
            wx.showToast({
              title: '生成失败',
              icon: 'none'
            })
            reject(new Error('提交失败: ' + JSON.stringify(res.data)))
          }
        },
        fail: (err) => {
          console.error('提交失败:', err)
          wx.showToast({
            title: '请求失败',
            icon: 'error'
          })
          reject(err)
        }
      })
    })

    // 第二步：轮询任务状态
    return await new Promise((resolve, reject) => {
      const maxRetries = 30; // 最大重试次数
      let retryCount = 0;
      
      const checkStatus = () => {
        if (retryCount >= maxRetries) {
          wx.showToast({
            title: '生成超时',
            icon: 'none'
          })
          reject(new Error('生成超时'))
          return;
        }

        wx.request({
          url: `https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`,
          method: 'GET',
          header: {
            'Authorization': auth.Authorization,
            'Content-Type': 'application/json'
          },
          success: (res: any) => {
            console.log('\n=== 收到任务状态响应 ===')
            console.log('响应数据:', JSON.stringify(res.data, null, 2))

            if (res.data && res.data.output && res.data.output.task_status === 'SUCCEEDED') {
              if (res.data.output.results && res.data.output.results[0] && res.data.output.results[0].url) {
                console.log('生成成功:', res.data.output.results[0].url)
                resolve(res.data.output.results[0].url)
              } else {
                wx.showToast({
                  title: '未获取到图片',
                  icon: 'none'
                })
                reject(new Error('未获取到图片URL'))
              }
            } else if (res.data && res.data.output && res.data.output.task_status === 'FAILED') {
              console.error('生成失败:', res.data)
              wx.showToast({
                title: res.data.output.message || '生成失败',
                icon: 'none'
              })
              reject(new Error('生成失败: ' + JSON.stringify(res.data)))
            } else if (res.data && res.data.output && ['PENDING', 'RUNNING'].includes(res.data.output.task_status)) {
              retryCount++;
              // 继续轮询，使用递增的延迟时间
              setTimeout(checkStatus, 1000 + retryCount * 500)
            } else {
              wx.showToast({
                title: '未知状态',
                icon: 'none'
              })
              reject(new Error('未知状态: ' + (res.data && res.data.output && res.data.output.task_status || 'unknown')))
            }
          },
          fail: (err) => {
            console.error('查询失败:', err)
            wx.showToast({
              title: '查询失败',
              icon: 'error'
            })
            reject(err)
          }
        })
      }

      // 开始轮询
      checkStatus()
    })
  } catch (error) {
    console.error('\n=== 生成图片过程中出错 ===')
    console.error('错误详情:', error)
    throw error
  }
} 