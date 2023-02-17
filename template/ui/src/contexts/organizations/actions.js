import RestStatus from "http-status-codes";
import { apiUrl, HTTP_METHODS } from "../../helpers/constants";

const actionDescriptors = {
  fetchOrganizations: "organizations/fetch_organizations",
  fetchOrganizationsSuccessful: "organizations/fetch_organizations_successful",
  fetchOrganizationsFailed: "organizations/fetch_organizations_failed"
};

const actions = {
  fetchOrganizations: async (dispatch) => {
    dispatch({ type: actionDescriptors.fetchOrganizations });

    try {
      const response = await fetch(`${apiUrl}/organizations`, {
        method: HTTP_METHODS.GET,
      });

      const body = await response.json();

      if (response.status === RestStatus.OK) {
        dispatch({
          type: actionDescriptors.fetchOrganizationsSuccessful,
          payload: body.data,
        });
        return;
      }
      dispatch({ type: actionDescriptors.fetchOrganizationsFailed, payload: 'organization request failed' });
    } catch (err) {
      dispatch({ type: actionDescriptors.fetchOrganizationsFailed, payload: 'organization request failed' });
    }

  },
};

export { actionDescriptors, actions };
