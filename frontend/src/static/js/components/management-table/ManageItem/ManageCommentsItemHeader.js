import React from 'react';
import i18n from '../../../i18n';
import { useManagementTableHeader } from '../../../utils/hooks/';
import { MaterialIcon } from '../../_shared/material-icon/MaterialIcon';

export function ManageCommentsItemHeader(props) {
  const [sort, order, isSelected, sortByColumn, checkAll] = useManagementTableHeader({ ...props, type: 'comments' });

  return (
    <div className="item manage-item manage-item-header manage-comments-item">
      <div className="mi-checkbox">
        <input type="checkbox" checked={isSelected} onChange={checkAll} />
      </div>
      <div className="mi-author">{i18n.t('admin.table.author')}</div>
      <div
        id="text"
        onClick={sortByColumn}
        className={'mi-comment mi-col-sort' + ('text' === sort ? ('asc' === order ? ' asc' : ' desc') : '')}
      >
        {i18n.t('admin.table.comment')}
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
    </div>
  );
}
