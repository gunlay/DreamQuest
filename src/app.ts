import { PropsWithChildren } from 'react'
import { useError, useLaunch } from '@tarojs/taro'
import './app.scss'
import { useLoginStore } from './store/loginStore'

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
