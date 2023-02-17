import { actionDescriptors } from "./actions";

const reducer = (state, action) => {
  switch (action.type) {
    case actionDescriptors.check:
      return {
        ...state,
        isCheckingAuthentication: true,
      };
    case actionDescriptors.checkFailed:
      return {
        ...state,
        user: undefined,
        isAuthenticated: false,
        isCheckingAuthentication: false,
        hasChecked: true,
        loginUrl: action.payload,
      };
    case actionDescriptors.checkSuccessful:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isCheckingAuthentication: false,
        hasChecked: true,
      };
    case actionDescriptors.fetchUsers:
      return {
        ...state,
        isUsersLoading: true,
      };
    case actionDescriptors.fetchUsersSuccessful:
      return {
        ...state,
        isUsersLoading: false,
        users: action.payload,
      };
    case actionDescriptors.fetchUsersFailed:
      return {
        ...state,
        isUsersLoading: false,
      };
    case actionDescriptors.logoutCheck:
      return {
        ...state,
        isUsersLoading: true,
      };
    case actionDescriptors.logoutSuccessful:
      return {
        ...state,
        isUsersLoading: false,
        isAuthenticated: false,
        logoutUrl: action.payload,
      };
    case actionDescriptors.logoutFailed:
      return {
        ...state,
        isUsersLoading: false,
      };
    default:
      throw new Error(`Unhandled action: '${action.type}'`);
  }
};

export default reducer;
