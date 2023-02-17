import React, { useState, useEffect, useMemo } from "react";
import { PageHeader } from '@ant-design/pro-layout'
import { Card, Row, Col } from 'antd';
import { useMatch, useLocation } from "react-router-dom";
import { actions } from "../../contexts/{{lower name}}/actions";
import DataTableComponent from "../DataTableComponent";
import { use{{name}}Dispatch, use{{name}}State } from "../../contexts/{{lower name}}";
import routes from "../../helpers/routes";
import dayjs from "dayjs";

function useQuery() {
  const { search } = useLocation();

  return useMemo(() => new URLSearchParams(search), [search]);
}

const {{name}}Details = ({ user, users }) => {
  const [Id, setId] = useState(undefined);
  const [chainId, setChainId] = useState(undefined);

  const dispatch = use{{name}}Dispatch();

  const { 
    {{lower name}}Details,
    is{{lower name}}DetailsLoading,
    {{lower name}}sAudit,
    is{{lower name}}AuditLoading
  } = use{{name}}State();

  const routeMatch = useMatch({
    path: routes.{{name}}Detail.url,
    strict: true,
  });

  const query = useQuery();

  useEffect(() => {
    setId(routeMatch?.params?.id);
    setChainId(query.get("chainId"));
  }, [routeMatch]);

  useEffect(() => {
    if (Id !== undefined && chainId !== undefined) {
      actions.fetch{{name}}Details(dispatch, Id, chainId);
      actions.fetch{{name}}Audit(dispatch, Id, chainId);
    }
  }, [Id, dispatch]);

  const details = {{lower name}}Details;
  const audits = {{lower name}}sAudit;
  if (audits && audits.length) {
    audits.map((val) => {
      if (users && users.length) {
        const sender = users.find((data) => val['transaction_sender'] === data.userAdress);
        audits['sender'] = sender;
      }
    })
  }
  const columns = [
    {
      title: 'Date',
      dataIndex: 'block_timestamp',
    },
    {
      title: 'Sender',
      dataIndex: 'sender',
    },
    {{# each attributes}}
    {
      title: "{{attribute}}",
      dataIndex: "{{field}}",
    },
    {{/each}}
    {
      title: 'Organization',
      dataIndex: 'ownerOrganization',
    },
    {
      title: 'Organizational Unit',
      dataIndex: 'ownerOrganizationalUnit',
    },
    {
      title: 'Common Name',
      dataIndex: 'ownerCommonName',
    },
  ];
  if (Id !== undefined && !is{{lower name}}DetailsLoading && details !== null) {
    if (details['ownerOrganizationalUnit'] == '') {
      details['ownerOrganizationalUnit'] = 'N/A'
    }
  }

  return (
    <>
      <PageHeader
      onBack={() => {window.history.back()}}
      title="Details"
      />
        { 
        Id === undefined ||
        is{{lower name}}DetailsLoading ||
        details === null ?
        <Card />
        : 
        <Card>
          {{# each attributes}}
          {{#ifeq type "boolean"}}
          <Row gutter={30}>
            <Col span={4} style=\{{ textAlign: 'right' }}>
              <p> {{attribute}}: </p>
            </Col>
            <Col span={4}> 
              <p> {`${details['{{field}}'].toString().charAt(0).toUpperCase() + details['{{field}}'].toString().slice(1)}`} </p> 
            </Col>
          </Row>
          {{else}}
          {{#ifeq type "datetime"}}
          <Row gutter={30}>
            <Col span={4} style=\{{ textAlign: 'right' }}>
              <p> {{attribute}}: </p>
            </Col>
            <Col span={4}> 
              <p> {dayjs.unix(details['{{field}}']).format("MM/DD/YYYY")} </p> 
            </Col>
          </Row>
          {{else}}
          <Row gutter={30}>
            <Col span={4} style=\{{ textAlign: 'right' }}>
              <p> {{attribute}}: </p>
            </Col>
            <Col span={4}> 
              <p> {details['{{field}}']} </p> 
            </Col>
          </Row>
          {{/ifeq}}
          {{/ifeq}}
          {{/each}}
          <Row gutter={30}>
            <Col span={4} style=\{{ textAlign: 'right' }}>
              <p>  Organization: </p>
            </Col>
            <Col span={4}> 
              <p> {details['ownerOrganization']} </p> 
            </Col>
          </Row>
          <Row gutter={30}>
            <Col span={4} style=\{{ textAlign: 'right' }}>
              <p> Organizational Unit: </p>
            </Col>
            <Col span={4}> 
              <p> {details['ownerOrganizationalUnit']} </p> 
            </Col>
          </Row>
          <Row gutter={30}>
            <Col span={4} style=\{{ textAlign: 'right' }}>
              <p> Common Name: </p>
            </Col>
            <Col span={4}> 
              <p> {details['ownerCommonName']} </p> 
            </Col>
          </Row>
        </Card>
        }
        <PageHeader title='Audit' />
        { 
        is{{lower name}}AuditLoading ?
        <Card />
        : 
        <DataTableComponent
          columns={columns}
          data={audits}
          isLoading={false}
        />
        }
    </>
  );
};

export default {{name}}Details;
