import React, { useRef, useState, useEffect, useCallback } from 'react';
import i18n from '../../../i18n';
import { usePopup, useUser } from '../../../utils/hooks/';
import { PageStore } from '../../../utils/stores/';
import { csrfToken, rememberMessage } from '../../../utils/helpers/';
import { PopupMain } from '../../_shared';
import { MaterialIcon } from '../../_shared/material-icon/MaterialIcon.jsx';
import { ManageItemDate } from './ManageMediaItem';
import { applyDefaultProps } from '../../../utils/helpers/applyDefaultProps';

function ManageItemName(props) {
  if (void 0 !== props.url) {
    if (null !== props.name && '' !== props.name) {
      return (
        <a href={props.url} title={props.name}>
          {props.name}
        </a>
      );
    }
  } else if (null !== props.name && '' !== props.name) {
    return props.name;
  }

  return <i className="non-available">{i18n.t('admin.table.notAvailable')}</i>;
}

function ManageItemUsername(props) {
  if (void 0 !== props.url) {
    if (null !== props.username && '' !== props.username) {
      return (
        <a href={props.url} title={props.username}>
          {props.username}
        </a>
      );
    }
  } else if (null !== props.username && '' !== props.username) {
    return props.username;
  }

  return <i className="non-available">{i18n.t('admin.table.notAvailable')}</i>;
}

function ManageUsersItemActions(props) {
  const { userCan } = useUser();
  const [deletePopupRef, DeletePopupContent, DeletePopupTrigger] = usePopup();
  const [passwordPopupRef, PasswordPopupContent, PasswordPopupTrigger] = usePopup();
  const [approvePopupRef, ApprovePopupContent, ApprovePopupTrigger] = usePopup();

  const [newPassword, setNewPassword] = useState('');

  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const [isPasswordOpen, setPasswordOpen] = useState(false);
  const [isApproveOpen, setApproveOpen] = useState(false);

  function onProceedDelete() {
    deletePopupRef.current.tryToHide();
    if ('function' === typeof props.onProceed) {
      props.onProceed();
    }
  }
  function onCancelDelete() {
    deletePopupRef.current.tryToHide();
  }

  function handlePasswordChangeSubmit(e) {
    e.preventDefault();
    props.setMessage({ type: '', text: '' });

    const formData = new FormData();
    formData.append('action', 'change_password');
    formData.append('password', newPassword);

    fetch(`/api/v1/users/${props.username}`, {
      method: 'PUT',
      body: formData,
      headers: { 'X-CSRFToken': csrfToken() },
    })
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
        return res.json().then((data) => {
          throw new Error(data.detail || i18n.t('admin.actions.passwordChangeFailed'));
        });
      })
      .then(() => {
        rememberMessage({ type: 'success', text: i18n.t('admin.actions.passwordChanged') });
        window.location.reload();
      })
      .catch((err) => {
        props.setMessage({ type: 'error', text: err.message });
      });
  }

  function handleApproveUser() {
    props.setMessage({ type: '', text: '' });
    const formData = new FormData();
    formData.append('action', 'approve_user');

    fetch(`/api/v1/users/${props.username}`, {
      method: 'PUT',
      body: formData,
      headers: { 'X-CSRFToken': csrfToken() },
    })
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
        return res.json().then((data) => {
          throw new Error(data.detail || i18n.t('admin.actions.userApproveFailed'));
        });
      })
      .then(() => {
        rememberMessage({ type: 'success', text: i18n.t('admin.actions.userApproved') });
        window.location.reload();
      })
      .catch((err) => {
        props.setMessage({ type: 'error', text: err.message });
      });
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

  const isOpenPopup = isDeleteOpen || isPasswordOpen || isApproveOpen;

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
      <PasswordPopupTrigger contentRef={passwordPopupRef}>
        <button>{i18n.t('admin.actions.changePassword')}</button>
      </PasswordPopupTrigger>
      {userCan.usersNeedsToBeApproved && !props.is_approved && (
        <>
          <span className="seperator">|</span>
          <ApprovePopupTrigger contentRef={approvePopupRef}>
            <button>{i18n.t('admin.actions.approve')}</button>
          </ApprovePopupTrigger>
        </>
      )}
      <span className="seperator">|</span>
      <DeletePopupTrigger contentRef={deletePopupRef}>
        <button title={`${i18n.t('admin.actions.delete')} “${props.name}”`}>{i18n.t('admin.actions.delete')}</button>
      </DeletePopupTrigger>

      <PasswordPopupContent
        contentRef={passwordPopupRef}
        showCallback={() => setPasswordOpen(true)}
        hideCallback={() => {
          setPasswordOpen(false);
          props.setMessage({ type: '', text: '' });
        }}
      >
        <PopupMain>
          <form onSubmit={handlePasswordChangeSubmit}>
            <div className="popup-message">
              <span className="popup-message-title">
                {i18n.t('admin.actions.changePasswordTitle', { name: props.name })}
              </span>
              <span className="popup-message-main">
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={i18n.t('admin.actions.newPassword')}
                  required
                  style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                />
              </span>
            </div>
            <hr />
            <span className="popup-message-bottom">
              <button
                type="button"
                className="button-link cancel-profile-removal"
                onClick={() => passwordPopupRef.current.tryToHide()}
              >
                {i18n.t('admin.actions.cancel')}
              </button>
              <button type="submit" className="button-link proceed-profile-removal">
                {i18n.t('admin.actions.submit')}
              </button>
            </span>
          </form>
        </PopupMain>
      </PasswordPopupContent>

      <ApprovePopupContent
        contentRef={approvePopupRef}
        showCallback={() => setApproveOpen(true)}
        hideCallback={() => {
          setApproveOpen(false);
          props.setMessage({ type: '', text: '' });
        }}
      >
        <PopupMain>
          <div className="popup-message">
            <span className="popup-message-title">{i18n.t('admin.actions.approveUserTitle')}</span>
            <span className="popup-message-main">
              {i18n.t('admin.actions.approveUserConfirm', { name: props.name })}
            </span>
          </div>
          <hr />
          <span className="popup-message-bottom">
            <button className="button-link cancel-profile-removal" onClick={() => approvePopupRef.current.tryToHide()}>
              {i18n.t('admin.actions.cancel')}
            </button>
            <button className="button-link proceed-profile-removal" onClick={handleApproveUser}>
              {i18n.t('admin.actions.proceed')}
            </button>
          </span>
        </PopupMain>
      </ApprovePopupContent>

      <DeletePopupContent
        contentRef={deletePopupRef}
        showCallback={() => setDeleteOpen(true)}
        hideCallback={() => setDeleteOpen(false)}
      >
        <PopupMain>
          <div className="popup-message">
            <span className="popup-message-title">{i18n.t('admin.actions.userRemovalTitle')}</span>
            <span className="popup-message-main">
              {i18n.t('admin.actions.userRemovalConfirm', { name: props.name })}
            </span>
          </div>
          <hr />
          <span className="popup-message-bottom">
            <button className="button-link cancel-profile-removal" onClick={onCancelDelete}>
              {i18n.t('admin.actions.cancel')}
            </button>
            <button className="button-link proceed-profile-removal" onClick={onProceedDelete}>
              {i18n.t('admin.actions.proceed')}
            </button>
          </span>
        </PopupMain>
      </DeletePopupContent>
    </div>
  );
}

export function ManageUsersItem(rawProps) {
  const props = applyDefaultProps(rawProps, ManageUsersItem.defaultPropValues);
  const actionsContainerRef = useRef(null);

  const [selected, setSelected] = useState(false);

  function onRowCheck() {
    setSelected(!selected);
  }

  function onClickProceed() {
    if ('function' === typeof props.onProceedRemoval) {
      props.onProceedRemoval(props.username);
    }
  }

  useEffect(() => {
    if ('function' === typeof props.onCheckRow) {
      props.onCheckRow(props.username, selected);
    }
  }, [selected]);

  useEffect(() => {
    setSelected(props.selectedRow);
  }, [props.selectedRow]);

  return (
    <div className="item manage-item manage-users-item">
      <div className="mi-checkbox">
        <input type="checkbox" checked={selected} onChange={onRowCheck} />
      </div>
      <div className="mi-name">
        <ManageItemName name={props.name} url={props.url} />
        <ManageUsersItemActions
          containerRef={actionsContainerRef}
          name={props.name || props.username}
          username={props.username}
          is_approved={props.is_approved}
          onProceed={onClickProceed}
          onUserUpdate={props.onUserUpdate}
          setMessage={props.setMessage}
        />
      </div>
      <div className="mi-username">
        <ManageItemUsername username={props.username} url={props.url} />
      </div>
      <div className="mi-added">
        <ManageItemDate date={props.add_date} />
      </div>
      {props.has_roles ? (
        <div className="mi-role">
          {void 0 === props.roles ? (
            <i className="non-available">{i18n.t('admin.table.notAvailable')}</i>
          ) : props.roles.length ? (
            props.roles
              .map((role) => i18n.t(role === 'Editor' ? 'admin.filters.editor' : 'admin.filters.manager'))
              .join('\n')
          ) : (
            '-'
          )}
        </div>
      ) : null}
      {props.has_verified ? (
        <div className="mi-verified">
          {void 0 === props.is_verified ? (
            <i className="non-available">{i18n.t('admin.table.notAvailable')}</i>
          ) : props.is_verified ? (
            <MaterialIcon type="check_circle" />
          ) : (
            '-'
          )}
        </div>
      ) : null}
      {props.has_trusted ? (
        <div className="mi-trusted">
          {void 0 === props.is_trusted ? (
            <i className="non-available">{i18n.t('admin.table.notAvailable')}</i>
          ) : props.is_trusted ? (
            <MaterialIcon type="check_circle" />
          ) : (
            '-'
          )}
        </div>
      ) : null}
      {props.has_approved ? (
        <div className="mi-approved">
          {void 0 === props.is_approved || props.is_approved === null ? (
            <i className="non-available">{i18n.t('admin.table.notAvailable')}</i>
          ) : props.is_approved ? (
            <MaterialIcon type="check_circle" />
          ) : (
            <MaterialIcon type="cancel" />
          )}
        </div>
      ) : null}
      <div className="mi-featured">
        {void 0 === props.is_featured ? (
          <i className="non-available">{i18n.t('admin.table.notAvailable')}</i>
        ) : props.is_featured ? (
          <MaterialIcon type="check_circle" />
        ) : (
          '-'
        )}
      </div>
    </div>
  );
}

ManageUsersItem.defaultPropValues = {
  has_roles: false,
  has_verified: false,
  has_trusted: false,
  has_approved: false,
  onUserUpdate: () => {},
  setMessage: () => {},
};
