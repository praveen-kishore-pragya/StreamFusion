import { useRef } from 'react';
import './App.css'
import VideoJS from './VideoJS';
import videojs from 'video.js';

function App() {

  const playerRef = useRef(null);
  const videoLink = "http://localhost:8000/uploads/topic1/f1322610-9b2a-46f7-9d46-0fbfc70bd042/index.m3u8"
  
  
  const videoJsOptions = {
    autoplay: true,
    controls: true,
    responsive: true,
    fluid: true,
    sources: [{
      src: videoLink,
      type: 'application/x-mpegURL'
    }]
  };

  const handlePlayerReady = (player) => {
    playerRef.current = player;

    // You can handle player events here, for example:
    player.on('waiting', () => {
      videojs.log('player is waiting');
    });

    player.on('dispose', () => {
      videojs.log('player will dispose');
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center  bg-gray-600">
      {/* <h1>Home Page</h1> */}
      <VideoJS options={videoJsOptions} onReady={handlePlayerReady} />
    </div>
  )
}

export default App
