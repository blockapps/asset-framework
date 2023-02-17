import { actionDescriptors } from "./actions";

const reducer = (state, action) => {
  switch (action.type) {
    case actionDescriptors.resetMessage:
      return {
        ...state,
        success: false,
        message: null
      };
    case actionDescriptors.setMessage:
      return {
        ...state,
        success: action.success,
        message: action.message
      };
    case actionDescriptors.create{{name}}:
      return {
        ...state,
        isCreate{{name}}Submitting: true
      };
    case actionDescriptors.create{{name}}Successful:
      return {
        ...state,
        {{lower name}}: action.payload,
        isCreate{{name}}Submitting: false
      };
    case actionDescriptors.create{{name}}Failed:
      return {
        ...state,
        error: action.error,
        isCreate{{name}}Submitting: false
      };
    case actionDescriptors.fetch{{name}}:
      return {
        ...state,
        is{{name}}sLoading: true
      };
    case actionDescriptors.fetch{{name}}Successful:
      return {
        ...state,
        {{lower name}}s: action.payload.{{lower name}}s,
        total{{name}}s: action.payload.total,
        is{{name}}sLoading: false
      };
    case actionDescriptors.fetch{{name}}Failed:
      return {
        ...state,
        error: action.error,
        is{{name}}sLoading: false
      };
    case actionDescriptors.fetch{{name}}Details:
      return {
        ...state,
        is{{lower name}}DetailsLoading: true
      };
    case actionDescriptors.fetch{{name}}DetailsSuccessful:
      return {
        ...state,
        {{lower name}}Details: action.payload,
        is{{lower name}}DetailsLoading: false
      };
    case actionDescriptors.fetch{{name}}DetailsFailed:
      return {
        ...state,
        error: action.error,
        is{{lower name}}DetailsLoading: false
      };
    case actionDescriptors.transfer{{name}}Ownership:
      return {
        ...state,
        isOwnership{{lower name}}Transferring: true
      };
    case actionDescriptors.transfer{{name}}OwnershipSuccessful:
      return {
        ...state,
        {{lower name}}Ownership: action.payload,
        isOwnership{{lower name}}Transferring: false
      };
    case actionDescriptors.transfer{{name}}OwnershipFailed:
      return {
        ...state,
        error: action.error,
        isOwnership{{lower name}}Transferring: false
      };
    case actionDescriptors.update{{name}}:
      return {
        ...state,
        is{{lower name}}Updating: true
      };
    case actionDescriptors.update{{name}}Successful:
      return {
        ...state,
        {{lower name}}UpdateObject: action.payload,
        is{{lower name}}Updating: false
      };
    case actionDescriptors.update{{name}}Failed:
      return {
        ...state,
        error: action.error,
        is{{lower name}}Updating: false
      };
    case actionDescriptors.fetch{{name}}Audit:
      return {
        ...state,
        is{{lower name}}sAuditLoading: true
      };
    case actionDescriptors.fetch{{name}}AuditSuccessful:
      return {
        ...state,
        {{lower name}}sAudit: action.payload,
        is{{lower name}}sAuditLoading: false
      };
    case actionDescriptors.fetch{{name}}AuditFailed:
      return {
        ...state,
        error: action.error,
        is{{lower name}}sAuditLoading: false
      };
    case actionDescriptors.importAssetRequest:
      return {
        ...state,
        isAssetImportInProgress: true,
        assetsUploaded: 0,
        assetsUploadedErrors: []
      }
    case actionDescriptors.importAssetSuccess:
      return {
        ...state,
        isAssetImportInProgress: false,
        error: null
      }
    case actionDescriptors.importAssetFailure:
      return {
        ...state,
        error: action.error,
        isAssetImportInProgress: false,
        isImportAssetsModalOpen: true
      }
    case actionDescriptors.updateAssetImportCount:
      return {
        ...state,
        assetsUploaded: action.count
      }
    case actionDescriptors.updateAssetUploadError:
      return {
        ...state,
        assetsUploadedErrors: action.errors
      }
    case actionDescriptors.openImportCSVModal:
      return {
        ...state,
        isImportAssetsModalOpen: true
      }
    case actionDescriptors.closeImportCSVModal:
      return {
        ...state,
        isImportAssetsModalOpen: false
      }
    default:
      throw new Error(`Unhandled action: '${action.type}'`);
  }
};

export default reducer;
