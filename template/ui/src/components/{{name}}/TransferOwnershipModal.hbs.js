import React, { useState } from "react";
import {
  Form,
  Modal,
  Select } 
from "antd";
import { useUsersState } from "../../contexts/users";

const TransferOwnershipModal = ({
  isTransferOwnershipModalOpen,
  toggleTransferOwnershipModal,
  actions,
  dispatch,
  selectedObj,
  isTransferring
}) => {
  const [user, setUser] = useState('');
  const [searchList, setSearchList] = useState([]);
  const [searchValue, setSearchValue] = useState('');


  const {
    users
  } = useUsersState();

  const handleFormSubmit = async () => {
    const body = {
      address: selectedObj[0].address, 
      chainId: selectedObj[0].chainId, 
      newOwner: user,
    };

    const isDone = await actions.transfer{{name}}Ownership(dispatch, body);

    if (isDone) {
      toggleTransferOwnershipModal(!isTransferOwnershipModalOpen);
    }
  };

  const fetchUser = value => {
    const userList = users && users.length ?  Object.entries(users.reduce((prev, cur) => {
      const k = `${cur.commonName} - ${cur.organization}`;
      if (!prev[cur.userAddress]) {
        return {
            ...prev,
            [`${cur.userAddress}`]: k
        }
      }
      return prev
    }, {})).map(([key, val]) => ({label: val, value: key})) : []

    const filteredUserList = userList.filter(user => user.label.toLowerCase().includes(value.toLowerCase()));
    if (value.length > 2) {
      setSearchList(filteredUserList);
    } else {
      setSearchList([]);
    }
  };

  const handleSearch = value => {
    setSearchValue(value);
    fetchUser(value, userList => setSearchList(userList));
  };

  const handleChange = newValue => {
    if (newValue) {
      setSearchValue(newValue);
      handleSearch(newValue);
    }
  };

  return (
    <Modal
      open={isTransferOwnershipModalOpen}
      title={"Transfer Ownership"}
      width={400}
      onOk={handleFormSubmit}
      okType={"primary"}
      okText={"Transfer Ownership"}
      okButtonProps=\{{ disabled: !user }}
      onCancel={() => toggleTransferOwnershipModal(!isTransferOwnershipModalOpen)}
      confirmLoading={isTransferring}
    >
      <Form>
        <Form.Item>
          <Select
            label="Users"
            onSelect={(value) => setUser(value)}
            placeholder="Search for a user"
            notFoundContent={"User not found"}
            optionFilterProp="label"
            onSearch={handleSearch}
            onChange={handleChange}
            options={ searchList || []}
            filterSort={(optionA, optionB) => optionA.label.toLowerCase().indexOf(searchValue.toLowerCase()) - optionB.label.toLowerCase().indexOf(searchValue.toLowerCase())}
            showArrow={false}
            showSearch
            allowClear
          >
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TransferOwnershipModal;
