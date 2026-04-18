import {QRCodeSVG} from 'qrcode.react';
import {buildPairingUrl} from '@zappix/shared';
import css from './PairingScreen.module.less';

const WEB_APP_BASE = 'https://nbumann97.github.io/zappix';

const PairingScreen = ({pairingCode}) => {
  const url = buildPairingUrl(WEB_APP_BASE, pairingCode);

  return (
    <div className={css.screen}>
      <div className={css.content}>
        <div className={css.left}>
          <div className={css.qrCard}>
            <QRCodeSVG
              value={url}
              size={220}
              bgColor="transparent"
              fgColor="#ffffff"
              level="M"
            />
          </div>
          <div className={css.scanHint}>QR-Code scannen</div>
        </div>

        <div className={css.divider}>
          <span className={css.dividerText}>oder</span>
        </div>

        <div className={css.right}>
          <div className={css.step}>
            <div className={css.stepNum}>1</div>
            <div className={css.stepText}>
              <div className={css.stepLabel}>Öffne</div>
              <div className={css.stepUrl}>{WEB_APP_BASE}</div>
            </div>
          </div>

          <div className={css.step}>
            <div className={css.stepNum}>2</div>
            <div className={css.stepText}>
              <div className={css.stepLabel}>Gib den Code ein</div>
            </div>
          </div>
          <div className={css.codeDisplay}>{pairingCode}</div>
        </div>
      </div>

      <div className={css.brand}>
        <span className={css.logo}>Zappix</span>
      </div>
    </div>
  );
};

export default PairingScreen;
export {PairingScreen};
