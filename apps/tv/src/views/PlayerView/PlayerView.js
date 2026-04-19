import {useRef, useEffect, useState} from 'react';
import {getStreamUrl} from '../../api/xtream';
import css from './PlayerView.module.less';

const PlayerView = ({channel, epg}) => {
  const videoRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!channel || !videoRef.current) return;
    const video = videoRef.current;
    video.src = getStreamUrl(channel.id);
    video.play().catch(() => {});

    const onError = () => setError('Stream nicht verfügbar');
    const onPlaying = () => setError(null);
    const onLoadStart = () => setError(null);

    video.addEventListener('error', onError);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('loadstart', onLoadStart);

    return () => {
      video.removeEventListener('error', onError);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('loadstart', onLoadStart);
    };
  }, [channel]);

  if (!channel) return null;

  return (
    <div className={css.player}>
      <video
        ref={videoRef}
        className={css.video}
        autoPlay
        playsInline
      />
      <div key={channel.id} className={css.badge}>
        <div className={css.badgeContent}>
          {channel.icon && (
            <img src={channel.icon} alt="" className={css.badgeLogo} onError={(e) => { e.target.style.display = 'none'; }} />
          )}
          <div className={css.badgeInfo}>
            <div className={css.badgeName}>{channel.name}</div>
            {epg && <div className={css.badgeProgram}>{epg.title}</div>}
          </div>
        </div>
      </div>
      {error && (
        <div className={css.error}>
          <div className={css.errorContent}>{error}</div>
        </div>
      )}
    </div>
  );
};

export default PlayerView;
export {PlayerView};
