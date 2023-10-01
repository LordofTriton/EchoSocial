import Head from "next/head";
import React, { useState } from "react";
import styles from "./logo-splash.module.css"

export default function LogoSplash() {
    const [activeTheme, setActiveTheme] = useState(localStorage.getItem("EchoTheme") || "light")

    return(
        <div className={styles.logoSplashContainer}>
            <Head>
                <title>Echo</title>
                <meta name="description" content="A simple social media." />
                <link rel="icon" href="/icon.ico" />
                <meta name="description" content="Echo is a simple, basic social media platform designed to bring together people with similar interests and passions." />
                <meta name="keywords" content="Echo, Echo Social, Social Media" />
                <meta name="author" content="Joshua Agboola" />
                <link rel="stylesheet" href={`/styles/themes/${activeTheme === "dark" ? 'classic-dark.css' : 'classic-light.css'}`} />
            </Head>

            <div className={styles.logoSplashCircle}>
                <img src="/images/logo.png" alt="splash-logo" />
            </div>

            <div className={styles.logoSplashLoader}></div>
        </div>
    )
}