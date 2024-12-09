import { adminResolvers as resolvers } from '../graphql/resolvers/admin.resolver';

describe('Minimal Test', () => {
  it('should have a createCar mutation', () => {
    expect(resolvers.AdminMutation.createCar).toBeDefined();
  });
});
