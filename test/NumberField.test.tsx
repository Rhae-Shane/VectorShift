import { render, screen, fireEvent } from '@testing-library/react';
import { NumberField } from '../src/nodes/fields';
import { useStore } from '../src/store';

describe('NumberField (custom field type example)', () => {
  beforeEach(() => {
    useStore.setState({
      nodes: [
        {
          id: 'httpRequest-1',
          type: 'httpRequest',
          position: { x: 0, y: 0 },
          data: {
            id: 'httpRequest-1',
            nodeType: 'httpRequest',
            timeoutMs: 30000,
          },
        },
      ],
      edges: [],
      nodeIDs: { httpRequest: 1 },
    });
  });

  it('renders and syncs numeric values to the store', () => {
    const data = useStore.getState().nodes[0].data;

    render(
      <NumberField
        nodeId="httpRequest-1"
        data={data}
        name="timeoutMs"
        label="Timeout"
        defaultValue={30000}
        min={1000}
        max={120000}
        step={1000}
        unit="ms"
      />
    );

    const input = screen.getByRole('spinbutton');
    expect(input).toHaveValue(30000);

    fireEvent.change(input, { target: { value: '5000' } });

    expect(useStore.getState().nodes[0].data.timeoutMs).toBe(5000);
  });
});
