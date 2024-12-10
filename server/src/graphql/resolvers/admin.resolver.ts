import { AdminService } from '../../services/admin.service'
import { IContext } from '../../types/context'
import { FileUpload } from '../../types/file'
import { GraphQLError } from 'graphql'
import mongoose from 'mongoose'
import { ICar } from '../../models/Car'
import { Car } from '../../models/Car'
import { IUser } from '../../models/User'

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
  engineType?: 'GASOLINE' | 'DIESEL' | 'ELECTRIC' | 'HYBRID' | 'HYDROGEN' | 'PLUG_IN_HYBRID'
  transmission?: string
  power?: number
  acceleration?: number
  rating?: number
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
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
      clutchType?: 'MANUAL' | 'AUTOMATIC' | 'SINGLE_CLUTCH'
      driveType?: 'FRONT_WHEEL_DRIVE' | 'REAR_WHEEL_DRIVE' | 'ALL_WHEEL_DRIVE'
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

const convertToEngineType = (engineType?: string): 'GASOLINE' | 'DIESEL' | 'ELECTRIC' | 'HYBRID' | 'HYDROGEN' | 'PLUG_IN_HYBRID' | undefined => {
  if (!engineType) return undefined;
  
  const upperCaseEngineType = engineType.toUpperCase();
  
  switch (upperCaseEngineType) {
    case 'GASOLINE':
      return 'GASOLINE';
    case 'DIESEL':
      return 'DIESEL';
    case 'ELECTRIC':
      return 'ELECTRIC';
    case 'HYBRID':
      return 'HYBRID';
    case 'HYDROGEN':
      return 'HYDROGEN';
    case 'PLUG_IN_HYBRID':
      return 'PLUG_IN_HYBRID';
    default:
      throw new Error(`Invalid engine type: ${engineType}`);
  }
};

export const adminResolvers = {
  Query: {
    admin: () => ({})
  },

  AdminQuery: {
    adminCars: async (_parent: unknown, _args: unknown, context: IContext): Promise<ICar[]> => {
      if (!context.user || context.user.role !== 'ADMIN') {
        throw new Error('Unauthorized: Admin access required')
      }
      return Car.find()
    }
  },

  Mutation: {
    admin: () => ({})
  },

  AdminMutation: {
    createCar: async (_parent: unknown, { input }: { input: AdminCarInput }, context: IContext): Promise<ICar> => {
      // Check if user is authenticated and is an admin
      if (!context.user) {
        throw new GraphQLError('Authentication required', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      if (context.user.role !== 'ADMIN') {
        throw new GraphQLError('Only admin users can create cars', {
          extensions: { code: 'FORBIDDEN' }
        });
      }

      // Sanitize and validate input
      const sanitizedInput: AdminCarInput = {
        make: input.make,
        carModel: input.carModel,
        year: input.year,
        price: input.price,
        engineType: convertToEngineType(input.engineType),
        transmission: input.transmission,
        power: input.power,
        acceleration: input.acceleration,
        rating: input.rating,
        status: input.status ?? 'DRAFT',
        createdBy: context.user?._id instanceof mongoose.Types.ObjectId ? context.user._id : undefined,
        lastUpdatedBy: context.user?._id instanceof mongoose.Types.ObjectId ? context.user._id : undefined,
        specs: input.specs ? {
          engine: input.specs.engine ? {
            displacement: input.specs.engine?.displacement ?? 0,
            cylinders: input.specs.engine?.cylinders ?? 0,
            configuration: input.specs.engine?.configuration ?? '',
            fuelInjection: input.specs.engine?.fuelInjection ?? '',
            turbocharger: input.specs.engine?.turbocharger ?? false,
            supercharger: input.specs.engine?.supercharger ?? false,
            compression: input.specs.engine?.compression ?? '',
            valvesPerCylinder: input.specs.engine?.valvesPerCylinder ?? 0,
            type: input.specs.engine?.type,
            engineType: convertToEngineType(input.specs.engine?.engineType),
            powerOutput: input.specs.engine?.powerOutput,
            horsepower: input.specs.engine?.horsepower,
            torque: input.specs.engine?.torque,
            compressionRatio: input.specs.engine?.compressionRatio,
            bore: input.specs.engine?.bore,
            stroke: input.specs.engine?.stroke,
            weight: input.specs.engine?.weight,
            oilCapacity: input.specs.engine?.oilCapacity,
            coolingSystem: input.specs.engine?.coolingSystem
          } : {
            displacement: 0,
            cylinders: 0,
            configuration: '',
            fuelInjection: '',
            turbocharger: false,
            supercharger: false,
            compression: '',
            valvesPerCylinder: 0,
            type: undefined,
            engineType: undefined,
            powerOutput: undefined,
            horsepower: undefined,
            torque: undefined,
            compressionRatio: undefined,
            bore: undefined,
            stroke: undefined,
            weight: undefined,
            oilCapacity: undefined,
            coolingSystem: undefined
          },
          performance: input.specs.performance ? {
            powerToWeight: input.specs.performance?.powerToWeight,
            powerToWeightRatio: input.specs.performance?.powerToWeightRatio,
            topSpeed: input.specs.performance?.topSpeed,
            acceleration060: input.specs.performance?.acceleration060,
            acceleration0100: input.specs.performance?.acceleration0100,
            quarterMile: input.specs.performance?.quarterMile,
            quarterMileSpeed: input.specs.performance?.quarterMileSpeed,
            brakingDistance60_0: input.specs.performance?.brakingDistance60_0,
            brakingDistance: input.specs.performance?.brakingDistance,
            lateralG: input.specs.performance?.lateralG,
            nurburgringTime: input.specs.performance?.nurburgringTime,
            passingAcceleration: input.specs.performance?.passingAcceleration,
            elasticity: input.specs.performance?.elasticity,
            launchControl: input.specs.performance?.launchControl,
            performanceMode: input.specs.performance?.performanceMode
          } : {
            powerToWeight: undefined,
            powerToWeightRatio: undefined,
            topSpeed: undefined,
            acceleration060: undefined,
            acceleration0100: undefined,
            quarterMile: undefined,
            quarterMileSpeed: undefined,
            brakingDistance60_0: undefined,
            brakingDistance: undefined,
            lateralG: undefined,
            nurburgringTime: undefined,
            passingAcceleration: undefined,
            elasticity: undefined,
            launchControl: undefined,
            performanceMode: undefined
          },
          chassis: input.specs.chassis ? {
            bodyType: input.specs.chassis?.bodyType,
            platform: input.specs.chassis?.platform,
            frontSuspension: input.specs.chassis?.frontSuspension,
            rearSuspension: input.specs.chassis?.rearSuspension,
            frontBrakes: input.specs.chassis?.frontBrakes,
            rearBrakes: input.specs.chassis?.rearBrakes,
            wheelSize: input.specs.chassis?.wheelSize,
            tireSize: input.specs.chassis?.tireSize
          } : {
            bodyType: undefined,
            platform: undefined,
            frontSuspension: undefined,
            rearSuspension: undefined,
            frontBrakes: undefined,
            rearBrakes: undefined,
            wheelSize: undefined,
            tireSize: undefined
          },
          dimensions: input.specs.dimensions ? {
            length: input.specs.dimensions?.length,
            width: input.specs.dimensions?.width,
            height: input.specs.dimensions?.height,
            wheelbase: input.specs.dimensions?.wheelbase,
            groundClearance: input.specs.dimensions?.groundClearance,
            dragCoefficient: input.specs.dimensions?.dragCoefficient,
            weight: input.specs.dimensions?.weight,
            distribution: input.specs.dimensions?.distribution
          } : {
            length: undefined,
            width: undefined,
            height: undefined,
            wheelbase: undefined,
            groundClearance: undefined,
            dragCoefficient: undefined,
            weight: undefined,
            distribution: undefined
          },
          transmission: input.specs.transmission ? {
            type: input.specs.transmission?.type,
            gears: input.specs.transmission?.gears,
            clutchType: input.specs.transmission?.clutchType,
            driveType: input.specs.transmission?.driveType,
            differential: input.specs.transmission?.differential
          } : {
            type: undefined,
            gears: undefined,
            clutchType: undefined,
            driveType: undefined,
            differential: undefined
          },
          fuel: input.specs.fuel ? {
            fuelType: input.specs.fuel?.fuelType,
            fuelSystem: input.specs.fuel?.fuelSystem,
            tankCapacity: input.specs.fuel?.tankCapacity,
            cityMPG: input.specs.fuel?.cityMPG,
            highwayMPG: input.specs.fuel?.highwayMPG,
            combinedMPG: input.specs.fuel?.combinedMPG,
            emissionClass: input.specs.fuel?.emissionClass
          } : {
            fuelType: undefined,
            fuelSystem: undefined,
            tankCapacity: undefined,
            cityMPG: undefined,
            highwayMPG: undefined,
            combinedMPG: undefined,
            emissionClass: undefined
          },
          interior: input.specs.interior ? {
            seatingCapacity: input.specs.interior?.seatingCapacity,
            doors: input.specs.interior?.doors,
            trunkCapacity: input.specs.interior?.trunkCapacity,
            infotainmentScreen: input.specs.interior?.infotainmentScreen,
            soundSystem: input.specs.interior?.soundSystem,
            climateZones: input.specs.interior?.climateZones,
            upholsteryMaterial: input.specs.interior?.upholsteryMaterial
          } : {
            seatingCapacity: undefined,
            doors: undefined,
            trunkCapacity: undefined,
            infotainmentScreen: undefined,
            soundSystem: undefined,
            climateZones: undefined,
            upholsteryMaterial: undefined
          },
          safety: input.specs.safety ? {
            airbags: input.specs.safety?.airbags,
            abs: input.specs.safety?.abs,
            stabilityControl: input.specs.safety?.stabilityControl,
            tractionControl: input.specs.safety?.tractionControl,
            parkingSensors: input.specs.safety?.parkingSensors,
            camera: input.specs.safety?.camera,
            blindSpotMonitoring: input.specs.safety?.blindSpotMonitoring,
            laneDepartureWarning: input.specs.safety?.laneDepartureWarning,
            collisionWarning: input.specs.safety?.collisionWarning,
            nightVision: input.specs.safety?.nightVision
          } : {
            airbags: undefined,
            abs: undefined,
            stabilityControl: undefined,
            tractionControl: undefined,
            parkingSensors: undefined,
            camera: undefined,
            blindSpotMonitoring: undefined,
            laneDepartureWarning: undefined,
            collisionWarning: undefined,
            nightVision: undefined
          },
          technology: input.specs.technology ? {
            infotainmentSystem: input.specs.technology?.infotainmentSystem,
            screenSize: input.specs.technology?.screenSize,
            appleCarPlay: input.specs.technology?.appleCarPlay,
            androidAuto: input.specs.technology?.androidAuto,
            adaptiveCruiseControl: input.specs.technology?.adaptiveCruiseControl,
            laneKeepAssist: input.specs.technology?.laneKeepAssist,
            blindSpotMonitoring: input.specs.technology?.blindSpotMonitoring,
            parkingAssist: input.specs.technology?.parkingAssist,
            nightVision: input.specs.technology?.nightVision,
            headUpDisplay: input.specs.technology?.headUpDisplay,
            surroundViewCamera: input.specs.technology?.surroundViewCamera,
            bluetooth: input.specs.technology?.bluetooth,
            wirelessCharging: input.specs.technology?.wirelessCharging,
            wifi: input.specs.technology?.wifi,
            soundSystem: input.specs.technology?.soundSystem,
            speakers: input.specs.technology?.speakers,
            digitalKey: input.specs.technology?.digitalKey,
            mobileApp: input.specs.technology?.mobileApp,
            overTheAirUpdates: input.specs.technology?.overTheAirUpdates,
            voiceControl: input.specs.technology?.voiceControl,
            voiceAssistantName: input.specs.technology?.voiceAssistantName,
            navigation: input.specs.technology?.navigation,
            headlightType: input.specs.technology?.headlightType,
            driverAssistance: input.specs.technology?.driverAssistance
          } : {
            infotainmentSystem: undefined,
            screenSize: undefined,
            appleCarPlay: undefined,
            androidAuto: undefined,
            adaptiveCruiseControl: undefined,
            laneKeepAssist: undefined,
            blindSpotMonitoring: undefined,
            parkingAssist: undefined,
            nightVision: undefined,
            headUpDisplay: undefined,
            surroundViewCamera: undefined,
            bluetooth: undefined,
            wirelessCharging: undefined,
            wifi: undefined,
            soundSystem: undefined,
            speakers: undefined,
            digitalKey: undefined,
            mobileApp: undefined,
            overTheAirUpdates: undefined,
            voiceControl: undefined,
            voiceAssistantName: undefined,
            navigation: undefined,
            headlightType: undefined,
            driverAssistance: undefined
          },
          warranty: input.specs.warranty ? {
            basic: input.specs.warranty?.basic,
            powertrain: input.specs.warranty?.powertrain,
            corrosion: input.specs.warranty?.corrosion,
            roadside: input.specs.warranty?.roadside,
            maintenance: input.specs.warranty?.maintenance
          } : {
            basic: undefined,
            powertrain: undefined,
            corrosion: undefined,
            roadside: undefined,
            maintenance: undefined
          },
          features: input.specs.features ? {
            safety: input.specs.features?.safety,
            comfort: input.specs.features?.comfort,
            technology: input.specs.features?.technology,
            exterior: input.specs.features?.exterior,
            interior: input.specs.features?.interior
          } : {
            safety: undefined,
            comfort: undefined,
            technology: undefined,
            exterior: undefined,
            interior: undefined
          }
        } : {
          engine: {
            displacement: 0,
            cylinders: 0,
            configuration: '',
            fuelInjection: '',
            turbocharger: false,
            supercharger: false,
            compression: '',
            valvesPerCylinder: 0,
            type: undefined,
            engineType: undefined,
            powerOutput: undefined,
            horsepower: undefined,
            torque: undefined,
            compressionRatio: undefined,
            bore: undefined,
            stroke: undefined,
            weight: undefined,
            oilCapacity: undefined,
            coolingSystem: undefined
          },
          performance: {
            powerToWeight: undefined,
            powerToWeightRatio: undefined,
            topSpeed: undefined,
            acceleration060: undefined,
            acceleration0100: undefined,
            quarterMile: undefined,
            quarterMileSpeed: undefined,
            brakingDistance60_0: undefined,
            brakingDistance: undefined,
            lateralG: undefined,
            nurburgringTime: undefined,
            passingAcceleration: undefined,
            elasticity: undefined,
            launchControl: undefined,
            performanceMode: undefined
          },
          chassis: {
            bodyType: undefined,
            platform: undefined,
            frontSuspension: undefined,
            rearSuspension: undefined,
            frontBrakes: undefined,
            rearBrakes: undefined,
            wheelSize: undefined,
            tireSize: undefined
          },
          dimensions: {
            length: undefined,
            width: undefined,
            height: undefined,
            wheelbase: undefined,
            groundClearance: undefined,
            dragCoefficient: undefined,
            weight: undefined,
            distribution: undefined
          },
          transmission: {
            type: undefined,
            gears: undefined,
            clutchType: undefined,
            driveType: undefined,
            differential: undefined
          },
          fuel: {
            fuelType: undefined,
            fuelSystem: undefined,
            tankCapacity: undefined,
            cityMPG: undefined,
            highwayMPG: undefined,
            combinedMPG: undefined,
            emissionClass: undefined
          },
          interior: {
            seatingCapacity: undefined,
            doors: undefined,
            trunkCapacity: undefined,
            infotainmentScreen: undefined,
            soundSystem: undefined,
            climateZones: undefined,
            upholsteryMaterial: undefined
          },
          safety: {
            airbags: undefined,
            abs: undefined,
            stabilityControl: undefined,
            tractionControl: undefined,
            parkingSensors: undefined,
            camera: undefined,
            blindSpotMonitoring: undefined,
            laneDepartureWarning: undefined,
            collisionWarning: undefined,
            nightVision: undefined
          },
          technology: {
            infotainmentSystem: undefined,
            screenSize: undefined,
            appleCarPlay: undefined,
            androidAuto: undefined,
            adaptiveCruiseControl: undefined,
            laneKeepAssist: undefined,
            blindSpotMonitoring: undefined,
            parkingAssist: undefined,
            nightVision: undefined,
            headUpDisplay: undefined,
            surroundViewCamera: undefined,
            bluetooth: undefined,
            wirelessCharging: undefined,
            wifi: undefined,
            soundSystem: undefined,
            speakers: undefined,
            digitalKey: undefined,
            mobileApp: undefined,
            overTheAirUpdates: undefined,
            voiceControl: undefined,
            voiceAssistantName: undefined,
            navigation: undefined,
            headlightType: undefined,
            driverAssistance: undefined
          },
          warranty: {
            basic: undefined,
            powertrain: undefined,
            corrosion: undefined,
            roadside: undefined,
            maintenance: undefined
          },
          features: {
            safety: undefined,
            comfort: undefined,
            technology: undefined,
            exterior: undefined,
            interior: undefined
          }
        },
        images: input.images?.map(img => ({
          url: img.url || '',  
          isFeatured: img.isFeatured,
          uploadedBy: img.uploadedBy,
          uploadedAt: img.uploadedAt
        })) || [],
      };

      console.log('Prepared Car Data:', JSON.stringify(sanitizedInput, null, 2));

      // Create the car in the database
      return AdminService.createCar(sanitizedInput, context.user as IUser);
    },

    updateCar: async (_parent: unknown, { id, input }: { id: string, input: Partial<AdminCarInput> }, context: IContext): Promise<ICar> => {
      // Check if user is authenticated and is an admin
      if (!context.user) {
        throw new GraphQLError('Authentication required', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      if (context.user.role !== 'ADMIN') {
        throw new GraphQLError('Only admin users can update cars', {
          extensions: { code: 'FORBIDDEN' }
        });
      }

      // Convert AdminCarInput to Partial<ICar>
      const sanitizedInput: Partial<ICar> = {
        ...input,
        engineType: input.engineType ? convertToEngineType(input.engineType) : undefined,
        specs: input.specs ? {
          engine: input.specs.engine ? {
            displacement: input.specs.engine?.displacement ?? 0,
            cylinders: input.specs.engine?.cylinders ?? 0,
            configuration: input.specs.engine?.configuration ?? '',
            fuelInjection: input.specs.engine?.fuelInjection ?? '',
            turbocharger: input.specs.engine?.turbocharger ?? false,
            supercharger: input.specs.engine?.supercharger ?? false,
            compression: input.specs.engine?.compression ?? '',
            valvesPerCylinder: input.specs.engine?.valvesPerCylinder ?? 0,
            type: input.specs.engine?.type,
            engineType: input.specs.engine?.engineType ? convertToEngineType(input.specs.engine?.engineType) : undefined,
            powerOutput: input.specs.engine?.powerOutput,
            horsepower: input.specs.engine?.horsepower,
            torque: input.specs.engine?.torque,
            compressionRatio: input.specs.engine?.compressionRatio,
            bore: input.specs.engine?.bore,
            stroke: input.specs.engine?.stroke,
            weight: input.specs.engine?.weight,
            oilCapacity: input.specs.engine?.oilCapacity,
            coolingSystem: input.specs.engine?.coolingSystem
          } : {
            displacement: 0,
            cylinders: 0,
            configuration: '',
            fuelInjection: '',
            turbocharger: false,
            supercharger: false,
            compression: '',
            valvesPerCylinder: 0,
            type: undefined,
            engineType: undefined,
            powerOutput: undefined,
            horsepower: undefined,
            torque: undefined,
            compressionRatio: undefined,
            bore: undefined,
            stroke: undefined,
            weight: undefined,
            oilCapacity: undefined,
            coolingSystem: undefined
          },
          performance: input.specs.performance ? {
            powerToWeight: input.specs.performance?.powerToWeight,
            powerToWeightRatio: input.specs.performance?.powerToWeightRatio,
            topSpeed: input.specs.performance?.topSpeed,
            acceleration060: input.specs.performance?.acceleration060,
            acceleration0100: input.specs.performance?.acceleration0100,
            quarterMile: input.specs.performance?.quarterMile,
            quarterMileSpeed: input.specs.performance?.quarterMileSpeed,
            brakingDistance60_0: input.specs.performance?.brakingDistance60_0,
            brakingDistance: input.specs.performance?.brakingDistance,
            lateralG: input.specs.performance?.lateralG,
            nurburgringTime: input.specs.performance?.nurburgringTime,
            passingAcceleration: input.specs.performance?.passingAcceleration,
            elasticity: input.specs.performance?.elasticity,
            launchControl: input.specs.performance?.launchControl,
            performanceMode: input.specs.performance?.performanceMode
          } : {
            powerToWeight: undefined,
            powerToWeightRatio: undefined,
            topSpeed: undefined,
            acceleration060: undefined,
            acceleration0100: undefined,
            quarterMile: undefined,
            quarterMileSpeed: undefined,
            brakingDistance60_0: undefined,
            brakingDistance: undefined,
            lateralG: undefined,
            nurburgringTime: undefined,
            passingAcceleration: undefined,
            elasticity: undefined,
            launchControl: undefined,
            performanceMode: undefined
          },
          chassis: input.specs.chassis ? {
            bodyType: input.specs.chassis?.bodyType,
            platform: input.specs.chassis?.platform,
            frontSuspension: input.specs.chassis?.frontSuspension,
            rearSuspension: input.specs.chassis?.rearSuspension,
            frontBrakes: input.specs.chassis?.frontBrakes,
            rearBrakes: input.specs.chassis?.rearBrakes,
            wheelSize: input.specs.chassis?.wheelSize,
            tireSize: input.specs.chassis?.tireSize
          } : {
            bodyType: undefined,
            platform: undefined,
            frontSuspension: undefined,
            rearSuspension: undefined,
            frontBrakes: undefined,
            rearBrakes: undefined,
            wheelSize: undefined,
            tireSize: undefined
          },
          dimensions: input.specs.dimensions ? {
            length: input.specs.dimensions?.length,
            width: input.specs.dimensions?.width,
            height: input.specs.dimensions?.height,
            wheelbase: input.specs.dimensions?.wheelbase,
            groundClearance: input.specs.dimensions?.groundClearance,
            dragCoefficient: input.specs.dimensions?.dragCoefficient,
            weight: input.specs.dimensions?.weight,
            distribution: input.specs.dimensions?.distribution
          } : {
            length: undefined,
            width: undefined,
            height: undefined,
            wheelbase: undefined,
            groundClearance: undefined,
            dragCoefficient: undefined,
            weight: undefined,
            distribution: undefined
          },
          transmission: input.specs.transmission ? {
            type: input.specs.transmission?.type,
            gears: input.specs.transmission?.gears,
            clutchType: input.specs.transmission?.clutchType,
            driveType: input.specs.transmission?.driveType,
            differential: input.specs.transmission?.differential
          } : {
            type: undefined,
            gears: undefined,
            clutchType: undefined,
            driveType: undefined,
            differential: undefined
          },
          fuel: input.specs.fuel ? {
            fuelType: input.specs.fuel?.fuelType,
            fuelSystem: input.specs.fuel?.fuelSystem,
            tankCapacity: input.specs.fuel?.tankCapacity,
            cityMPG: input.specs.fuel?.cityMPG,
            highwayMPG: input.specs.fuel?.highwayMPG,
            combinedMPG: input.specs.fuel?.combinedMPG,
            emissionClass: input.specs.fuel?.emissionClass
          } : {
            fuelType: undefined,
            fuelSystem: undefined,
            tankCapacity: undefined,
            cityMPG: undefined,
            highwayMPG: undefined,
            combinedMPG: undefined,
            emissionClass: undefined
          },
          interior: input.specs.interior ? {
            seatingCapacity: input.specs.interior?.seatingCapacity,
            doors: input.specs.interior?.doors,
            trunkCapacity: input.specs.interior?.trunkCapacity,
            infotainmentScreen: input.specs.interior?.infotainmentScreen,
            soundSystem: input.specs.interior?.soundSystem,
            climateZones: input.specs.interior?.climateZones,
            upholsteryMaterial: input.specs.interior?.upholsteryMaterial
          } : {
            seatingCapacity: undefined,
            doors: undefined,
            trunkCapacity: undefined,
            infotainmentScreen: undefined,
            soundSystem: undefined,
            climateZones: undefined,
            upholsteryMaterial: undefined
          },
          safety: input.specs.safety ? {
            airbags: input.specs.safety?.airbags,
            abs: input.specs.safety?.abs,
            stabilityControl: input.specs.safety?.stabilityControl,
            tractionControl: input.specs.safety?.tractionControl,
            parkingSensors: input.specs.safety?.parkingSensors,
            camera: input.specs.safety?.camera,
            blindSpotMonitoring: input.specs.safety?.blindSpotMonitoring,
            laneDepartureWarning: input.specs.safety?.laneDepartureWarning,
            collisionWarning: input.specs.safety?.collisionWarning,
            nightVision: input.specs.safety?.nightVision
          } : {
            airbags: undefined,
            abs: undefined,
            stabilityControl: undefined,
            tractionControl: undefined,
            parkingSensors: undefined,
            camera: undefined,
            blindSpotMonitoring: undefined,
            laneDepartureWarning: undefined,
            collisionWarning: undefined,
            nightVision: undefined
          },
          technology: input.specs.technology ? {
            infotainmentSystem: input.specs.technology?.infotainmentSystem,
            screenSize: input.specs.technology?.screenSize,
            appleCarPlay: input.specs.technology?.appleCarPlay,
            androidAuto: input.specs.technology?.androidAuto,
            adaptiveCruiseControl: input.specs.technology?.adaptiveCruiseControl,
            laneKeepAssist: input.specs.technology?.laneKeepAssist,
            blindSpotMonitoring: input.specs.technology?.blindSpotMonitoring,
            parkingAssist: input.specs.technology?.parkingAssist,
            nightVision: input.specs.technology?.nightVision,
            headUpDisplay: input.specs.technology?.headUpDisplay,
            surroundViewCamera: input.specs.technology?.surroundViewCamera,
            bluetooth: input.specs.technology?.bluetooth,
            wirelessCharging: input.specs.technology?.wirelessCharging,
            wifi: input.specs.technology?.wifi,
            soundSystem: input.specs.technology?.soundSystem,
            speakers: input.specs.technology?.speakers,
            digitalKey: input.specs.technology?.digitalKey,
            mobileApp: input.specs.technology?.mobileApp,
            overTheAirUpdates: input.specs.technology?.overTheAirUpdates,
            voiceControl: input.specs.technology?.voiceControl,
            voiceAssistantName: input.specs.technology?.voiceAssistantName,
            navigation: input.specs.technology?.navigation,
            headlightType: input.specs.technology?.headlightType,
            driverAssistance: input.specs.technology?.driverAssistance
          } : {
            infotainmentSystem: undefined,
            screenSize: undefined,
            appleCarPlay: undefined,
            androidAuto: undefined,
            adaptiveCruiseControl: undefined,
            laneKeepAssist: undefined,
            blindSpotMonitoring: undefined,
            parkingAssist: undefined,
            nightVision: undefined,
            headUpDisplay: undefined,
            surroundViewCamera: undefined,
            bluetooth: undefined,
            wirelessCharging: undefined,
            wifi: undefined,
            soundSystem: undefined,
            speakers: undefined,
            digitalKey: undefined,
            mobileApp: undefined,
            overTheAirUpdates: undefined,
            voiceControl: undefined,
            voiceAssistantName: undefined,
            navigation: undefined,
            headlightType: undefined,
            driverAssistance: undefined
          },
          warranty: input.specs.warranty ? {
            basic: input.specs.warranty?.basic,
            powertrain: input.specs.warranty?.powertrain,
            corrosion: input.specs.warranty?.corrosion,
            roadside: input.specs.warranty?.roadside,
            maintenance: input.specs.warranty?.maintenance
          } : {
            basic: undefined,
            powertrain: undefined,
            corrosion: undefined,
            roadside: undefined,
            maintenance: undefined
          },
          features: input.specs.features ? {
            safety: input.specs.features?.safety,
            comfort: input.specs.features?.comfort,
            technology: input.specs.features?.technology,
            exterior: input.specs.features?.exterior,
            interior: input.specs.features?.interior
          } : {
            safety: undefined,
            comfort: undefined,
            technology: undefined,
            exterior: undefined,
            interior: undefined
          }
        } : {
          engine: {
            displacement: 0,
            cylinders: 0,
            configuration: '',
            fuelInjection: '',
            turbocharger: false,
            supercharger: false,
            compression: '',
            valvesPerCylinder: 0,
            type: undefined,
            engineType: undefined,
            powerOutput: undefined,
            horsepower: undefined,
            torque: undefined,
            compressionRatio: undefined,
            bore: undefined,
            stroke: undefined,
            weight: undefined,
            oilCapacity: undefined,
            coolingSystem: undefined
          },
          performance: {
            powerToWeight: undefined,
            powerToWeightRatio: undefined,
            topSpeed: undefined,
            acceleration060: undefined,
            acceleration0100: undefined,
            quarterMile: undefined,
            quarterMileSpeed: undefined,
            brakingDistance60_0: undefined,
            brakingDistance: undefined,
            lateralG: undefined,
            nurburgringTime: undefined,
            passingAcceleration: undefined,
            elasticity: undefined,
            launchControl: undefined,
            performanceMode: undefined
          },
          chassis: {
            bodyType: undefined,
            platform: undefined,
            frontSuspension: undefined,
            rearSuspension: undefined,
            frontBrakes: undefined,
            rearBrakes: undefined,
            wheelSize: undefined,
            tireSize: undefined
          },
          dimensions: {
            length: undefined,
            width: undefined,
            height: undefined,
            wheelbase: undefined,
            groundClearance: undefined,
            dragCoefficient: undefined,
            weight: undefined,
            distribution: undefined
          },
          transmission: {
            type: undefined,
            gears: undefined,
            clutchType: undefined,
            driveType: undefined,
            differential: undefined
          },
          fuel: {
            fuelType: undefined,
            fuelSystem: undefined,
            tankCapacity: undefined,
            cityMPG: undefined,
            highwayMPG: undefined,
            combinedMPG: undefined,
            emissionClass: undefined
          },
          interior: {
            seatingCapacity: undefined,
            doors: undefined,
            trunkCapacity: undefined,
            infotainmentScreen: undefined,
            soundSystem: undefined,
            climateZones: undefined,
            upholsteryMaterial: undefined
          },
          safety: {
            airbags: undefined,
            abs: undefined,
            stabilityControl: undefined,
            tractionControl: undefined,
            parkingSensors: undefined,
            camera: undefined,
            blindSpotMonitoring: undefined,
            laneDepartureWarning: undefined,
            collisionWarning: undefined,
            nightVision: undefined
          },
          technology: {
            infotainmentSystem: undefined,
            screenSize: undefined,
            appleCarPlay: undefined,
            androidAuto: undefined,
            adaptiveCruiseControl: undefined,
            laneKeepAssist: undefined,
            blindSpotMonitoring: undefined,
            parkingAssist: undefined,
            nightVision: undefined,
            headUpDisplay: undefined,
            surroundViewCamera: undefined,
            bluetooth: undefined,
            wirelessCharging: undefined,
            wifi: undefined,
            soundSystem: undefined,
            speakers: undefined,
            digitalKey: undefined,
            mobileApp: undefined,
            overTheAirUpdates: undefined,
            voiceControl: undefined,
            voiceAssistantName: undefined,
            navigation: undefined,
            headlightType: undefined,
            driverAssistance: undefined
          },
          warranty: {
            basic: undefined,
            powertrain: undefined,
            corrosion: undefined,
            roadside: undefined,
            maintenance: undefined
          },
          features: {
            safety: undefined,
            comfort: undefined,
            technology: undefined,
            exterior: undefined,
            interior: undefined
          }
        },
      };

      return AdminService.updateCar(id, sanitizedInput, context.user as IUser);
    },

    uploadCarImage: async (
      _parent: unknown,
      { carId, image, caption, isFeatured }: { carId: string, image: FileUpload, caption?: string, isFeatured: boolean },
      context: IContext
    ): Promise<ICar> => {
      if (!context.user || context.user.role !== 'ADMIN') {
        throw new Error('Unauthorized: Admin access required')
      }
      // TODO: Implement image upload logic
      const car = await Car.findByIdAndUpdate(
        carId,
        {
          $push: {
            images: {
              url: 'placeholder-url',
              isFeatured,
              caption,
              uploadedBy: context.user,
              uploadedAt: new Date()
            }
          },
          lastUpdatedBy: context.user
        },
        { new: true }
      )
      if (!car) {
        throw new Error('Car not found')
      }
      return car
    },

    deleteCarImage: async (_parent: unknown, { carId, imageUrl }: { carId: string, imageUrl: string }, context: IContext): Promise<ICar> => {
      if (!context.user || context.user.role !== 'ADMIN') {
        throw new Error('Unauthorized: Admin access required')
      }
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
