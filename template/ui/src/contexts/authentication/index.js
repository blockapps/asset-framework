import React, { createContext, useContext, useReducer, useEffect } from "react";
import { actions } from "./actions";
import reducer from "./reducer";

const AuthenticationStateContext = createContext();
const AuthenticationDispatchContext = createContext();

const AuthenticationProvider = ({ children }) => {
  const initialState = {
    isAuthenticated: false,
    error: undefined,
    hasChecked: false,
    isCheckingAuthentication: false,
    user: undefined,
    users: [],
    isUsersLoading: false,
    loginUrl: undefined,
    logoutUrl: undefined
  };
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    if (!state.isAuthenticated && !state.hasChecked) {
      actions.check(dispatch);
    }
  }, [state.isAuthenticated, state.hasChecked]);

  return (
    <AuthenticationStateContext.Provider value={state}>
      <AuthenticationDispatchContext.Provider value={dispatch}>
        {children}
      </AuthenticationDispatchContext.Provider>
    </AuthenticationStateContext.Provider>
  );
};

const useAuthenticateState = () => {
  const context = useContext(AuthenticationStateContext);
  if (context === undefined) {
    throw new Error(
      `'useAuthenticationState' must be used within a AuthenticationProvider`
    );
  }
  return context;
};

const useAuthenticateDispatch = () => {
  const context = useContext(AuthenticationDispatchContext);
  if (context === undefined) {
    throw new Error(
      `'useAuthenticationDispatch' must be used within a AuthenticationProvider`
    );
  }
  return context;
};

const useAuthentication = () => {
  return [useAuthenticateState(), useAuthenticateDispatch()];
};

export {
  useAuthenticateDispatch,
  useAuthenticateState,
  useAuthentication,
  AuthenticationProvider,
};
