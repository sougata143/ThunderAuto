import mongoose from 'mongoose'
import { Car } from '../../../models/Car'
import { User } from '../../../models/User'
import { adminResolvers } from '../admin.resolver'
import { EngineType, CarStatus, TransmissionType } from '../../types/enums'
import { IContext } from '../../../types/context'
import { Request } from 'express'
import { IUser } from '../../../models/User'

// Mock Car model completely
jest.mock('../../../models/Car', () => ({
  create: jest.fn(),
  findOne: jest.fn(),
  findById: jest.fn(),
  __esModule: true,
  Car: {
    create: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn()
  }
}))

// Mock logger to prevent console output during tests
jest.mock('../../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn()
  }
}))

describe('Admin Resolver - createCar', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const createMockRequest = (): Request => {
    return {
      get: jest.fn(),
      header: jest.fn(),
      accepts: jest.fn(),
      acceptsCharsets: jest.fn(),
      headers: {},
    } as unknown as Request
  }

  const createMockContext = (userRole: string, isAuthenticated: boolean): IContext => {
    const user = isAuthenticated ? { 
      _id: new mongoose.Types.ObjectId(),
      email: 'admin@thunderauto.com',
      password: 'hashedPassword123',
      firstName: 'Admin',
      lastName: 'User',
      role: userRole,
      preferences: {
        theme: 'light',
        notifications: true,
        language: 'en'
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      comparePassword: jest.fn().mockResolvedValue(true),
      $assertPopulated: jest.fn(),
      $clearModifiedPaths: jest.fn(),
      $clone: jest.fn(),
      $createModifiedPathsSnapshot: jest.fn(),
    } : null
    return {
      user: user as unknown as IUser,
      req: createMockRequest()
    }
  }

  const baseValidInput = {
    make: 'Tesla',
    carModel: 'Model S',
    year: 2023,
    price: 79990,
    engineType: EngineType.ELECTRIC,
    transmission: TransmissionType.AUTOMATIC,
    status: CarStatus.DRAFT,
    power: 670,
    acceleration: 2.3,
    specs: {
      engine: {},
      performance: {},
      chassis: {},
      dimensions: {},
      transmission: {},
      fuel: {},
      interior: {},
      safety: {},
      technology: {},
      warranty: {},
      features: {}
    }
  }

  const mockSavedCar = {
    _id: new mongoose.Types.ObjectId(),
    ...baseValidInput,
    toObject: jest.fn().mockReturnValue(baseValidInput)
  }

  describe('createCar', () => {
    it('should create a car successfully', async () => {
      const validInput = { ...baseValidInput }

      // Explicitly mock Car.create
      jest.spyOn(Car, 'create').mockResolvedValue(mockSavedCar as any)

      const result = await adminResolvers.AdminMutation.createCar(
        null, 
        { input: validInput }, 
        createMockContext('ADMIN', true)
      )

      expect(result).toEqual(mockSavedCar)
      expect(Car.create).toHaveBeenCalledWith(expect.objectContaining({
        ...validInput,
        createdBy: expect.any(mongoose.Types.ObjectId)
      }))
    })

    describe('Authentication', () => {
      it('should reject unauthenticated user', async () => {
        await expect(
          adminResolvers.AdminMutation.createCar(
            null, 
            { input: baseValidInput }, 
            createMockContext('ADMIN', false)
          )
        ).rejects.toThrow('Authentication required')
      })

      it('should reject non-admin user', async () => {
        await expect(
          adminResolvers.AdminMutation.createCar(
            null, 
            { input: baseValidInput }, 
            createMockContext('USER', true)
          )
        ).rejects.toThrow('Unauthorized')
      })

      it('should allow admin user to create car', async () => {
        // Explicitly mock Car.create
        jest.spyOn(Car, 'create').mockResolvedValue(mockSavedCar as any)

        const result = await adminResolvers.AdminMutation.createCar(
          null, 
          { input: baseValidInput }, 
          createMockContext('ADMIN', true)
        )

        expect(result).toBeDefined()
        expect(Car.create).toHaveBeenCalled()
      })

      it('should set createdBy for admin user', async () => {
        const adminContext = createMockContext('ADMIN', true)
        const adminUser = adminContext.user!

        // Explicitly mock Car.create
        jest.spyOn(Car, 'create').mockResolvedValue(mockSavedCar as any)

        await adminResolvers.AdminMutation.createCar(
          null, 
          { input: baseValidInput }, 
          adminContext
        )

        expect(Car.create).toHaveBeenCalledWith(
          expect.objectContaining({
            createdBy: adminUser._id
          })
        )
      })
    })
  })
})
