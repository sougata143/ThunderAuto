import mongoose, { Schema, Document } from 'mongoose'

export interface ICar extends Document {
  make: string
  model: string
  year: number
  price: number
  images: string[]
  rating: number
  engineType: string
  transmission: string
  power: number
  acceleration: number
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
    fuel: {
      tankCapacity: number
      fuelType: string
      fuelSystem: string
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

const CarSchema: Schema = new Schema({
  make: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  price: { type: Number, required: true },
  images: [{ type: String }],
  rating: { type: Number, default: 0 },
  engineType: { type: String, required: true },
  transmission: { type: String, required: true },
  power: { type: Number, required: true },
  acceleration: { type: Number, required: true },
  specs: {
    engine: {
      displacement: { type: Number, required: true },
      cylinders: { type: Number, required: true },
      configuration: { type: String, required: true },
      fuelInjection: { type: String, required: true },
      turbocharger: { type: Boolean, default: false },
      supercharger: { type: Boolean, default: false },
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
    fuel: {
      tankCapacity: { type: Number, required: true },
      fuelType: { type: String, required: true },
      fuelSystem: { type: String, required: true },
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
      abs: { type: Boolean, default: true },
      stabilityControl: { type: Boolean, default: true },
      tractionControl: { type: Boolean, default: true },
      parkingSensors: { type: Boolean, default: false },
      camera: { type: String, required: true },
      blindSpotMonitoring: { type: Boolean, default: false },
      laneDepartureWarning: { type: Boolean, default: false },
      collisionWarning: { type: Boolean, default: false },
      nightVision: { type: Boolean, default: false }
    },
    technology: {
      connectivity: [{ type: String }],
      smartphone: [{ type: String }],
      navigation: { type: String, required: true },
      headlightType: { type: String, required: true },
      adaptiveCruiseControl: { type: Boolean, default: false },
      keylessEntry: { type: Boolean, default: true },
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
      id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      name: { type: String, required: true }
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
    createdAt: { type: Date, default: Date.now }
  }]
})

// Add indexes for better query performance
CarSchema.index({ make: 1, model: 1, year: 1 })
CarSchema.index({ price: 1 })
CarSchema.index({ engineType: 1 })
CarSchema.index({ transmission: 1 })
CarSchema.index({ 'specs.engine.fuelType': 1 })

export const Car = mongoose.model<ICar>('Car', CarSchema)
