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

interface AdminCarInput {
  make: string
  carModel: string
  year: number
  price: number
  images?: {
    url: string;
    isFeatured: boolean;
    uploadedBy: mongoose.Types.ObjectId;
    uploadedAt: Date;
  }[]
  engineType: 'GASOLINE' | 'DIESEL' | 'ELECTRIC' | 'HYBRID' | 'HYDROGEN' | 'PLUG_IN_HYBRID'
  transmission: string
  power: number
  acceleration: number
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  createdBy?: mongoose.Types.ObjectId | IUser
  lastUpdatedBy?: mongoose.Types.ObjectId | IUser
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
      engineType?: 'GASOLINE' | 'DIESEL' | 'ELECTRIC' | 'HYBRID' | 'HYDROGEN' | 'PLUG_IN_HYBRID'
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
      clutchType?: 'MANUAL' | 'AUTOMATIC' | 'SINGLE_CLUTCH' | ''
      driveType?: 'FRONT_WHEEL_DRIVE' | 'REAR_WHEEL_DRIVE' | 'ALL_WHEEL_DRIVE' | ''
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

type ClutchType = 'MANUAL' | 'AUTOMATIC' | 'SINGLE_CLUTCH' | undefined;
type DriveType = 'FRONT_WHEEL_DRIVE' | 'REAR_WHEEL_DRIVE' | 'ALL_WHEEL_DRIVE' | undefined;

const convertToEngineType = (engineType?: string): 'GASOLINE' | 'DIESEL' | 'ELECTRIC' | 'HYBRID' | 'HYDROGEN' | 'PLUG_IN_HYBRID' | undefined => {
  if (!engineType) return undefined;
  
  const validEngineTypes = [
    'GASOLINE', 
    'DIESEL', 
    'ELECTRIC', 
    'HYBRID', 
    'HYDROGEN', 
    'PLUG_IN_HYBRID'
  ] as const;

  const upperCaseEngineType = engineType.toUpperCase();
  
  const matchedType = validEngineTypes.find(type => type === upperCaseEngineType);
  
  return matchedType ?? undefined;
};

const convertToClutchType = (clutchType?: string): ClutchType => {
  if (!clutchType) return undefined;
  
  const validClutchTypes = [
    'MANUAL', 
    'AUTOMATIC', 
    'SINGLE_CLUTCH'
  ] as const;

  const upperCaseClutchType = clutchType.toUpperCase();
  
  const matchedType = validClutchTypes.find(type => type === upperCaseClutchType);
  
  return matchedType ?? undefined;
};

const convertToDriveType = (driveType?: string): 'FRONT_WHEEL_DRIVE' | 'REAR_WHEEL_DRIVE' | 'ALL_WHEEL_DRIVE' | undefined => {
  if (!driveType) return undefined;
  
  const validDriveTypes = [
    'FRONT_WHEEL_DRIVE', 
    'REAR_WHEEL_DRIVE', 
    'ALL_WHEEL_DRIVE'
  ] as const;

  const upperCaseDriveType = driveType.toUpperCase();
  
  return validDriveTypes.find(type => type === upperCaseDriveType);
};

// Add utility functions for image validation and processing
const isValidBase64Image = (base64String: string): boolean => {
  const base64ImageRegex = /^data:image\/(png|jpeg|jpg|gif|webp);base64,/;
  return base64ImageRegex.test(base64String);
}

const processBase64Image = async (
  base64String: string, 
  carId: string, 
  userId: mongoose.Types.ObjectId
): Promise<string> => {
  if (!isValidBase64Image(base64String)) {
    throw new GraphQLError('Invalid base64 image format', {
      extensions: { code: 'BAD_USER_INPUT' }
    });
  }

  try {
    const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    const compressionOptions = getImageCompressionOptions(buffer.byteLength);

    const imageUrl = await uploadImageToS3(
      base64String, 
      `cars/${carId}`, 
      compressionOptions
    );

    return imageUrl;
  } catch (error) {
    console.error('Image upload error:', error);
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
    createCar: async (_parent: unknown, { input }: { input: AdminCarInput }, context: IContext): Promise<ICar> => {
      // Validate admin access
      if (!context.user || context.user.role !== 'ADMIN') {
        throw new GraphQLError('Unauthorized: Admin access required', {
          extensions: { code: 'UNAUTHORIZED' }
        });
      }

      // Sanitize and validate input
      const sanitizedInput: AdminCarInput = {
        make: input.make || '',
        carModel: input.carModel || '',
        year: input.year || new Date().getFullYear(),
        price: input.price || 0,
        engineType: convertToEngineType(input.engineType) ?? 'GASOLINE',
        transmission: input.transmission || '',
        power: input.power ?? 0,
        acceleration: input.acceleration ?? 0,
        status: input.status || 'DRAFT',
        createdBy: context.user?._id instanceof mongoose.Types.ObjectId ? context.user._id : undefined,
        lastUpdatedBy: context.user?._id instanceof mongoose.Types.ObjectId ? context.user._id : undefined,
        specs: {
          engine: {
            displacement: input.specs?.engine?.displacement ?? 0,
            cylinders: input.specs?.engine?.cylinders ?? 0,
            configuration: input.specs?.engine?.configuration || '',
            fuelInjection: input.specs?.engine?.fuelInjection || '',
            turbocharger: input.specs?.engine?.turbocharger ?? false,
            supercharger: input.specs?.engine?.supercharger ?? false,
            compression: input.specs?.engine?.compression || '',
            valvesPerCylinder: input.specs?.engine?.valvesPerCylinder ?? 0,
            type: input.specs?.engine?.type || '',
            engineType: convertToEngineType(input.specs?.engine?.engineType) ?? 'GASOLINE',
            powerOutput: input.specs?.engine?.powerOutput ?? 0,
            horsepower: input.specs?.engine?.horsepower ?? 0,
            torque: input.specs?.engine?.torque ?? 0,
            compressionRatio: input.specs?.engine?.compressionRatio ?? 0,
            bore: input.specs?.engine?.bore ?? 0,
            stroke: input.specs?.engine?.stroke ?? 0,
            weight: input.specs?.engine?.weight ?? 0,
            oilCapacity: input.specs?.engine?.oilCapacity ?? 0,
            coolingSystem: input.specs?.engine?.coolingSystem || ''
          },
          transmission: {
            type: input.specs?.transmission?.type || '',
            gears: input.specs?.transmission?.gears ?? 0,
            clutchType: convertToClutchType(input.specs?.transmission?.clutchType),
            driveType: convertToDriveType(input.specs?.transmission?.driveType),
            differential: input.specs?.transmission?.differential || ''
          },
          interior: {
            seatingCapacity: input.specs?.interior?.seatingCapacity ?? 0,
            doors: input.specs?.interior?.doors ?? 0,
            climateZones: input.specs?.interior?.climateZones ?? 0
          }
        }
      };

      try {
        const newCar = new Car(sanitizedInput);
        await newCar.save();
        return newCar;
      } catch (error) {
        console.error('Error creating car:', error);
        throw new GraphQLError('Failed to create car', {
          extensions: { 
            code: 'INTERNAL_SERVER_ERROR',
            originalError: error instanceof Error ? error.message : 'Unknown error'
          }
        });
      }
    },

    updateCar: async (
      _parent: unknown, 
      { id, input }: { id: string, input: Partial<AdminCarInput> }, 
      context: IContext
    ): Promise<ICar> => {
      // Validate admin access
      if (!context.user || context.user.role !== 'ADMIN') {
        throw new GraphQLError('Unauthorized: Admin access required', {
          extensions: { code: 'UNAUTHORIZED' }
        });
      }

      // Find the existing car
      const existingCar = await Car.findById(id);
      if (!existingCar) {
        throw new GraphQLError('Car not found', {
          extensions: { code: 'NOT_FOUND' }
        });
      }

      // Process images if provided
      let processedImages: {
        url: string;
        isFeatured: boolean;
        uploadedBy: mongoose.Types.ObjectId;
        uploadedAt: Date;
      }[] = [];
      
      if (input.images && input.images.length > 0) {
        processedImages = await Promise.all(
          input.images.map(async (imageData, index) => {
            const imageUrl = await processBase64Image(
              imageData.url, // Pass the correct base64 string
              id, 
              context.user?._id as mongoose.Types.ObjectId
            );
            
            return {
              url: imageUrl,
              isFeatured: index === 0,
              uploadedBy: context.user?._id as mongoose.Types.ObjectId,
              uploadedAt: new Date()
            };
          })
        );
      }
      
      const sanitizedInput: Partial<AdminCarInput> = {
        make: input.make || existingCar.make || '',
        carModel: input.carModel || existingCar.carModel || '',
        year: input.year || existingCar.year || new Date().getFullYear(),
        price: input.price ?? existingCar.price ?? 0,
        engineType: convertToEngineType(input.engineType) ?? existingCar.engineType ?? 'GASOLINE',
        transmission: input.transmission || existingCar.transmission || '',
        power: input.power ?? existingCar.power ?? 0,
        acceleration: input.acceleration ?? existingCar.acceleration ?? 0,
        status: input.status || existingCar.status || 'DRAFT',
        lastUpdatedBy: context.user?._id instanceof mongoose.Types.ObjectId ? context.user._id : undefined,
        specs: {
          engine: {
            displacement: input.specs?.engine?.displacement ?? existingCar.specs?.engine?.displacement ?? 0,
            cylinders: input.specs?.engine?.cylinders ?? existingCar.specs?.engine?.cylinders ?? 0,
            configuration: input.specs?.engine?.configuration || existingCar.specs?.engine?.configuration || '',
            fuelInjection: input.specs?.engine?.fuelInjection || existingCar.specs?.engine?.fuelInjection || '',
            turbocharger: input.specs?.engine?.turbocharger ?? existingCar.specs?.engine?.turbocharger ?? false,
            supercharger: input.specs?.engine?.supercharger ?? existingCar.specs?.engine?.supercharger ?? false,
            compression: input.specs?.engine?.compression || existingCar.specs?.engine?.compression || '',
            valvesPerCylinder: input.specs?.engine?.valvesPerCylinder ?? existingCar.specs?.engine?.valvesPerCylinder ?? 0,
            type: input.specs?.engine?.type || existingCar.specs?.engine?.type || '',
            engineType: convertToEngineType(input.specs?.engine?.engineType) ?? 
              convertToEngineType(existingCar.specs?.engine?.engineType) ?? 'GASOLINE',
            powerOutput: input.specs?.engine?.powerOutput ?? existingCar.specs?.engine?.powerOutput ?? 0,
            horsepower: input.specs?.engine?.horsepower ?? existingCar.specs?.engine?.horsepower ?? 0,
            torque: input.specs?.engine?.torque ?? existingCar.specs?.engine?.torque ?? 0,
            compressionRatio: input.specs?.engine?.compressionRatio ?? existingCar.specs?.engine?.compressionRatio ?? 0,
            bore: input.specs?.engine?.bore ?? existingCar.specs?.engine?.bore ?? 0,
            stroke: input.specs?.engine?.stroke ?? existingCar.specs?.engine?.stroke ?? 0,
            weight: input.specs?.engine?.weight ?? existingCar.specs?.engine?.weight ?? 0,
            oilCapacity: input.specs?.engine?.oilCapacity ?? existingCar.specs?.engine?.oilCapacity ?? 0,
            coolingSystem: input.specs?.engine?.coolingSystem || existingCar.specs?.engine?.coolingSystem || ''
          },
          transmission: {
            type: input.specs?.transmission?.type || existingCar.specs?.transmission?.type || '',
            gears: input.specs?.transmission?.gears ?? existingCar.specs?.transmission?.gears ?? 0,
            clutchType: convertToClutchType(input.specs?.transmission?.clutchType) ?? 
              convertToClutchType(existingCar.specs?.transmission?.clutchType),
            driveType: convertToDriveType(input.specs?.transmission?.driveType) ?? 
              (existingCar.specs?.transmission?.driveType === 'FRONT_WHEEL_DRIVE' || 
               existingCar.specs?.transmission?.driveType === 'REAR_WHEEL_DRIVE' || 
               existingCar.specs?.transmission?.driveType === 'ALL_WHEEL_DRIVE' 
                ? existingCar.specs?.transmission?.driveType 
                : undefined),
            differential: input.specs?.transmission?.differential || existingCar.specs?.transmission?.differential || ''
          },
          interior: {
            seatingCapacity: input.specs?.interior?.seatingCapacity ?? existingCar.specs?.interior?.seatingCapacity ?? 0,
            doors: input.specs?.interior?.doors ?? existingCar.specs?.interior?.doors ?? 0,
            climateZones: input.specs?.interior?.climateZones ?? existingCar.specs?.interior?.climateZones ?? 0
          }
        },
        ...(processedImages.length > 0 && { images: processedImages })
      };

      try {
        // Update the car
        const updatedCar = await Car.findByIdAndUpdate(
          id, 
          sanitizedInput, 
          { new: true, runValidators: true }
        );

        if (!updatedCar) {
          throw new GraphQLError('Failed to update car', {
            extensions: { code: 'INTERNAL_SERVER_ERROR' }
          });
        }

        return updatedCar;
      } catch (error) {
        console.error('Error updating car:', error);
        throw new GraphQLError('Failed to update car', {
          extensions: { 
            code: 'INTERNAL_SERVER_ERROR',
            originalError: error instanceof Error ? error.message : 'Unknown error'
          }
        });
      }
    },

    uploadCarImage: async (
      _parent: unknown,
      { carId, image, caption, isFeatured }: { 
        carId: string, 
        image: string,  
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
              caption,
              uploadedBy: context.user?._id,
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
    
      return car;
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
          lastUpdatedBy: context.user
        },
        { new: true }
      )

      if (!car) {
        throw new Error('Car not found')
      }

      return car
    },

    updateCarStatus: async (_parent: unknown, { carId, status }: { carId: string, status: 'draft' | 'published' | 'archived' }, context: IContext): Promise<ICar> => {
      if (!context.user || context.user.role !== 'ADMIN') {
        throw new Error('Unauthorized: Admin access required')
      }
      const car = await Car.findByIdAndUpdate(
        carId,
        {
          status,
          lastUpdatedBy: context.user
        },
        { new: true }
      )
      if (!car) {
        throw new Error('Car not found')
      }
      return car
    },

    deleteCar: async (_parent: unknown, { id }: { id: string }, context: IContext): Promise<{ success: boolean, message: string }> => {
      if (!context.user || context.user.role !== 'ADMIN') {
        throw new Error('Unauthorized: Admin access required')
      }
      const car = await Car.findByIdAndDelete(id)
      if (!car) {
        throw new Error('Car not found')
      }
      return { success: true, message: 'Car deleted successfully' }
    }
  }
}
