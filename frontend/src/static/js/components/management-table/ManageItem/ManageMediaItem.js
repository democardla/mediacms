import React, { useRef, useState, useEffect, useCallback } from 'react';
import i18n from '../../../i18n';
import { usePopup } from '../../../utils/hooks/usePopup';
import { formatManagementTableDate } from '../../../utils/helpers/';
import { PageStore } from '../../../utils/stores/';
import { PopupMain } from '../../_shared';
import { MaterialIcon } from '../../_shared/material-icon/MaterialIcon';

function ManageItemTitle(props) {
  if (void 0 !== props.title && void 0 !== props.url) {
    return (
      <a href={props.url} title={props.title}>
        {props.title}
      </a>
    );
  }

  if (void 0 !== props.title) {
    return props.title;
  }

  if (void 0 !== props.url) {
    return props.url;
  }

  return <i className="non-available">{i18n.t('admin.table.notAvailable')}</i>;
}

export function ManageItemDate(props) {
  if (void 0 !== props.date) {
    return formatManagementTableDate(new Date(Date.parse(props.date)));
  }

  return <i className="non-available">{i18n.t('admin.table.notAvailable')}</i>;
}

function ManageItemMediaAuthor(props) {
  if (void 0 !== props.name && void 0 !== props.url) {
    return (
      <a href={props.url} title={props.name}>
        {props.name}
      </a>
    );
  }

  if (void 0 !== props.name) {
    return props.name;
  }

  if (void 0 !== props.url) {
    return props.url;
  }

  return <i className="non-available">{i18n.t('admin.table.notAvailable')}</i>;
}

function localizedMediaValue(value) {
  if (void 0 === value || null === value || '' === value) {
    return <i className="non-available">{i18n.t('admin.table.notAvailable')}</i>;
  }

  const normalizedValue = String(value).toLowerCase();
  const valueKey = normalizedValue === 'fail' ? 'failed' : normalizedValue;
  const key = `admin.filters.${valueKey}`;
  return i18n.exists(key) ? i18n.t(key) : value;
}

function ManageItemMediaActions(props) {
  const [popupContentRef, PopupContent, PopupTrigger] = usePopup();
  const [isOpenPopup, setIsOpenPopup] = useState(false);

  function onPopupShow() {
    setIsOpenPopup(true);
  }

  function onPopupHide() {
    setIsOpenPopup(false);
  }

  function onCancel() {
    popupContentRef.current.tryToHide();
    if ('function' === typeof props.onCancel) {
      props.onCancel();
    }
  }

  function onProceed() {
    popupContentRef.current.tryToHide();
    if ('function' === typeof props.onProceed) {
      props.onProceed();
    }
  }

  const positionState = { updating: false, pending: 0 };

  const onWindowResize = useCallback(function () {
    if (positionState.updating) {
      positionState.pending = positionState.pending + 1;
    } else {
      positionState.updating = true;

      const popupElem = props.containerRef.current.querySelector('.popup');

      if (popupElem) {
        const containerClientRect = props.containerRef.current.getBoundingClientRect();

        popupElem.style.position = 'fixed';
        popupElem.style.left = containerClientRect.x + 'px';

        if (document.body.offsetHeight < 32 + popupElem.offsetHeight + window.scrollY + containerClientRect.top) {
          popupElem.style.top = containerClientRect.y - popupElem.offsetHeight + 'px';
        } else {
          popupElem.style.top = containerClientRect.y + containerClientRect.height + 'px';
        }
      }

      setTimeout(() => {
        positionState.updating = false;

        if (positionState.pending) {
          positionState.pending = 0;
          onWindowResize();
        }
      }, 8);
    }
  }, []);

  useEffect(() => {
    if (isOpenPopup) {
      PageStore.on('window_scroll', onWindowResize);
      PageStore.on('window_resize', onWindowResize);
      onWindowResize();
    } else {
      PageStore.removeListener('window_scroll', onWindowResize);
      PageStore.removeListener('window_resize', onWindowResize);
    }
  }, [isOpenPopup]);

  return (
    <div ref={props.containerRef} className="actions">
      <PopupTrigger contentRef={popupContentRef}>
        <button title={i18n.t('admin.actions.delete') + (void 0 !== props.title ? ' “' + props.title + '”' : '')}>
          {i18n.t('admin.actions.delete')}
        </button>
      </PopupTrigger>

      <PopupContent contentRef={popupContentRef} showCallback={onPopupShow} hideCallback={onPopupHide}>
        <PopupMain>
          <div className="popup-message">
            <span className="popup-message-title">{i18n.t('admin.actions.mediaRemovalTitle')}</span>
            <span className="popup-message-main">
              {void 0 !== props.title
                ? i18n.t('admin.actions.mediaRemovalConfirmNamed', { title: props.title })
                : i18n.t('admin.actions.mediaRemovalConfirm')}
            </span>
          </div>
          <hr />
          <span className="popup-message-bottom">
            <button className="button-link cancel-profile-removal" onClick={onCancel}>
              {i18n.t('admin.actions.cancel')}
            </button>
            <button className="button-link proceed-profile-removal" onClick={onProceed}>
              {i18n.t('admin.actions.proceed')}
            </button>
          </span>
        </PopupMain>
      </PopupContent>
    </div>
  );
}

export function ManageMediaItem(props) {
  const actionsContainerRef = useRef(null);

  const [selected, setSelected] = useState(false);

  function onRowCheck() {
    setSelected(!selected);
  }

  function onClickProceed() {
    if ('function' === typeof props.onProceedRemoval) {
      props.onProceedRemoval(props.token);
    }
  }

  useEffect(() => {
    if ('function' === typeof props.onCheckRow) {
      props.onCheckRow(props.token, selected);
    }
  }, [selected]);

  useEffect(() => {
    setSelected(props.selectedRow);
  }, [props.selectedRow]);

  return (
    <div className="item manage-item manage-media-item">
      <div className="mi-checkbox">
        <input type="checkbox" checked={selected} onChange={onRowCheck} />
      </div>
      <div className="mi-title">
        <ManageItemTitle title={props.title} url={props.url} />
        {props.hideDeleteAction ? null : (
          <ManageItemMediaActions containerRef={actionsContainerRef} title={props.title} onProceed={onClickProceed} />
        )}
      </div>
      <div className="mi-added">
        <ManageItemDate date={props.add_date} />
      </div>
      <div className="mi-author">
        <ManageItemMediaAuthor name={props.author_name} url={props.author_url} />
      </div>
      <div className="mi-type">
        {localizedMediaValue(props.media_type)}
      </div>
      <div className="mi-encoding">
        {localizedMediaValue(props.encoding_status)}
      </div>
      <div className="mi-state">{localizedMediaValue(props.state)}</div>
      <div className="mi-reviewed">
        {void 0 === props.is_reviewed ? (
          <i className="non-available">{i18n.t('admin.table.notAvailable')}</i>
        ) : props.is_reviewed ? (
          <MaterialIcon type="check_circle" />
        ) : (
          <MaterialIcon type="cancel" />
        )}
      </div>
      <div className="mi-featured">
        {void 0 === props.featured ? (
          <i className="non-available">{i18n.t('admin.table.notAvailable')}</i>
        ) : props.featured ? (
          <MaterialIcon type="check_circle" />
        ) : (
          '-'
        )}
      </div>
      <div className="mi-reported">
        {void 0 === props.reported_times ? (
          <i className="non-available">{i18n.t('admin.table.notAvailable')}</i>
        ) : 0 === props.reported_times ? (
          <span>-</span>
        ) : (
          <span className="reported-number">
            {props.reported_times} {i18n.t('admin.table.time', { count: props.reported_times })}
          </span>
        )}
      </div>
    </div>
  );
}
