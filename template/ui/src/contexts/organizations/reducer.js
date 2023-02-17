import { actionDescriptors } from "./actions";

const reducer = (state, action) => {
  switch (action.type) {
    case actionDescriptors.fetchOrganizations:
      return {
        ...state,
        isOrganizationsLoading: true
      };
    case actionDescriptors.fetchOrganizationsSuccessful:
      return {
        ...state,
        organizations: action.payload,
        isOrganizationsLoading: false
      };
    case actionDescriptors.fetchOrganizationsFailed:
      return {
        ...state,
        error: action.error,
        isOrganizationsLoading: false
      };
    default:
      throw new Error(`Unhandled action: '${action.type}'`);
  }
};

export default reducer;
