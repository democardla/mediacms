import React from 'react';
import { useTranslation } from 'react-i18next';
import { CircleIconButton, MaterialIcon } from '../_shared/';

export function OtherMediaDownloadLink(props) {
  const { t } = useTranslation('media');
  return (
    <div className="download hidden-only-in-small" data-action-tooltip={t('more.download')}>
      <a href={props.link} target="_blank" download={props.title} rel="noreferrer">
        <CircleIconButton type="span">
          <MaterialIcon type="arrow_downward" />
        </CircleIconButton>
        <span>{t('more.download')}</span>
      </a>
    </div>
  );
}
