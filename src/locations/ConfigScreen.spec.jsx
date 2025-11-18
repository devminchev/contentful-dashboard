import React from 'react';
import ConfigScreen from './ConfigScreen';
import { render } from '@testing-library/react';
import { mockCma, mockSdk } from '../../test/mocks';

jest.mock('@contentful/react-apps-toolkit', () => ({
  useSDK: () => mockSdk,
  useCMA: () => mockCma,
}));

// Mock the Root component to avoid all dependency chain issues
jest.mock('../core/Root', () => {
  return function MockRoot() {
    return (
      <div>
        <h1>Editor Admin Panel</h1>
        <p>Archived & Draft Contents</p>
      </div>
    );
  };
});

describe('Config Screen component', () => {
  it('Component renders and shows main application', async () => {
    const { getByText } = render(<ConfigScreen />);

    // Check that the main application content is rendered
    expect(getByText('Editor Admin Panel')).toBeInTheDocument();
    expect(getByText('Archived & Draft Contents')).toBeInTheDocument();
  });

  it('SDK configuration is called on mount', async () => {
    render(<ConfigScreen />);

    // Verify that SDK methods were called
    expect(mockSdk.app.onConfigure).toHaveBeenCalled();

    // Wait for async useEffect to complete
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(mockSdk.app.setReady).toHaveBeenCalled();
  });
});
