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
  make: { type: String },
  carModel: { type: String },
  year: { type: Number },
  price: { type: Number },
  images: [{
    url: { type: String },
    isFeatured: { type: Boolean, default: false },
    caption: String,
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    uploadedAt: { type: Date, default: Date.now }
  }],
  rating: { type: Number, default: 0 },
  engineType: {
    type: String,
    enum: ['GASOLINE', 'DIESEL', 'ELECTRIC', 'HYBRID', 'HYDROGEN', 'PLUG_IN_HYBRID']
  },
  transmission: { type: String },
  power: { type: Number },
  acceleration: { type: Number },
  status: {
    type: String,
    enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
    default: 'DRAFT'
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  specs: {
    engine: {
      displacement: { type: Number },
      cylinders: { type: Number },
      configuration: { type: String },
      fuelInjection: { type: String },
      turbocharger: { type: Boolean },
      supercharger: { type: Boolean },
      compression: { type: String },
      valvesPerCylinder: { type: Number },
      valveSystem: { type: String },
      aspiration: { type: String },
      boostPressure: { type: Number },
      redlineRpm: { type: Number },
      idleRpm: { type: Number },
      position: { type: String },
      orientation: { type: String },
      horsepower: { type: Number },
      torque: { type: Number },
      compressionRatio: { type: Number },
      bore: { type: Number },
      stroke: { type: Number },
      engineType: { type: String },
      powerOutput: { type: Number },
      weight: { type: Number },
      oilCapacity: { type: Number },
      coolingSystem: { type: String },
      type: { type: String }
    },
    performance: {
      powerToWeight: { type: Number },
      powerToWeightRatio: { type: Number },
      topSpeed: { type: Number },
      acceleration060: { type: Number },
      acceleration0100: { type: Number },
      quarterMile: { type: Number },
      quarterMileSpeed: { type: Number },
      brakingDistance60_0: { type: Number },
      brakingDistance: { type: Number },
      lateralG: { type: Number },
      nurburgringTime: { type: String },
      passingAcceleration: { type: Number },
      elasticity: { type: Number },
      launchControl: { type: Boolean },
      performanceMode: [{ type: String }]
    },
    chassis: {
      bodyType: { type: String },
      platform: { type: String },
      frontSuspension: { type: String },
      rearSuspension: { type: String },
      frontBrakes: { type: String },
      rearBrakes: { type: String },
      wheelSize: { type: String },
      tireSize: { type: String }
    },
    dimensions: {
      length: { type: Number },
      width: { type: Number },
      height: { type: Number },
      wheelbase: { type: Number },
      groundClearance: { type: Number },
      dragCoefficient: { type: Number },
      weight: { type: Number },
      distribution: { type: String }
    },
    transmission: {
      type: { type: String },
      gears: { type: Number },
      clutchType: { type: String },
      driveType: { type: String },
      differential: { type: String }
    },
    fuel: {
      fuelType: { type: String },
      fuelSystem: { type: String },
      tankCapacity: { type: Number },
      cityMPG: { type: Number },
      highwayMPG: { type: Number },
      combinedMPG: { type: Number },
      emissionClass: { type: String }
    },
    interior: {
      seatingCapacity: { type: Number },
      doors: { type: Number },
      trunkCapacity: { type: Number },
      infotainmentScreen: { type: String },
      soundSystem: { type: String },
      climateZones: { type: Number },
      upholsteryMaterial: { type: String }
    },
    safety: {
      airbags: { type: String },
      abs: { type: Boolean },
      stabilityControl: { type: Boolean },
      tractionControl: { type: Boolean },
      parkingSensors: { type: Boolean },
      camera: { type: String },
      blindSpotMonitoring: { type: Boolean },
      laneDepartureWarning: { type: Boolean },
      collisionWarning: { type: Boolean },
      nightVision: { type: Boolean }
    },
    technology: {
      infotainmentSystem: { type: String },
      screenSize: { type: Number },
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
      soundSystem: { type: String },
      speakers: { type: Number },
      digitalKey: { type: Boolean, default: false },
      mobileApp: { type: Boolean, default: false },
      overTheAirUpdates: { type: Boolean, default: false },
      voiceControl: { type: Boolean, default: false },
      voiceAssistantName: { type: String },
      navigation: { type: String },
      headlightType: { type: String },
      driverAssistance: [{ type: String }]
    },
    warranty: {
      basic: { type: String },
      powertrain: { type: String },
      corrosion: { type: String },
      roadside: { type: String },
      maintenance: { type: String }
    },
    features: {
      safety: [{ type: String }],
      comfort: [{ type: String }],
      technology: [{ type: String }],
      exterior: [{ type: String }],
      interior: [{ type: String }]
    }
  },
  reviews: [{
    user: {
      id: { type: String },
      firstName: { type: String },
      lastName: { type: String }
    },
    rating: { type: Number },
    comment: { type: String },
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
