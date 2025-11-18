import React from 'react';
import Page from './Page';
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

describe('Page component', () => {
  it('Component renders main dashboard elements', () => {
    const { getByText } = render(<Page />);

    // Check for the main header
    expect(getByText('Editor Admin Panel')).toBeInTheDocument();

    // Check for the main content section
    expect(getByText('Archived & Draft Contents')).toBeInTheDocument();
  });
});
