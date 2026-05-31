import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { KeyboardShortcutsPopover } from '../src/components/KeyboardShortcutsPopover';

describe('KeyboardShortcutsPopover', () => {
  it('opens and closes the shortcuts panel from the trigger', async () => {
    render(<KeyboardShortcutsPopover />);

    const trigger = screen.getByRole('button', { name: 'Keyboard shortcuts' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(
      screen.getByRole('dialog', { name: 'Keyboard shortcuts' })
    ).toBeInTheDocument();
    expect(screen.getByText('Shortcuts')).toBeInTheDocument();
    expect(screen.getByText(/ignored while typing in a field/i)).toBeInTheDocument();

    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes the panel when Escape is pressed', async () => {
    render(<KeyboardShortcutsPopover />);

    fireEvent.click(screen.getByRole('button', { name: 'Keyboard shortcuts' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('closes when clicking outside the popover', async () => {
    render(
      <div>
        <KeyboardShortcutsPopover />
        <button type="button">Outside</button>
      </div>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Keyboard shortcuts' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByRole('button', { name: 'Outside' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
