import React, { useState, useEffect } from "react";
import { useRouter } from 'next/router'

import CookieService from '../../services/CookieService'

export default function Communities() {
    const router = useRouter()
    const [activeUser, setActiveUser] = useState(CookieService.getData("EchoActiveUser"))

    useEffect(() => {
        router.push(`/user/${activeUser.accountID}`)
    }, [])

    return(
        <div></div>
    )
}