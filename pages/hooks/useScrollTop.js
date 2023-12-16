import { useEffect } from 'react';
import { useRouter } from 'next/router';

const ScrollTop = () => {
    const router = useRouter();

    useEffect(() => {
        const handleRouteChange = () => {
            let page = document.getElementsByClassName("page")
            page = page[0]
            if (page) page.scrollTo(0, 0);
        };

        // Subscribe to the router events
        router.events.on('routeChangeComplete', handleRouteChange);

        // Clean up the subscription when the component is unmounted
        return () => {
            router.events.off('routeChangeComplete', handleRouteChange);
        };
    }, [router.events]);

    return null; // This component doesn't render anything
};

export default ScrollTop;