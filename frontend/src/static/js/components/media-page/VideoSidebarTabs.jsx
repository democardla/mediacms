import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MediaPageStore } from '../../utils/stores/';
import { siteConfig } from '../../utils/contexts/';
import { formatInnerLink } from '../../utils/helpers/';
import ViewerInfoContent from './ViewerInfoContent';
import { AutoPlay } from './AutoPlay';
import { RelatedMedia } from './RelatedMedia';
import PlaylistView from './PlaylistView';

const tabs = ['info', 'legacy', 'upNext'];

export default function VideoSidebarTabs({ playlistData, activeItem }) {
    const { t } = useTranslation('media');
    const [activeTab, setActiveTab] = useState('info');
    const [playerHeight, setPlayerHeight] = useState(null);
    const media = MediaPageStore.get('media-data');
    const author = {
        name: media.author_name,
        url: media.author_profile,
        thumb: MediaPageStore.get('media-author-thumbnail-url'),
    };
    const creatorName = author.name || author.url?.match(/\/user\/([^/]+)/)?.[1] || t('videoTabs.creator');

    useEffect(() => {
        const player = document.querySelector('.viewer-container .player-container');
        if (!player) return;

        const updateHeight = () => setPlayerHeight(player.getBoundingClientRect().height);
        updateHeight();
        if (!window.ResizeObserver) {
            window.addEventListener('resize', updateHeight);
            return () => window.removeEventListener('resize', updateHeight);
        }
        const observer = new ResizeObserver(updateHeight);
        observer.observe(player);
        return () => observer.disconnect();
    }, []);

    function onTabKeyDown(event, tab) {
        const index = tabs.indexOf(tab);
        const nextIndex = event.key === 'ArrowRight' ? (index + 1) % tabs.length
            : event.key === 'ArrowLeft' ? (index + tabs.length - 1) % tabs.length
            : event.key === 'Home' ? 0
            : event.key === 'End' ? tabs.length - 1
            : null;

        if (nextIndex === null) return;
        event.preventDefault();
        setActiveTab(tabs[nextIndex]);
        event.currentTarget.parentElement.querySelectorAll('[role="tab"]')[nextIndex].focus();
    }

    return (
        <section className="video-sidebar-tabs" aria-label={t('videoTabs.label')} style={playerHeight ? { height: playerHeight } : undefined}>
            <div className="video-sidebar-tab-list" role="tablist" aria-label={t('videoTabs.label')}>
                {tabs.map(tab => (
                    <button
                        key={tab}
                        id={`video-tab-${tab}`}
                        type="button"
                        role="tab"
                        aria-controls={`video-panel-${tab}`}
                        aria-selected={activeTab === tab}
                        tabIndex={activeTab === tab ? 0 : -1}
                        onClick={() => setActiveTab(tab)}
                        onKeyDown={event => onTabKeyDown(event, tab)}
                    >
                        {tab === 'info' ? t('videoTabs.info') : tab === 'legacy' ? t('videoTabs.legacy') : t('upNext')}
                    </button>
                ))}
            </div>
            <div
                id="video-panel-info"
                className="video-sidebar-tab-panel"
                role="tabpanel"
                aria-labelledby="video-tab-info"
                hidden={activeTab !== 'info'}
            >
                <div className="video-sidebar-creator">
                    <a href={formatInnerLink(author.url, siteConfig.url)}>
                        <img src={formatInnerLink(author.thumb, siteConfig.url)} alt="" />
                        <span>{creatorName}</span>
                    </a>
                </div>
                <ViewerInfoContent author={author} published={media.add_date} description={media.description} showAuthor={false} showPublished={false} showComments={false} />
            </div>
            <div
                id="video-panel-legacy"
                className="video-sidebar-tab-panel video-legacy-panel"
                role="tabpanel"
                aria-labelledby="video-tab-legacy"
                hidden={activeTab !== 'legacy'}
            >
                <span className="material-icons" aria-hidden="true">emoji_events</span>
                <p>{t('videoTabs.legacyEmpty')}</p>
            </div>
            <div
                id="video-panel-upNext"
                className="video-sidebar-tab-panel video-up-next-panel"
                role="tabpanel"
                aria-labelledby="video-tab-upNext"
                hidden={activeTab !== 'upNext'}
            >
                {playlistData ? <PlaylistView activeItem={activeItem} playlistData={playlistData} /> : <AutoPlay />}
                <RelatedMedia hideFirst={!playlistData} />
            </div>
        </section>
    );
}
