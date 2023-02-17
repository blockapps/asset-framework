import React from "react";
import { Link } from "react-router-dom";
import { Menu } from "antd";
import { AppstoreOutlined } from "@ant-design/icons";
import routes from "../../helpers/routes";

const AssetFrameworkNavigation = ({ isAuthenticated }) => {

  const assets = [
    {{#each assets}}
    { 
      ...routes.{{name}}s,
      icon: <AppstoreOutlined />,
    },
    {{/each}}
];

const menuItems = assets.map((asset) => (
  {
    label: ( 
      <Link to={asset.url}>{asset.label}</Link>
      ), 
    key: asset.name,
    icon: asset.icon,
  }
));

return (
  <>
    <Menu
      mode="inline"
      items={isAuthenticated ? menuItems : []}
      style=\{{ backgroundColor: "#d9d9d9" }}
    />
  </>
);
};

export default AssetFrameworkNavigation;
