import { Card, Button, notification, Input, Space,  } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { PageHeader } from '@ant-design/pro-layout'
import React, { useEffect, useState, useRef } from "react";
import DataTableComponent from "../DataTableComponent";
import routes from "../../helpers/routes";
import CreateModal from "./CreateModal";
import UpdateModal from "./UpdateModal";
import ImportCSVModal from "./ImportCSVModal";
import { blue } from '@ant-design/colors';
import dayjs from 'dayjs';

import { actions } from "../../contexts/{{lower name}}/actions";
{{#each attributes}}
{{#ifeq type "references"}}
import { actions as actions{{reference}} } from "../../contexts/{{lower reference}}/actions";
import { use{{reference}}Dispatch, use{{reference}}State } from "../../contexts/{{lower reference}}";
{{/ifeq}}
{{#ifeq type "reference"}}
import { actions as actions{{reference}} } from "../../contexts/{{lower reference}}/actions";
import { use{{reference}}Dispatch, use{{reference}}State } from "../../contexts/{{lower reference}}";
{{/ifeq}}
{{/each}}
import { use{{name}}Dispatch, use{{name}}State } from "../../contexts/{{lower name}}";
import TransferOwnershipModal from "./TransferOwnershipModal";
import useDebounce from "../UseDebounce";

const {{name}} = () => {
  const [queryValue, setQueryValue] = useState('');
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [selectedObj, setSelectedObj] = useState([]);
  const [isCreateModalOpen, toggleCreateModal] = useState(false);
  const [isTransferOwnershipModalOpen, toggleTransferOwnershipModal] = useState(false);
  const [isUpdateModalOpen, toggleUpdateModal] = useState(false);
  const [api, contextHolder] = notification.useNotification();
  const naviroute = routes.{{name}}Detail.url;
  const openToast = (placement) => {
    if (success) {
      api.success({
        message: message,
        onClose: actions.resetMessage(dispatch),
        placement,
        key: 1
      })
    }
    else {
      api.error({
        message: message,
        onClose: actions.resetMessage(dispatch),
        placement,
        key: 2
      })
    }
  }

  const dispatch = use{{name}}Dispatch();
  {{#each attributes}}
  {{#ifeq type "reference"}}
  const dispatch{{reference}} = use{{reference}}Dispatch();
  {{/ifeq}}
  {{#ifeq type "references"}}
  const dispatch{{reference}} = use{{reference}}Dispatch();
  {{/ifeq}}
  {{/each}}
  const debouncedSearchTerm = useDebounce(queryValue, 1000);

  const { 
    {{lower name}}s,
    total{{name}}s,
    is{{lower name}}sLoading,
    isCreate{{name}}Submitting,
    isOwnership{{lower name}}Transferring,
    is{{lower name}}Updating,
    message,
    success,
    isAssetImportInProgress,
    assetsUploaded,
    assetsUploadedErrors,
    isImportAssetsModalOpen,
  } = use{{name}}State();

  {{#each attributes}}
  {{#ifeq type "reference"}}
  const {
    {{lower reference}}s,
    is{{lower reference}}sLoading,
  } = use{{reference}}State();
  {{/ifeq}}
  {{#ifeq type "references"}}
  const {
    {{lower reference}}s,
    is{{lower reference}}sLoading,
  } = use{{reference}}State();
  {{/ifeq}}
  {{/each}}

  useEffect(() => {
    actions.fetch{{name}}(
      dispatch,
      limit,
      offset,
      debouncedSearchTerm
    );
  }, [dispatch, limit, offset, debouncedSearchTerm]);

  {{#each attributes}}
  {{#ifeq type "reference"}}
  useEffect(() => {
    actions{{reference}}.fetch{{reference}}(dispatch{{reference}}, '', '', '');
  }, [dispatch{{reference}}]);
  {{/ifeq}}
  {{#ifeq type "references"}}
  useEffect(() => {
    actions{{reference}}.fetch{{reference}}(dispatch{{reference}}, '', '', '');
  }, [dispatch{{reference}}]);
  {{/ifeq}}
  {{/each}}

  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };
  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText('');
  };
  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div
        style=\{{padding: 8}}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={'Search'}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style=\{{marginBottom: 8, display: 'block'}}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style=\{{width: 90}}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style=\{{width: 90}}
          >
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style=\{{color: filtered ? blue.primary : undefined}}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    }
  });

  for (const value in Object.values({{lower name}}s)) {
    if ({{lower name}}s[value].ownerOrganizationalUnit === '') {
      {{lower name}}s[value].ownerOrganizationalUnit = 'N/A';
    }
  }

  let columns = [
    {{# each attributes}}
    {{#ifeq type "boolean"}}
    {
      title: "{{attribute}}",
      dataIndex: "{{field}}",
      ...getColumnSearchProps("{{field}}"),
      render: (text) => String(text).charAt(0).toUpperCase() + String(text).slice(1)
    },
    {{else}}
    {{#ifeq type "datetime"}}
    {
      title: "{{attribute}}",
      dataIndex: "{{field}}",
      ...getColumnSearchProps("{{field}}"),
      render: (text) => dayjs.unix(text).format("MM/DD/YYYY")
    },
    {{else}}
    {
      title: "{{attribute}}",
      dataIndex: "{{field}}",
      ...getColumnSearchProps("{{field}}")
    },
    {{/ifeq}}
    {{/ifeq}}
    {{/each}}
    {
      title: 'Organization',
      dataIndex: 'ownerOrganization',
      ...getColumnSearchProps('ownerOrganization')
    },
    {
      title: 'Organizational Unit',
      dataIndex: 'ownerOrganizationalUnit',
      ...getColumnSearchProps('ownerOrganizationalUnit')
    },
    {
      title: 'Common Name',
      dataIndex: 'ownerCommonName',
      ...getColumnSearchProps('ownerCommonName')
    },
  ]

  return (
    <div>
      {contextHolder}
      <PageHeader
        title="{{name}}"
        extra={[
          <Button disabled={!selectedObj.length} onClick={() => {
            toggleUpdateModal(!isUpdateModalOpen);
          }}>
            Edit
          </Button>,
          <Button disabled={!selectedObj.length} onClick={() => {
            toggleTransferOwnershipModal(!isTransferOwnershipModalOpen)
          }}>
            Transfer Ownership
          </Button>,
          <Button onClick={() => {
            actions.openImportCSVmodal(dispatch)
          }}>
            Import CSV
          </Button>,
          <Button type="primary" onClick={() => {
            toggleCreateModal(!isCreateModalOpen);
          }}>
            Create {{name}}
          </Button>,
        ]}
      />
      <DataTableComponent
        columns={columns}
        data={ {{lower name}}s}
        isLoading={is{{lower name}}sLoading}
        naviroute={naviroute}
        rowKey={'chainId'}   
        setSelectedObj={setSelectedObj}
        selectedRowObj={selectedObj}
        total={total{{name}}s}
        setOffset={setOffset}
        setLimit={setLimit}
      />
      {isCreateModalOpen && <CreateModal
        {{#each attributes}}
        {{#ifeq type "reference"}}
        {{lower reference}}s={ {{~lower reference~}}s}
        is{{lower reference}}sLoading={is{{lower reference}}sLoading}
        {{/ifeq}}
        {{#ifeq type "references"}}
        {{lower reference}}s={ {{~lower reference~}}s}
        is{{lower reference}}sLoading={is{{lower reference}}sLoading}
        {{/ifeq}}
        {{/each}}
        isCreateModalOpen={isCreateModalOpen}
        toggleCreateModal={toggleCreateModal}
        dispatch={dispatch}
        actions={actions}
        isCreateSubmitting={isCreate{{name}}Submitting}
        debouncedSearchTerm={debouncedSearchTerm}
      />}
      {isUpdateModalOpen && <UpdateModal
        {{#each attributes}}
        {{#ifeq type "reference"}}
        {{lower reference}}s={ {{~lower reference~}}s}
        is{{lower reference}}sLoading={is{{lower reference}}sLoading}
        {{/ifeq}}
        {{#ifeq type "references"}}
        {{lower reference}}s={ {{~lower reference~}}s}
        is{{lower reference}}sLoading={is{{lower reference}}sLoading}
        {{/ifeq}}
        {{/each}}
        isUpdateModalOpen={isUpdateModalOpen}
        toggleUpdateModal={toggleUpdateModal}
        dispatch={dispatch}
        actions={actions}
        isUpdating={is{{lower name}}Updating}
        debouncedSearchTerm={debouncedSearchTerm}
        selectedObj={selectedObj}
      />}
      {isImportAssetsModalOpen && <ImportCSVModal
        dispatch={dispatch}
        actions={actions}
        isAssetImportInProgress={isAssetImportInProgress}
        assetsUploaded={assetsUploaded}
        assetsUploadedErrors={assetsUploadedErrors}
        isImportAssetsModalOpen={isImportAssetsModalOpen}
      />}
      {isTransferOwnershipModalOpen && <TransferOwnershipModal
        isTransferOwnershipModalOpen={isTransferOwnershipModalOpen}
        toggleTransferOwnershipModal={toggleTransferOwnershipModal}
        selectedObj={selectedObj}
        dispatch={dispatch}
        actions={actions}
        isTransferring={isOwnership{{lower name}}Transferring}
      />}
      {message && openToast('bottom')}
    </div>
  );
};

export default {{name}};
