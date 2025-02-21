import { PropsWithChildren } from 'react'
import { useError, useLaunch } from '@tarojs/taro'
import './app.scss'

function App({ children }: PropsWithChildren<any>) {

  useLaunch(() => {
    console.log('App launched.')
  })

  useError((error) => console.error(error))

  // children 是将要会渲染的页面
  return children
}

export default App
