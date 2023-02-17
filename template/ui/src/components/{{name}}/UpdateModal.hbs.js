import React, { useState, useEffect } from "react";
import {
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Radio,
  Select 
} from "antd";
import dayjs from "dayjs";

const { Option } = Select;

const UpdateModal = ({
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
  isUpdateModalOpen,
  toggleUpdateModal,
  dispatch,
  actions,
  isUpdating,
  debouncedSearchTerm,
  selectedObj
}) => {

  {{#each attributes}}
  const [{{field}}, set{{field}}] = useState();
  {{/each}}

  useEffect(() => {
    if (selectedObj.length) {
      const product = selectedObj[0];
      {{#each attributes}}
      {{#ifeq type "datetime"}}
      set{{field}}(dayjs.unix(product["{{field}}"]).toDate());
      {{else}}
      set{{field}}(product["{{field}}"]);
      {{/ifeq}}
      {{/each}}      
    }
  }, [selectedObj]);
  

  const handleFormSubmit = async () => {
    const body = {
      address: selectedObj[0].address, 
      chainId: selectedObj[0].chainId,
      updates: {
        {{#each attributes}}
          {{#ifeq type "datetime"}}
            {{field}}: dayjs({{field}}).unix(),
          {{else}}
            {{field}},
          {{/ifeq}}
        {{/each}}
      },
    };

    let isDone = await actions.update{{name}}(dispatch, body); 

    if (isDone) {
      actions.fetch{{name}}(dispatch, 10, 0, debouncedSearchTerm);
      toggleUpdateModal(false);
    }
  };

  // const isDisabled = ( {{#each attributes}} {{#ifeq type "boolean"}}{{field}} === undefined {{else}} !{{field}}{{#if @last}} {{else}} || {{/if~}} {{/ifeq}}{{/each}});
  
  const primaryAction = {
    content: "Update {{name}}",
    disabled: false,
    onAction: handleFormSubmit,
    loading: isUpdating
  };

  return (
    <Modal
      open={isUpdateModalOpen}
      title={"Update {{name}}"}
      onOk={primaryAction.onAction}
      okType={"primary"}
      okText={"Update {{name}}"}
      okButtonProps=\{{ disabled: primaryAction.disabled }}
      onCancel={() => toggleUpdateModal(!isUpdateModalOpen)}
      confirmLoading={primaryAction.loading}
    >
      <Form labelCol=\{{ span: 8 }}>
      {{#each attributes}}
      {{#ifeq type "datetime"}}
        <Form.Item 
          label="{{attribute}}"
          name="{{field}}"
          rules={[{ required: true, message: 'Please input {{attribute}}.' }]}
        >
          <DatePicker
            label="{{attribute}}"
            defaultValue={dayjs.unix(selectedObj[0]["{{field}}"])}
            onChange={(e) => set{{field}}(e)}
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
            name="{{field}}"
            defaultValue={selectedObj[0]["{{field}}"]}
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
            name="{{field}}"
            mode="multiple"
            defaultValue={selectedObj[0]["{{field}}"]}
            onChange={(e) => set{{field}}(e)}
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
            name="{{field}}"
            defaultValue={selectedObj[0]["{{field}}"]}
            onChange={(e) => set{{field}}(e)}
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
            defaultValue={selectedObj[0]["{{field}}"]}
            onChange={(e) => set{{field}}(e.target.value)}
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
            name="{{field}}"
            defaultValue={selectedObj[0]["{{field}}"]}
            onChange={(e) => set{{field}}(e.target.value)}
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

export default UpdateModal;
