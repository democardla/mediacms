import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { siteConfig } from '../../utils/contexts/';
import { PageStore, MediaPageStore } from '../../utils/stores/';
import { PageActions } from '../../utils/actions/';
import { formatInnerLink, inEmbeddedApp } from '../../utils/helpers/';
import CommentsList from '../comments/Comments';
import formatLocalizedDate from '../../utils/helpers/formatLocalizedDate';
import MarkdownDescription from './MarkdownDescription';

function metafield(arr) {
    let i;
    let sep;
    let ret = [];

    if (arr && arr.length) {
        i = 0;
        sep = 1 < arr.length ? ', ' : '';
        while (i < arr.length) {
            ret[i] = (
                <div key={i}>
                    <a href={arr[i].url} title={arr[i].title}>
                        {arr[i].title}
                    </a>
                    {i < arr.length - 1 ? sep : ''}
                </div>
            );
            i += 1;
        }
    }

    return ret;
}

function MediaAuthorBanner(props) {
    const { t } = useTranslation('media');
    return (
        <div className="media-author-banner">
            <div>
                <a className="author-banner-thumb" href={props.link || null} title={props.name}>
                    <span style={{ backgroundImage: 'url(' + props.thumb + ')' }}>
                        <img src={props.thumb} loading="lazy" alt={props.name} title={props.name} />
                    </span>
                </a>
            </div>
            <div>
                <span>
                    <a href={props.link} className="author-banner-name" title={props.name}>
                        <span>{props.name}</span>
                    </a>
                </span>
                {props.showPublished !== false && PageStore.get('config-media-item').displayPublishDate && props.published ? (
                    <span className="author-banner-date">
                        {t('publishedOn', { date: formatLocalizedDate(props.published) })}
                    </span>
                ) : null}
            </div>
        </div>
    );
}

function MediaMetaField(props) {
    return (
        <div className={props.id.trim() ? 'media-content-' + props.id.trim() : null}>
            <div className="media-content-field">
                <div className="media-content-field-label">
                    <h4>{props.title}</h4>
                </div>
                <div className="media-content-field-content">{props.value}</div>
            </div>
        </div>
    );
}

export default function ViewerInfoContent(props) {
    const { t } = useTranslation('media');
    const description = props.description.trim();
    const tagsContent =
        !PageStore.get('config-enabled').taxonomies.tags || PageStore.get('config-enabled').taxonomies.tags.enabled
            ? metafield(MediaPageStore.get('media-tags'))
            : [];
    let mediaCategories = MediaPageStore.get('media-categories');

    // Filter to show only LMS courses when in embed mode
    if (inEmbeddedApp()) {
        mediaCategories = mediaCategories.filter(cat => cat.is_lms_course === true);
    }

    const categoriesContent = PageStore.get('config-options').pages.media.categoriesWithTitle
        ? []
        : !PageStore.get('config-enabled').taxonomies.categories ||
            PageStore.get('config-enabled').taxonomies.categories.enabled
          ? metafield(mediaCategories)
          : [];

    let summary = MediaPageStore.get('media-summary');

    summary = summary ? summary.trim() : '';

    const [hasSummary, setHasSummary] = useState('' !== summary);
    const [isContentVisible, setIsContentVisible] = useState('' == summary);

    function onMediaDelete(mediaId) {
        // FIXME: Without delay creates conflict [ Uncaught Error: Dispatch.dispatch(...): Cannot dispatch in the middle of a dispatch. ].
        setTimeout(function () {
            PageActions.addNotification('Media removed. Redirecting...', 'mediaDelete');
            setTimeout(function () {
                window.location.href =
                    siteConfig.url +
                    '/' +
                    MediaPageStore.get('media-data').author_profile.replace(/^\//g, '');
            }, 2000);
        }, 100);

        if (void 0 !== mediaId) {
            console.info("Removed media '" + mediaId + '"');
        }
    }

    function onMediaDeleteFail(mediaId) {
        // FIXME: Without delay creates conflict [ Uncaught Error: Dispatch.dispatch(...): Cannot dispatch in the middle of a dispatch. ].
        setTimeout(function () {
            PageActions.addNotification('Media removal failed', 'mediaDeleteFail');
        }, 100);

        if (void 0 !== mediaId) {
            console.info('Media "' + mediaId + '"' + ' removal failed');
        }
    }

    function onClickLoadMore() {
        setIsContentVisible(!isContentVisible);
    }

    useEffect(() => {
        MediaPageStore.on('media_delete', onMediaDelete);
        MediaPageStore.on('media_delete_fail', onMediaDeleteFail);
        return () => {
            MediaPageStore.removeListener('media_delete', onMediaDelete);
            MediaPageStore.removeListener('media_delete_fail', onMediaDeleteFail);
        };
    }, []);

    const authorLink = formatInnerLink(props.author.url, siteConfig.url);
    const authorThumb = formatInnerLink(props.author.thumb, siteConfig.url);

    return (
        <div className="media-info-content">
            {props.showAuthor !== false && (void 0 === PageStore.get('config-media-item').displayAuthor ||
            null === PageStore.get('config-media-item').displayAuthor ||
            !!PageStore.get('config-media-item').displayAuthor) ? (
                <MediaAuthorBanner
                    link={authorLink}
                    thumb={authorThumb}
                    name={props.author.name}
                    published={props.published}
                    showPublished={props.showPublished}
                />
            ) : null}

            <div className="media-content-banner">
                <div className="media-content-banner-inner">
                    {hasSummary ? <div className="media-content-summary">{summary}</div> : null}
                    {(!hasSummary || isContentVisible) && description ? (
                        <div className="media-content-description">
                            <MarkdownDescription>{description}</MarkdownDescription>
                        </div>
                    ) : null}
                    {hasSummary ? (
                        <button className="load-more" onClick={onClickLoadMore}>
                            {isContentVisible ? t('showLess') : t('showMore')}
                        </button>
                    ) : null}
                    {tagsContent.length ? (
                        <MediaMetaField
                            value={tagsContent}
                            title={1 < tagsContent.length ? t('taxonomy.tags') : t('taxonomy.tag')}
                            id="tags"
                        />
                    ) : null}
                    {categoriesContent.length ? (
                        <MediaMetaField
                            value={categoriesContent}
                            title={
                                inEmbeddedApp()
                                    ? (1 < categoriesContent.length ? t('taxonomy.courses') : t('taxonomy.course'))
                                    : (1 < categoriesContent.length
                                        ? t('taxonomy.categories')
                                        : t('taxonomy.category'))
                            }
                            id="categories"
                        />
                    ) : null}
                </div>
            </div>

            {props.showComments === false ? null : <CommentsList />}
        </div>
    );
}
