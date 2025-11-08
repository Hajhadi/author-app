import React from 'react';

const VideoPlayer = ({ contentId }) => {
  const videoSrc = `http://localhost:3000/api/user/content/${contentId}`;

  return (
    <div className="w-full h-full flex items-center justify-center bg-black">
      <video controls className="max-w-full max-h-full">
        <source src={videoSrc} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoPlayer;
