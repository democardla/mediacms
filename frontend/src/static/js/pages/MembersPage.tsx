import React, { useState } from 'react';
import i18n from '../i18n';
import { ApiUrlConsumer, linksConfig } from '../utils/contexts/';
import { SearchFieldStore } from '../utils/stores/';
import { MediaListWrapper } from '../components/MediaListWrapper';
import { LazyLoadItemListAsync } from '../components/item-list/LazyLoadItemListAsync.jsx';
import { Page } from './Page';

interface MembersPageProps {
  id?: string;
  title?: string;
}

export const MembersPage: React.FC<MembersPageProps> = ({ id = 'members', title }) => {
  const query = (SearchFieldStore.get('search-query') || '').trim();
  const [resultsCount, setResultsCount] = useState<number | null>(null);
  const nothingFound = '' !== query && 0 === resultsCount;

  return (
    <Page id={id}>
      <ApiUrlConsumer>
        {(apiUrl) => (
          <MediaListWrapper
            title={
              nothingFound
                ? i18n.t('members.noResults', { query })
                : query
                  ? i18n.t('members.searchResults', { query })
                  : title || i18n.t('members.title')
            }
            viewAllLink={nothingFound ? linksConfig.search.query + encodeURIComponent(query) : undefined}
            viewAllText={i18n.t('members.searchMediaInstead')}
            className="items-list-ver"
          >
            <LazyLoadItemListAsync
              key={query}
              itemsCountCallback={setResultsCount}
              requestUrl={query ? apiUrl.users + '?name=' + encodeURIComponent(query) : apiUrl.users}
            />
          </MediaListWrapper>
        )}
      </ApiUrlConsumer>
    </Page>
  );
};
