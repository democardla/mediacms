import React from 'react';
import i18n from '../../../i18n';
import { useManagementTableHeader } from '../../../utils/hooks/';
import { MaterialIcon } from '../../_shared/material-icon/MaterialIcon.jsx';

export function ManageMediaItemHeader(props) {
  const [sort, order, isSelected, sortByColumn, checkAll] = useManagementTableHeader({ ...props, type: 'media' });

  return (
    <div className="item manage-item manage-item-header manage-media-item">
      <div className="mi-checkbox">
        <input type="checkbox" checked={isSelected} onChange={checkAll} />
      </div>
      <div
        id="title"
        onClick={sortByColumn}
        className={'mi-title mi-col-sort' + ('title' === sort ? ('asc' === order ? ' asc' : ' desc') : '')}
      >
        {i18n.t('admin.table.title')}
        <div className="mi-col-sort-icons">
          <span>
            <MaterialIcon type="arrow_drop_up" />
          </span>
          <span>
            <MaterialIcon type="arrow_drop_down" />
          </span>
        </div>
      </div>
      <div
        id="add_date"
        onClick={sortByColumn}
        className={'mi-added mi-col-sort' + ('add_date' === sort ? ('asc' === order ? ' asc' : ' desc') : '')}
      >
        {i18n.t('admin.table.dateAdded')}
        <div className="mi-col-sort-icons">
          <span>
            <MaterialIcon type="arrow_drop_up" />
          </span>
          <span>
            <MaterialIcon type="arrow_drop_down" />
          </span>
        </div>
      </div>
      <div className="mi-author">{i18n.t('admin.table.author')}</div>
      <div className="mi-type">{i18n.t('admin.table.mediaType')}</div>
      <div className="mi-encoding">{i18n.t('admin.table.encodingStatus')}</div>
      <div className="mi-state">{i18n.t('admin.table.state')}</div>
      <div className="mi-reviewed">{i18n.t('admin.table.reviewed')}</div>
      <div className="mi-featured">{i18n.t('admin.table.featured')}</div>
      <div className="mi-reported">{i18n.t('admin.table.reported')}</div>
    </div>
  );
}
