import mongoose, { Document, Model } from 'mongoose'
import { IUser } from './User'

export interface ICar extends mongoose.Document {
  make?: string
  carModel?: string
  year?: number
  price?: number
  images?: {
    url: string
    isFeatured: boolean
    caption?: string
    uploadedBy: mongoose.Types.ObjectId | IUser
    uploadedAt: Date
  }[]
  rating?: number
  engineType?: 'GASOLINE' | 'DIESEL' | 'ELECTRIC' | 'HYBRID' | 'HYDROGEN' | 'PLUG_IN_HYBRID'
  transmission?: string
  power?: number
  acceleration?: number
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  createdBy?: mongoose.Types.ObjectId | IUser
  lastUpdatedBy?: mongoose.Types.ObjectId | IUser
  specs?: {
    engine?: {
      displacement?: number
      cylinders?: number
      configuration?: string
      fuelInjection?: string
      turbocharger?: boolean
      supercharger?: boolean
      compression?: string
      valvesPerCylinder?: number
      valveSystem?: string
      aspiration?: string
      boostPressure?: number
      redlineRpm?: number
      idleRpm?: number
      position?: string
      orientation?: string
      horsepower?: number
      torque?: number
      compressionRatio?: number
      bore?: number
      stroke?: number
      engineType?: string
      powerOutput?: number
      weight?: number
      oilCapacity?: number
      coolingSystem?: string
      type?: string
    }
    performance?: {
      powerToWeight?: number
      powerToWeightRatio?: number
      topSpeed?: number
      acceleration060?: number
      acceleration0100?: number
      quarterMile?: number
      quarterMileSpeed?: number
      brakingDistance60_0?: number
      brakingDistance?: number
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
      clutchType?: string
      driveType?: string
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
  reviews?: Array<{
    user: {
      id: string
      firstName: string
      lastName: string
    }
    rating: number
    comment: string
    createdAt: Date
  }>
}

const carSchema = new mongoose.Schema({
  make: { type: String, default: '' },
  carModel: { type: String, default: '' },
  year: { type: Number, default: new Date().getFullYear() },
  price: { type: Number, default: 0 },
  images: [{
    url: { type: String, default: '' },
    isFeatured: { type: Boolean, default: false },
    caption: { type: String, default: '' },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    uploadedAt: { type: Date, default: Date.now }
  }],
  rating: { type: Number, default: 0 },
  engineType: {
    type: String,
    enum: ['GASOLINE', 'DIESEL', 'ELECTRIC', 'HYBRID', 'HYDROGEN', 'PLUG_IN_HYBRID'],
    default: 'GASOLINE'
  },
  transmission: { type: String, default: '' },
  power: { type: Number, default: 0 },
  acceleration: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
    default: 'DRAFT'
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  specs: {
    engine: {
      displacement: { type: Number, default: 0 },
      cylinders: { type: Number, default: 0 },
      configuration: { type: String, default: '' },
      fuelInjection: { type: String, default: '' },
      turbocharger: { type: Boolean, default: false },
      supercharger: { type: Boolean, default: false },
      compression: { type: String, default: '' },
      valvesPerCylinder: { type: Number, default: 0 },
      valveSystem: { type: String, default: '' },
      aspiration: { type: String, default: '' },
      boostPressure: { type: Number, default: 0 },
      redlineRpm: { type: Number, default: 0 },
      idleRpm: { type: Number, default: 0 },
      position: { type: String, default: '' },
      orientation: { type: String, default: '' },
      horsepower: { type: Number, default: 0 },
      torque: { type: Number, default: 0 },
      compressionRatio: { type: Number, default: 0 },
      bore: { type: Number, default: 0 },
      stroke: { type: Number, default: 0 },
      engineType: { type: String, default: '' },
      powerOutput: { type: Number, default: 0 },
      weight: { type: Number, default: 0 },
      oilCapacity: { type: Number, default: 0 },
      coolingSystem: { type: String, default: '' },
      type: { type: String, default: '' }
    },
    performance: {
      powerToWeight: { type: Number, default: 0 },
      powerToWeightRatio: { type: Number, default: 0 },
      topSpeed: { type: Number, default: 0 },
      acceleration060: { type: Number, default: 0 },
      acceleration0100: { type: Number, default: 0 },
      quarterMile: { type: Number, default: 0 },
      quarterMileSpeed: { type: Number, default: 0 },
      brakingDistance60_0: { type: Number, default: 0 },
      brakingDistance: { type: Number, default: 0 },
      lateralG: { type: Number, default: 0 },
      nurburgringTime: { type: String, default: '' },
      passingAcceleration: { type: Number, default: 0 },
      elasticity: { type: Number, default: 0 },
      launchControl: { type: Boolean, default: false },
      performanceMode: [{ type: String, default: '' }]
    },
    chassis: {
      bodyType: { type: String, default: '' },
      platform: { type: String, default: '' },
      frontSuspension: { type: String, default: '' },
      rearSuspension: { type: String, default: '' },
      frontBrakes: { type: String, default: '' },
      rearBrakes: { type: String, default: '' },
      wheelSize: { type: String, default: '' },
      tireSize: { type: String, default: '' }
    },
    dimensions: {
      length: { type: Number, default: 0 },
      width: { type: Number, default: 0 },
      height: { type: Number, default: 0 },
      wheelbase: { type: Number, default: 0 },
      groundClearance: { type: Number, default: 0 },
      dragCoefficient: { type: Number, default: 0 },
      weight: { type: Number, default: 0 },
      distribution: { type: String, default: '' }
    },
    transmission: {
      type: { type: String, default: '' },
      gears: { type: Number, default: 0 },
      clutchType: { type: String, default: '' },
      driveType: { type: String, default: '' },
      differential: { type: String, default: '' }
    },
    fuel: {
      fuelType: { type: String, default: '' },
      fuelSystem: { type: String, default: '' },
      tankCapacity: { type: Number, default: 0 },
      cityMPG: { type: Number, default: 0 },
      highwayMPG: { type: Number, default: 0 },
      combinedMPG: { type: Number, default: 0 },
      emissionClass: { type: String, default: '' }
    },
    interior: {
      seatingCapacity: { type: Number, default: 0 },
      doors: { type: Number, default: 0 },
      trunkCapacity: { type: Number, default: 0 },
      infotainmentScreen: { type: String, default: '' },
      soundSystem: { type: String, default: '' },
      climateZones: { type: Number, default: 0 },
      upholsteryMaterial: { type: String, default: '' }
    },
    safety: {
      airbags: { type: String, default: '' },
      abs: { type: Boolean, default: false },
      stabilityControl: { type: Boolean, default: false },
      tractionControl: { type: Boolean, default: false },
      parkingSensors: { type: Boolean, default: false },
      camera: { type: String, default: '' },
      blindSpotMonitoring: { type: Boolean, default: false },
      laneDepartureWarning: { type: Boolean, default: false },
      collisionWarning: { type: Boolean, default: false },
      nightVision: { type: Boolean, default: false }
    },
    technology: {
      infotainmentSystem: { type: String, default: '' },
      screenSize: { type: Number, default: 0 },
      appleCarPlay: { type: Boolean, default: false },
      androidAuto: { type: Boolean, default: false },
      adaptiveCruiseControl: { type: Boolean, default: false },
      laneKeepAssist: { type: Boolean, default: false },
      blindSpotMonitoring: { type: Boolean, default: false },
      parkingAssist: { type: Boolean, default: false },
      nightVision: { type: Boolean, default: false },
      headUpDisplay: { type: Boolean, default: false },
      surroundViewCamera: { type: Boolean, default: false },
      bluetooth: { type: Boolean, default: false },
      wirelessCharging: { type: Boolean, default: false },
      wifi: { type: Boolean, default: false },
      soundSystem: { type: String, default: '' },
      speakers: { type: Number, default: 0 },
      digitalKey: { type: Boolean, default: false },
      mobileApp: { type: Boolean, default: false },
      overTheAirUpdates: { type: Boolean, default: false },
      voiceControl: { type: Boolean, default: false },
      voiceAssistantName: { type: String, default: '' },
      navigation: { type: String, default: '' },
      headlightType: { type: String, default: '' },
      driverAssistance: [{ type: String, default: '' }]
    },
    warranty: {
      basic: { type: String, default: '' },
      powertrain: { type: String, default: '' },
      corrosion: { type: String, default: '' },
      roadside: { type: String, default: '' },
      maintenance: { type: String, default: '' }
    },
    features: {
      safety: [{ type: String, default: '' }],
      comfort: [{ type: String, default: '' }],
      technology: [{ type: String, default: '' }],
      exterior: [{ type: String, default: '' }],
      interior: [{ type: String, default: '' }]
    }
  },
  reviews: [{
    user: {
      id: { type: String, default: '' },
      firstName: { type: String, default: '' },
      lastName: { type: String, default: '' }
    },
    rating: { type: Number, default: 0 },
    comment: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
})

// Add indexes for better query performance
carSchema.index({ make: 1, carModel: 1 })
carSchema.index({ year: 1 })
carSchema.index({ price: 1 })
carSchema.index({ status: 1 })
carSchema.index({ createdAt: -1 })

// Create and export the Car model
export const Car = mongoose.model<ICar>('Car', carSchema)
