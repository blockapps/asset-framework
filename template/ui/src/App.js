import React, { useEffect } from "react";
import "./styles/app.css";
import { useAuthenticateState, useAuthenticateDispatch } from "./contexts/authentication";
import AssetFrameworkTopBar from "./components/AssetFrameworkTopBar";
import AssetFrameworkNavigation from "./components/AssetFrameworkNavigation";
import AuthenticatedRoutes from "./AuthenticatedRoutes";
import { actions } from "./contexts/authentication/actions";
import { BrowserRouter } from "react-router-dom";
import { Layout, Card, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";


const App = () => {

  const { Header, Content, Sider, Footer } = Layout;
  const antIcon = <LoadingOutlined spin />;

  const dispatch = useAuthenticateDispatch();

  const {
    isAuthenticated,
    hasChecked,
    user,
    loginUrl,
    users
  } = useAuthenticateState();

  useEffect(() => {
    if (hasChecked && !isAuthenticated && loginUrl !== undefined) {
      window.location.href = loginUrl;
    }
  }, [isAuthenticated, hasChecked, loginUrl]);

  useEffect(() => {
    if (isAuthenticated) {
      actions.fetchUsers(dispatch);
    }
  }, [isAuthenticated]);

  return (
    <BrowserRouter>
      <Layout style={{ minHeight: "100vh" }}>
        <Header style={{ backgroundColor: "#bfbfbf", height: "100%" }}>
          <AssetFrameworkTopBar user={user} logout={() => actions.logout(dispatch)} />
        </Header>
        <Layout>
          {isAuthenticated ?
            <Sider style={{ height: "auto", backgroundColor: "#d9d9d9" }}>
              <AssetFrameworkNavigation isAuthenticated={isAuthenticated} />
            </Sider>
            : null}
          <Content>
            {hasChecked && isAuthenticated ? (
              <AuthenticatedRoutes user={user} users={users} />
            ) :
              (
                <div style={{ width: "420px", margin: "auto", height: "100vh" }}>
                  {hasChecked && !isAuthenticated && loginUrl === undefined ? (
                    <Card title="Authentication Error">
                      <p>
                        An error occured when attempting to verify user
                        credentials. Perhaps the user does not exist in
                        asset Framework yet. Contact a System Administrator
                      </p>
                    </Card>
                  ) : (
                    <Card title="Checking Authentication">
                      <Spin indicator={antIcon} />
                    </Card>
                  )}
                </div>
              )
            }
          </Content>
        </Layout>
        <Footer style={{ backgroundColor: "#F0F0F0", width: "100%" }}>
          BlockApps Inc. © 2023
        </Footer>
      </Layout>
    </BrowserRouter>
  );
};

export default App;
