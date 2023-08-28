import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import 'videojs-thumbnail/dist/videojs-thumbnail.css';
import 'videojs-thumbnail/dist/videojs-thumbnail';

const VideoPlayer = ({ url }) => {
    const videoRef = useRef();

    useEffect(() => {
        const player = videojs(videoRef.current, {
            controls: true,
            preload: 'auto',
            sources: [{ src: url }],
        });

        player.thumbnail({
            timeInterval: 10
        });

        return () => {
            player.dispose();
        };
    }, [videoUrl]);

    return (
        <div data-vjs-player>
            <video ref={videoRef} className="video-js" />
        </div>
    );
};

export default VideoPlayer;