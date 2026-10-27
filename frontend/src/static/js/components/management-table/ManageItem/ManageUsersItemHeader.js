import React from 'react';
import i18n from '../../../i18n';
import { useManagementTableHeader } from '../../../utils/hooks/';
import { MaterialIcon } from '../../_shared/material-icon/MaterialIcon';
import { applyDefaultProps } from '../../../utils/helpers/applyDefaultProps';

export function ManageUsersItemHeader(rawProps) {
  const props = applyDefaultProps(rawProps, ManageUsersItemHeader.defaultPropValues);
  const [sort, order, isSelected, sortByColumn, checkAll] = useManagementTableHeader({ ...props, type: 'users' });

  return (
    <div className="item manage-item manage-item-header manage-users-item">
      <div className="mi-checkbox">
        <input type="checkbox" checked={isSelected} onChange={checkAll} />
      </div>
      <div
        id="name"
        onClick={sortByColumn}
        className={'mi-name mi-col-sort' + ('name' === sort ? ('asc' === order ? ' asc' : ' desc') : '')}
      >
        {i18n.t('admin.table.name')}
        <div className="mi-col-sort-icons">
          <span>
            <MaterialIcon type="arrow_drop_up" />
          </span>
          <span>
            <MaterialIcon type="arrow_drop_down" />
          </span>
        </div>
      </div>
      <div className="mi-username">{i18n.t('admin.table.username')}</div>
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
      {props.has_roles ? <div className="mi-role">{i18n.t('admin.table.role')}</div> : null}
      {props.has_verified ? <div className="mi-verified">{i18n.t('admin.table.verified')}</div> : null}
      {props.has_trusted ? <div className="mi-trusted">{i18n.t('admin.table.trusted')}</div> : null}
      {props.has_approved ? <div className="mi-approved">{i18n.t('admin.table.approved')}</div> : null}
      <div className="mi-featured">{i18n.t('admin.table.featured')}</div>
    </div>
  );
}

ManageUsersItemHeader.defaultPropValues = {
  has_roles: false,
  has_verified: false,
  has_trusted: false,
  has_approved: false,
};
