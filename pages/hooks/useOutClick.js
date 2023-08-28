import { useEffect, useRef, useState } from 'react';

const useOutClick = (initialState) => {
    const [isActive, setIsActive] = useState(initialState);
    const ref = useRef(null);

    const handleClickOutside = (event) => {
        if (ref.current && !ref.current.contains(event.target)) {
            setIsActive(false);
        }
    };

    useEffect(() => {
        if (isActive) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isActive]);

    return [ref, isActive, setIsActive];
};

export default useOutClick;