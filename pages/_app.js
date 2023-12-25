import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import '../styles/globals.css'

import CacheService from '../services/CacheService';
import { SSEProvider } from '../util/SocketProvider';
import Helpers from '../util/Helpers';
import DateGenerator from '../services/generators/DateGenerator';
import ScrollTop from './hooks/useScrollTop';

const publicRoutes = ["/login", "/signup", "/reset-password", "/forgot-password"]

export default function MyApp({ Component, pageProps }) {
  const router = useRouter()
  const [showChild, setShowChild] = useState(0);
  const [activeUser, setActiveUser] = useState()

  useEffect(() => {
    setShowChild(1);
  }, [router.route]);

  useEffect(() => {
    if (typeof window !== undefined) {
      const user = CacheService.getData("EchoActiveUser")
      if (!user) {
        if (!publicRoutes.includes(router.route)) router.push("/login");
      }
      else {
        if (DateGenerator.hoursBetween(Date.now(), user.lastLogin) > 24) router.push("/login")
        if (user.nodes && user.nodes.length < 3 && !publicRoutes.includes(router.route)) router.push("/nodes")
        setActiveUser(user)
      }
    }
    if (!activeUser || !activeUser.accountID) setTimeout(() => setShowChild(showChild + 1), 1000)
  }, [typeof window, showChild])

  if (!showChild) {
    return null;
  }

  if (typeof window === undefined) {
    return ( <></> );
  } else {
    return ( 
      <div className="app-container">
        { 
          (activeUser && activeUser.accountID) || publicRoutes.includes(router.route) ?
            <>
              <ScrollTop />
              <Component {...pageProps} />
            </>
            : null
        }
      </div> 
    );
  }
}
