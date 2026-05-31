import { PipelineServiceError } from '../services/pipelineService';

export type SubmitFailureKind =
  | 'offline'
  | 'backend_unreachable'
  | 'server_error'
  | 'validation'
  | 'unknown';

export interface SubmitErrorInfo {
  kind: SubmitFailureKind;
  title: string;
  message: string;
  showBanner: boolean;
}

const isNetworkFetchError = (error: unknown): boolean => {
  if (error instanceof TypeError) return true;
  if (error instanceof Error) {
    return /failed to fetch|network|load failed|networkerror/i.test(error.message);
  }
  return false;
};

export const classifySubmitError = (
  error: unknown,
  isOnline: boolean
): SubmitErrorInfo => {
  if (!isOnline) {
    return {
      kind: 'offline',
      title: 'You appear to be offline',
      message:
        'Check your internet connection, then click Submit again to analyze the pipeline.',
      showBanner: true,
    };
  }

  if (isNetworkFetchError(error)) {
    return {
      kind: 'backend_unreachable',
      title: 'Unable to connect to backend',
      message:
        'The API server may be stopped or unreachable. From the project backend folder, run: uvicorn main:app --reload (port 8000).',
      showBanner: true,
    };
  }

  if (error instanceof PipelineServiceError) {
    if (error.status !== undefined && error.status >= 500) {
      return {
        kind: 'server_error',
        title: 'Backend error',
        message: error.message,
        showBanner: true,
      };
    }

    return {
      kind: 'validation',
      title: 'Pipeline Error',
      message: error.message,
      showBanner: false,
    };
  }

  return {
    kind: 'unknown',
    title: 'Pipeline Error',
    message:
      error instanceof Error
        ? error.message
        : 'Something went wrong while analyzing the pipeline.',
    showBanner: false,
  };
};
