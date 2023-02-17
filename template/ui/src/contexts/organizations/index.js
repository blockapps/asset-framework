import React, { createContext, useContext, useEffect, useReducer } from "react";
import { actions } from "./actions";
import reducer from "./reducer";

const OrganizationsStateContext = createContext();
const OrganizationsDispatchContext = createContext();

const OrganizationsProvider = ({ children }) => {
  const initialState = {
    organizations: [],
    isOrganizationsLoading: false,
    error: undefined,
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    actions.fetchOrganizations(dispatch);
  }, []);

  return (
    <OrganizationsStateContext.Provider value={state}>
      <OrganizationsDispatchContext.Provider value={dispatch}>
        {children}
      </OrganizationsDispatchContext.Provider>
    </OrganizationsStateContext.Provider>
  );
};

const useOrganizationsState = () => {
  const context = useContext(OrganizationsStateContext);
  if (context === undefined) {
    throw new Error(
      `'useOrganizationsState' must be used within a OrganizationsProvider`
    );
  }
  return context;
};

const useOrganizationsDispatch = () => {
  const context = useContext(OrganizationsDispatchContext);
  if (context === undefined) {
    throw new Error(
      `'useOrganizationsDispatch' must be used within a OrganizationsProvider`
    );
  }
  return context;
};

const useReferenceUnit = () => {
  return [useOrganizationsState(), useOrganizationsDispatch()];
};

export {
  useOrganizationsDispatch,
  useOrganizationsState,
  useReferenceUnit,
  OrganizationsProvider,
};
