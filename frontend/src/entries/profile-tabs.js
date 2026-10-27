import { renderPage } from '../static/js/utils/renderer';
import { ProfileTabbedPage } from '../static/js/pages/ProfileTabbedPage';

const container = document.querySelector('[id^="page-profile-"]');
if (container) renderPage(container.id, ProfileTabbedPage);
