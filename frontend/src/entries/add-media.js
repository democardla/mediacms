import { renderPage } from '../static/js/utils/renderer';
import React from 'react';
import { createRoot } from 'react-dom/client';
import AddMediaUpload from '../static/js/components/AddMediaUpload';
import UploadWorkflowSteps from '../static/js/components/UploadWorkflowSteps';

import '../static/css/AddMediaPage.scss';

renderPage();

function mountWorkflowSteps() {
  const container = document.getElementById('upload-workflow-steps');
  const flow = document.getElementById('media-upload-flow');
  if (!container || !flow || container.dataset.mounted) return;
  container.dataset.mounted = 'true';
  createRoot(container).render(
    <UploadWorkflowSteps activeStep={flow.dataset.step} mediaToken={flow.dataset.mediaToken} />,
  );
}

function mountUploadComponent() {
  const uploaderContainer = document.getElementById('antd-media-upload');
  if (!uploaderContainer || uploaderContainer.dataset.mounted) return;
  uploaderContainer.dataset.mounted = 'true';
  createRoot(uploaderContainer).render(<AddMediaUpload />);
}

window.addEventListener('media-uploader-ready', mountUploadComponent);
document.addEventListener('DOMContentLoaded', mountUploadComponent);
document.addEventListener('DOMContentLoaded', mountWorkflowSteps);
if (document.readyState !== 'loading') {
  mountUploadComponent();
  mountWorkflowSteps();
}
