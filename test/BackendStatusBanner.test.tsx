import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BackendStatusBanner } from '../src/components/BackendStatusBanner';
import { useOnlineStatus } from '../src/hooks/useOnlineStatus';
import {
  showBackendStatus,
} from '../src/utils/backendStatusEvents';

jest.mock('framer-motion', () => {
  const actual = jest.requireActual('framer-motion');
  return {
    ...actual,
    useReducedMotion: () => true,
  };
});

jest.mock('../src/hooks/useOnlineStatus');

const mockUseOnlineStatus = useOnlineStatus as jest.MockedFunction<
  typeof useOnlineStatus
>;

describe('BackendStatusBanner', () => {
  beforeEach(() => {
    mockUseOnlineStatus.mockReturnValue(true);
  });

  it('does not render when online and no backend status event', () => {
    render(<BackendStatusBanner />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows an offline hint when the browser is offline', () => {
    mockUseOnlineStatus.mockReturnValue(false);

    render(<BackendStatusBanner />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('You appear to be offline');
    expect(alert).toHaveTextContent(/network connection/i);
    expect(document.querySelector('.vs-backend-banner--offline')).toBeInTheDocument();
  });

  it('shows backend status from a custom event', async () => {
    render(<BackendStatusBanner />);

    act(() => {
      showBackendStatus({
        title: 'Backend unavailable',
        message: 'Could not reach the pipeline API.',
      });
    });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Backend unavailable');
      expect(screen.getByText('Could not reach the pipeline API.')).toBeInTheDocument();
    });
  });

  it('dismisses a backend status banner', async () => {
    render(<BackendStatusBanner />);

    act(() => {
      showBackendStatus({
        title: 'Backend unavailable',
        message: 'Try again later.',
      });
    });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    fireEvent.click(
      screen.getByRole('button', { name: 'Dismiss connection notice' })
    );

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });
});
