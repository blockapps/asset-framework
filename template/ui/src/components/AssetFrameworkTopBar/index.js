import React, { useState, useCallback } from "react";
import { Avatar, Dropdown } from "antd";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { apiUrl, HTTP_METHODS } from "../../helpers/constants";
import logo from "../../blockapps-logo.png";


const AssetFrameworkTopBar = ({ user, logout }) => {

  const name = user !== undefined ? user.preferred_username || user.email : "";
  const menu =
  {
    items: [
      {
        label: (<span >Logout</span>),
        key: "logout",
        icon: (<LogoutOutlined />),
      }
    ],
    style: { width: "250px" },
    onClick: ({item, key, keyPath, e}) => {
      // include a case statement to allow extensibility to this menu
      switch(key) {
        case "logout": 
          logout(e)
          return
        default: return
      }
    }
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "start", float: "left", paddingTop: 5 }}>
        <img src={logo} height={50} weight={50} />
      </div>
      <div style={{ display: "flex", justifyContent: "end", float: "right" }}>
        <Dropdown
          menu={menu}
          trigger={["click"]}
          className="pointer-hover"
        >
          <div>
            <Avatar
              style={{
                backgroundColor: "#4d94ff",
                justifyContent: "center",
                alignItems: "center",
              }}
              icon={<UserOutlined />}
            />
            <span style={{ marginLeft: "10px" }}>{name}</span>
          </div>
        </Dropdown>
      </div>
    </>
  )
};

export default AssetFrameworkTopBar;