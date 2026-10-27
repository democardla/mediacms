import React, { useEffect } from 'react';
import { PageActions } from '../utils/actions/';
import { PageMain } from '../components/page-layout/';
import { Notifications } from '../components/_shared';

function ProfileTabHeaderSync({ headerProps, onChange }) {
  useEffect(() => {
    if (headerProps) onChange(headerProps);
  }, [headerProps, onChange]);

  return null;
}

export class Page extends React.PureComponent {
  constructor(props, pageId) {
    super(props);

    if (void 0 !== pageId) {
      PageActions.initPage(pageId);
    }
  }

  render() {
    const content = this.pageContent();

    if (this.props.profileTabContentOnly) {
      const items = Array.isArray(content) ? content : [content];
      const header = items.find((item) => item && item.key === 'ProfilePagesHeader');

      return (
        <>
          <ProfileTabHeaderSync headerProps={header && header.props} onChange={this.props.onProfileHeaderChange} />
          {items.filter((item) => item && item.key !== 'ProfilePagesHeader')}
        </>
      );
    }

    return (
      <>
        <PageMain>{content}</PageMain>
        <Notifications />
      </>
    );
  }
}
