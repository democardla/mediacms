import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PageStore, MediaPageStore } from '../../utils/stores/';
import { ItemList } from '../item-list/ItemList';

function autoPlayMedia() {
  const dt = MediaPageStore.get('media-data');
  return dt && dt.related_media && dt.related_media.length ? dt.related_media[0] : null;
}

export function AutoPlay(props) {
  const { t } = useTranslation('media');
  const [media, setMedia] = useState(autoPlayMedia());

  function onMediaDataLoad() {
    setMedia(autoPlayMedia());
  }

  useEffect(() => {
    MediaPageStore.on('loaded_media_data', onMediaDataLoad);
    return () => {
      MediaPageStore.removeListener('loaded_media_data', onMediaDataLoad);
    };
  }, []);

  return !media ? null : (
    <div className="auto-play">
      <div className="auto-play-header">
        <div className="next-label">{t('upNext')}</div>
      </div>
      <ItemList
        className="items-list-hor"
        items={[media]}
        pageItems={1}
        maxItems={1}
        singleLinkContent={true}
        horizontalItemsOrientation={true}
        hideDate={true}
        hideViews={!PageStore.get('config-media-item').displayViews}
        hideAuthor={!PageStore.get('config-media-item').displayAuthor}
      />
    </div>
  );
}
