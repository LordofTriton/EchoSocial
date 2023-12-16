import React, { useState, useEffect } from "react";
import { useRouter } from 'next/router'

import CacheService from '../../services/CacheService'

export default function Communities() {
    const router = useRouter()
    const [activeUser, setActiveUser] = useState(CacheService.getData("EchoActiveUser"))

    useEffect(() => {
        router.push(`/user/${activeUser.accountID}`)
    }, [])

    return(
        <div></div>
    )
}