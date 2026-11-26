import React from 'react';
import { Steps } from 'antd';
import { useTranslation } from 'react-i18next';

const stepNames = ['details', 'edit', 'publish'];

function UploadWorkflowSteps({ activeStep, mediaToken }) {
  const { t } = useTranslation('media');
  const current = activeStep === 'publish' ? 2 : activeStep === 'edit' || ['trim', 'subtitles', 'chapters'].includes(activeStep) ? 1 : 0;

  const stepTitles = [
    t('upload.steps.details'),
    t('upload.steps.edit'),
    t('upload.steps.publish'),
  ];
  const items = stepTitles.map((title, index) => ({
    title,
    disabled: index > 0 && !mediaToken,
  }));

  const selectStep = (index) => {
    const step = stepNames[index];
    if (mediaToken) {
      const destination = step === 'details' ? 'basic' : step;
      window.location.assign(`/upload?m=${encodeURIComponent(mediaToken)}&step=${destination}`);
    } else if (step === 'details') {
      window.location.assign('/upload');
    }
  };

  return <Steps current={current} items={items} onChange={selectStep} />;
}

export default UploadWorkflowSteps;
