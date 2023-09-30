import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import '../styles/globals.css'

import CookieService from '../services/CookieService';
import { SocketProvider } from '../util/SocketProvider';
import LogoSplash from './components/logo-splash';

const authLess = ["/login", "/signup", "/password-reset"]

export default function MyApp({ Component, pageProps }) {
  const router = useRouter()
  const [showChild, setShowChild] = useState(0);
  const [showSplash, setShowSplash] = useState(true)
  const [activeUser, setActiveUser] = useState(CookieService.getData("EchoActiveUser"))

  useEffect(() => {
    setShowChild(1);
    if (showSplash) setTimeout(() => setShowSplash(false), 5000)
  }, [router.route]);

  useEffect(() => {
    if (typeof window !== undefined) {
      setShowChild(true);
      if (window.location.hostname === "echosocial.netlify.app") {
        document.location = "http://13.53.39.114"
        return;
      }
      const user = CookieService.getData("EchoActiveUser")
      if (!user.accountID && !authLess.includes(router.route)) router.push("/login")
      if (user.nodes && user.nodes.length < 1) router.push("/nodes")
      setActiveUser(user)
    } else {
      setTimeout(() => setShowChild(showChild + 1), 1000)
    }
  }, [typeof window, showChild])

  if (!showChild) {
    return null;
  }

  if (typeof window === undefined) {
    return ( <></> );
  } else if (showSplash) return ( <LogoSplash /> )
  else {
    return ( 
      <div className="app-container">
        { 
          activeUser.accountID || authLess.includes(router.route) ? 
            <SocketProvider>
              <Component {...pageProps} /> 
            </SocketProvider>
          : null 
        }
      </div> 
    );
  }
}
