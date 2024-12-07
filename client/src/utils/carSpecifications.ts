interface Car {
  specs: {
    engine: any
    performance: any
    chassis: any
    dimensions: any
    fuel: any
    interior: any
    safety: any
    technology: any
    warranty: any
  }
}

export function getCarSpecifications(car: Car) {
  return [
    {
      title: 'Engine',
      items: [
        { label: 'Displacement', value: car.specs.engine.displacement, unit: 'cc' },
        { label: 'Cylinders', value: car.specs.engine.cylinders },
        { label: 'Configuration', value: car.specs.engine.configuration },
        { label: 'Fuel Injection', value: car.specs.engine.fuelInjection },
        { label: 'Turbocharger', value: car.specs.engine.turbocharger },
        { label: 'Supercharger', value: car.specs.engine.supercharger },
        { label: 'Compression Ratio', value: car.specs.engine.compression },
        { label: 'Valves per Cylinder', value: car.specs.engine.valvesPerCylinder },
      ],
    },
    {
      title: 'Performance',
      items: [
        { label: 'Power to Weight', value: car.specs.performance.powerToWeight, unit: 'kg/hp' },
        { label: 'Top Speed', value: car.specs.performance.topSpeed, unit: 'mph' },
        { label: '0-60 mph', value: car.specs.performance.acceleration060, unit: 'sec' },
        { label: '0-100 mph', value: car.specs.performance.acceleration0100, unit: 'sec' },
        { label: 'Quarter Mile', value: car.specs.performance.quarterMile, unit: 'sec' },
        { label: '60-0 Braking', value: car.specs.performance.brakingDistance60_0, unit: 'ft' },
      ],
    },
    {
      title: 'Chassis',
      items: [
        { label: 'Body Type', value: car.specs.chassis.bodyType },
        { label: 'Platform', value: car.specs.chassis.platform },
        { label: 'Front Suspension', value: car.specs.chassis.frontSuspension },
        { label: 'Rear Suspension', value: car.specs.chassis.rearSuspension },
        { label: 'Front Brakes', value: car.specs.chassis.frontBrakes },
        { label: 'Rear Brakes', value: car.specs.chassis.rearBrakes },
        { label: 'Wheel Size', value: car.specs.chassis.wheelSize },
        { label: 'Tire Size', value: car.specs.chassis.tireSize },
      ],
    },
    {
      title: 'Dimensions',
      items: [
        { label: 'Length', value: car.specs.dimensions.length, unit: 'mm' },
        { label: 'Width', value: car.specs.dimensions.width, unit: 'mm' },
        { label: 'Height', value: car.specs.dimensions.height, unit: 'mm' },
        { label: 'Wheelbase', value: car.specs.dimensions.wheelbase, unit: 'mm' },
        { label: 'Ground Clearance', value: car.specs.dimensions.groundClearance, unit: 'mm' },
        { label: 'Drag Coefficient', value: car.specs.dimensions.dragCoefficient },
        { label: 'Weight', value: car.specs.dimensions.weight, unit: 'kg' },
        { label: 'Weight Distribution', value: car.specs.dimensions.distribution },
      ],
    },
    {
      title: 'Fuel',
      items: [
        { label: 'Tank Capacity', value: car.specs.fuel.tankCapacity, unit: 'L' },
        { label: 'Fuel Type', value: car.specs.fuel.fuelType },
        { label: 'Fuel System', value: car.specs.fuel.fuelSystem },
        { label: 'City MPG', value: car.specs.fuel.cityMPG },
        { label: 'Highway MPG', value: car.specs.fuel.highwayMPG },
        { label: 'Combined MPG', value: car.specs.fuel.combinedMPG },
        { label: 'Emission Class', value: car.specs.fuel.emissionClass },
      ],
    },
    {
      title: 'Interior',
      items: [
        { label: 'Seating Capacity', value: car.specs.interior.seatingCapacity },
        { label: 'Doors', value: car.specs.interior.doors },
        { label: 'Trunk Capacity', value: car.specs.interior.trunkCapacity, unit: 'L' },
        { label: 'Infotainment Screen', value: car.specs.interior.infotainmentScreen },
        { label: 'Sound System', value: car.specs.interior.soundSystem },
        { label: 'Climate Zones', value: car.specs.interior.climateZones },
        { label: 'Upholstery Material', value: car.specs.interior.upholsteryMaterial },
      ],
    },
    {
      title: 'Safety',
      items: [
        { label: 'Airbags', value: car.specs.safety.airbags },
        { label: 'ABS', value: car.specs.safety.abs },
        { label: 'Stability Control', value: car.specs.safety.stabilityControl },
        { label: 'Traction Control', value: car.specs.safety.tractionControl },
        { label: 'Parking Sensors', value: car.specs.safety.parkingSensors },
        { label: 'Camera System', value: car.specs.safety.camera },
        { label: 'Blind Spot Monitoring', value: car.specs.safety.blindSpotMonitoring },
        { label: 'Lane Departure Warning', value: car.specs.safety.laneDepartureWarning },
        { label: 'Collision Warning', value: car.specs.safety.collisionWarning },
        { label: 'Night Vision', value: car.specs.safety.nightVision },
      ],
    },
    {
      title: 'Technology',
      items: [
        { label: 'Connectivity', value: car.specs.technology.connectivity },
        { label: 'Smartphone Integration', value: car.specs.technology.smartphone },
        { label: 'Navigation', value: car.specs.technology.navigation },
        { label: 'Headlights', value: car.specs.technology.headlightType },
        { label: 'Adaptive Cruise Control', value: car.specs.technology.adaptiveCruiseControl },
        { label: 'Keyless Entry', value: car.specs.technology.keylessEntry },
        { label: 'Start System', value: car.specs.technology.startSystem },
        { label: 'Driver Assistance', value: car.specs.technology.driverAssistance },
      ],
    },
    {
      title: 'Warranty',
      items: [
        { label: 'Basic', value: car.specs.warranty.basic },
        { label: 'Powertrain', value: car.specs.warranty.powertrain },
        { label: 'Corrosion', value: car.specs.warranty.corrosion },
        { label: 'Roadside Assistance', value: car.specs.warranty.roadside },
        { label: 'Maintenance', value: car.specs.warranty.maintenance },
      ],
    },
  ]
}
