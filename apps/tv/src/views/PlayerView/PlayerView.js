import {useRef, useEffect} from 'react';
import {getStreamUrl} from '../../api/xtream';
import css from './PlayerView.module.less';

/**
 * Fullscreen video player using plain <video> element.
 * No Enact VideoPlayer — avoids Spotlight conflicts and unwanted UI.
 */
const PlayerView = ({channel}) => {
  const videoRef = useRef(null);

  // Auto-play when channel changes
  useEffect(() => {
    if (!channel || !videoRef.current) return;

    const video = videoRef.current;
    video.src = getStreamUrl(channel.id);
    video.play().catch(() => {});  // autoplay might be blocked in browser, OK on TV
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
    </div>
  );
};

export default PlayerView;
export {PlayerView};
