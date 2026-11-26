import React, { useRef, useState, useEffect } from 'react';
import { Tabs } from 'antd';
import i18n from '../../i18n';
import { usePopup } from '../../utils/hooks/';
import { linksConfig, memberConfig, siteConfig } from '../../utils/contexts/';
import { PageStore, ProfilePageStore } from '../../utils/stores/';
import { PageActions, ProfilePageActions } from '../../utils/actions/';
import { CircleIconButton, PopupMain } from '../_shared';
import { translateString, inEmbeddedApp, inSelectMediaEmbedMode, isSelectMediaMode, isShareMediaDisabled } from '../../utils/helpers/';
import { applyDefaultProps } from '../../utils/helpers/applyDefaultProps';

class ProfileSearchBar extends React.PureComponent {
    constructor(props) {
        super(props);
        this.searchInput = React.createRef();

        this.state = {
            visibleForm: false,
            queryVal: ProfilePageStore.get('author-query') || '',
        };

        this.onChange = this.onChange.bind(this);
        this.onInputFocus = this.onInputFocus.bind(this);
        this.onInputBlur = this.onInputBlur.bind(this);
        this.showForm = this.showForm.bind(this);
        this.hideForm = this.hideForm.bind(this);
        this.onFormSubmit = this.onFormSubmit.bind(this);

        this.updateTimeout = null;
        this.pendingUpdate = false;
        this.justShown = false;
    }

    updateQuery(value) {
        this.pendingUpdateValue = null;

        this.setState(
            {
                queryVal: value,
            },
            function () {
                if ('function' === typeof this.props.onQueryChange) {
                    this.props.onQueryChange(this.state.queryVal);
                }
            }
        );
    }

    onChange(ev) {
        this.pendingEvent = ev;
        const newValue = ev.target.value || '';

        this.setState(
            {
                queryVal: newValue,
            },
            function () {
                if (this.updateTimeout) {
                    return;
                }

                this.pendingEvent = null;

                // Only trigger search if 3+ characters or empty (to reset)
                if ('function' === typeof this.props.onQueryChange) {
                    if (newValue.length >= 3 || newValue.length === 0) {
                        this.props.onQueryChange(newValue);
                    }
                }

                this.updateTimeout = setTimeout(
                    function () {
                        this.updateTimeout = null;

                        if (this.pendingEvent) {
                            this.onChange(this.pendingEvent);
                        }
                    }.bind(this),
                    100
                );
            }
        );
    }

    /*onKeydown(e){
    let found = false, key =  e.keyCode || e.charCode;
        switch( key ){
            case 38:    // Arrow Up.
              found = this.getItemsArr(this.state.predictionItems.length-1);
              break;
            case 40:    // Arrow Down.
              found = this.getItemsArr(0);
              break;
        }
        if( found ){
          found.focus();
            e.preventDefault();
            e.stopPropagation();
        }
    }*/

    onInputFocus() {
        // console.log('FOCUS');
        /*if( this.state.predictionItems.length ){
      this.searchInput.current.onkeydown = this.searchInput.current.onkeydown || this.onKeydown;
    }*/
    }

    onInputBlur() {
        // Don't hide immediately after showing to prevent race condition
        if (this.justShown) {
            return;
        }
        this.hideForm();
    }

    showForm() {
        this.justShown = true;
        this.setState(
            {
                visibleForm: true,
            },
            function () {
                if ('function' === typeof this.props.toggleSearchField) {
                    this.props.toggleSearchField();
                }
                // Reset the flag after a short delay
                setTimeout(() => {
                    this.justShown = false;
                }, 200);
            }
        );
    }

    hideForm() {
        this.setState(
            {
                visibleForm: false,
            },
            function () {
                if ('function' === typeof this.props.toggleSearchField) {
                    this.props.toggleSearchField();
                }
            }
        );
    }

    onFormSubmit(ev) {
        if ('' === this.searchInput.current.value.trim()) {
            ev.preventDefault();
            ev.stopPropagation();
        }
    }

    render() {
        const hasSearchText = this.state.queryVal && this.state.queryVal.length > 0;

        // Determine the correct action URL based on page type
        let actionUrl = linksConfig.profile.media;
        if (this.props.type === 'shared_by_me') {
            actionUrl = linksConfig.profile.shared_by_me;
        } else if (this.props.type === 'shared_with_me') {
            actionUrl = linksConfig.profile.shared_with_me;
        }

        if (!this.state.visibleForm) {
            return (
                <span
                    style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', position: 'relative' }}
                    onClick={this.showForm}
                >
                    <CircleIconButton buttonShadow={false}>
                        <i className="material-icons">search</i>
                    </CircleIconButton>
                    {hasSearchText ? (
                        <span
                            style={{
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: 'var(--default-theme-color)',
                                border: '2px solid white',
                            }}
                        ></span>
                    ) : null}
                </span>
            );
        }

        return (
            <form method="get" action={actionUrl} onSubmit={this.onFormSubmit}>
                <span style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                    <CircleIconButton buttonShadow={false}>
                        <i className="material-icons">search</i>
                    </CircleIconButton>
                    {hasSearchText ? (
                        <span
                            style={{
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: 'var(--default-theme-color)',
                                border: '2px solid white',
                            }}
                        ></span>
                    ) : null}
                </span>
                <span>
                    <input
                        autoFocus={true}
                        ref={this.searchInput}
                        type="text"
                        name="aq"
                        placeholder={i18n.t('profile.searchMedia')}
                        aria-label={i18n.t('profile.searchMedia')}
                        value={this.state.queryVal}
                        onChange={this.onChange}
                        onFocus={this.onInputFocus}
                        onBlur={this.onInputBlur}
                    />
                </span>
            </form>
        );
    }
}

ProfileSearchBar.defaultProps = {};

class NavMenuInlineTabs extends React.PureComponent {
    render() {
        const isSelectMediaMode = inSelectMediaEmbedMode();
        const shareMediaDisabled = isShareMediaDisabled();
        const userIsAuthor = !memberConfig.is.anonymous &&
            ProfilePageStore.get('author-data').username === memberConfig.username;

        // Append action=select_media to links when in select mode
        const mediaLink = isSelectMediaMode
            ? `${linksConfig.profile.media}${linksConfig.profile.media.includes('?') ? '&' : '?'}action=select_media`
            : linksConfig.profile.media;

        const sharedByMeLink = isSelectMediaMode
            ? `${linksConfig.profile.shared_by_me}${linksConfig.profile.shared_by_me.includes('?') ? '&' : '?'}action=select_media`
            : linksConfig.profile.shared_by_me;

        const sharedWithMeBase = shareMediaDisabled
            ? `${linksConfig.profile.shared_with_me}${linksConfig.profile.shared_with_me.includes('?') ? '&' : '?'}share_media=0`
            : linksConfig.profile.shared_with_me;
        const sharedWithMeLink = isSelectMediaMode
            ? `${sharedWithMeBase}${sharedWithMeBase.includes('?') ? '&' : '?'}action=select_media`
            : sharedWithMeBase;

        const visibleTabs = [
            { key: 'media', label: i18n.t('profile.nav.home'), href: mediaLink },
            userIsAuthor
                ? { key: 'shared_by_me', label: i18n.t('profile.nav.sharedByMe'), href: sharedByMeLink }
                : null,
            userIsAuthor
                ? { key: 'shared_with_me', label: i18n.t('profile.nav.sharedWithMe'), href: sharedWithMeLink }
                : null,
            !isSelectMediaMode && memberConfig.can.saveMedia
                ? { key: 'playlists', label: i18n.t('profile.nav.playlists'), href: linksConfig.profile.playlists }
                : null,
            PageStore.get('config-options').pages.profile.includeHistory && userIsAuthor
                ? { key: 'history', label: PageStore.get('config-enabled').pages.history.title, href: linksConfig.user.history }
                : null,
            PageStore.get('config-options').pages.profile.includeLikedMedia && userIsAuthor
                ? { key: 'liked', label: PageStore.get('config-enabled').pages.liked.title, href: linksConfig.user.liked }
                : null,
        ].filter(Boolean);

        const tabItems = visibleTabs.map((tab) => ({
            key: tab.key,
            label: (
                <a
                    href={tab.href}
                    title={tab.label}
                    aria-current={this.props.type === tab.key ? 'page' : undefined}
                    onClick={(event) => {
                        event.stopPropagation();
                        if (!this.props.onTabChange || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                        event.preventDefault();
                        this.props.onTabChange(tab.key, tab.href);
                    }}
                >
                    {tab.label}
                </a>
            ),
        }));

        return (
            <nav className="profile-nav items-list-outer list-inline list-slider">
                <div className="profile-nav-inner items-list-outer">
                    <Tabs
                        className="profile-ant-tabs"
                        type="line"
                        activeKey={this.props.type}
                        items={tabItems}
                        onChange={(key) => {
                            const tab = visibleTabs.find((item) => item.key === key);
                            if (!tab) return;
                            if (this.props.onTabChange && ['media', 'about', 'shared_by_me', 'shared_with_me', 'playlists'].includes(key)) {
                                this.props.onTabChange(key, tab.href);
                            } else {
                                window.location.assign(tab.href);
                            }
                        }}
                    />

                    <div className="profile-nav-actions">

                        {!['about', 'playlists'].includes(this.props.type) ? (
                            <span className="media-search">
                                <ProfileSearchBar
                                    onQueryChange={this.props.onQueryChange}
                                    type={this.props.type}
                                />
                            </span>
                        ) : null}
                        {this.props.onToggleFiltersClick &&
                        ['media', 'shared_by_me', 'shared_with_me'].includes(this.props.type) ? (
                            <span className="media-filters-toggle">
                                <span
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        position: 'relative',
                                    }}
                                    onClick={this.props.onToggleFiltersClick}
                                    title={translateString('Filters')}
                                >
                                    <CircleIconButton buttonShadow={false}>
                                        <i className="material-icons">filter_list</i>
                                    </CircleIconButton>
                                    {this.props.hasActiveFilters ? (
                                        <span
                                            style={{
                                                position: 'absolute',
                                                top: '8px',
                                                right: '8px',
                                                width: '8px',
                                                height: '8px',
                                                borderRadius: '50%',
                                                backgroundColor: 'var(--default-theme-color)',
                                                border: '2px solid white',
                                            }}
                                        ></span>
                                    ) : null}
                                </span>
                            </span>
                        ) : null}
                        {this.props.onToggleSharingClick &&
                        ['media', 'shared_by_me', 'shared_with_me'].includes(this.props.type) ? (
                            <span className="media-sharing-toggle">
                                <span
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        position: 'relative',
                                    }}
                                    onClick={this.props.onToggleSharingClick}
                                    title={i18n.t('profile.sharedWithFilter')}
                                >
                                    <CircleIconButton buttonShadow={false}>
                                        <i className="material-icons">people</i>
                                    </CircleIconButton>
                                    {this.props.hasActiveSharing ? (
                                        <span
                                            style={{
                                                position: 'absolute',
                                                top: '8px',
                                                right: '8px',
                                                width: '8px',
                                                height: '8px',
                                                borderRadius: '50%',
                                                backgroundColor: 'var(--default-theme-color)',
                                                border: '2px solid white',
                                            }}
                                        ></span>
                                    ) : null}
                                </span>
                            </span>
                        ) : null}
                        {this.props.onToggleTagsClick &&
                        ['media', 'shared_by_me', 'shared_with_me'].includes(this.props.type) ? (
                            <span className="media-tags-toggle">
                                <span
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        position: 'relative',
                                    }}
                                    onClick={this.props.onToggleTagsClick}
                                    title={translateString('Tags')}
                                >
                                    <CircleIconButton buttonShadow={false}>
                                        <i className="material-icons">local_offer</i>
                                    </CircleIconButton>
                                    {this.props.hasActiveTags ? (
                                        <span
                                            style={{
                                                position: 'absolute',
                                                top: '8px',
                                                right: '8px',
                                                width: '8px',
                                                height: '8px',
                                                borderRadius: '50%',
                                                backgroundColor: 'var(--default-theme-color)',
                                                border: '2px solid white',
                                            }}
                                        ></span>
                                    ) : null}
                                </span>
                            </span>
                        ) : null}
                        {this.props.onToggleSortingClick &&
                        ['media', 'shared_by_me', 'shared_with_me'].includes(this.props.type) ? (
                            <span className="media-sorting-toggle">
                                <span
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        position: 'relative',
                                    }}
                                    onClick={this.props.onToggleSortingClick}
                                    title={translateString('Sort By')}
                                >
                                    <CircleIconButton buttonShadow={false}>
                                        <i className="material-icons">swap_vert</i>
                                    </CircleIconButton>
                                    {this.props.hasActiveSort ? (
                                        <span
                                            style={{
                                                position: 'absolute',
                                                top: '8px',
                                                right: '8px',
                                                width: '8px',
                                                height: '8px',
                                                borderRadius: '50%',
                                                backgroundColor: 'var(--default-theme-color)',
                                                border: '2px solid white',
                                            }}
                                        ></span>
                                    ) : null}
                                </span>
                            </span>
                        ) : null}
                    </div>
                </div>
            </nav>
        );
    }
}

function AddBannerButton(props) {
    let link = props.link;

    if (window.MediaCMS.site.devEnv) {
        link = '/edit-channel.html';
    }
    return (
        <a href={link} className="edit-channel-icon" title={i18n.t('profile.addBanner')}>
            <i className="material-icons">add_photo_alternate</i>
            {props.showLabel ? <span>{i18n.t('profile.addBanner')}</span> : null}
        </a>
    );
}

function EditBannerButton(props) {
    let link = props.link;

    if (window.MediaCMS.site.devEnv) {
        link = '/edit-channel.html';
    }
    return (
        <a href={link} className="edit-channel-icon" title={i18n.t('profile.editBanner')}>
            <i className="material-icons">edit</i>
            {props.showLabel ? <span>{i18n.t('profile.editBanner')}</span> : null}
        </a>
    );
}

function EditProfileButton(props) {
    let link = props.link;

    if (window.MediaCMS.site.devEnv) {
        link = '/edit-profile.html';
    }

    return (
        <a href={link} className="edit-profile-icon" title={i18n.t('profile.editProfile')}>
            {props.showLabel ? i18n.t('profile.editProfile') : <i className="material-icons">edit</i>}
        </a>
    );
}

export default function ProfilePagesHeader(rawProps) {
    const props = applyDefaultProps(rawProps, ProfilePagesHeader.defaultPropValues);
    const [popupContentRef, PopupContent, PopupTrigger] = usePopup();

    const profilePageHeaderRef = useRef(null);

    const userIsAdmin = !memberConfig.is.anonymous && memberConfig.is.admin;
    const userIsAuthor =
        !memberConfig.is.anonymous &&
        ProfilePageStore.get('author-data').username === memberConfig.username;
    const userCanEditProfile =
        userIsAuthor || (!memberConfig.is.anonymous && memberConfig.can.editProfile);
    const userCanDeleteProfile =
        userIsAdmin ||
        userIsAuthor ||
        (!memberConfig.is.anonymous && memberConfig.can.deleteProfile);

    function cancelProfileRemoval() {
        popupContentRef.current.toggle();
    }

    function proceedMediaRemoval() {
        ProfilePageActions.remove_profile();
        popupContentRef.current.toggle();
    }

    function onProfileDelete(username) {
        // FIXME: Without delay creates conflict [ Uncaught Error: Dispatch.dispatch(...): Cannot dispatch in the middle of a dispatch. ].
        setTimeout(function () {
            PageActions.addNotification(i18n.t('profile.removeProfileSuccess'), 'profileDelete');
            setTimeout(function () {
                window.location.href = siteConfig.url;
            }, 2000);
        }, 100);

        if (void 0 !== username) {
            console.info("Removed user's profile '" + username + '"');
        }
    }

    function onProfileDeleteFail(username) {
        // FIXME: Without delay creates conflict [ Uncaught Error: Dispatch.dispatch(...): Cannot dispatch in the middle of a dispatch. ].
        setTimeout(function () {
            PageActions.addNotification(i18n.t('profile.removeProfileFailed'), 'profileDeleteFail');
        }, 100);

        if (void 0 !== username) {
            console.info('Profile "' + username + '"' + ' removal failed');
        }
    }

    useEffect(() => {
        if (userCanDeleteProfile) {
            ProfilePageStore.on('profile_delete', onProfileDelete);
            ProfilePageStore.on('profile_delete_fail', onProfileDeleteFail);
        }

        return () => {
            if (userCanDeleteProfile) {
                ProfilePageStore.removeListener('profile_delete', onProfileDelete);
                ProfilePageStore.removeListener('profile_delete_fail', onProfileDeleteFail);
            }
        };
    }, []);

    return (
        <div
            ref={profilePageHeaderRef}
            className={'profile-page-header' + (!props.hideChannelBanner && props.author.banner_thumbnail_url ? ' has-banner' : '')}
            {...(isSelectMediaMode() ? { 'data-action': 'select_media' } : {})}
        >
            {!props.hideChannelBanner && (
                <span className="profile-banner-wrap">
                    {props.author.banner_thumbnail_url ? (
                        <span
                            className="profile-banner"
                            style={{
                                backgroundImage:
                                    'url(' +
                                    siteConfig.url +
                                    '/' +
                                    props.author.banner_thumbnail_url.replace(/^\//g, '') +
                                    ')',
                            }}
                        ></span>
                    ) : null}

                    {userCanDeleteProfile && !userIsAuthor ? (
                        <span className="delete-profile-wrap">
                            <PopupTrigger contentRef={popupContentRef}>
                                <button className="delete-profile" title={i18n.t('profile.removeProfile')}>
                                    <i className="material-icons">delete</i>
                                </button>
                            </PopupTrigger>

                            <PopupContent contentRef={popupContentRef}>
                                <PopupMain>
                                    <div className="popup-message">
                                        <span className="popup-message-title">{i18n.t('profile.removeProfile')}</span>
                                        <span className="popup-message-main">
                                            {i18n.t('profile.removeProfileConfirm')}
                                        </span>
                                    </div>
                                    <hr />
                                    <span className="popup-message-bottom">
                                        <button
                                            className="button-link cancel-profile-removal"
                                            onClick={cancelProfileRemoval}
                                        >
                                            {i18n.t('profile.cancel')}
                                        </button>
                                        <button
                                            className="button-link proceed-profile-removal"
                                            onClick={proceedMediaRemoval}
                                        >
                                            {i18n.t('profile.proceed')}
                                        </button>
                                    </span>
                                </PopupMain>
                            </PopupContent>
                        </span>
                    ) : null}

                    {userCanEditProfile && userIsAuthor ? (
                        props.author.banner_thumbnail_url ? (
                            <EditBannerButton link={ProfilePageStore.get('author-data').default_channel_edit_url} showLabel={true} />
                        ) : (
                            <AddBannerButton link={ProfilePageStore.get('author-data').default_channel_edit_url} showLabel={true} />
                        )
                    ) : null}
                </span>
            )}

            <div className="profile-info-nav-wrap">
                {!inEmbeddedApp() && (props.author.thumbnail_url || props.author.name) ? (
                    <div className="profile-info">
                        <div className="profile-info-inner">
                            <div>
                                {props.author.thumbnail_url ? <img src={props.author.thumbnail_url} alt={props.author.name || props.author.username} /> : null}
                            </div>
                            <div>
                                {props.author.name ? (
                                    <div className="profile-name-edit-wrapper">
                                        <h1>{props.author.name}</h1>
                                        {userCanEditProfile && !userIsAuthor ? (
                                            <EditProfileButton link={ProfilePageStore.get('author-data').edit_url} showLabel={true} />
                                        ) : null}
                                    </div>
                                ) : null}
                                <span className="profile-handle">@{props.author.username}</span>
                                {props.author.description ? <span className="profile-signature">{props.author.description}</span> : null}
                            </div>
                            {userIsAuthor && userCanEditProfile ? (
                                <div className="profile-header-actions">
                                    <a href={props.author.edit_url}>{i18n.t('profile.editProfile')}</a>
                                </div>
                            ) : null}
                        </div>
                    </div>
                ) : null}

                <NavMenuInlineTabs
                    type={props.type}
                    onTabChange={props.onTabChange}
                    onQueryChange={props.onQueryChange}
                    onToggleFiltersClick={props.onToggleFiltersClick}
                    onToggleSharingClick={userIsAuthor ? props.onToggleSharingClick : undefined}
                    onToggleTagsClick={props.onToggleTagsClick}
                    onToggleSortingClick={props.onToggleSortingClick}
                    hasActiveFilters={props.hasActiveFilters}
                    hasActiveSharing={props.hasActiveSharing}
                    hasActiveTags={props.hasActiveTags}
                    hasActiveSort={props.hasActiveSort}
                />
            </div>
        </div>
    );
}

ProfilePagesHeader.defaultPropValues = {
    type: 'media',
};
