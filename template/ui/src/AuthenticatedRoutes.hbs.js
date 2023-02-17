import { Route, Routes, Navigate } from "react-router-dom";
import routes from "./helpers/routes";
{{#each assets}}
import {{name}} from "./components/{{name}}";
import {{name}}Details from "./components/{{name}}/{{name}}Details";
import { {{name}}sProvider } from "./contexts/{{lower name}}";
{{/each}}
import { UsersProvider } from "./contexts/users";

const AuthenticatedRoutes = ({user, users}) => {
  return (
      <Routes>
      {{#each assets}}
        <Route exact path={routes.{{name}}s.url} element={
          <UsersProvider>

            {{#each attributes}}
            {{#ifeq type "reference"}}
            <{{reference}}sProvider>
            {{/ifeq}}
            {{#ifeq type "references"}}
            <{{reference}}sProvider>
            {{/ifeq}}
            {{/each}}
            
              <{{name}}sProvider>
                <{{name}} user={user} users={users} />
              </{{name}}sProvider>

            {{#eachrev attributes}}
            {{#ifeq type "reference"}}
            </{{reference}}sProvider>
            {{/ifeq}}
            {{#ifeq type "references"}}
            </{{reference}}sProvider>
            {{/ifeq}}
            {{/eachrev}}

          </UsersProvider>
        } />
        <Route exact path={routes.{{name}}Detail.url} element={
          <UsersProvider>
            <{{name}}sProvider>
              <{{name}}Details user={user} users={users} />
            </{{name}}sProvider>
          </UsersProvider>
        } />
        {{/each}}
        <Route
          path="/"
          element={<Navigate to={routes.{{assets.0.name}}s.url} replace />}
        />
        <Route
          path="*"
          element={<Navigate to={routes.{{assets.0.name}}s.url} replace />}
        />
      </Routes>
  );
};

export default AuthenticatedRoutes;