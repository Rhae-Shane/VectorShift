import { PipelineServiceError } from '../src/services/pipelineService';
import { classifySubmitError } from '../src/utils/submitError';

describe('classifySubmitError', () => {
  it('returns offline guidance when the browser is offline', () => {
    const info = classifySubmitError(new Error('anything'), false);

    expect(info.kind).toBe('offline');
    expect(info.showBanner).toBe(true);
    expect(info.title).toMatch(/offline/i);
  });

  it('detects network fetch failures as backend unreachable', () => {
    const info = classifySubmitError(
      new TypeError('Failed to fetch'),
      true
    );

    expect(info.kind).toBe('backend_unreachable');
    expect(info.showBanner).toBe(true);
    expect(info.message).toMatch(/uvicorn/i);
  });

  it('shows banner for server errors from the API', () => {
    const info = classifySubmitError(
      new PipelineServiceError('Internal server error', 500),
      true
    );

    expect(info.kind).toBe('server_error');
    expect(info.showBanner).toBe(true);
  });

  it('does not show banner for validation errors', () => {
    const info = classifySubmitError(
      new PipelineServiceError('Invalid pipeline', 422),
      true
    );

    expect(info.kind).toBe('validation');
    expect(info.showBanner).toBe(false);
  });
});
