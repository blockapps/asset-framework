import { actionDescriptors } from "./actions";

const reducer = (state, action) => {
  switch (action.type) {
    case actionDescriptors.fetchUsers:
      return {
        ...state,
        isUsersLoading: true
      };
    case actionDescriptors.fetchUsersSuccessful:
      return {
        ...state,
        users: action.payload,
        isUsersLoading: false
      };
    case actionDescriptors.fetchUsersFailed:
      return {
        ...state,
        error: action.error,
        isUsersLoading: false
      };
    default:
      throw new Error(`Unhandled action: '${action.type}'`);
  }
};

export default reducer;
