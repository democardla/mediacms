import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { PageStore } from '../../utils/stores/';
import { FilterOptions } from '../_shared';

import './ManageItemList-filters.scss';
import { applyDefaultProps } from '../../utils/helpers/applyDefaultProps';

// Get categories from window if available
const categories = window.CATEGORIES
  ? [{ id: 'all', titleKey: 'admin.filters.all' }].concat(window.CATEGORIES.map((cat) => ({ id: cat.uid, title: cat.title })))
  : [{ id: 'all', titleKey: 'admin.filters.all' }];

const filters = {
  state: [
    { id: 'all', titleKey: 'admin.filters.all' },
    { id: 'public', titleKey: 'admin.filters.public' },
    { id: 'private', titleKey: 'admin.filters.private' },
    { id: 'unlisted', titleKey: 'admin.filters.unlisted' },
  ],
  media_type: [
    { id: 'all', titleKey: 'admin.filters.all' },
    { id: 'video', titleKey: 'admin.filters.video' },
    { id: 'audio', titleKey: 'admin.filters.audio' },
    { id: 'image', titleKey: 'admin.filters.image' },
    { id: 'pdf', titleKey: 'admin.filters.pdf' },
  ],
  encoding_status: [
    { id: 'all', titleKey: 'admin.filters.all' },
    { id: 'success', titleKey: 'admin.filters.success' },
    { id: 'running', titleKey: 'admin.filters.running' },
    { id: 'pending', titleKey: 'admin.filters.pending' },
    { id: 'fail', titleKey: 'admin.filters.failed' },
  ],
  reviewed: [
    { id: 'all', titleKey: 'admin.filters.all' },
    { id: 'true', titleKey: 'admin.filters.yes' },
    { id: 'false', titleKey: 'admin.filters.no' },
  ],
  featured: [
    { id: 'all', titleKey: 'admin.filters.all' },
    { id: 'true', titleKey: 'admin.filters.yes' },
    { id: 'false', titleKey: 'admin.filters.no' },
  ],
};

function localizedOptions(options, t) {
  return options.map(({ titleKey, ...option }) => ({
    ...option,
    title: titleKey ? t(titleKey) : option.title,
  }));
}

export function ManageMediaFilters(rawProps) {
  const { t } = useTranslation();
  const props = applyDefaultProps(rawProps, ManageMediaFilters.defaultPropValues);
  const [isHidden, setIsHidden] = useState(props.hidden);

  const [state, setState] = useState('all');
  const [mediaType, setMediaType] = useState('all');
  const [encodingStatus, setEncodingStatus] = useState('all');
  const [isFeatured, setIsFeatured] = useState('all');
  const [isReviewed, setIsReviewed] = useState('all');
  const [category, setCategory] = useState('all');

  const containerRef = useRef(null);
  const innerContainerRef = useRef(null);

  function onWindowResize() {
    if (!isHidden) {
      containerRef.current.style.height = 24 + innerContainerRef.current.offsetHeight + 'px';
    }
  }

  function onFilterSelect(ev) {
    const args = {
      state: state,
      media_type: mediaType,
      encoding_status: encodingStatus,
      featured: isFeatured,
      is_reviewed: isReviewed,
      category: category,
    };

    switch (ev.currentTarget.getAttribute('filter')) {
      case 'state':
        args.state = ev.currentTarget.getAttribute('value');
        props.onFiltersUpdate(args);
        setState(args.state);
        break;
      case 'media_type':
        args.media_type = ev.currentTarget.getAttribute('value');
        props.onFiltersUpdate(args);
        setMediaType(args.media_type);
        break;
      case 'encoding_status':
        args.encoding_status = ev.currentTarget.getAttribute('value');
        props.onFiltersUpdate(args);
        setEncodingStatus(args.encoding_status);
        break;
      case 'featured':
        args.featured = ev.currentTarget.getAttribute('value');
        props.onFiltersUpdate(args);
        setIsFeatured(args.featured);
        break;
      case 'reviewed':
        args.is_reviewed = ev.currentTarget.getAttribute('value');
        props.onFiltersUpdate(args);
        setIsReviewed(args.is_reviewed);
        break;
      case 'category':
        args.category = ev.currentTarget.getAttribute('value');
        props.onFiltersUpdate(args);
        setCategory(args.category);
        break;
    }
  }

  useEffect(() => {
    setIsHidden(props.hidden);
    onWindowResize();
  }, [props.hidden]);

  useEffect(() => {
    PageStore.on('window_resize', onWindowResize);
    return () => PageStore.removeListener('window_resize', onWindowResize);
  }, []);

  return (
    <div ref={containerRef} className={'mi-filters-row' + (isHidden ? ' hidden' : '')}>
      <div ref={innerContainerRef} className="mi-filters-row-inner">
        <div className="mi-filter">
          <div className="mi-filter-title">{t('admin.filters.state')}</div>
          <div className="mi-filter-options">
            <FilterOptions id={'state'} options={localizedOptions(filters.state, t)} selected={state} onSelect={onFilterSelect} />
          </div>
        </div>

        <div className="mi-filter">
          <div className="mi-filter-title">{t('admin.filters.mediaType')}</div>
          <div className="mi-filter-options">
            <FilterOptions
              id={'media_type'}
              options={localizedOptions(filters.media_type, t)}
              selected={mediaType}
              onSelect={onFilterSelect}
            />
          </div>
        </div>

        <div className="mi-filter">
          <div className="mi-filter-title">{t('admin.filters.encodingStatus')}</div>
          <div className="mi-filter-options">
            <FilterOptions
              id={'encoding_status'}
              options={localizedOptions(filters.encoding_status, t)}
              selected={encodingStatus}
              onSelect={onFilterSelect}
            />
          </div>
        </div>

        <div className="mi-filter">
          <div className="mi-filter-title">{t('admin.filters.reviewed')}</div>
          <div className="mi-filter-options">
            <FilterOptions id={'reviewed'} options={localizedOptions(filters.reviewed, t)} selected={isReviewed} onSelect={onFilterSelect} />
          </div>
        </div>

        <div className="mi-filter">
          <div className="mi-filter-title">{t('admin.filters.featured')}</div>
          <div className="mi-filter-options">
            <FilterOptions id={'featured'} options={localizedOptions(filters.featured, t)} selected={isFeatured} onSelect={onFilterSelect} />
          </div>
        </div>

        <div className="mi-filter">
          <div className="mi-filter-title">{t('admin.filters.category')}</div>
          <div className="mi-filter-options">
            <FilterOptions id={'category'} options={localizedOptions(categories, t)} selected={category} onSelect={onFilterSelect} />
          </div>
        </div>
      </div>
    </div>
  );
}

ManageMediaFilters.defaultPropValues = {
  hidden: false,
};
