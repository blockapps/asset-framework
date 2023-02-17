import React, { useState } from "react";
import {
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Radio,
  Select } 
from "antd";
import dayjs from "dayjs";

const { Option } = Select;

const CreateModal = ({
  {{#each attributes}}
  {{#ifeq type "reference"}}
  {{lower reference}}s,
  is{{lower reference}}sLoading,
  {{/ifeq}}
  {{#ifeq type "references"}}
  {{lower reference}}s,
  is{{lower reference}}sLoading,
  {{/ifeq}}
  {{/each}}
  isCreateModalOpen,
  toggleCreateModal,
  dispatch,
  actions,
  isCreateSubmitting,
  debouncedSearchTerm
}) => {

  {{#each attributes}}
  const [{{field}}, set{{field}}] = useState();
  {{/each}}

  const handleFormSubmit = async () => {
    const body = {
      {{lower name}}Args: {
        {{#each attributes}}
          {{#ifeq type "datetime"}}
            {{field}}: dayjs({{field}}).unix(),
          {{else}}
            {{field}},
          {{/ifeq}}
        {{/each}}
      },
      isPublic: false
    };

    let isDone = await actions.create{{name}}(dispatch, body); 

    if (isDone) {
      actions.fetch{{name}}(dispatch, 10, 0, debouncedSearchTerm);
      toggleCreateModal(false);
    }
  }

  const isDisabled = ( {{#each attributes}} {{#ifeq type "boolean"}}{{field}} === undefined {{else}} !{{field}}{{#if @last}} {{else}} || {{/if~}} {{/ifeq}}{{/each}});

  const primaryAction = {
    content: "Create {{name}}",
    disabled: isDisabled,
    onAction: handleFormSubmit,
    loading: isCreateSubmitting
  };

  return (
    <Modal
      open={isCreateModalOpen}
      title={"Create {{name}}"}
      onOk={primaryAction.onAction}
      okType={"primary"}
      okText={"Create {{name}}"}
      okButtonProps=\{{ disabled: primaryAction.disabled }}
      onCancel={() => toggleCreateModal(!isCreateModalOpen)}
      confirmLoading={primaryAction.loading}
    >
      <Form labelCol=\{{ span: 10 }}>
      {{#each attributes}}
      {{#ifeq type "datetime"}}
        <Form.Item 
          label="{{attribute}}"
          name="{{field}}"
          rules={[{ required: true, message: 'Please input {{attribute}}.' }]}
        >
          <DatePicker
            label="{{attribute}}"
            onChange={ (e) => set{{field}}(e) }
          />
        </Form.Item>
      {{else}}
      {{#ifeq type "reference"}}
        <Form.Item
          label="{{attribute}}"
          name="{{field}}"
          rules={[{ required: true, message: 'Please select {{attribute}}.' }]}
        >
          <Select
            label="{{attribute}}"
            onChange={(e) => set{{field}}(e)}
            allowClear
          >
            { {{lower reference}}s.map(x => (
              <Option key={x.chainId} value={x.chainId}>
                { x.{{referenceField}} }
              </Option>
            ))}
          </Select>
        </Form.Item>
      {{else}}
      {{#ifeq type "references"}}
        <Form.Item 
          label="{{attribute}}"
          name="{{field}}"
          rules={[{ required: true, message: 'Please select {{attribute}}.' }]}
        >
          <Select
            label="{{attribute}}"
            mode="multiple"
            onChange={ (e) => set{{field}}(e) }
            allowClear
          >
            { {{lower reference}}s.map(x => (
              <Option key={x.chainId} value={x.chainID}>
                { x.{{referenceField}} }
              </Option>
            ))}
          </Select>
        </Form.Item>
      {{else}}
      {{#ifeq type "integer"}}
        <Form.Item
          label="{{attribute}}"
          name="{{field}}"
          rules={[{ required: true, message: 'Please input {{attribute}}.' }]}
        >
          <InputNumber
            label="{{attribute}}"
            onChange={ (e) => set{{field}}(e) }
          />
        </Form.Item>
      {{else}}
      {{#ifeq type "boolean"}}
        <Form.Item 
          label="{{attribute}}" 
          name="{{field}}"
          rules={[{ required: true, message: 'Please select {{attribute}}.' }]}
        >
          <Radio.Group 
            label="{{attribute}}"
            onChange={ (e) => set{{field}}(e.target.value) }
            optionType="button"
            buttonStyle="solid"
          >
            <Radio value={true}>True</Radio>
            <Radio value={false}>False</Radio>
          </Radio.Group>
        </Form.Item>
      {{else}}
        <Form.Item 
          label="{{attribute}}"
          name="{{field}}"
          rules={[{ required: true, message: 'Please input {{attribute}}.' }]}
        >
          <Input
            label="{{attribute}}"
            onChange={ (e) => set{{field}}(e.target.value) }
          />
        </Form.Item>
      {{/ifeq}}
      {{/ifeq}}
      {{/ifeq}}
      {{/ifeq}}
      {{/ifeq}}
      {{/each}}
      </Form>
    </Modal>
  );
};

export default CreateModal;
