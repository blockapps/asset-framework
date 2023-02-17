import RestStatus from "http-status-codes";
import { apiUrl, HTTP_METHODS } from "../../helpers/constants";

const actionDescriptors = {
  fetchUsers: "users/fetch_users",
  fetchUsersSuccessful: "users/fetch_users_successful",
  fetchUsersFailed: "users/fetch_users_failed"
};

const actions = {
  fetchUsers: async (dispatch) => {
    dispatch({ type: actionDescriptors.fetchUsers });

    try {
      const response = await fetch(`${apiUrl}/users`, {
        method: HTTP_METHODS.GET,
      });

      const body = await response.json();

      if (response.status === RestStatus.OK) {
        dispatch({
          type: actionDescriptors.fetchUsersSuccessful,
          payload: body.data,
        });
        return;
      }
      dispatch({ type: actionDescriptors.fetchUsersFailed, payload: 'users request failed' });
    } catch (err) {
      dispatch({ type: actionDescriptors.fetchUsersFailed, payload: 'users request failed' });
    }

  },
};

export { actionDescriptors, actions };
