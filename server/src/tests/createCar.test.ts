import { ApolloServer } from '@apollo/server';
import { GraphQLError } from 'graphql';
import mongoose from 'mongoose';
import { adminResolvers as resolvers } from '../graphql/resolvers/admin.resolver';
import { Car } from '../models/Car';
import { IUser } from '../models/User';

// Mock dependencies
jest.mock('../models/Car', () => ({
  Car: {
    create: jest.fn(),
    findById: jest.fn()
  }
}));

describe('createCar Mutation', () => {
  let mockUser: IUser;
  let mockContext: any;

  beforeEach(() => {
    // Setup mock user and context
    mockUser = {
      _id: new mongoose.Types.ObjectId(),
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      role: 'ADMIN'
    } as IUser;

    mockContext = {
      user: mockUser
    };

    // Reset mocks
    (Car.create as jest.Mock).mockReset();
    (Car.findById as jest.Mock).mockReset();
  });

  const baseCarInput = {
    make: 'Toyota',
    carModel: 'Camry',
    year: 2023,
    price: 25000,
    engineType: 'GASOLINE',
    transmission: 'AUTOMATIC',
    specs: {
      engine: {
        displacement: 0,
        cylinders: 0,
        configuration: '',
        fuelInjection: '',
        turbocharger: false,
        supercharger: false,
        compression: '',
        valvesPerCylinder: 0
      }
    }
  };

  it('should successfully create a car with minimal input', async () => {
    // Mock car creation and population
    const mockCreatedCar = {
      ...baseCarInput,
      _id: new mongoose.Types.ObjectId(),
      createdBy: mockUser,
      lastUpdatedBy: mockUser,
      specs: {
        engine: {
          displacement: 0,
          cylinders: 0,
          configuration: '',
          fuelInjection: '',
          turbocharger: false,
          supercharger: false,
          compression: '',
          valvesPerCylinder: 0
        },
        performance: {
          powerToWeight: 0,
          topSpeed: 0,
          acceleration060: 0,
          acceleration0100: 0,
          quarterMile: 0,
          brakingDistance60_0: 0
        },
        chassis: {
          bodyType: '',
          platform: '',
          frontSuspension: '',
          rearSuspension: '',
          frontBrakes: '',
          rearBrakes: '',
          wheelSize: '',
          tireSize: ''
        },
        dimensions: {
          length: 0,
          width: 0,
          height: 0,
          wheelbase: 0,
          groundClearance: 0,
          dragCoefficient: 0,
          weight: 0,
          distribution: ''
        },
        transmission: {
          type: '',
          gears: 0,
          clutchType: 'AUTOMATIC',
          driveType: 'FRONT_WHEEL_DRIVE',
          differential: ''
        },
        fuel: {
          fuelType: '',
          fuelSystem: '',
          tankCapacity: 0,
          cityMPG: 0,
          highwayMPG: 0,
          combinedMPG: 0,
          emissionClass: ''
        },
        interior: {
          seatingCapacity: 0,
          doors: 0,
          trunkCapacity: 0,
          infotainmentScreen: '',
          soundSystem: '',
          climateZones: 0,
          upholsteryMaterial: ''
        },
        safety: {
          airbags: '',
          abs: false,
          stabilityControl: false,
          tractionControl: false,
          parkingSensors: false,
          camera: '',
          blindSpotMonitoring: false,
          laneDepartureWarning: false,
          collisionWarning: false,
          nightVision: false
        },
        technology: {
          infotainmentSystem: '',
          screenSize: 0,
          appleCarPlay: false,
          androidAuto: false,
          adaptiveCruiseControl: false,
          laneKeepAssist: false,
          blindSpotMonitoring: false,
          parkingAssist: false,
          nightVision: false,
          headUpDisplay: false,
          surroundViewCamera: false,
          bluetooth: false,
          wirelessCharging: false,
          wifi: false,
          soundSystem: '',
          speakers: 0,
          digitalKey: false,
          mobileApp: false,
          overTheAirUpdates: false,
          voiceControl: false,
          voiceAssistantName: '',
          smartphone: [],
          navigation: '',
          headlightType: '',
          driverAssistance: []
        },
        warranty: {
          basic: '',
          powertrain: '',
          corrosion: '',
          roadside: '',
          maintenance: ''
        },
        features: {
          safety: [],
          comfort: [],
          technology: [],
          exterior: [],
          interior: []
        }
      },
      rating: 0,
      images: [],
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date)
    };

    (Car.create as jest.Mock).mockResolvedValue(mockCreatedCar);
    (Car.findById as jest.Mock).mockResolvedValue(mockCreatedCar);

    const { createCar } = resolvers.AdminMutation;
    const result = await createCar(
      null, 
      { input: baseCarInput }, 
      mockContext
    );

    expect(result).toMatchObject(mockCreatedCar);
    expect(Car.create).toHaveBeenCalledWith(expect.objectContaining({
      make: 'Toyota',
      carModel: 'Camry',
      year: 2023,
      price: 25000,
      engineType: 'GASOLINE',
      transmission: 'AUTOMATIC'
    }));
  });

  it('should throw error for missing required fields', async () => {
    const { createCar } = resolvers.AdminMutation;
    
    // Test missing make
    await expect(createCar(
      null, 
      { input: { ...baseCarInput, make: undefined } }, 
      mockContext
    )).rejects.toThrow(GraphQLError);

    // Test missing carModel
    await expect(createCar(
      null, 
      { input: { ...baseCarInput, carModel: undefined } }, 
      mockContext
    )).rejects.toThrow(GraphQLError);

    // Test missing year
    await expect(createCar(
      null, 
      { input: { ...baseCarInput, year: undefined } }, 
      mockContext
    )).rejects.toThrow(GraphQLError);

    // Test missing price
    await expect(createCar(
      null, 
      { input: { ...baseCarInput, price: undefined } }, 
      mockContext
    )).rejects.toThrow(GraphQLError);
  });

  it('should throw error for unauthorized access', async () => {
    const { createCar } = resolvers.AdminMutation;
    
    // Test non-admin user
    const nonAdminContext = {
      user: {
        ...mockUser,
        role: 'USER'
      }
    };

    await expect(createCar(
      null, 
      { input: baseCarInput }, 
      nonAdminContext
    )).rejects.toThrow(GraphQLError);

    // Test no user context
    await expect(createCar(
      null, 
      { input: baseCarInput }, 
      { user: null }
    )).rejects.toThrow(GraphQLError);
  });

  it('should handle optional specs fields', async () => {
    const { createCar } = resolvers.AdminMutation;

    const carInputWithPartialSpecs = {
      ...baseCarInput,
      specs: {
        engine: {
          displacement: 2000,
          cylinders: 4
        },
        performance: {
          topSpeed: 180
        }
      }
    };

    (Car.create as jest.Mock).mockResolvedValue({
      ...baseCarInput,
      specs: {
        engine: {
          displacement: 2000,
          cylinders: 4,
          configuration: '',
          fuelInjection: '',
          turbocharger: false,
          supercharger: false,
          compression: '',
          valvesPerCylinder: 0
        },
        performance: {
          topSpeed: 180,
          powerToWeight: 0,
          acceleration060: 0,
          acceleration0100: 0,
          quarterMile: 0,
          brakingDistance60_0: 0
        }
      }
    });
    (Car.findById as jest.Mock).mockResolvedValue({
      ...baseCarInput,
      specs: {
        engine: {
          displacement: 2000,
          cylinders: 4,
          configuration: '',
          fuelInjection: '',
          turbocharger: false,
          supercharger: false,
          compression: '',
          valvesPerCylinder: 0
        },
        performance: {
          topSpeed: 180,
          powerToWeight: 0,
          acceleration060: 0,
          acceleration0100: 0,
          quarterMile: 0,
          brakingDistance60_0: 0
        }
      }
    });

    const result = await createCar(
      null, 
      { input: carInputWithPartialSpecs }, 
      mockContext
    );

    expect(result).toMatchObject({
      ...baseCarInput,
      specs: {
        engine: {
          displacement: 2000,
          cylinders: 4,
          configuration: '',
          fuelInjection: '',
          turbocharger: false,
          supercharger: false,
          compression: '',
          valvesPerCylinder: 0
        },
        performance: {
          topSpeed: 180,
          powerToWeight: 0,
          acceleration060: 0,
          acceleration0100: 0,
          quarterMile: 0,
          brakingDistance60_0: 0
        }
      }
    });
  });

  it('should handle invalid engine type', async () => {
    const { createCar } = resolvers.AdminMutation;

    const carInputWithInvalidEngineType = {
      ...baseCarInput,
      engineType: 'INVALID_ENGINE_TYPE'
    };

    await expect(createCar(
      null, 
      { input: carInputWithInvalidEngineType }, 
      mockContext
    )).rejects.toThrow(GraphQLError);
  });

  it('should handle invalid transmission type', async () => {
    const { createCar } = resolvers.AdminMutation;

    const carInputWithInvalidTransmissionType = {
      ...baseCarInput,
      transmission: 'INVALID_TRANSMISSION_TYPE'
    };

    await expect(createCar(
      null, 
      { input: carInputWithInvalidTransmissionType }, 
      mockContext
    )).rejects.toThrow(GraphQLError);
  });

  it('should handle invalid status', async () => {
    const { createCar } = resolvers.AdminMutation;

    const carInputWithInvalidStatus = {
      ...baseCarInput,
      status: 'INVALID_STATUS'
    };

    await expect(createCar(
      null, 
      { input: carInputWithInvalidStatus }, 
      mockContext
    )).rejects.toThrow(GraphQLError);
  });
});
