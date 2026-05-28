import React from 'react'
import HeaderComponent from '../HeaderComponent/HeaderComponent'
import Footer from '../Footer/Footer'
import ChatWidget from '../ChatWidget/ChatWidget'

const DefaultCompoent = ({children}) => {
  const isChatEnabled = String(process.env.REACT_APP_ENABLE_CHAT_WIDGET || '').toLowerCase() === 'true'
  return (
    <div>
        <HeaderComponent />
        {children}
        {isChatEnabled ? <ChatWidget /> : null}
        <Footer/>
       
    
    </div>
  )
}

export default DefaultCompoent