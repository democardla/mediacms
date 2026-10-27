import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import i18n from '../i18n';
import { linksConfig, siteConfig } from '../utils/contexts';
import { inEmbeddedApp, inSelectMediaEmbedMode } from '../utils/helpers';
import { PageMain } from '../components/page-layout';
import { Notifications } from '../components/_shared';
import ProfilePagesHeader from '../components/profile-page/ProfilePagesHeader';
import { ProfileMediaPage } from './ProfileMediaPage';
import { ProfileAboutPage } from './ProfileAboutPage';
import { ProfileSharedByMePage } from './ProfileSharedByMePage';
import { ProfileSharedWithMePage } from './ProfileSharedWithMePage';
import { ProfilePlaylistsPage } from './ProfilePlaylistsPage';

const tabs = {
    media: { url: () => linksConfig.profile.media, component: ProfileMediaPage, label: 'profile.nav.home' },
    about: { url: () => linksConfig.profile.about, component: ProfileAboutPage, label: 'profile.nav.about' },
    shared_by_me: { url: () => linksConfig.profile.shared_by_me, component: ProfileSharedByMePage, label: 'profile.nav.sharedByMe' },
    shared_with_me: { url: () => linksConfig.profile.shared_with_me, component: ProfileSharedWithMePage, label: 'profile.nav.sharedWithMe' },
    playlists: { url: () => linksConfig.profile.playlists, component: ProfilePlaylistsPage, label: 'profile.nav.playlists' },
};

function tabFromLocation() {
    const pathname = window.location.pathname.replace(/\/$/, '');
    return Object.keys(tabs).find((type) => new URL(tabs[type].url(), window.location.origin).pathname.replace(/\/$/, '') === pathname) || 'media';
}

export function ProfileTabbedPage() {
    const [tab, setTab] = useState(tabFromLocation);
    const [headerProps, setHeaderProps] = useState(null);
    const onHeaderChange = useCallback((props) => setHeaderProps(props), []);

    useEffect(() => {
        const onPopState = () => setTab(tabFromLocation());
        window.addEventListener('popstate', onPopState);
        return () => window.removeEventListener('popstate', onPopState);
    }, []);

    useLayoutEffect(() => {
        const container = document.querySelector('[id^="page-profile-"]');
        if (container) container.id = `page-profile-${tab.replace(/_/g, '-')}`;
    }, [tab]);

    const onTabChange = useCallback((type, href) => {
        if (!tabs[type]) return;
        const destination = new URL(href, window.location.origin);
        if (destination.origin !== window.location.origin) {
            window.location.assign(destination.href);
            return;
        }
        if (window.location.href !== destination.href) {
            window.history.pushState({ profileTab: type }, '', destination.href);
        }
        setTab(type);
    }, []);

    const ActivePage = tabs[tab].component;
    const author = headerProps && headerProps.author;
    const activeHeaderProps = headerProps && headerProps.type === tab ? headerProps : {};

    useEffect(() => {
        const parts = tab === 'media' ? [] : [i18n.t(tabs[tab].label)];
        if (author && author.name) parts.push(author.name);
        parts.push(siteConfig.title || 'MediaCMS');
        document.title = parts.join(' - ');
    }, [tab, author]);

    return (
        <>
            <PageMain>
                {author ? (
                    <ProfilePagesHeader
                        {...activeHeaderProps}
                        author={author}
                        type={tab}
                        onTabChange={!inEmbeddedApp() && !inSelectMediaEmbedMode() ? onTabChange : undefined}
                        hideChannelBanner={inEmbeddedApp()}
                    />
                ) : null}
                <ActivePage key={tab} profileTabContentOnly onProfileHeaderChange={onHeaderChange} />
            </PageMain>
            <Notifications />
        </>
    );
}
