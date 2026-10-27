import React from 'react';
import { useTranslation } from 'react-i18next';
import { useUser } from '../../utils/hooks/';
import { MediaPageStore } from '../../utils/stores/';
import { CircleIconButton, MaterialIcon } from '../_shared/';
import { inEmbeddedApp } from '../../utils/helpers/';

export function MediaEditButton() {
  const { userCan } = useUser();
  const { t } = useTranslation('media');

  if (!userCan.editMedia) {
    return null;
  }

  let link = MediaPageStore.get('media-data').edit_url;

  if (window.MediaCMS.site.devEnv) {
    link = '/edit-media.html';
  }

  if (link && inEmbeddedApp()) {
    link += '&mode=lms_embed_mode';
  }

  return (
    <div className="edit" data-action-tooltip={t('editMedia')}>
      <a href={link} rel="nofollow">
        <CircleIconButton type="span">
          <MaterialIcon type="edit" />
        </CircleIconButton>
        <span>{t('edit')}</span>
      </a>
    </div>
  );
}
