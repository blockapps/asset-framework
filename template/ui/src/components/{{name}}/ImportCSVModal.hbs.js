import React, { useState } from "react";
import {
  Modal,
  Upload,
  Progress,
} from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { usePapaParse } from "react-papaparse";

const ImportCSVModal = ({
  dispatch,
  actions,
  isAssetImportInProgress,
  assetsUploaded,
  assetsUploadedErrors,
  isImportAssetsModalOpen
}) => {
  const { readString } = usePapaParse();
  const [files, setFiles] = useState([]);
  const [isValidated, setValidated] = useState(false);
  const [assetData, setAssetData] = useState([]);


  const onFileLoad = (_dropFiles, acceptedFiles, _rejectedFiles) => {

    const file = acceptedFiles[0];
    if (file.type !== "text/csv") {
      this.props.setUserMessage(
        "Invalid file type. File must be of type text/csv"
      );
      return;
    }

    setValidated(true);
    const reader = new FileReader();
    reader.onload = evt => {
      const contents = readString(evt.target.result, { header: true });

      if (contents.data.length === 0) {
        actions.setMessage(dispatch, "No records to import")
        return;
      }


      {{#each attributes}}
      
      if (!contents.data[0]['{{field}}']) {
        actions.setMessage(dispatch, "Missing required column '{{field}}'");
        return;
      }

      {{/each}}

      const assetData = [];
      for (let i = 0; i < contents.data.length; i++) {
        const row = contents.data[i];

        assetData.push({
          {{lower name}}Args: {
            {{#each attributes}}
            {{field}}: row['{{field}}'],
            {{/each}}
          },
          isPublic: false
        });
      }

      setAssetData(assetData);
      if (assetData.length > 0) {
        setFiles(() => [...files, ...acceptedFiles]);
      }
    };
    reader.readAsText(file, "UTF-8");

  };

  const primaryAction = {
    content: "Import",
    disabled: !isValidated || isAssetImportInProgress || assetData.length === 0,
    onAction: () => actions.importAssets(dispatch, assetData)
  };

  const closeModal = () => {
    setValidated(false);
    setAssetData([]);
    actions.closeImportCSVmodal(dispatch)
  }

  return (
    <Modal
    open={isImportAssetsModalOpen}
    title={"Import {{name}}"}
    okText="Import"
    onCancel={closeModal}
    onOk={primaryAction.onAction}
    confirmLoading={isAssetImportInProgress}
    okButtonProps=\{{ disabled: primaryAction.disabled }}
  >
    <Upload.Dragger
      name="files"
      accept=".csv"
      multiple={false}
      beforeUpload={onFileLoad}
      confirmLoading={isAssetImportInProgress}
      fileList={files}
      onRemove={(file) => { setValidated(false); setAssetData([]); setFiles((files) => files.filter((f) => f.uid !== file.uid))}}
      status={assetsUploadedErrors.length ? 'error' : assetsUploaded ? 'done' : 'uploading'}
    >
      <p className="ant-upload-drag-icon">
        <InboxOutlined />
      </p>
      <p className="ant-upload-text">Click or drag file to this area to upload</p>
    </Upload.Dragger>
    <div>
      <br />
      {isValidated && assetData.length > 0 ? (
        <div>
          <p>
            {isAssetImportInProgress
              ? `${assetsUploaded} / ${assetData.length} records imported`
              : `Click on IMPORT button to import ${assetData.length} records`}
          </p>
          <Progress
            percent={assetData ? (assetsUploaded * 100) / assetData.length : 0}
            status={assetsUploaded ? "success" : assetsUploadedErrors.length ? "exception" : "active"}
          />
        </div>
      ) : null}
    </div>
  </Modal>
  );
};

export default ImportCSVModal;
