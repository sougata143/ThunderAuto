import mongoose, { Document, Model } from 'mongoose'

export interface ICar extends mongoose.Document {
  make: string
  carModel: string
  year: number
  price: number
  images: {
    url: string
    isFeatured: boolean
    caption?: string
    uploadedBy: mongoose.Types.ObjectId
    uploadedAt: Date
  }[]
  rating: number
  engineType: string
  transmission: string
  power: number
  acceleration: number
  status: 'draft' | 'published' | 'archived'
  createdBy: mongoose.Types.ObjectId
  lastUpdatedBy: mongoose.Types.ObjectId
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
    }
    performance: {
      powerToWeight: number
      topSpeed: number
      acceleration060: number
      acceleration0100: number
      quarterMile: number
      brakingDistance60_0: number
    }
    chassis: {
      bodyType: string
      platform: string
      frontSuspension: string
      rearSuspension: string
      frontBrakes: string
      rearBrakes: string
      wheelSize: string
      tireSize: string
    }
    dimensions: {
      length: number
      width: number
      height: number
      wheelbase: number
      groundClearance: number
      dragCoefficient: number
      weight: number
      distribution: string
    }
    transmission: {
      type: string
      gears: number
      clutchType: string
      driveType: string
      differential: string
    }
    fuel: {
      fuelType: string
      fuelSystem: string
      tankCapacity: number
      cityMPG: number
      highwayMPG: number
      combinedMPG: number
      emissionClass: string
    }
    interior: {
      seatingCapacity: number
      doors: number
      trunkCapacity: number
      infotainmentScreen: string
      soundSystem: string
      climateZones: number
      upholsteryMaterial: string
    }
    safety: {
      airbags: string
      abs: boolean
      stabilityControl: boolean
      tractionControl: boolean
      parkingSensors: boolean
      camera: string
      blindSpotMonitoring: boolean
      laneDepartureWarning: boolean
      collisionWarning: boolean
      nightVision: boolean
    }
    technology: {
      connectivity: string[]
      smartphone: string[]
      navigation: string
      headlightType: string
      adaptiveCruiseControl: boolean
      keylessEntry: boolean
      startSystem: string
      driverAssistance: string[]
    }
    warranty: {
      basic: string
      powertrain: string
      corrosion: string
      roadside: string
      maintenance: string
    }
  }
  reviews: Array<{
    user: {
      id: string
      name: string
    }
    rating: number
    comment: string
    createdAt: Date
  }>
}

const carSchema = new mongoose.Schema({
  make: { type: String, required: true, index: true },
  carModel: { type: String, required: true, index: true },
  year: { type: Number, required: true, index: true },
  price: { type: Number, required: true },
  images: [{
    url: { type: String, required: true },
    isFeatured: { type: Boolean, default: false },
    caption: String,
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    uploadedAt: { type: Date, default: Date.now }
  }],
  rating: { type: Number, default: 0 },
  engineType: { type: String, required: true },
  transmission: { type: String, required: true },
  power: { type: Number, required: true },
  acceleration: { type: Number, required: true },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  specs: {
    engine: {
      displacement: { type: Number, required: true },
      cylinders: { type: Number, required: true },
      configuration: { type: String, required: true },
      fuelInjection: { type: String, required: true },
      turbocharger: { type: Boolean, required: true },
      supercharger: { type: Boolean, required: true },
      compression: { type: String, required: true },
      valvesPerCylinder: { type: Number, required: true }
    },
    performance: {
      powerToWeight: { type: Number, required: true },
      topSpeed: { type: Number, required: true },
      acceleration060: { type: Number, required: true },
      acceleration0100: { type: Number, required: true },
      quarterMile: { type: Number, required: true },
      brakingDistance60_0: { type: Number, required: true }
    },
    chassis: {
      bodyType: { type: String, required: true },
      platform: { type: String, required: true },
      frontSuspension: { type: String, required: true },
      rearSuspension: { type: String, required: true },
      frontBrakes: { type: String, required: true },
      rearBrakes: { type: String, required: true },
      wheelSize: { type: String, required: true },
      tireSize: { type: String, required: true }
    },
    dimensions: {
      length: { type: Number, required: true },
      width: { type: Number, required: true },
      height: { type: Number, required: true },
      wheelbase: { type: Number, required: true },
      groundClearance: { type: Number, required: true },
      dragCoefficient: { type: Number, required: true },
      weight: { type: Number, required: true },
      distribution: { type: String, required: true }
    },
    transmission: {
      type: { type: String, required: true },
      gears: { type: Number, required: true },
      clutchType: { type: String, required: true },
      driveType: { type: String, required: true },
      differential: { type: String, required: true }
    },
    fuel: {
      fuelType: { type: String, required: true },
      fuelSystem: { type: String, required: true },
      tankCapacity: { type: Number, required: true },
      cityMPG: { type: Number, required: true },
      highwayMPG: { type: Number, required: true },
      combinedMPG: { type: Number, required: true },
      emissionClass: { type: String, required: true }
    },
    interior: {
      seatingCapacity: { type: Number, required: true },
      doors: { type: Number, required: true },
      trunkCapacity: { type: Number, required: true },
      infotainmentScreen: { type: String, required: true },
      soundSystem: { type: String, required: true },
      climateZones: { type: Number, required: true },
      upholsteryMaterial: { type: String, required: true }
    },
    safety: {
      airbags: { type: String, required: true },
      abs: { type: Boolean, required: true },
      stabilityControl: { type: Boolean, required: true },
      tractionControl: { type: Boolean, required: true },
      parkingSensors: { type: Boolean, required: true },
      camera: { type: String, required: true },
      blindSpotMonitoring: { type: Boolean, required: true },
      laneDepartureWarning: { type: Boolean, required: true },
      collisionWarning: { type: Boolean, required: true },
      nightVision: { type: Boolean, required: true }
    },
    technology: {
      connectivity: [{ type: String }],
      smartphone: [{ type: String }],
      navigation: { type: String, required: true },
      headlightType: { type: String, required: true },
      adaptiveCruiseControl: { type: Boolean, required: true },
      keylessEntry: { type: Boolean, required: true },
      startSystem: { type: String, required: true },
      driverAssistance: [{ type: String }]
    },
    warranty: {
      basic: { type: String, required: true },
      powertrain: { type: String, required: true },
      corrosion: { type: String, required: true },
      roadside: { type: String, required: true },
      maintenance: { type: String, required: true }
    }
  },
  reviews: [{
    user: {
      id: { type: String, required: true },
      name: { type: String, required: true }
    },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
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
