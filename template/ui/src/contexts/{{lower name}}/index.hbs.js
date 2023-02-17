import React, { createContext, useContext, useReducer } from "react";
import reducer from "./reducer";

const {{name}}StateContext = createContext();
const {{name}}DispatchContext = createContext();

const {{name}}sProvider = ({ children }) => {
  const initialState = {
    {{lower name}}: null,
    isCreate{{name}}Submitting: false,
    {{lower name}}s: [],
    is{{lower name}}sLoading: false,
    {{lower name}}Details: null,
    is{{lower name}}DetailsLoading: false,
    {{lower name}}Ownership: null,
    isOwnership{{lower name}}Transferring: false,
    {{lower name}}UpdateObject: null,
    is{{lower name}}Updating: false,
    {{lower name}}sAudit: [],
    is{{lower name}}sAuditLoading: false,
    error: undefined,
    success: false,
    message: null,
    isAssetImportInProgress: false,
    assetsUploaded: 0,
    assetsUploadedErrors: [],
    isImportAssetsModalOpen: false,
    total{{name}}s: 0
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <{{name}}StateContext.Provider value={state}>
      <{{name}}DispatchContext.Provider value={dispatch}>
        {children}
      </{{name}}DispatchContext.Provider>
    </{{name}}StateContext.Provider>
  );
};

const use{{name}}State = () => {
  const context = useContext({{name}}StateContext);
  if (context === undefined) {
    throw new Error(
      `'use{{name}}State' must be used within a {{name}}sProvider`
    );
  }
  return context;
};

const use{{name}}Dispatch = () => {
  const context = useContext({{name}}DispatchContext);
  if (context === undefined) {
    throw new Error(
      `'use{{name}}Dispatch' must be used within a {{name}}sProvider`
    );
  }
  return context;
};

const use{{name}}Unit = () => {
  return [use{{name}}State(), use{{name}}Dispatch()];
};

export {
  use{{name}}Dispatch,
  use{{name}}State,
  use{{name}}Unit,
  {{name}}sProvider,
};
