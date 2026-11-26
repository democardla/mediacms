import React from 'react';
import { MediaPageStore } from '../../utils/stores/';
import CommentsList from '../comments/Comments';
import ViewerInfoVideoTitleBanner from './ViewerInfoVideoTitleBanner';
import ViewerInfo from './ViewerInfo';

export default class ViewerInfoVideo extends ViewerInfo {
  render() {
    let views, categories, title;
    let allowDownload = false;

    if (this.state.videoLoaded) {
      allowDownload = MediaPageStore.get('media-data').allow_download;

      if (void 0 === allowDownload) {
        allowDownload = true;
      } else {
        allowDownload = !!allowDownload;
      }

      views = MediaPageStore.get('media-data').views;
      categories = MediaPageStore.get('media-data').categories_info;
      title = MediaPageStore.get('media-data').title;

    }

    return !this.state.videoLoaded ? null : (
      <div className="viewer-info">
        <div className="viewer-info-inner">
          <ViewerInfoVideoTitleBanner
            title={title}
            views={views}
            categories={categories}
            allowDownload={allowDownload}
          />
          <CommentsList />
        </div>
      </div>
    );
  }
}
