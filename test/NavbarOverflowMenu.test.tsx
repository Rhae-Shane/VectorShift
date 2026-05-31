import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NavbarOverflowMenu } from '../src/components/NavbarOverflowMenu';

describe('NavbarOverflowMenu', () => {
  it('opens the menu and runs pipeline actions', async () => {
    const onImport = jest.fn();
    const onShare = jest.fn();
    const onPreview = jest.fn();

    render(
      <NavbarOverflowMenu
        hasNodes
        onImport={onImport}
        onShare={onShare}
        onPreview={onPreview}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'More actions' }));
    expect(screen.getByRole('menu')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('menuitem', { name: 'Import' }));
    expect(onImport).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'More actions' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Share' }));
    expect(onShare).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'More actions' }));
    fireEvent.click(screen.getByRole('menuitem', { name: /Preview/i }));
    expect(onPreview).toHaveBeenCalledTimes(1);
  });

  it('disables share and preview when the canvas is empty', () => {
    render(
      <NavbarOverflowMenu
        hasNodes={false}
        onImport={jest.fn()}
        onShare={jest.fn()}
        onPreview={jest.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'More actions' }));

    expect(screen.getByRole('menuitem', { name: 'Share' })).toBeDisabled();
    expect(screen.getByRole('menuitem', { name: /Preview/i })).toBeDisabled();
  });

  it('closes when Escape is pressed', async () => {
    render(
      <NavbarOverflowMenu
        hasNodes
        onImport={jest.fn()}
        onShare={jest.fn()}
        onPreview={jest.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'More actions' }));
    expect(screen.getByRole('menu')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });
});
