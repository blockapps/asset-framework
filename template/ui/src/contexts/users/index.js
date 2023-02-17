import React, { createContext, useContext, useEffect, useReducer } from "react";
import { actions } from "./actions";
import reducer from "./reducer";

const UsersStateContext = createContext();
const UsersDispatchContext = createContext();

const UsersProvider = ({ children }) => {
  const initialState = {
    users: [],
    isUsersLoading: false,
    error: undefined,
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    actions.fetchUsers(dispatch);
  }, []);

  return (
    <UsersStateContext.Provider value={state}>
      <UsersDispatchContext.Provider value={dispatch}>
        {children}
      </UsersDispatchContext.Provider>
    </UsersStateContext.Provider>
  );
};

const useUsersState = () => {
  const context = useContext(UsersStateContext);
  if (context === undefined) {
    throw new Error(
      `'useUsersState' must be used within a UsersProvider`
    );
  }
  return context;
};

const useUsersDispatch = () => {
  const context = useContext(UsersDispatchContext);
  if (context === undefined) {
    throw new Error(
      `'useUsersDispatch' must be used within a UsersProvider`
    );
  }
  return context;
};

const useReferenceUnit = () => {
  return [useUsersState(), useUsersDispatch()];
};

export {
  useUsersDispatch,
  useUsersState,
  useReferenceUnit,
  UsersProvider,
};
