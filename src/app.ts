import { PropsWithChildren } from 'react'
import { useError, useLaunch } from '@tarojs/taro'
import { useLoginStore } from './store/loginStore'
import './app.scss'

function App({ children }: PropsWithChildren<any>) {
  const { checkLogin } = useLoginStore()

  useLaunch(() => {
    console.log('App launched.')
    checkLogin()
  })

  useError((error) => console.error(error))

  // children 是将要会渲染的页面
  return children
}

export default App
