import mongoose from 'mongoose';
import { adminResolvers } from '../graphql/resolvers';
import { Car } from '../models/Car';
import { GraphQLError } from 'graphql';

describe('Manual Car Creation Test', () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect('mongodb://localhost:27017/thunderauto_test');
  });

  afterAll(async () => {
    // Disconnect from test database
    await mongoose.connection.close();
  });

  it('should create a car successfully', async () => {
    const mockUser = {
      _id: new mongoose.Types.ObjectId(),
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      role: 'ADMIN'
    };

    const mockContext = { user: mockUser };

    const baseCarInput = {
      make: 'Toyota',
      carModel: 'Camry',
      year: 2023,
      price: 25000,
      engineType: 'GASOLINE',
      transmission: 'AUTOMATIC'
    };

    try {
      const result = await adminResolvers.AdminMutation.createCar(
        null, 
        { input: baseCarInput }, 
        mockContext
      );

      expect(result).toBeDefined();
      expect(result.make).toBe('Toyota');
      expect(result.carModel).toBe('Camry');
      expect(result.year).toBe(2023);
      expect(result.price).toBe(25000);
      expect(result.engineType).toBe('GASOLINE');
      expect(result.transmission).toBe('AUTOMATIC');
      expect(result.rating).toBe(0);
      expect(result.images).toEqual([]);
      expect(result.status).toBe('DRAFT');
    } catch (error) {
      console.error('Test failed:', error);
      throw error;
    }
  });

  it('should throw error for invalid engine type', async () => {
    const mockUser = {
      _id: new mongoose.Types.ObjectId(),
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      role: 'ADMIN'
    };

    const mockContext = { user: mockUser };

    const invalidCarInput = {
      make: 'Toyota',
      carModel: 'Camry',
      year: 2023,
      price: 25000,
      engineType: 'INVALID_ENGINE',
      transmission: 'AUTOMATIC'
    };

    await expect(adminResolvers.AdminMutation.createCar(
      null, 
      { input: invalidCarInput }, 
      mockContext
    )).rejects.toThrow(GraphQLError);
  });

  it('should throw error for non-admin user', async () => {
    const mockUser = {
      _id: new mongoose.Types.ObjectId(),
      firstName: 'Regular',
      lastName: 'User',
      email: 'user@example.com',
      role: 'USER'
    };

    const mockContext = { user: mockUser };

    const baseCarInput = {
      make: 'Toyota',
      carModel: 'Camry',
      year: 2023,
      price: 25000,
      engineType: 'GASOLINE',
      transmission: 'AUTOMATIC'
    };

    await expect(adminResolvers.AdminMutation.createCar(
      null, 
      { input: baseCarInput }, 
      mockContext
    )).rejects.toThrow(GraphQLError);
  });
});
