import React, { useState, useRef, useEffect } from 'react';
import i18n from '../i18n';
import './BulkActionsDropdown.scss';
import { inEmbeddedApp } from '../utils/helpers/embeddedApp';

interface BulkActionsDropdownProps {
  selectedCount: number;
  onActionSelect: (action: string) => void;
  hasContributorCourses?: boolean;
}

interface BulkAction {
  value: string;
  label: string;
  enabled: boolean;
  allowsNoSelection?: boolean;
}

interface BulkActionGroup {
  label: string;
  actions: BulkAction[];
}

export const BulkActionsDropdown: React.FC<BulkActionsDropdownProps> = ({ selectedCount, onActionSelect, hasContributorCourses = false }) => {
  const isLmsMode = inEmbeddedApp();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const BULK_ACTION_GROUPS: BulkActionGroup[] = [
    {
      label: i18n.t('profile.bulk.sharing'),
      actions: [
        { value: 'add-remove-coviewers', label: i18n.t('profile.bulk.shareViewers'), enabled: true },
        { value: 'add-remove-coeditors', label: i18n.t('profile.bulk.shareEditors'), enabled: true },
        { value: 'add-remove-coowners', label: i18n.t('profile.bulk.shareOwners'), enabled: true },
        { value: 'add-remove-category', label: i18n.t(isLmsMode ? 'profile.bulk.shareCourse' : 'profile.bulk.categories'), enabled: true },
      ],
    },
    {
      label: i18n.t('profile.bulk.organization'),
      actions: [
        { value: 'add-remove-playlist', label: i18n.t('profile.bulk.playlists'), enabled: true },
        { value: 'add-remove-tags', label: i18n.t('profile.bulk.tags'), enabled: true },
      ],
    },
    {
      label: i18n.t('profile.bulk.settings'),
      actions: [
        { value: 'enable-comments', label: i18n.t('profile.bulk.enableComments'), enabled: true },
        { value: 'disable-comments', label: i18n.t('profile.bulk.disableComments'), enabled: true },
        { value: 'delete-comments', label: i18n.t('profile.bulk.deleteComments'), enabled: true },
        { value: 'enable-download', label: i18n.t('profile.bulk.enableDownload'), enabled: true },
        { value: 'disable-download', label: i18n.t('profile.bulk.disableDownload'), enabled: true },
      ],
    },
    {
      label: i18n.t('profile.bulk.management'),
      actions: [
        { value: 'publish-state', label: i18n.t('profile.bulk.publishState'), enabled: true },
        { value: 'change-owner', label: i18n.t('profile.bulk.changeOwner'), enabled: true },
        { value: 'copy-media', label: i18n.t('profile.bulk.copyMedia'), enabled: true },
        { value: 'delete-media', label: i18n.t('profile.bulk.deleteMedia'), enabled: true },
        ...(isLmsMode && hasContributorCourses
          ? [{ value: 'course-cleanup', label: i18n.t('profile.bulk.courseCleanup'), enabled: true, allowsNoSelection: true }]
          : []),
      ],
    },
  ];

  const noSelection = selectedCount === 0;

  const displayText = noSelection
    ? i18n.t('profile.bulk.actions')
    : i18n.t('profile.bulk.actionsSelected', { count: selectedCount });

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', keyHandler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', keyHandler);
    };
  }, [isOpen]);

  const handleSelect = (action: BulkAction) => {
    const isDisabled = (!action.allowsNoSelection && noSelection) || !action.enabled;
    if (isDisabled) return;
    onActionSelect(action.value);
    setIsOpen(false);
  };

  return (
    <div className="bulk-actions-dropdown" ref={dropdownRef}>
      <button
        type="button"
        className={'bulk-actions-trigger' + (noSelection ? ' no-selection' : '') + (isOpen ? ' is-open' : '')}
        onClick={() => setIsOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {displayText}
        <svg
          className="bulk-actions-chevron"
          xmlns="http://www.w3.org/2000/svg"
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div className="bulk-actions-menu" role="listbox">
          {BULK_ACTION_GROUPS.map((group) => (
            <div key={group.label} className="bulk-actions-group">
              <div className="bulk-actions-group-label">{group.label}</div>
              {group.actions.map((action) => {
                const isDisabled = (!action.allowsNoSelection && noSelection) || !action.enabled;
                return (
                  <button
                    key={action.value}
                    type="button"
                    className={'bulk-actions-item' + (isDisabled ? ' is-disabled' : '')}
                    onClick={() => handleSelect(action)}
                    disabled={isDisabled}
                    role="option"
                  >
                    {action.label}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
