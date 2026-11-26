import React from 'react';
import i18n from '../../i18n';
import formatRelativeDate from '../../utils/helpers/formatRelativeDate';
import { useItem } from '../../utils/hooks/';
import { PlaylistItemMetaDate } from './includes/items/';
import { Item } from './Item';
import { applyDefaultProps } from '../../utils/helpers/applyDefaultProps';

export function PlaylistItem(rawProps) {
  const props = applyDefaultProps(rawProps, PlaylistItem.defaultPropValues);
  const type = 'playlist';

  const { titleComponent, thumbnailUrl, UnderThumbWrapper } = useItem({ ...props, type });

  function metaComponents() {
    const date = new Date(props.publish_date);
    if (Number.isNaN(date.getTime())) return null;
    const publishDate = formatRelativeDate(date);

    return <PlaylistItemMetaDate dateTime={date.toISOString()} text={i18n.t('playlist.createdAgo', { time: publishDate })} />;
  }

  return (
    <div className="item playlist-item">
      <div className="item-content">
        <a
          className={'item-thumb' + (!thumbnailUrl ? ' no-thumb' : '')}
          href={props.link}
          title={props.title}
          tabIndex="-1"
          aria-hidden="true"
          style={!thumbnailUrl ? null : { backgroundImage: "url('" + thumbnailUrl + "')" }}
        >
          <div className="playlist-count">
            <div>
              <div>
                <span>{props.media_count}</span>
                <i className="material-icons">playlist_play</i>
              </div>
            </div>
          </div>

          <div className="playlist-hover-play-all">
            <div>
              <div>
                <i className="material-icons">play_arrow</i>
                <span>{i18n.t('playlist.playAll')}</span>
              </div>
            </div>
          </div>
        </a>

        <UnderThumbWrapper title={props.title} link={props.link}>
          {titleComponent()}
          {metaComponents()}
        </UnderThumbWrapper>
      </div>
    </div>
  );
}

PlaylistItem.defaultPropValues = {
  ...Item.defaultPropValues,
  media_count: 0,
};
