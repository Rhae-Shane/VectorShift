export interface BackendStatusPayload {
  title: string;
  message: string;
}

export const BACKEND_STATUS_EVENT = 'vs:backend-status';

export const showBackendStatus = (payload: BackendStatusPayload): void => {
  window.dispatchEvent(
    new CustomEvent(BACKEND_STATUS_EVENT, { detail: payload })
  );
};

export const clearBackendStatus = (): void => {
  window.dispatchEvent(
    new CustomEvent(BACKEND_STATUS_EVENT, { detail: null })
  );
};
