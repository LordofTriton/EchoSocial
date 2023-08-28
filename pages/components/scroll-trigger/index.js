import React, { useState, useEffect, useRef } from 'react';

function ScrollTrigger({ onEnterView }) {
    const [isInView, setIsInView] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.5,
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.unobserve(entry.target);
                }
            });
        }, options);

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, []);

    useEffect(() => {
        if (isInView) {
            console.log("Entered View!")
            onEnterView();
        }
    }, [isInView, onEnterView]);

    return (
        <div ref={ref} style={{ height: '100px', border: '1px solid #ccc' }}>
            {isInView ? 'In view!' : 'Not in view'}
        </div>
    );
}

export default ScrollTrigger;