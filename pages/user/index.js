import React, { useState, useEffect } from "react";
import { useRouter } from 'next/router'

import Cache from '../../services/CacheService'

export default function Communities() {
    const router = useRouter()
    const [activeUser, setActiveUser] = useState(Cache.getData("EchoUser"))

    useEffect(() => {
        router.push(`/user/${activeUser.accountID}`)
    }, [])

    return(
        <div></div>
    )
}