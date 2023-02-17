import React from 'react';

import { Table, Spin } from 'antd';
import { useNavigate } from 'react-router-dom'
import PropTypes from 'prop-types';

const DataTableComponent = ({ columns, data, isLoading, naviroute, rowKey, setSelectedObj, selectedRowObj, total, setOffset, setLimit }) => {
  const navigate = useNavigate()

  return (
    <Spin
      spinning={isLoading}
      delay={500}
      size='large'>

      <Table
        columns={columns}
        dataSource={data}
        sticky={true}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          total: total,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          onChange: (page, pageSize) => {
            setOffset((page - 1) * pageSize)
          },
          onShowSizeChange: (page, pageSize) => {
            setOffset((page - 1) * pageSize);
            setLimit(pageSize);
          }
        }}
        scroll={{
          x: 1300,
        }}
        rowKey={rowKey}
        rowSelection={{
          getCheckboxProps: (record) => {
            if (selectedRowObj[0]) {
              return {
                disabled: selectedRowObj[0].chainId !== record.chainId 
              }
            }
          },
          onChange: (selectedKeys, selectedObj) => {
            setSelectedObj(selectedObj)
          },
          hideSelectAll: true
        }}
        onRow={(record) => {
          return {
            onClick: (e) => {
              navigate(`${naviroute.replace(":id", record.address)}?chainId=${record.chainId}`)
            }
          }
        }}
      />
    </Spin>
  );
};

DataTableComponent.propTypes = {
  columnContentTypes: PropTypes.array,
  rows: PropTypes.array,
  headings: PropTypes.array,
  sortable: PropTypes.array,
  onSort: PropTypes.func,
  defaultSortDirection: PropTypes.string,
  initialSortColumnIndex: PropTypes.number,
  offset: PropTypes.number,
  setOffset: PropTypes.func,
  limit: PropTypes.number,
  isLoading: PropTypes.bool
};

export default DataTableComponent;
