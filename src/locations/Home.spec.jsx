import React from 'react';
import Home from './Home';
import { render } from '@testing-library/react';
import { mockCma, mockSdk } from '../../test/mocks';

jest.mock('@contentful/react-apps-toolkit', () => ({
  useSDK: () => mockSdk,
  useCMA: () => mockCma,
}));

// Mock the Root component
jest.mock('../core/Root', () => {
  return function MockRoot() {
    return <div data-test-id="root-component">Mocked Root Component</div>;
  };
});

describe('Home component', () => {
  it('renders Root component', () => {
    const { getByTestId, getByText } = render(<Home />);

    // Check that Root component is rendered
    expect(getByTestId('root-component')).toBeInTheDocument();
    expect(getByText('Mocked Root Component')).toBeInTheDocument();
  });
});
