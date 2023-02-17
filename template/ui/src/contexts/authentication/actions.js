import RestStatus from "http-status-codes";
import { apiUrl, HTTP_METHODS } from "../../helpers/constants";

const actionDescriptors = {
  check: "auth/check",
  checkSuccessful: "auth/check_successful",
  checkFailed: "auth/check_failed",
  fetchUsers: "FETCH_USERS",
  fetchUsersSuccessful: "FETCH_USERS_SUCCESSFUL",
  fetchUsersFailed: "FETCH_USERS_FAILED",
  logoutCheck: "auth/logout_check",
  logoutSuccessful: "auth/logout_success",
  logoutFailed: "auth/logout_failed",
};

const actions = {
  check: async (dispatch) => {
    dispatch({ type: actionDescriptors.check });
    try {
      const response = await fetch(`${apiUrl}/users/me`, {
        method: HTTP_METHODS.GET,
        credentials: "same-origin",
      });
      const body = await response.json();
      if (response.status === RestStatus.UNAUTHORIZED || response.status === RestStatus.FORBIDDEN) {
        dispatch({
          type: actionDescriptors.checkFailed,
          payload: body.error.loginUrl,
        });
        return;
      }
      if (response.status === RestStatus.OK) {
        dispatch({
          type: actionDescriptors.checkSuccessful,
          payload: body.data,
        });
        return;
      }
      dispatch({ type: actionDescriptors.checkFailed, payload: undefined });
    } catch (err) {
      dispatch({ type: actionDescriptors.checkFailed, payload: undefined });
    }
  },
  fetchUsers: async (dispatch) => {
    dispatch({ type: actionDescriptors.fetchUsers });
    try {
      const response = await fetch(`${apiUrl}/users`, {
        method: HTTP_METHODS.GET,
        credentials: "same-origin",
      });
      const body = await response.json();
      if (response.status === RestStatus.OK) {
        dispatch({
          type: actionDescriptors.fetchUsersSuccessful,
          payload: body.data,
        });
        return;
      }
      dispatch({ type: actionDescriptors.fetchUsersFailed, payload: undefined });
    } catch (err) {
      dispatch({ type: actionDescriptors.fetchUsersFailed, payload: undefined });
    }
  },
  logout: async (dispatch) => {
    dispatch({ type: actionDescriptors.logoutCheck });
    try {
      const response = await fetch(`${apiUrl}/authentication/logout`, {
          method: HTTP_METHODS.GET,
          credentials: "same-origin",
      });
      if (response.status === RestStatus.OK) {
        const body = await response.json();
        window.location.href = body.data.logoutUrl;
        dispatch({ type: actionDescriptors.logoutSuccessful, payload: body.data.logoutUrl });
        return;
      }
      dispatch({ type: actionDescriptors.logoutFailed, payload: undefined });
    } catch (err) {
      dispatch({ type: actionDescriptors.logoutFailed, payload: undefined });
    }
  },
};

export { actionDescriptors, actions };
