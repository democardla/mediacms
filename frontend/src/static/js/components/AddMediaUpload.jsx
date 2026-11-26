import React, { useEffect, useState } from 'react';
import { Button, ConfigProvider, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import enUS from 'antd/locale/en_US';
import zhCN from 'antd/locale/zh_CN';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';

function previewVideo(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.muted = true;
    video.preload = 'metadata';
    let finished = false;
    const finish = (image = '') => {
      if (finished) return;
      finished = true;
      video.removeAttribute('src');
      video.load();
      URL.revokeObjectURL(url);
      resolve(image);
    };
    const capture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 160;
      canvas.height = Math.round(160 * video.videoHeight / video.videoWidth) || 90;
      try {
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
        finish(canvas.toDataURL('image/jpeg', 0.7));
      } catch (error) { finish(); }
    };
    video.onloadedmetadata = () => { video.currentTime = Math.min(0.1, video.duration || 0); };
    video.onloadeddata = () => { if (!video.currentTime) capture(); };
    video.onseeked = capture;
    video.onerror = () => finish();
    video.src = url;
  });
}

function AddMediaUpload() {
  const { t } = useTranslation('media');
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    const onUploadState = (event) => {
      const { id, name, status, percent, file } = event.detail;
      setFileList((current) => {
        if (status === 'removed') return current.filter((item) => item.uid !== String(id));
        const previous = current.find((item) => item.uid === String(id));
        return [{
          ...previous,
          uid: String(id),
          name,
          originFileObj: file || previous?.originFileObj,
          status: status || previous?.status,
          percent: percent ?? previous?.percent,
        }];
      });
    };
    window.addEventListener('media-upload-state', onUploadState);
    return () => window.removeEventListener('media-upload-state', onUploadState);
  }, []);

  return (
    <ConfigProvider
      locale={i18n.language === 'zh-Hans' ? zhCN : enUS}
    >
      <Upload
        className="add-media-upload-button"
        accept="video/*"
        multiple={false}
        listType="picture"
        fileList={fileList}
        previewFile={previewVideo}
        showUploadList={{ showPreviewIcon: false, showRemoveIcon: (file) => file.status !== 'done' }}
        disabled={fileList.some((file) => file.status !== 'error')}
        beforeUpload={(file) => {
          const uploader = window.mediaUploader;
          if (uploader) uploader.addFiles(file);
          return false;
        }}
        onRemove={(file) => {
          window.mediaUploader?.cancel(Number(file.uid));
          return true;
        }}
      >
        <Button icon={<UploadOutlined />}>{t('upload.selectFile')}</Button>
      </Upload>
      <p className="ant-upload-hint">{t('upload.hint')}</p>
    </ConfigProvider>
  );
}

export default AddMediaUpload;
