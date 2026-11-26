import React from 'react';
import { inEmbeddedApp } from '../../utils/helpers/';
import i18n, { activeIntlLocale } from '../../i18n';
import { PageStore, MediaPageStore } from '../../utils/stores/';
import { memberConfig, PlaylistsContext } from '../../utils/contexts/';
import {
    MediaLikeIcon,
    MediaDislikeIcon,
    MediaEditButton,
    OtherMediaDownloadLink,
    VideoMediaDownloadLink,
    MediaSaveButton,
    MediaShareButton,
    MediaMoreOptionsIcon,
} from '../media-actions/';
import ViewerInfoTitleBanner from './ViewerInfoTitleBanner';
import formatLocalizedDate from '../../utils/helpers/formatLocalizedDate';

export default class ViewerInfoVideoTitleBanner extends ViewerInfoTitleBanner {
    render() {
        const displayViews = PageStore.get('config-options').pages.media.displayViews && void 0 !== this.props.views;

        const mediaData = MediaPageStore.get('media-data');
        const mediaState = mediaData.state;
        const isShared = mediaData.is_shared;

        let stateTooltip = '';

        switch (mediaState) {
            case 'private':
                stateTooltip = i18n.t('media:mediaState.privateTooltip');
                break;
            case 'unlisted':
                stateTooltip = i18n.t('media:mediaState.unlistedTooltip');
                break;
        }

        const sharedTooltip = i18n.t('media:sharedTooltip');

        return (
            <div className="media-title-banner">
                {displayViews && PageStore.get('config-options').pages.media.categoriesWithTitle
                    ? this.mediaCategories(true)
                    : null}

                {void 0 !== this.props.title ? <h1>{this.props.title}</h1> : null}

                {isShared || 'public' !== mediaState ? (
                    <div className="media-labels-area">
                        <div className="media-labels-area-inner">
                            {isShared ? (
                                <>
                                    <span className="media-label-state">
                                        <span>{i18n.t('media:shared')}</span>
                                    </span>
                                    <span className="helper-icon" data-tooltip={sharedTooltip}>
                                        <i className="material-icons">help_outline</i>
                                    </span>
                                </>
                            ) : 'public' !== mediaState ? (
                                <>
                                    <span className="media-label-state">
                                        <span>{mediaState === 'private' ? i18n.t('media:mediaStatePrivate') : mediaState === 'unlisted' ? i18n.t('media:mediaStateUnlisted') : mediaState}</span>
                                    </span>
                                    <span className="helper-icon" data-tooltip={stateTooltip}>
                                        <i className="material-icons">help_outline</i>
                                    </span>
                                </>
                            ) : null}
                        </div>
                    </div>
                ) : null}

                {mediaData.media_type === 'video' && PageStore.get('config-media-item').displayPublishDate && mediaData.add_date ? (
                    <div className="video-published-date">
                        {i18n.t('media:publishedOn', { date: formatLocalizedDate(mediaData.add_date) })}
                    </div>
                ) : null}

                <div
                    ref={this.viewsActionsRef}
                    className={
                        'media-views-actions' +
                        (this.state.likedMedia ? ' liked-media' : '') +
                        (this.state.dislikedMedia ? ' disliked-media' : '') +
                        (this.state.actionsLayout ? ' ' + this.state.actionsLayout + '-actions' : '')
                    }
                >
                    {!displayViews && PageStore.get('config-options').pages.media.categoriesWithTitle
                        ? this.mediaCategories()
                        : null}

                    {displayViews ? (
                        <div className="media-views">
                            {i18n.t('media:views', {
                                count: this.props.views,
                                formattedCount: new Intl.NumberFormat(activeIntlLocale()).format(this.props.views),
                            })}
                        </div>
                    ) : null}

                    <div className="media-actions">
                        <div>
                            {memberConfig.can.likeMedia ? <MediaLikeIcon /> : null}
                            {memberConfig.can.dislikeMedia ? <MediaDislikeIcon /> : null}
                            <MediaEditButton />
                            {!inEmbeddedApp() && memberConfig.can.shareMedia ? (
                                <MediaShareButton isVideo={true} />
                            ) : null}

                            {!memberConfig.is.anonymous &&
                            memberConfig.can.saveMedia ? (
                                <MediaSaveButton />
                            ) : null}

                            {!this.props.allowDownload || !memberConfig.can.downloadMedia ? null : !this
                                  .downloadLink ? (
                                <VideoMediaDownloadLink />
                            ) : (
                                <OtherMediaDownloadLink link={this.downloadLink} title={this.downloadFilename} />
                            )}

                            <MediaMoreOptionsIcon allowDownload={this.props.allowDownload} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
