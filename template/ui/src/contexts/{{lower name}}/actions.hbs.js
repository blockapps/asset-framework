import RestStatus from "http-status-codes";
import { apiUrl, HTTP_METHODS } from "../../helpers/constants";

const actionDescriptors = {
  create{{name}}: "create_{{lower name}}",
  create{{name}}Successful: "create_{{lower name}}_successful",
  create{{name}}Failed: "create_{{lower name}}_failed",
  fetch{{name}}: "fetch_{{lower name}}s",
  fetch{{name}}Successful: "fetch_{{lower name}}_successful",
  fetch{{name}}Failed: "fetch_{{lower name}}_failed",
  fetch{{name}}Details: "fetch_{{lower name}}_details",
  fetch{{name}}DetailsSuccessful: "fetch_{{lower name}}_details_successful",
  fetch{{name}}DetailsFailed: "fetch_{{lower name}}_details_failed",
  transfer{{name}}Ownership: "transfer_{{lower name}}_ownership",
  transfer{{name}}OwnershipSuccessful: "transfer_{{lower name}}_ownership_successful",
  transfer{{name}}OwnershipFailed: "transfer_{{lower name}}_ownership_failed",
  update{{name}}: "update_{{lower name}}",
  update{{name}}Successful: "update_{{lower name}}_successful",
  update{{name}}Failed: "update_{{lower name}}_failed",
  resetMessage: "reset_message",
  setMessage: "set_message",
  fetch{{name}}Audit: "fetch_{{lower name}}_audit",
  fetch{{name}}AuditSuccessful: "fetch_{{lower name}}_audit_successful",
  fetch{{name}}AuditFailed: "fetch_{{lower name}}_audit_failed",
  importAssetRequest: "import_asset_request",
  importAssetSuccess: "import_asset_success",
  importAssetFailure: "import_asset_failure",
  updateAssetImportCount: "update_asset_import_count",
  updateAssetUploadError: "update_asset_upload_error",
  openImportCSVModal: "open_import_csv_modal",
  closeImportCSVModal: "close_import_csv_modal"
};

const actions = {
  resetMessage: (dispatch) => {
    dispatch({ type: actionDescriptors.resetMessage });
  },

  setMessage: (dispatch, message, success = false) => {
    dispatch({ type: actionDescriptors.setMessage, message, success });
  },

  openImportCSVmodal: (dispatch) => {
    dispatch({ type: actionDescriptors.openImportCSVModal });
  },

  closeImportCSVmodal: (dispatch) => {
    dispatch({ type: actionDescriptors.closeImportCSVModal });
  },

  create{{name}}: async (dispatch, payload) => {
    dispatch({ type: actionDescriptors.create{{name}} });

    try {
      const response = await fetch(`${apiUrl}/{{lower name}}`, {
        method: HTTP_METHODS.POST,
        credentials: "same-origin",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const body = await response.json();

      if (response.status === RestStatus.OK) {
        dispatch({
          type: actionDescriptors.create{{name}}Successful,
          payload: body.data,
        });
        actions.setMessage(dispatch, "{{name}} created successfully", true)
        return true;
      }

      dispatch({ type: actionDescriptors.create{{name}}Failed, error: 'Error while creating {{name}}' });
      actions.setMessage(dispatch, "Error while creating {{name}}")
      return false;

    } catch (err) {
      dispatch({ type: actionDescriptors.create{{name}}Failed, error: "Error while creating {{name}}" });
      actions.setMessage(dispatch, "Error while creating {{name}}")
    }
  },

  fetch{{name}}Details: async (dispatch, id, chainId) => {
    dispatch({ type: actionDescriptors.fetch{{name}}Details });

    try {
      const response = await fetch(`${apiUrl}/{{lower name}}/${id}/${chainId}`, {
        method: HTTP_METHODS.GET
      });

      const body = await response.json();

      if (response.status === RestStatus.OK) {
        dispatch({
          type: actionDescriptors.fetch{{name}}DetailsSuccessful,
          payload: body.data,
        });

        return true;
      }

      dispatch({ type: actionDescriptors.fetch{{name}}DetailsFailed, error: 'Error while fetching {{name}}' });
      return false;

    } catch (err) {
      dispatch({ type: actionDescriptors.fetch{{name}}DetailsFailed, error: "Error while fetching {{name}}" });
    }
  },

  fetch{{name}}: async (dispatch, limit, offset, queryValue) => {
    const query = queryValue
      ? `&{{attributes.[0].field}}=${queryValue}`
      : "";

    dispatch({ type: actionDescriptors.fetch{{name}} });

    try {
      const response = await fetch(`${apiUrl}/{{lower name}}?limit=${limit}&offset=${offset}${query}`, {
        method: HTTP_METHODS.GET,
      });

      const body = await response.json();

      if (response.status === RestStatus.OK) {
        dispatch({
          type: actionDescriptors.fetch{{name}}Successful,
          payload: body.data,
        });
        return;
      }
      dispatch({ type: actionDescriptors.fetch{{name}}Failed, error: undefined });
    } catch (err) {
      dispatch({ type: actionDescriptors.fetch{{name}}Failed, error: undefined });
    }
  },
  transfer{{name}}Ownership: async (dispatch, payload) => {
    dispatch({ type: actionDescriptors.transfer{{name}}Ownership });

    try {
      const response = await fetch(`${apiUrl}/{{lower name}}/transferOwnership`, {
        method: HTTP_METHODS.POST,
        credentials: "same-origin",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const body = await response.json();

      if (response.status === RestStatus.OK) {
        dispatch({
          type: actionDescriptors.transfer{{name}}OwnershipSuccessful,
          payload: body.data,
        });
        actions.setMessage(dispatch, "{{name}} has been transferred", true);
        return true;
      }

      dispatch({ type: actionDescriptors.transfer{{name}}OwnershipFailed, error: 'Error while transfer ownership {{name}}' });
      actions.setMessage(dispatch, "Error while transfer ownership {{name}}")
      return false;

    } catch (err) {
      dispatch({ type: actionDescriptors.transfer{{name}}OwnershipFailed, error: "Error while transfer ownership {{name}}" });
      actions.setMessage(dispatch, "Error while transfer ownership {{name}}")
    }
  },
  update{{name}}: async (dispatch, payload) => {
    dispatch({ type: actionDescriptors.update{{name}} });

    try {
      const response = await fetch(`${apiUrl}/{{lower name}}/update`, {
        method: HTTP_METHODS.PUT,
        credentials: "same-origin",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const body = await response.json();

      if (response.status === RestStatus.OK) {
        dispatch({
          type: actionDescriptors.update{{name}}Successful,
          payload: body.data,
        });
        actions.setMessage(dispatch, "{{name}} has been updated", true);
        return true;
      }

      dispatch({ type: actionDescriptors.update{{name}}Failed, error: 'Error while updating {{name}}' });
      actions.setMessage(dispatch, "Error while updating {{name}}")
      return false;

    } catch (err) {
      dispatch({ type: actionDescriptors.update{{name}}Failed, error: "Error while updating {{name}}" });
      actions.setMessage(dispatch, "Error while updating {{name}}")
    }
  },
  fetch{{name}}Audit: async (dispatch, address, chainId) => {
    dispatch({ type: actionDescriptors.fetch{{name}}Details });

    try {
      const response = await fetch(`${apiUrl}/{{lower name}}/${address}/${chainId}/audit`, {
        method: HTTP_METHODS.GET
      });

      const body = await response.json();

      if (response.status === RestStatus.OK) {
        dispatch({
          type: actionDescriptors.fetch{{name}}AuditSuccessful,
          payload: body.data,
        });

        return true;
      }

      dispatch({ type: actionDescriptors.fetch{{name}}AuditFailed, error: 'Error while fetching audit' });
      return false;

    } catch (err) {
      dispatch({ type: actionDescriptors.fetch{{name}}AuditFailed, error: "Error while fetching audit" });
    }
  },
  importAssets: async (dispatch, assets) => {
    dispatch({ type: actionDescriptors.importAssetRequest });
    const errors = [];

    for (let i = 0; i < assets.length; i++) {
      try {
        const response = await fetch(`${apiUrl}/{{lower name}}`, {
          method: HTTP_METHODS.POST,
          credentials: "same-origin",
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(assets[i])
        });

        const body = await response.json();

        if (response.status === RestStatus.OK) {
          dispatch({
            type: actionDescriptors.updateAssetImportCount,
            count: i+1,
          });
        } else {
          errors.push({ status: response.error.status, error: response.error.data.method, id: i })
        }        
      } catch (err) {
        //  nothing
      }
    }

    dispatch({ type: actionDescriptors.importAssetSuccess });
    dispatch({ type: actionDescriptors.updateAssetUploadError, errors });
    actions.setMessage(dispatch, `Imported ${assets.length} records`, true)
  },
};

export { actionDescriptors, actions };
