const mockSdk = {
  app: {
    onConfigure: jest.fn(),
    getParameters: jest.fn().mockReturnValue({}),
    setReady: jest.fn(),
    getCurrentState: jest.fn(),
  },
  ids: {
    app: 'test-app',
    space: 'test-space',
    environment: 'test-environment',
  },
  space: {
    sys: {
      id: 'test-space',
    },
  },
  user: {
    spaceMembership: {
      admin: false,
      roles: [],
    },
    teamMemberships: [],
  },
};

const mockCma = {
  getSpace: jest.fn().mockResolvedValue({
    sys: { id: 'test-space' },
    name: 'Test Space',
  }),
  getEnvironment: jest.fn().mockResolvedValue({
    sys: { id: 'test-environment' },
    name: 'Test Environment',
  }),
};

export { mockSdk, mockCma };
