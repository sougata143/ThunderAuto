import { AdminService } from '../../services/admin.service'
import { IContext } from '../../types/context'
import { FileUpload } from '../../types/file'
import { GraphQLError } from 'graphql'
import mongoose from 'mongoose'
import { ICar } from '../../models/Car'
import { Car } from '../../models/Car'
import { IUser } from '../../models/User'
import { 
  uploadImageToS3, 
  deleteImageFromS3, 
  getImageCompressionOptions 
} from '../../config/cloudStorage';
import { logger, logMethodCall, logObject, logObjectWithContext } from '../../utils/logger';
import { 
  EngineType, 
  CarStatus, 
  TransmissionType, 
  ClutchType, 
  DriveType 
} from '../types/enums'

// Detailed Specs Interfaces
interface EngineSpecs {
  displacement?: number
  cylinders?: number
  configuration?: string
  fuelInjection?: string
  turbocharger?: boolean
  supercharger?: boolean
  horsepower?: number
  torque?: number
  compression?: string
  valvesPerCylinder?: number
  type?: string
  engineType?: EngineType
  powerOutput?: number
  compressionRatio?: number
  bore?: number
  stroke?: number
  weight?: number
  oilCapacity?: number
  coolingSystem?: string
}

interface PerformanceSpecs {
  powerToWeight?: number
  topSpeed?: number
  acceleration060?: number
  acceleration0100?: number
  quarterMile?: number
  brakingDistance60_0?: number
  brakingDistance?: number
  powerToWeightRatio?: number
  quarterMileSpeed?: number
  lateralG?: number
  nurburgringTime?: string
  passingAcceleration?: number
  elasticity?: number
  launchControl?: boolean
  performanceMode?: string[]
}

interface ChassisSpecs {
  bodyType?: string
  platform?: string
  frontSuspension?: string
  rearSuspension?: string
  frontBrakes?: string
  rearBrakes?: string
  wheelSize?: string
  tireSize?: string
}

interface DimensionsSpecs {
  length?: number
  width?: number
  height?: number
  wheelbase?: number
  groundClearance?: number
  dragCoefficient?: number
  weight?: number
  distribution?: string
}

interface TransmissionSpecs {
  type?: string
  gears?: number
  clutchType?: ClutchType
  driveType?: DriveType
  differential?: string
}

interface FuelSpecs {
  fuelType?: string
  fuelSystem?: string
  tankCapacity?: number
  cityMPG?: number
  highwayMPG?: number
  combinedMPG?: number
  emissionClass?: string
}

interface InteriorSpecs {
  seatingCapacity?: number
  doors?: number
  trunkCapacity?: number
  infotainmentScreen?: string
  soundSystem?: string
  climateZones?: number
  upholsteryMaterial?: string
}

interface SafetySpecs {
  airbags?: string
  abs?: boolean
  stabilityControl?: boolean
  tractionControl?: boolean
  parkingSensors?: boolean
  camera?: string
  blindSpotMonitoring?: boolean
  laneDepartureWarning?: boolean
  collisionWarning?: boolean
  nightVision?: boolean
}

interface TechnologySpecs {
  infotainmentSystem?: string
  screenSize?: number
  appleCarPlay?: boolean
  androidAuto?: boolean
  adaptiveCruiseControl?: boolean
  laneKeepAssist?: boolean
  blindSpotMonitoring?: boolean
  parkingAssist?: boolean
  nightVision?: boolean
  headUpDisplay?: boolean
  surroundViewCamera?: boolean
  bluetooth?: boolean
  wirelessCharging?: boolean
  wifi?: boolean
  soundSystem?: string
  speakers?: number
  digitalKey?: boolean
  mobileApp?: boolean
  overTheAirUpdates?: boolean
  voiceControl?: boolean
  voiceAssistantName?: string
  navigation?: string
  headlightType?: string
  driverAssistance?: string[]
}

interface WarrantySpecs {
  basic?: string
  powertrain?: string
  corrosion?: string
  roadside?: string
  maintenance?: string
}

interface FeaturesSpecs {
  safety?: string[]
  comfort?: string[]
  technology?: string[]
  exterior?: string[]
  interior?: string[]
}

// Comprehensive Car Input Interface
interface AdminCarInput {
  make: string
  carModel: string
  year: number
  price: number
  engineType: EngineType
  transmission: TransmissionType
  power: number
  acceleration: number
  status: CarStatus
  specs: {
    engine?: EngineSpecs
    performance?: PerformanceSpecs
    chassis?: ChassisSpecs
    dimensions?: DimensionsSpecs
    transmission?: TransmissionSpecs
    fuel?: FuelSpecs
    interior?: InteriorSpecs
    safety?: SafetySpecs
    technology?: TechnologySpecs
    warranty?: WarrantySpecs
    features?: FeaturesSpecs
  }
  images?: {
    url: string
    isFeatured?: boolean
    caption?: string
  }[]
  rating?: number
  createdBy?: mongoose.Types.ObjectId
  lastUpdatedBy?: mongoose.Types.ObjectId
}

interface AdminCarInputWithImages {
  make: string
  carModel: string
  year: number
  price: number
  images?: {
    url: string;
    isFeatured: boolean;
    uploadedBy: mongoose.Types.ObjectId;
    uploadedAt: Date;
    caption?: string; // Add optional caption
  }[]
  engineType: EngineType
  transmission: TransmissionType
  power: number
  acceleration: number
  status: CarStatus
  rating?: number
  createdBy?: mongoose.Types.ObjectId
  lastUpdatedBy?: mongoose.Types.ObjectId
  specs: {
    engine: {
      displacement: number
      cylinders: number
      configuration: string
      fuelInjection: string
      turbocharger: boolean
      supercharger: boolean
      compression: string
      valvesPerCylinder: number
      type?: string
      engineType?: EngineType
      powerOutput?: number
      horsepower?: number
      torque?: number
      compressionRatio?: number
      bore?: number
      stroke?: number
      weight?: number
      oilCapacity?: number
      coolingSystem?: string
    }
    performance?: {
      powerToWeight?: number
      topSpeed?: number
      acceleration060?: number
      acceleration0100?: number
      quarterMile?: number
      brakingDistance60_0?: number
      brakingDistance?: number
      powerToWeightRatio?: number
      quarterMileSpeed?: number
      lateralG?: number
      nurburgringTime?: string
      passingAcceleration?: number
      elasticity?: number
      launchControl?: boolean
      performanceMode?: string[]
    }
    chassis?: {
      bodyType?: string
      platform?: string
      frontSuspension?: string
      rearSuspension?: string
      frontBrakes?: string
      rearBrakes?: string
      wheelSize?: string
      tireSize?: string
    }
    dimensions?: {
      length?: number
      width?: number
      height?: number
      wheelbase?: number
      groundClearance?: number
      dragCoefficient?: number
      weight?: number
      distribution?: string
    }
    transmission?: {
      type?: string
      gears?: number
      clutchType?: ClutchType
      driveType?: DriveType
      differential?: string
    }
    fuel?: {
      fuelType?: string
      fuelSystem?: string
      tankCapacity?: number
      cityMPG?: number
      highwayMPG?: number
      combinedMPG?: number
      emissionClass?: string
    }
    interior?: {
      seatingCapacity?: number
      doors?: number
      trunkCapacity?: number
      infotainmentScreen?: string
      soundSystem?: string
      climateZones?: number
      upholsteryMaterial?: string
    }
    safety?: {
      airbags?: string
      abs?: boolean
      stabilityControl?: boolean
      tractionControl?: boolean
      parkingSensors?: boolean
      camera?: string
      blindSpotMonitoring?: boolean
      laneDepartureWarning?: boolean
      collisionWarning?: boolean
      nightVision?: boolean
    }
    technology?: {
      infotainmentSystem?: string
      screenSize?: number
      appleCarPlay?: boolean
      androidAuto?: boolean
      adaptiveCruiseControl?: boolean
      laneKeepAssist?: boolean
      blindSpotMonitoring?: boolean
      parkingAssist?: boolean
      nightVision?: boolean
      headUpDisplay?: boolean
      surroundViewCamera?: boolean
      bluetooth?: boolean
      wirelessCharging?: boolean
      wifi?: boolean
      soundSystem?: string
      speakers?: number
      digitalKey?: boolean
      mobileApp?: boolean
      overTheAirUpdates?: boolean
      voiceControl?: boolean
      voiceAssistantName?: string
      navigation?: string
      headlightType?: string
      driverAssistance?: string[]
    }
    warranty?: {
      basic?: string
      powertrain?: string
      corrosion?: string
      roadside?: string
      maintenance?: string
    }
    features?: {
      safety?: string[]
      comfort?: string[]
      technology?: string[]
      exterior?: string[]
      interior?: string[]
    }
  }
}

// Add utility functions for image validation and processing
const isValidBase64Image = (base64String: string): boolean => {
  const base64ImageRegex = /^data:image\/(png|jpeg|jpg|gif|webp);base64,/;
  return base64ImageRegex.test(base64String);
}

const processBase64Image = async (
  imageInput: string | { url: string }, 
  carId: string, 
  userId: mongoose.Types.ObjectId
): Promise<string> => {
  // Extract the actual image string
  const base64String = typeof imageInput === 'string' 
    ? imageInput 
    : imageInput.url;

  // Validate base64 image
  if (!isValidBase64Image(base64String)) {
    // If it's not a base64 string, assume it's an existing URL
    if (base64String.startsWith('http') || base64String.startsWith('/')) {
      return base64String;
    }
    throw new GraphQLError('Invalid image format', {
      extensions: { code: 'BAD_USER_INPUT' }
    });
  }

  // Rest of the existing image processing logic remains the same
  const fileExtension = base64String.split(';')[0].split('/')[1];
  const fileName = `car-${carId}-${Date.now()}.${fileExtension}`;
  const bucket = process.env.AWS_S3_BUCKET_NAME;

  if (!bucket) {
    throw new GraphQLError('S3 Bucket not configured', {
      extensions: { code: 'INTERNAL_SERVER_ERROR' }
    });
  }

  const uploadParams = {
    Bucket: bucket,
    Key: fileName,
    Body: Buffer.from(base64String.split(',')[1], 'base64'),
    ContentEncoding: 'base64',
    ContentType: `image/${fileExtension}`
  };

  try {
    const uploadResult = await uploadImageToS3(
      base64String, 
      `cars/${carId}`, 
      getImageCompressionOptions(uploadParams.Body.byteLength)
    );
    return uploadResult;
  } catch (error) {
    console.log('Image upload error:', error);
    throw new GraphQLError(
      error instanceof Error ? error.message : 'Failed to process image', 
      {
        extensions: { 
          code: 'INTERNAL_SERVER_ERROR',
          originalError: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    );
  }
};

const cleanupOldImages = async (car: ICar, newImages: { url: string, isFeatured: boolean }[]) => {
  if (car.images && car.images.length > 0) {
    const oldImageUrls = car.images.map(img => img.url);
    const newImageUrls = newImages.map(img => img.url);
    
    // Find images to delete (those in old list but not in new list)
    const imagesToDelete = oldImageUrls.filter(
      oldUrl => !newImageUrls.includes(oldUrl)
    );

    // Delete images from S3
    await Promise.all(
      imagesToDelete.map(imageUrl => deleteImageFromS3(imageUrl))
    );
  }
}

export const adminResolvers = {
  Query: {
    admin: () => ({})
  },

  AdminQuery: {
    adminCars: async (_parent: unknown, _args: unknown, context: IContext): Promise<ICar[]> => {
      if (!context.user || context.user.role !== 'ADMIN') {
        throw new GraphQLError('Unauthorized: Admin access required', {
          extensions: { code: 'UNAUTHORIZED' }
        });
      }
      return Car.find()
    }
  },

  Mutation: {
    admin: () => ({})
  },

  AdminMutation: {
    createCar: async (
      _parent: unknown, 
      { input }: { input: AdminCarInput }, 
      context: IContext
    ): Promise<ICar | null> => {
      // ULTRA COMPREHENSIVE DEBUGGING
      console.log('🚨 DEBUG: createCar FULL CONTEXT', JSON.stringify({
        input,
        contextUser: context.user,
        requestHeaders: context.req.headers
      }, null, 2));

      // Validate context and user with EXTREME DETAIL
      if (!context.user) {
        const errorDetails = {
          message: 'No authenticated user found',
          context: JSON.stringify(context, null, 2),
          input: JSON.stringify(input, null, 2)
        };

        console.error('❌ AUTHENTICATION FAILURE', errorDetails);
        logger.error('CreateCar: Authentication Failure', errorDetails);
        
        throw new GraphQLError('Authentication required', {
          extensions: { 
            code: 'UNAUTHENTICATED',
            details: errorDetails
          }
        });
      }

      // Check user role with EXPLICIT authorization
      if (context.user.role !== 'ADMIN') {
        const errorDetails = {
          message: 'Non-admin user attempted to create car',
          userRole: context.user.role,
          userId: context.user._id
        };

        console.error('❌ UNAUTHORIZED ACCESS', errorDetails);
        logger.error('CreateCar: Unauthorized Access', errorDetails);
        
        throw new GraphQLError('Unauthorized: Admin access required', {
          extensions: { 
            code: 'UNAUTHORIZED',
            details: errorDetails
          }
        });
      }

      // Comprehensive input validation with EXTREME LOGGING
      if (!input) {
        const errorDetails = {
          message: 'No input provided',
          user: context.user?._id,
          context: JSON.stringify(context, null, 2)
        };

        console.error('❌ NO INPUT PROVIDED', errorDetails);
        logger.error('CreateCar: No input provided', errorDetails);
        
        throw new GraphQLError('Car input is required', {
          extensions: { 
            code: 'BAD_USER_INPUT',
            details: errorDetails
          }
        });
      }

      // ULTRA DETAILED FIELD VALIDATION
      const requiredFields: (keyof AdminCarInput)[] = [
        'make', 'carModel', 'year', 'price', 
        'engineType', 'transmission', 'power', 
        'acceleration', 'status', 'specs'
      ];

      const missingFields = requiredFields.filter(field => {
        const value = input[field];
        return value === undefined || value === null || 
               (typeof value === 'string' && value.trim() === '') ||
               (Array.isArray(value) && value.length === 0);
      });

      if (missingFields.length > 0) {
        const errorDetails = {
          missingFields,
          providedInput: JSON.stringify(input, null, 2),
          userId: context.user?._id
        };

        console.error('❌ MISSING REQUIRED FIELDS', errorDetails);
        logger.error('CreateCar: Missing required fields', errorDetails);
        
        throw new GraphQLError(`Missing required fields: ${missingFields.join(', ')}`, {
          extensions: { 
            code: 'BAD_USER_INPUT',
            missingFields,
            details: errorDetails
          }
        });
      }

      // ENUM VALIDATION WITH EXTREME DETAIL
      const validationChecks = [
        {
          field: 'engineType',
          value: input.engineType,
          validValues: Object.values(EngineType)
        },
        {
          field: 'transmission',
          value: input.transmission,
          validValues: Object.values(TransmissionType)
        },
        {
          field: 'status',
          value: input.status,
          validValues: Object.values(CarStatus)
        }
      ];

      for (const check of validationChecks) {
        // Explicitly check against the enum values
        const isValidEnumValue = check.validValues.some(
          validValue => validValue === check.value
        );

        if (!isValidEnumValue) {
          const errorDetails = {
            message: `Invalid ${check.field}`,
            providedValue: check.value,
            validValues: check.validValues,
            fullInput: JSON.stringify(input, null, 2)
          };

          console.error(`❌ INVALID ${check.field.toUpperCase()}`, errorDetails);
          logger.error(`CreateCar: Invalid ${check.field}`, errorDetails);
          
          throw new GraphQLError(`Invalid ${check.field}. Must be one of: ${check.validValues.join(', ')}`, {
            extensions: { 
              code: 'BAD_USER_INPUT',
              details: errorDetails
            }
          });
        }
      }

      // COMPREHENSIVE SPECS VALIDATION
      if (!input.specs || typeof input.specs !== 'object') {
        const errorDetails = {
          message: 'Invalid or missing specs',
          providedSpecs: JSON.stringify(input.specs, null, 2),
          fullInput: JSON.stringify(input, null, 2)
        };

        console.error('❌ INVALID SPECS', errorDetails);
        logger.error('CreateCar: Invalid specs', errorDetails);
        
        throw new GraphQLError('Invalid or missing car specifications', {
          extensions: { 
            code: 'BAD_USER_INPUT',
            details: errorDetails
          }
        });
      }

      // Log successful validation
      console.log('✅ VALIDATION PASSED: Creating Car', {
        make: input.make,
        model: input.carModel,
        year: input.year
      });

      try {
        // Validate required fields
        if (!input.make || !input.carModel) {
          logger.error('CreateCar: Missing required fields', { 
            input, 
            userId: context.user._id 
          })
          throw new GraphQLError('Make and Car Model are required', {
            extensions: { code: 'BAD_USER_INPUT' }
          })
        }

        // Prepare car creation payload with STRICT defaults and transformations
        const carCreatePayload: Partial<ICar> = {
          ...input,
          make: input.make.trim(),
          carModel: input.carModel.trim(),
          year: input.year || new Date().getFullYear(),
          price: input.price ?? 0,
          engineType: input.engineType ?? EngineType.GASOLINE,
          transmission: input.transmission?.trim() || TransmissionType.AUTOMATIC,
          power: input.power ?? 0,
          acceleration: input.acceleration ?? 0,
          status: input.status ?? CarStatus.DRAFT,
          rating: input.rating ?? 0,
          createdBy: context.user?._id ?? new mongoose.Types.ObjectId(),
          lastUpdatedBy: context.user?._id ?? new mongoose.Types.ObjectId(),
          
          // Handle images with additional validation
          images: input.images?.length 
            ? input.images.map(img => ({
                url: img.url,
                isFeatured: img.isFeatured ?? false,
                uploadedBy: context.user?._id ?? new mongoose.Types.ObjectId(),
                uploadedAt: new Date(),
                caption: img.caption
              }))
            : []
        }

        // Perform actual car creation
        const savedCar = await Car.create(carCreatePayload)

        return savedCar
      } catch (error) {
        // ULTRA COMPREHENSIVE ERROR HANDLING
        const errorDetails = {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : 'No stack trace',
          input: JSON.stringify(input, null, 2),
          userId: context.user._id
        };

        // Log specific error types
        if (error instanceof mongoose.Error.ValidationError) {
          console.error('❌ MONGOOSE VALIDATION ERROR', errorDetails);
          logger.error('CreateCar: Mongoose Validation Error', errorDetails);
          
          throw new GraphQLError('Invalid car data', {
            extensions: { 
              code: 'BAD_USER_INPUT',
              details: errorDetails
            }
          });
        }

        if (error instanceof mongoose.Error.DocumentNotFoundError) {
          console.error('❌ DOCUMENT NOT FOUND ERROR', errorDetails);
          logger.error('CreateCar: Document Not Found', errorDetails);
          
          throw new GraphQLError('Car could not be created', {
            extensions: { 
              code: 'NOT_FOUND',
              details: errorDetails
            }
          });
        }

        // Generic error handling
        console.error('❌ UNEXPECTED ERROR IN CAR CREATION', errorDetails);
        logger.error('CreateCar: Unexpected Error', errorDetails);
        
        throw new GraphQLError('Failed to create car', {
          extensions: { 
            code: 'INTERNAL_SERVER_ERROR',
            details: errorDetails
          }
        });
      }
    },

    updateCar: async (
      _parent: unknown, 
      { id, input }: { id: string, input: Partial<AdminCarInput> }, 
      context: IContext
    ): Promise<ICar | null> => {
      if (!context.user) {
        throw new GraphQLError('User not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      try {
        const updatedCar = await Car.findByIdAndUpdate(
          id, 
          { 
            ...input,
            lastUpdatedBy: context.user._id 
          }, 
          { new: true }
        );

        // Check if updatedCar is null and throw an error
        if (!updatedCar) {
          throw new GraphQLError(`Car with ID ${id} not found`, {
            extensions: {
              code: 'NOT_FOUND',
              http: { status: 404 }
            }
          });
        }

        // Transform _id to id for GraphQL
        const transformedCar = updatedCar.toObject();

        return transformedCar;
      } catch (error) {
        console.log('Error updating car:', error);
        throw error; // Re-throw the error to be handled by GraphQL
      }
    },

    deleteCar: async (
      _parent: unknown, 
      { id }: { id: string }, 
      context: IContext
    ): Promise<ICar | null> => {
      if (!context.user) {
        throw new GraphQLError('User not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      try {
        const deletedCar = await Car.findByIdAndDelete(id);

        // Check if deletedCar is null before transforming
        if (!deletedCar) {
          throw new GraphQLError('Car not found', {
            extensions: {
              code: 'NOT_FOUND',
              http: { status: 404 }
            }
          });
        }

        // Transform _id to id for GraphQL
        const transformedCar = deletedCar.toObject();

        return transformedCar;
      } catch (error) {
        console.log('Error deleting car:', error);
        return null;
      }
    },

    uploadCarImage: async (
      _parent: unknown,
      { carId, image, caption, isFeatured }: { 
        carId: string, 
        image: string | { url: string },  
        caption?: string, 
        isFeatured: boolean 
      },
      context: IContext
    ): Promise<ICar> => {
      if (!context.user || context.user.role !== 'ADMIN') {
        throw new GraphQLError('Unauthorized: Admin access required', {
          extensions: { code: 'UNAUTHORIZED' }
        });
      }
    
      // Process and upload image
      const imageUrl = await processBase64Image(
        image, 
        carId, 
        context.user?._id as mongoose.Types.ObjectId
      );
    
      const car = await Car.findByIdAndUpdate(
        carId,
        {
          $push: {
            images: {
              url: imageUrl,
              isFeatured,
              caption: caption || '',
              uploadedBy: context.user?._id as mongoose.Types.ObjectId,
              uploadedAt: new Date()
            }
          }
        },
        { new: true }
      );
    
      if (!car) {
        // If image was uploaded, but car not found, delete the image
        await deleteImageFromS3(imageUrl);
        throw new GraphQLError('Car not found', {
          extensions: { code: 'NOT_FOUND' }
        });
      }
    
      // Transform _id to id for GraphQL
      const transformedCar = car.toObject();

      return transformedCar;
    },

    deleteCarImage: async (_parent: unknown, { carId, imageUrl }: { carId: string, imageUrl: string }, context: IContext): Promise<ICar> => {
      if (!context.user || context.user.role !== 'ADMIN') {
        throw new Error('Unauthorized: Admin access required')
      }

      // First, delete image from S3
      await deleteImageFromS3(imageUrl);

      const car = await Car.findByIdAndUpdate(
        carId,
        {
          $pull: { images: { url: imageUrl } },
          lastUpdatedBy: context.user?.['_id'] ? new mongoose.Types.ObjectId(context.user['_id'].toString()) : undefined
        },
        { new: true }
      )

      if (!car) {
        throw new Error('Car not found')
      }

      // Transform _id to id for GraphQL
      const transformedCar = car.toObject();

      return transformedCar
    },

    updateCarStatus: async (_parent: unknown, { carId, status }: { carId: string, status: CarStatus }, context: IContext): Promise<ICar> => {
      if (!context.user || context.user.role !== 'ADMIN') {
        throw new GraphQLError('Unauthorized: Admin access required', {
          extensions: {
            code: 'UNAUTHORIZED',
            details: {
              user: context.user?.email,
              role: context.user?.role
            }
          }
        });
      }

      try {
        const updatedCar = await Car.findByIdAndUpdate(
          carId, 
          { 
            status, 
            lastUpdatedBy: context.user._id 
          }, 
          { 
            new: true,  // Return the updated document
            runValidators: true  // Run Mongoose validation
          }
        );

        if (!updatedCar) {
          throw new GraphQLError('Car not found', {
            extensions: {
              code: 'NOT_FOUND',
              details: { carId }
            }
          });
        }

        // Log the status update
        logger.info('Car Status Updated', {
          carId,
          newStatus: status,
          updatedBy: context.user._id
        });

        return updatedCar;
      } catch (error) {
        // Comprehensive error handling
        const errorDetails = {
          message: error instanceof Error ? error.message : 'Unknown error',
          name: error instanceof Error ? error.name : 'UnknownError',
          stack: error instanceof Error ? error.stack : 'No stack trace',
          carId,
          status,
          userId: context.user?._id
        };

        console.error('❌ CAR STATUS UPDATE FAILED', errorDetails);
        logger.error('UpdateCarStatus: Unexpected Error', errorDetails);

        throw new GraphQLError('Failed to update car status', {
          extensions: { 
            code: 'INTERNAL_SERVER_ERROR',
            details: errorDetails
          }
        });
      }
    },
  }
}

function isMongooseConnectionError(error: unknown): error is mongoose.Error {
  return error instanceof mongoose.Error;
}
