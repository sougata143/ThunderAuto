import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@apollo/client'
import { CREATE_CAR, UPDATE_CAR, GET_CAR_BY_ID } from '../graphql/queries'
import { useAuth } from '../contexts/AuthContext'
import ImageUpload from '../components/ImageUpload'
import '../styles/automotive.css';

const defaultCarInput = {
  make: 'NA',
  carModel: 'NA',
  year: new Date().getFullYear(),
  price: 10000,  // Reasonable default price
  images: [],
  rating: 0,
  engineType: 'GASOLINE',
  transmission: 'AUTOMATIC',
  power: 100,  // Minimum reasonable power
  acceleration: 10,  // Reasonable default acceleration
  status: 'DRAFT',
  specs: {
    engine: {
      displacement: 1.0,  // Default 1.0L engine
      cylinders: 4,  // Standard 4-cylinder
      configuration: 'INLINE',
      fuelInjection: 'ELECTRONIC',
      turbocharger: false,
      supercharger: false,
      compression: '10:1',
      valvesPerCylinder: 4,
      valveSystem: 'DOHC',
      aspiration: 'NATURALLY_ASPIRATED',
      boostPressure: 0,
      redlineRpm: 6500,
      idleRpm: 750,
      position: 'FRONT',
      orientation: 'TRANSVERSE',
      type: 'INLINE',
      engineType: 'GASOLINE',
      powerOutput: 100
    },
    performance: {
      powerToWeightRatio: 0.1,
      topSpeed: 180,  // km/h
      acceleration060: 8.5,  // seconds
      acceleration0100: 10,  // seconds
      quarterMile: 16,  // seconds
      quarterMileSpeed: 140,  // km/h
      lateralG: 0.8,
      nurburgringTime: 'N/A',
      passingAcceleration: 5,
      elasticity: 3,
      launchControl: false,
      performanceMode: ['STANDARD'],
      brakingDistance: 40  // meters
    },
    chassis: {
      bodyType: 'SEDAN',
      platform: 'UNIBODY',
      frontSuspension: 'MACPHERSON_STRUT',
      rearSuspension: 'MULTI_LINK',
      frontBrakes: 'DISC',
      rearBrakes: 'DISC',
      wheelSize: '17',
      tireSize: '225/45R17'
    },
    dimensions: {
      length: 4500,  // mm
      width: 1800,   // mm
      height: 1450,  // mm
      wheelbase: 2700,  // mm
      groundClearance: 150,  // mm
      dragCoefficient: 0.3,
      weight: 1500,  // kg
      distribution: '50/50'
    },
    transmission: {
      type: 'AUTOMATIC',
      gears: 6,
      clutchType: 'AUTOMATIC', 
      driveType: 'FRONT_WHEEL_DRIVE', 
      differential: 'OPEN'
    },
    fuel: {
      fuelType: 'GASOLINE',
      fuelSystem: 'DIRECT_INJECTION',
      tankCapacity: 50,  // liters
      cityMPG: 25,
      highwayMPG: 35,
      combinedMPG: 30,
      emissionClass: 'EURO_6'
    },
    interior: {
      seatingCapacity: 5,
      doors: 4,
      trunkCapacity: 500,  // liters
      infotainmentScreen: '10.1',
      soundSystem: 'STANDARD',
      climateZones: 2,
      upholsteryMaterial: 'CLOTH'
    },
    safety: {
      airbags: '6',
      abs: true,
      stabilityControl: true,
      tractionControl: true,
      parkingSensors: false,
      camera: 'REAR_VIEW',
      blindSpotMonitoring: false,
      laneDepartureWarning: false,
      collisionWarning: false,
      nightVision: false
    },
    technology: {
      infotainmentSystem: 'BASIC',
      screenSize: 10,
      appleCarPlay: false,
      androidAuto: false,
      adaptiveCruiseControl: false,
      laneKeepAssist: false,
      blindSpotMonitoring: false,
      parkingAssist: false,
      nightVision: false,
      headUpDisplay: false,
      surroundViewCamera: false,
      bluetooth: true,
      wirelessCharging: false,
      wifi: false,
      soundSystem: 'STANDARD',
      speakers: 4,
      digitalKey: false,
      mobileApp: false,
      overTheAirUpdates: false,
      voiceControl: false,
      voiceAssistantName: 'NA',
      connectivity: {
        bluetooth: true,
        wirelessCharging: false,
        wifi: false,
        soundSystem: 'STANDARD',
        speakers: 4
      },
      navigation: 'BASIC',
      headlightType: 'LED',
      keylessEntry: false,
      startSystem: 'PUSH_BUTTON',
      driverAssistance: ['PARKING_SENSORS']
    },
    warranty: {
      basic: '3 YEARS/36,000 MILES',
      powertrain: '5 YEARS/60,000 MILES',
      corrosion: '5 YEARS/UNLIMITED MILES',
      roadside: '3 YEARS/36,000 MILES',
      maintenance: '1 YEAR/12,000 MILES'
    },
    features: {
      comfort: ['AIR_CONDITIONING', 'POWER_WINDOWS'],
      safety: ['SEATBELTS', 'CHILD_SAFETY_LOCKS'],
      performance: ['SPORT_MODE'],
      technology: ['BLUETOOTH_CONNECTIVITY'],
      exterior: ['ALLOY_WHEELS'],
      interior: ['FABRIC_SEATS']
    }
  }
}

export default function AdminCarForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [carInput, setCarInput] = useState(defaultCarInput)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('basic')

  const { loading: loadingCar, data: carData } = useQuery(GET_CAR_BY_ID, {
    variables: { id },
    skip: !id
  })

  const [createCar, { loading: creatingCar }] = useMutation(CREATE_CAR, {
    onCompleted: () => navigate('/admin/cars'),
    onError: (error) => setError(error.message)
  })

  const [updateCar, { loading: updatingCar }] = useMutation(UPDATE_CAR, {
    onCompleted: () => navigate('/admin/cars'),
    onError: (error) => setError(error.message)
  })

  useEffect(() => {
    if (carData?.car) {
      setCarInput(carData.car)
    }
  }, [carData])

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Access denied. Admin privileges required.</p>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (id) {
        await updateCar({
          variables: {
            id,
            input: carInput
          }
        })
      } else {
        await createCar({
          variables: {
            input: carInput
          }
        })
      }
    } catch (error) {
      console.error('Error saving car:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const path = name.split('.')
    
    setCarInput((prev) => {
      const newInput = { ...prev }
      let current: any = newInput
      
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]]
      }
      
      const finalKey = path[path.length - 1]
      if (type === 'number' || type === 'range') {
        current[finalKey] = parseFloat(value)
      } else if (type === 'checkbox') {
        current[finalKey] = (e.target as HTMLInputElement).checked
      } else if (type === 'select-multiple') {
        current[finalKey] = Array.from((e.target as HTMLSelectElement).selectedOptions).map(opt => opt.value)
      } else {
        current[finalKey] = value
      }
      
      return newInput
    })
  }

  const handleImagesChange = (images: Array<{ url: string; isFeatured: boolean; caption: string }>) => {
    setCarInput(prev => ({
      ...prev,
      images
    }))
  }

  if (loadingCar) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
      </div>
    )
  }

  const tabs = [
    { id: 'basic', name: 'Basic Info' },
    { id: 'images', name: 'Images' },
    { id: 'engine', name: 'Engine' },
    { id: 'performance', name: 'Performance' },
    { id: 'chassis', name: 'Chassis' },
    { id: 'dimensions', name: 'Dimensions' },
    { id: 'transmission', name: 'Transmission' },
    { id: 'fuel', name: 'Fuel' },
    { id: 'interior', name: 'Interior' },
    { id: 'safety', name: 'Safety' },
    { id: 'technology', name: 'Technology' },
    { id: 'features', name: 'Features' },
    { id: 'warranty', name: 'Warranty' }
  ]

  const TechnologyForm = ({ formData, setFormData }: any) => {
    return (
      <div className="spec-section">
        <div className="spec-header">
          <h3>Technology Features</h3>
        </div>
        <div className="spec-grid">
          {/* Infotainment */}
          <div className="spec-card p-4">
            <h4 className="text-lg font-semibold mb-4">Infotainment</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Infotainment System</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.specs.technology.infotainmentSystem || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    specs: {
                      ...formData.specs,
                      technology: {
                        ...formData.specs.technology,
                        infotainmentSystem: e.target.value
                      }
                    }
                  })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Screen Size (inches)</label>
                <input
                  type="number"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.specs.technology.screenSize || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    specs: {
                      ...formData.specs,
                      technology: {
                        ...formData.specs.technology,
                        screenSize: parseFloat(e.target.value)
                      }
                    }
                  })}
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={formData.specs.technology.appleCarPlay || false}
                    onChange={(e) => setFormData({
                      ...formData,
                      specs: {
                        ...formData.specs,
                        technology: {
                          ...formData.specs.technology,
                          appleCarPlay: e.target.checked
                        }
                      }
                    })}
                  />
                  <span>Apple CarPlay</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={formData.specs.technology.androidAuto || false}
                    onChange={(e) => setFormData({
                      ...formData,
                      specs: {
                        ...formData.specs,
                        technology: {
                          ...formData.specs.technology,
                          androidAuto: e.target.checked
                        }
                      }
                    })}
                  />
                  <span>Android Auto</span>
                </label>
              </div>
            </div>
          </div>

          {/* Driver Assistance */}
          <div className="spec-card p-4">
            <h4 className="text-lg font-semibold mb-4">Driver Assistance</h4>
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: 'adaptiveCruiseControl', label: 'Adaptive Cruise Control' },
                { key: 'laneKeepAssist', label: 'Lane Keep Assist' },
                { key: 'blindSpotMonitoring', label: 'Blind Spot Monitoring' },
                { key: 'parkingAssist', label: 'Parking Assist' },
                { key: 'nightVision', label: 'Night Vision' },
                { key: 'headUpDisplay', label: 'Head-Up Display' },
                { key: 'surroundViewCamera', label: '360° Camera' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={formData.specs.technology[key] || false}
                    onChange={(e) => setFormData({
                      ...formData,
                      specs: {
                        ...formData.specs,
                        technology: {
                          ...formData.specs.technology,
                          [key]: e.target.checked
                        }
                      }
                    })}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Connectivity */}
          <div className="spec-card p-4">
            <h4 className="text-lg font-semibold mb-4">Connectivity</h4>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: 'bluetooth', label: 'Bluetooth' },
                  { key: 'wirelessCharging', label: 'Wireless Charging' },
                  { key: 'wifi', label: 'Wi-Fi Hotspot' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={formData.specs.technology.connectivity[key] || false}
                      onChange={(e) => setFormData({
                        ...formData,
                        specs: {
                          ...formData.specs,
                          technology: {
                            ...formData.specs.technology,
                            connectivity: {
                              ...formData.specs.technology.connectivity,
                              [key]: e.target.checked
                            }
                          }
                        }
                      })}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium">Sound System</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.specs.technology.soundSystem || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    specs: {
                      ...formData.specs,
                      technology: {
                        ...formData.specs.technology,
                        soundSystem: e.target.value
                      }
                    }
                  })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Number of Speakers</label>
                <input
                  type="number"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.specs.technology.speakers || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    specs: {
                      ...formData.specs,
                      technology: {
                        ...formData.specs.technology,
                        speakers: parseInt(e.target.value)
                      }
                    }
                  })}
                />
              </div>
            </div>
          </div>

          {/* Digital Experience */}
          <div className="spec-card p-4">
            <h4 className="text-lg font-semibold mb-4">Digital Experience</h4>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: 'digitalKey', label: 'Digital Key' },
                  { key: 'mobileApp', label: 'Mobile App' },
                  { key: 'overTheAirUpdates', label: 'Over-the-Air Updates' },
                  { key: 'voiceControl', label: 'Voice Control' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={formData.specs.technology[key] || false}
                      onChange={(e) => setFormData({
                        ...formData,
                        specs: {
                          ...formData.specs,
                          technology: {
                            ...formData.specs.technology,
                            [key]: e.target.checked
                          }
                        }
                      })}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium">Voice Assistant Name</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.specs.technology.voiceAssistantName || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    specs: {
                      ...formData.specs,
                      technology: {
                        ...formData.specs.technology,
                        voiceAssistantName: e.target.value
                      }
                    }
                  })}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">
            {id ? 'Edit Car' : 'Add New Car'}
          </h1>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="mt-8">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium
                  ${activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }
                `}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-8">
          {/* Basic Info Tab */}
          <div className={activeTab === 'basic' ? '' : 'hidden'}>
            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="make" className="block text-sm font-medium text-gray-700">
                  Make
                </label>
                <input
                  type="text"
                  name="make"
                  id="make"
                  value={carInput.make}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="carModel" className="block text-sm font-medium text-gray-700">
                  Model
                </label>
                <input
                  type="text"
                  name="carModel"
                  id="carModel"
                  value={carInput.carModel}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div className="col-span-6 sm:col-span-2">
                <label htmlFor="year" className="block text-sm font-medium text-gray-700">
                  Year
                </label>
                <input
                  type="number"
                  name="year"
                  id="year"
                  value={carInput.year}
                  onChange={handleInputChange}
                  required
                  min="1900"
                  max="2100"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div className="col-span-6 sm:col-span-2">
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                  Price
                </label>
                <input
                  type="number"
                  name="price"
                  id="price"
                  value={carInput.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div className="col-span-6 sm:col-span-2">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  name="status"
                  id="status"
                  value={carInput.status}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
            </div>
          </div>

          {/* Images Tab */}
          <div className={activeTab === 'images' ? '' : 'hidden'}>
            <ImageUpload
              images={carInput.images}
              onImagesChange={handleImagesChange}
            />
          </div>

          {/* Engine Tab */}
          <div className={activeTab === 'engine' ? '' : 'hidden'}>
            <div className="space-y-4">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-2">
                  <label htmlFor="specs.engine.displacement" className="block text-sm font-medium text-gray-700">
                    Displacement (cc)
                  </label>
                  <input
                    type="number"
                    name="specs.engine.displacement"
                    id="specs.engine.displacement"
                    value={carInput.specs.engine.displacement}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="col-span-6 sm:col-span-2">
                  <label htmlFor="specs.engine.cylinders" className="block text-sm font-medium text-gray-700">
                    Cylinders
                  </label>
                  <input
                    type="number"
                    name="specs.engine.cylinders"
                    id="specs.engine.cylinders"
                    value={carInput.specs.engine.cylinders}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="col-span-6 sm:col-span-2">
                  <label htmlFor="specs.engine.powerOutput" className="block text-sm font-medium text-gray-700">
                    Power Output (HP)
                  </label>
                  <input
                    type="number"
                    name="specs.engine.powerOutput"
                    id="specs.engine.powerOutput"
                    value={carInput.specs.engine.powerOutput}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="col-span-6 sm:col-span-2">
                  <label htmlFor="specs.engine.torque" className="block text-sm font-medium text-gray-700">
                    Torque (Nm)
                  </label>
                  <input
                    type="number"
                    name="specs.engine.torque"
                    id="specs.engine.torque"
                    value={carInput.specs.engine.torque}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="col-span-6 sm:col-span-2">
                  <label htmlFor="specs.engine.compressionRatio" className="block text-sm font-medium text-gray-700">
                    Compression Ratio
                  </label>
                  <input
                    type="number"
                    name="specs.engine.compressionRatio"
                    id="specs.engine.compressionRatio"
                    value={carInput.specs.engine.compressionRatio}
                    onChange={handleInputChange}
                    step="0.1"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="col-span-6 sm:col-span-2">
                  <label htmlFor="specs.engine.bore" className="block text-sm font-medium text-gray-700">
                    Bore (mm)
                  </label>
                  <input
                    type="number"
                    name="specs.engine.bore"
                    id="specs.engine.bore"
                    value={carInput.specs.engine.bore}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="col-span-6 sm:col-span-2">
                  <label htmlFor="specs.engine.stroke" className="block text-sm font-medium text-gray-700">
                    Stroke (mm)
                  </label>
                  <input
                    type="number"
                    name="specs.engine.stroke"
                    id="specs.engine.stroke"
                    value={carInput.specs.engine.stroke}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="col-span-6 sm:col-span-2">
                  <label htmlFor="specs.engine.valveSystem" className="block text-sm font-medium text-gray-700">
                    Valve System
                  </label>
                  <select
                    name="specs.engine.valveSystem"
                    id="specs.engine.valveSystem"
                    value={carInput.specs.engine.valveSystem}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="">Select Valve System</option>
                    <option value="sohc">SOHC</option>
                    <option value="dohc">DOHC</option>
                    <option value="ohv">OHV</option>
                    <option value="vvt">VVT</option>
                  </select>
                </div>

                <div className="col-span-6 sm:col-span-2">
                  <label htmlFor="specs.engine.valvesPerCylinder" className="block text-sm font-medium text-gray-700">
                    Valves per Cylinder
                  </label>
                  <input
                    type="number"
                    name="specs.engine.valvesPerCylinder"
                    id="specs.engine.valvesPerCylinder"
                    value={carInput.specs.engine.valvesPerCylinder}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="col-span-6 sm:col-span-2">
                  <label htmlFor="specs.engine.fuelInjection" className="block text-sm font-medium text-gray-700">
                    Fuel Injection
                  </label>
                  <select
                    name="specs.engine.fuelInjection"
                    id="specs.engine.fuelInjection"
                    value={carInput.specs.engine.fuelInjection}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="">Select Fuel Injection</option>
                    <option value="direct">Direct Injection</option>
                    <option value="port">Port Injection</option>
                    <option value="sequential">Sequential</option>
                    <option value="multipoint">Multipoint</option>
                  </select>
                </div>

                <div className="col-span-6 sm:col-span-2">
                  <label htmlFor="specs.engine.aspiration" className="block text-sm font-medium text-gray-700">
                    Aspiration
                  </label>
                  <select
                    name="specs.engine.aspiration"
                    id="specs.engine.aspiration"
                    value={carInput.specs.engine.aspiration}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="">Select Aspiration</option>
                    <option value="natural">Naturally Aspirated</option>
                    <option value="turbo">Turbocharged</option>
                    <option value="supercharged">Supercharged</option>
                    <option value="twinturbo">Twin-Turbo</option>
                  </select>
                </div>

                <div className="col-span-6 sm:col-span-2">
                  <label htmlFor="specs.engine.boostPressure" className="block text-sm font-medium text-gray-700">
                    Boost Pressure (bar)
                  </label>
                  <input
                    type="number"
                    name="specs.engine.boostPressure"
                    id="specs.engine.boostPressure"
                    value={carInput.specs.engine.boostPressure}
                    onChange={handleInputChange}
                    step="0.1"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="col-span-6 sm:col-span-2">
                  <label htmlFor="specs.engine.redlineRpm" className="block text-sm font-medium text-gray-700">
                    Redline RPM
                  </label>
                  <input
                    type="number"
                    name="specs.engine.redlineRpm"
                    id="specs.engine.redlineRpm"
                    value={carInput.specs.engine.redlineRpm}
                    onChange={handleInputChange}
                    step="100"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="col-span-6 sm:col-span-2">
                  <label htmlFor="specs.engine.idleRpm" className="block text-sm font-medium text-gray-700">
                    Idle RPM
                  </label>
                  <input
                    type="number"
                    name="specs.engine.idleRpm"
                    id="specs.engine.idleRpm"
                    value={carInput.specs.engine.idleRpm}
                    onChange={handleInputChange}
                    step="50"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="col-span-6 sm:col-span-2">
                  <label htmlFor="specs.engine.position" className="block text-sm font-medium text-gray-700">
                    Engine Position
                  </label>
                  <select
                    name="specs.engine.position"
                    id="specs.engine.position"
                    value={carInput.specs.engine.position}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="">Select Position</option>
                    <option value="front">Front</option>
                    <option value="mid">Mid</option>
                    <option value="rear">Rear</option>
                  </select>
                </div>

                <div className="col-span-6 sm:col-span-2">
                  <label htmlFor="specs.engine.orientation" className="block text-sm font-medium text-gray-700">
                    Engine Orientation
                  </label>
                  <select
                    name="specs.engine.orientation"
                    id="specs.engine.orientation"
                    value={carInput.specs.engine.orientation}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="">Select Orientation</option>
                    <option value="longitudinal">Longitudinal</option>
                    <option value="transverse">Transverse</option>
                  </select>
                </div>

                <div className="col-span-6 sm:col-span-2">
                  <label htmlFor="specs.engine.type" className="block text-sm font-medium text-gray-700">
                    Engine Type
                  </label>
                  <select
                    name="specs.engine.type"
                    id="specs.engine.type"
                    value={carInput.specs.engine.type}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="INLINE">Inline</option>
                    <option value="V">V-Type</option>
                    <option value="BOXER">Boxer</option>
                    <option value="ROTARY">Rotary</option>
                    <option value="ELECTRIC">Electric</option>
                    <option value="HYBRID">Hybrid</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Tab */}
          <div className={activeTab === 'performance' ? '' : 'hidden'}>
            <div className="space-y-4">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-2">
                  <label htmlFor="specs.performance.powerToWeightRatio" className="block text-sm font-medium text-gray-700">
                    Power to Weight Ratio (hp/ton)
                  </label>
                  <input
                    type="number"
                    name="specs.performance.powerToWeightRatio"
                    id="specs.performance.powerToWeightRatio"
                    value={carInput.specs.performance.powerToWeightRatio}
                    onChange={handleInputChange}
                    step="0.1"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="col-span-6 sm:col-span-2">
                  <label htmlFor="specs.performance.topSpeed" className="block text-sm font-medium text-gray-700">
                    Top Speed (km/h)
                  </label>
                  <input
                    type="number"
                    name="specs.performance.topSpeed"
                    id="specs.performance.topSpeed"
                    value={carInput.specs.performance.topSpeed}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="col-span-6 sm:col-span-2">
                  <label htmlFor="specs.performance.brakingDistance" className="block text-sm font-medium text-gray-700">
                    Braking 100-0 km/h (meters)
                  </label>
                  <input
                    type="number"
                    name="specs.performance.brakingDistance"
                    id="specs.performance.brakingDistance"
                    value={carInput.specs.performance.brakingDistance}
                    onChange={handleInputChange}
                    step="0.1"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="col-span-6 sm:col-span-2">
                  <label htmlFor="specs.performance.acceleration060" className="block text-sm font-medium text-gray-700">
                    0-60 mph (seconds)
                  </label>
                  <input
                    type="number"
                    name="specs.performance.acceleration060"
                    id="specs.performance.acceleration060"
                    value={carInput.specs.performance.acceleration060}
                    onChange={handleInputChange}
                    step="0.1"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="col-span-6 sm:col-span-2">
                  <label htmlFor="specs.performance.acceleration0100" className="block text-sm font-medium text-gray-700">
                    0-100 km/h (seconds)
                  </label>
                  <input
                    type="number"
                    name="specs.performance.acceleration0100"
                    id="specs.performance.acceleration0100"
                    value={carInput.specs.performance.acceleration0100}
                    onChange={handleInputChange}
                    step="0.1"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="col-span-6 sm:col-span-2">
                  <label htmlFor="specs.performance.quarterMile" className="block text-sm font-medium text-gray-700">
                    Quarter Mile Time (seconds)
                  </label>
                  <input
                    type="number"
                    name="specs.performance.quarterMile"
                    id="specs.performance.quarterMile"
                    value={carInput.specs.performance.quarterMile}
                    onChange={handleInputChange}
                    step="0.1"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="col-span-6 sm:col-span-2">
                  <label htmlFor="specs.performance.quarterMileSpeed" className="block text-sm font-medium text-gray-700">
                    Quarter Mile Speed (km/h)
                  </label>
                  <input
                    type="number"
                    name="specs.performance.quarterMileSpeed"
                    id="specs.performance.quarterMileSpeed"
                    value={carInput.specs.performance.quarterMileSpeed}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="col-span-6 sm:col-span-2">
                  <label htmlFor="specs.performance.lateralG" className="block text-sm font-medium text-gray-700">
                    Lateral G-Force
                  </label>
                  <input
                    type="number"
                    name="specs.performance.lateralG"
                    id="specs.performance.lateralG"
                    value={carInput.specs.performance.lateralG}
                    onChange={handleInputChange}
                    step="0.01"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="col-span-6 sm:col-span-2">
                  <label htmlFor="specs.performance.nurburgringTime" className="block text-sm font-medium text-gray-700">
                    Nürburgring Lap Time
                  </label>
                  <input
                    type="text"
                    name="specs.performance.nurburgringTime"
                    id="specs.performance.nurburgringTime"
                    value={carInput.specs.performance.nurburgringTime}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="col-span-6 sm:col-span-2">
                  <label htmlFor="specs.performance.passingAcceleration" className="block text-sm font-medium text-gray-700">
                    50-75 mph (seconds)
                  </label>
                  <input
                    type="number"
                    name="specs.performance.passingAcceleration"
                    id="specs.performance.passingAcceleration"
                    value={carInput.specs.performance.passingAcceleration}
                    onChange={handleInputChange}
                    step="0.1"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="col-span-6 sm:col-span-2">
                  <label htmlFor="specs.performance.elasticity" className="block text-sm font-medium text-gray-700">
                    80-120 km/h (seconds)
                  </label>
                  <input
                    type="number"
                    name="specs.performance.elasticity"
                    id="specs.performance.elasticity"
                    value={carInput.specs.performance.elasticity}
                    onChange={handleInputChange}
                    step="0.1"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="col-span-6 sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Launch Control
                  </label>
                  <div className="mt-2">
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        name="specs.performance.launchControl"
                        id="specs.performance.launchControl"
                        checked={carInput.specs.performance.launchControl}
                        onChange={handleInputChange}
                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                      <span className="ml-2">Available</span>
                    </label>
                  </div>
                </div>

                <div className="col-span-6 sm:col-span-2">
                  <label htmlFor="specs.performance.performanceMode" className="block text-sm font-medium text-gray-700">
                    Performance Modes
                  </label>
                  <select
                    name="specs.performance.performanceMode"
                    id="specs.performance.performanceMode"
                    value={carInput.specs.performance.performanceMode}
                    onChange={handleInputChange}
                    multiple
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="eco">Eco</option>
                    <option value="normal">Normal</option>
                    <option value="sport">Sport</option>
                    <option value="sport_plus">Sport+</option>
                    <option value="race">Race</option>
                    <option value="individual">Individual</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Chassis Tab */}
          <div className={activeTab === 'chassis' ? '' : 'hidden'}>
            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-2">
                <label htmlFor="specs.chassis.bodyType" className="block text-sm font-medium text-gray-700">
                  Body Type
                </label>
                <select
                  name="specs.chassis.bodyType"
                  id="specs.chassis.bodyType"
                  value={carInput.specs.chassis.bodyType}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">Select Body Type</option>
                  <option value="SEDAN">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="COUPE">Coupe</option>
                  <option value="CONVERTIBLE">Convertible</option>
                  <option value="HATCHBACK">Hatchback</option>
                  <option value="WAGON">Wagon</option>
                  <option value="VAN">Van</option>
                  <option value="TRUCK">Truck</option>
                </select>
              </div>

              <div className="col-span-6 sm:col-span-2">
                <label htmlFor="specs.chassis.platform" className="block text-sm font-medium text-gray-700">
                  Platform
                </label>
                <input
                  type="text"
                  name="specs.chassis.platform"
                  id="specs.chassis.platform"
                  value={carInput.specs.chassis.platform}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div className="col-span-6 sm:col-span-2">
                <label htmlFor="specs.chassis.frontSuspension" className="block text-sm font-medium text-gray-700">
                  Front Suspension
                </label>
                <select
                  name="specs.chassis.frontSuspension"
                  id="specs.chassis.frontSuspension"
                  value={carInput.specs.chassis.frontSuspension}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">Select Front Suspension</option>
                  <option value="MACPHERSON">MacPherson Strut</option>
                  <option value="DOUBLE_WISHBONE">Double Wishbone</option>
                  <option value="MULTI_LINK">Multi-Link</option>
                  <option value="AIR_SUSPENSION">Air Suspension</option>
                  <option value="LEAF_SPRING">Leaf Spring</option>
                </select>
              </div>

              <div className="col-span-6 sm:col-span-2">
                <label htmlFor="specs.chassis.rearSuspension" className="block text-sm font-medium text-gray-700">
                  Rear Suspension
                </label>
                <select
                  name="specs.chassis.rearSuspension"
                  id="specs.chassis.rearSuspension"
                  value={carInput.specs.chassis.rearSuspension}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">Select Rear Suspension</option>
                  <option value="MULTI_LINK">Multi-Link</option>
                  <option value="TORSION_BEAM">Torsion Beam</option>
                  <option value="DOUBLE_WISHBONE">Double Wishbone</option>
                  <option value="AIR_SUSPENSION">Air Suspension</option>
                  <option value="LEAF_SPRING">Leaf Spring</option>
                </select>
              </div>

              <div className="col-span-6 sm:col-span-2">
                <label htmlFor="specs.chassis.frontBrakes" className="block text-sm font-medium text-gray-700">
                  Front Brakes
                </label>
                <select
                  name="specs.chassis.frontBrakes"
                  id="specs.chassis.frontBrakes"
                  value={carInput.specs.chassis.frontBrakes}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">Select Front Brakes</option>
                  <option value="VENTILATED_DISC">Ventilated Disc</option>
                  <option value="SOLID_DISC">Solid Disc</option>
                  <option value="CARBON_CERAMIC">Carbon Ceramic</option>
                  <option value="DRUM">Drum</option>
                </select>
              </div>

              <div className="col-span-6 sm:col-span-2">
                <label htmlFor="specs.chassis.rearBrakes" className="block text-sm font-medium text-gray-700">
                  Rear Brakes
                </label>
                <select
                  name="specs.chassis.rearBrakes"
                  id="specs.chassis.rearBrakes"
                  value={carInput.specs.chassis.rearBrakes}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">Select Rear Brakes</option>
                  <option value="VENTILATED_DISC">Ventilated Disc</option>
                  <option value="SOLID_DISC">Solid Disc</option>
                  <option value="CARBON_CERAMIC">Carbon Ceramic</option>
                  <option value="DRUM">Drum</option>
                </select>
              </div>

              <div className="col-span-6 sm:col-span-2">
                <label htmlFor="specs.chassis.wheelSize" className="block text-sm font-medium text-gray-700">
                  Wheel Size (inches)
                </label>
                <input
                  type="text"
                  name="specs.chassis.wheelSize"
                  id="specs.chassis.wheelSize"
                  value={carInput.specs.chassis.wheelSize}
                  onChange={handleInputChange}
                  placeholder="e.g., 19"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div className="col-span-6 sm:col-span-2">
                <label htmlFor="specs.chassis.tireSize" className="block text-sm font-medium text-gray-700">
                  Tire Size
                </label>
                <input
                  type="text"
                  name="specs.chassis.tireSize"
                  id="specs.chassis.tireSize"
                  value={carInput.specs.chassis.tireSize}
                  onChange={handleInputChange}
                  placeholder="e.g., 245/45R19"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Dimensions Tab */}
          <div className={activeTab === 'dimensions' ? '' : 'hidden'}>
            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-2">
                <label htmlFor="specs.dimensions.length" className="block text-sm font-medium text-gray-700">
                  Length (mm)
                </label>
                <input
                  type="number"
                  name="specs.dimensions.length"
                  id="specs.dimensions.length"
                  value={carInput.specs.dimensions.length}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div className="col-span-6 sm:col-span-2">
                <label htmlFor="specs.dimensions.width" className="block text-sm font-medium text-gray-700">
                  Width (mm)
                </label>
                <input
                  type="number"
                  name="specs.dimensions.width"
                  id="specs.dimensions.width"
                  value={carInput.specs.dimensions.width}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div className="col-span-6 sm:col-span-2">
                <label htmlFor="specs.dimensions.height" className="block text-sm font-medium text-gray-700">
                  Height (mm)
                </label>
                <input
                  type="number"
                  name="specs.dimensions.height"
                  id="specs.dimensions.height"
                  value={carInput.specs.dimensions.height}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div className="col-span-6 sm:col-span-2">
                <label htmlFor="specs.dimensions.wheelbase" className="block text-sm font-medium text-gray-700">
                  Wheelbase (mm)
                </label>
                <input
                  type="number"
                  name="specs.dimensions.wheelbase"
                  id="specs.dimensions.wheelbase"
                  value={carInput.specs.dimensions.wheelbase}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div className="col-span-6 sm:col-span-2">
                <label htmlFor="specs.dimensions.groundClearance" className="block text-sm font-medium text-gray-700">
                  Ground Clearance (mm)
                </label>
                <input
                  type="number"
                  name="specs.dimensions.groundClearance"
                  id="specs.dimensions.groundClearance"
                  value={carInput.specs.dimensions.groundClearance}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div className="col-span-6 sm:col-span-2">
                <label htmlFor="specs.dimensions.dragCoefficient" className="block text-sm font-medium text-gray-700">
                  Drag Coefficient
                </label>
                <input
                  type="number"
                  name="specs.dimensions.dragCoefficient"
                  id="specs.dimensions.dragCoefficient"
                  value={carInput.specs.dimensions.dragCoefficient}
                  onChange={handleInputChange}
                  step="0.01"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div className="col-span-6 sm:col-span-2">
                <label htmlFor="specs.dimensions.weight" className="block text-sm font-medium text-gray-700">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  name="specs.dimensions.weight"
                  id="specs.dimensions.weight"
                  value={carInput.specs.dimensions.weight}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div className="col-span-6 sm:col-span-2">
                <label htmlFor="specs.dimensions.distribution" className="block text-sm font-medium text-gray-700">
                  Weight Distribution (Front/Rear)
                </label>
                <input
                  type="text"
                  name="specs.dimensions.distribution"
                  id="specs.dimensions.distribution"
                  value={carInput.specs.dimensions.distribution}
                  onChange={handleInputChange}
                  placeholder="e.g., 50/50"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Transmission Tab */}
          <div className={activeTab === 'transmission' ? '' : 'hidden'}>
            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-2">
                <label htmlFor="specs.transmission.type" className="block text-sm font-medium text-gray-700">
                  Transmission Type
                </label>
                <select
                  name="specs.transmission.type"
                  id="specs.transmission.type"
                  value={carInput.specs.transmission.type}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">Select Type</option>
                  <option value="MANUAL">Manual</option>
                  <option value="AUTOMATIC">Automatic</option>
                  <option value="DCT">Dual-Clutch (DCT)</option>
                  <option value="CVT">CVT</option>
                  <option value="SEQUENTIAL">Sequential</option>
                  <option value="AMT">Automated Manual (AMT)</option>
                </select>
              </div>

              <div className="col-span-6 sm:col-span-2">
                <label htmlFor="specs.transmission.gears" className="block text-sm font-medium text-gray-700">
                  Number of Gears
                </label>
                <input
                  type="number"
                  name="specs.transmission.gears"
                  id="specs.transmission.gears"
                  value={carInput.specs.transmission.gears}
                  onChange={handleInputChange}
                  min="1"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div className="col-span-6 sm:col-span-2">
                <label htmlFor="specs.transmission.clutchType" className="block text-sm font-medium text-gray-700">
                  Clutch Type
                </label>
                <select
                  name="specs.transmission.clutchType"
                  id="specs.transmission.clutchType"
                  value={carInput.specs.transmission.clutchType}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">Select Clutch Type</option>
                  <option value="SINGLE_PLATE">Single Plate</option>
                  <option value="MULTI_PLATE">Multi-Plate</option>
                  <option value="DUAL_MASS">Dual Mass Flywheel</option>
                  <option value="TORQUE_CONVERTER">Torque Converter</option>
                  <option value="AUTOMATIC">Automatic</option>
                </select>
              </div>

              <div className="col-span-6 sm:col-span-2">
                <label htmlFor="specs.transmission.driveType" className="block text-sm font-medium text-gray-700">
                  Drive Type
                </label>
                <select
                  name="specs.transmission.driveType"
                  id="specs.transmission.driveType"
                  value={carInput.specs.transmission.driveType}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">Select Drive Type</option>
                  <option value="FRONT_WHEEL_DRIVE">Front-Wheel Drive (FWD)</option>
                  <option value="REAR_WHEEL_DRIVE">Rear-Wheel Drive (RWD)</option>
                  <option value="ALL_WHEEL_DRIVE">All-Wheel Drive (AWD)</option>
                  <option value="FOUR_WHEEL_DRIVE">Four-Wheel Drive (4WD)</option>
                </select>
              </div>

              <div className="col-span-6 sm:col-span-2">
                <label htmlFor="specs.transmission.differential" className="block text-sm font-medium text-gray-700">
                  Differential Type
                </label>
                <select
                  name="specs.transmission.differential"
                  id="specs.transmission.differential"
                  value={carInput.specs.transmission.differential}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">Select Differential</option>
                  <option value="OPEN">Open</option>
                  <option value="LIMITED_SLIP">Limited Slip (LSD)</option>
                  <option value="TORQUE_VECTORING">Torque Vectoring</option>
                  <option value="ELECTRONIC_LSD">Electronic LSD</option>
                </select>
              </div>
            </div>
          </div>

          {/* Fuel Tab */}
          <div className={activeTab === 'fuel' ? '' : 'hidden'}>
            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-2">
                <label htmlFor="specs.fuel.fuelType" className="block text-sm font-medium text-gray-700">
                  Fuel Type
                </label>
                <select
                  name="specs.fuel.fuelType"
                  id="specs.fuel.fuelType"
                  value={carInput.specs.fuel.fuelType}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">Select Fuel Type</option>
                  <option value="GASOLINE">Gasoline</option>
                  <option value="DIESEL">Diesel</option>
                  <option value="ELECTRIC">Electric</option>
                  <option value="HYBRID">Hybrid</option>
                  <option value="PLUG_IN_HYBRID">Plug-in Hybrid</option>
                  <option value="HYDROGEN">Hydrogen</option>
                </select>
              </div>

              <div className="col-span-6 sm:col-span-2">
                <label htmlFor="specs.fuel.fuelSystem" className="block text-sm font-medium text-gray-700">
                  Fuel System
                </label>
                <select
                  name="specs.fuel.fuelSystem"
                  id="specs.fuel.fuelSystem"
                  value={carInput.specs.fuel.fuelSystem}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">Select Fuel System</option>
                  <option value="DIRECT_INJECTION">Direct Injection</option>
                  <option value="PORT_INJECTION">Port Injection</option>
                  <option value="CARBURETOR">Carburetor</option>
                  <option value="COMMON_RAIL">Common Rail</option>
                </select>
              </div>

              <div className="col-span-6 sm:col-span-2">
                <label htmlFor="specs.fuel.tankCapacity" className="block text-sm font-medium text-gray-700">
                  Fuel Tank Capacity (L)
                </label>
                <input
                  type="number"
                  name="specs.fuel.tankCapacity"
                  id="specs.fuel.tankCapacity"
                  value={carInput.specs.fuel.tankCapacity}
                  onChange={handleInputChange}
                  step="0.1"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div className="col-span-6 sm:col-span-2">
                <label htmlFor="specs.fuel.cityMPG" className="block text-sm font-medium text-gray-700">
                  City MPG
                </label>
                <input
                  type="number"
                  name="specs.fuel.cityMPG"
                  id="specs.fuel.cityMPG"
                  value={carInput.specs.fuel.cityMPG}
                  onChange={handleInputChange}
                  step="0.1"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div className="col-span-6 sm:col-span-2">
                <label htmlFor="specs.fuel.highwayMPG" className="block text-sm font-medium text-gray-700">
                  Highway MPG
                </label>
                <input
                  type="number"
                  name="specs.fuel.highwayMPG"
                  id="specs.fuel.highwayMPG"
                  value={carInput.specs.fuel.highwayMPG}
                  onChange={handleInputChange}
                  step="0.1"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div className="col-span-6 sm:col-span-2">
                <label htmlFor="specs.fuel.combinedMPG" className="block text-sm font-medium text-gray-700">
                  Combined MPG
                </label>
                <input
                  type="number"
                  name="specs.fuel.combinedMPG"
                  id="specs.fuel.combinedMPG"
                  value={carInput.specs.fuel.combinedMPG}
                  onChange={handleInputChange}
                  step="0.1"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div className="col-span-6 sm:col-span-2">
                <label htmlFor="specs.fuel.emissionClass" className="block text-sm font-medium text-gray-700">
                  Emission Class
                </label>
                <select
                  name="specs.fuel.emissionClass"
                  id="specs.fuel.emissionClass"
                  value={carInput.specs.fuel.emissionClass}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">Select Emission Class</option>
                  <option value="EURO_6">Euro 6</option>
                  <option value="EURO_5">Euro 5</option>
                  <option value="TIER_3">Tier 3</option>
                  <option value="LEV_III">LEV III</option>
                  <option value="ZERO_EMISSION">Zero Emission</option>
                </select>
              </div>
            </div>
          </div>

          {/* Interior Tab */}
          <div className={activeTab === 'interior' ? '' : 'hidden'}>
            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-2">
                <label htmlFor="specs.interior.seatingCapacity" className="block text-sm font-medium text-gray-700">
                  Seating Capacity
                </label>
                <input
                  type="number"
                  name="specs.interior.seatingCapacity"
                  id="specs.interior.seatingCapacity"
                  value={carInput.specs.interior.seatingCapacity}
                  onChange={handleInputChange}
                  min="1"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div className="col-span-6 sm:col-span-2">
                <label htmlFor="specs.interior.doors" className="block text-sm font-medium text-gray-700">
                  Number of Doors
                </label>
                <input
                  type="number"
                  name="specs.interior.doors"
                  id="specs.interior.doors"
                  value={carInput.specs.interior.doors}
                  onChange={handleInputChange}
                  min="1"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div className="col-span-6 sm:col-span-2">
                <label htmlFor="specs.interior.trunkCapacity" className="block text-sm font-medium text-gray-700">
                  Trunk Capacity (L)
                </label>
                <input
                  type="number"
                  name="specs.interior.trunkCapacity"
                  id="specs.interior.trunkCapacity"
                  value={carInput.specs.interior.trunkCapacity}
                  onChange={handleInputChange}
                  step="0.1"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div className="col-span-6 sm:col-span-2">
                <label htmlFor="specs.interior.infotainmentScreen" className="block text-sm font-medium text-gray-700">
                  Infotainment Screen
                </label>
                <input
                  type="text"
                  name="specs.interior.infotainmentScreen"
                  id="specs.interior.infotainmentScreen"
                  value={carInput.specs.interior.infotainmentScreen}
                  onChange={handleInputChange}
                  placeholder="e.g., 10.25-inch touchscreen"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div className="col-span-6 sm:col-span-2">
                <label htmlFor="specs.interior.soundSystem" className="block text-sm font-medium text-gray-700">
                  Sound System
                </label>
                <input
                  type="text"
                  name="specs.interior.soundSystem"
                  id="specs.interior.soundSystem"
                  value={carInput.specs.interior.soundSystem}
                  onChange={handleInputChange}
                  placeholder="e.g., Bose Premium Audio"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div className="col-span-6 sm:col-span-2">
                <label htmlFor="specs.interior.climateZones" className="block text-sm font-medium text-gray-700">
                  Climate Zones
                </label>
                <input
                  type="number"
                  name="specs.interior.climateZones"
                  id="specs.interior.climateZones"
                  value={carInput.specs.interior.climateZones}
                  onChange={handleInputChange}
                  min="1"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div className="col-span-6 sm:col-span-2">
                <label htmlFor="specs.interior.upholsteryMaterial" className="block text-sm font-medium text-gray-700">
                  Upholstery Material
                </label>
                <select
                  name="specs.interior.upholsteryMaterial"
                  id="specs.interior.upholsteryMaterial"
                  value={carInput.specs.interior.upholsteryMaterial}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">Select Material</option>
                  <option value="CLOTH">Cloth</option>
                  <option value="LEATHER">Leather</option>
                  <option value="SYNTHETIC_LEATHER">Synthetic Leather</option>
                  <option value="ALCANTARA">Alcantara</option>
                  <option value="PREMIUM_LEATHER">Premium Leather</option>
                </select>
              </div>
            </div>
          </div>

          {/* Safety Tab */}
          <div className={activeTab === 'safety' ? '' : 'hidden'}>
            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-2">
                <label htmlFor="specs.safety.airbags" className="block text-sm font-medium text-gray-700">
                  Airbags
                </label>
                <input
                  type="text"
                  name="specs.safety.airbags"
                  id="specs.safety.airbags"
                  value={carInput.specs.safety.airbags}
                  onChange={handleInputChange}
                  placeholder="e.g., Front, Side, Curtain"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div className="col-span-6 sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  ABS
                </label>
                <div className="mt-2">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      name="specs.safety.abs"
                      checked={carInput.specs.safety.abs}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    <span className="ml-2">Available</span>
                  </label>
                </div>
              </div>

              <div className="col-span-6 sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Stability Control
                </label>
                <div className="mt-2">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      name="specs.safety.stabilityControl"
                      checked={carInput.specs.safety.stabilityControl}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    <span className="ml-2">Available</span>
                  </label>
                </div>
              </div>

              <div className="col-span-6 sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Traction Control
                </label>
                <div className="mt-2">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      name="specs.safety.tractionControl"
                      checked={carInput.specs.safety.tractionControl}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    <span className="ml-2">Available</span>
                  </label>
                </div>
              </div>

              <div className="col-span-6 sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Parking Sensors
                </label>
                <div className="mt-2">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      name="specs.safety.parkingSensors"
                      checked={carInput.specs.safety.parkingSensors}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    <span className="ml-2">Available</span>
                  </label>
                </div>
              </div>

              <div className="col-span-6 sm:col-span-2">
                <label htmlFor="specs.safety.camera" className="block text-sm font-medium text-gray-700">
                  Camera System
                </label>
                <select
                  name="specs.safety.camera"
                  id="specs.safety.camera"
                  value={carInput.specs.safety.camera}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">Select Camera System</option>
                  <option value="REAR">Rear View</option>
                  <option value="SURROUND">360° Surround View</option>
                  <option value="MULTI">Multi-Camera System</option>
                </select>
              </div>

              <div className="col-span-6 sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Blind Spot Monitoring
                </label>
                <div className="mt-2">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      name="specs.safety.blindSpotMonitoring"
                      checked={carInput.specs.safety.blindSpotMonitoring}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    <span className="ml-2">Available</span>
                  </label>
                </div>
              </div>

              <div className="col-span-6 sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Lane Departure Warning
                </label>
                <div className="mt-2">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      name="specs.safety.laneDepartureWarning"
                      checked={carInput.specs.safety.laneDepartureWarning}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    <span className="ml-2">Available</span>
                  </label>
                </div>
              </div>

              <div className="col-span-6 sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Collision Warning
                </label>
                <div className="mt-2">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      name="specs.safety.collisionWarning"
                      checked={carInput.specs.safety.collisionWarning}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    <span className="ml-2">Available</span>
                  </label>
                </div>
              </div>

              <div className="col-span-6 sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Night Vision
                </label>
                <div className="mt-2">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      name="specs.safety.nightVision"
                      checked={carInput.specs.safety.nightVision}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    <span className="ml-2">Available</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Technology Tab */}
          <div className={activeTab === 'technology' ? '' : 'hidden'}>
            <TechnologyForm formData={carInput} setFormData={setCarInput} />
          </div>

          {/* Features Tab */}
          <div className={activeTab === 'features' ? '' : 'hidden'}>
            <div className="space-y-4">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="specs.features.comfort" className="block text-sm font-medium text-gray-700">
                    Comfort Features
                  </label>
                  <textarea
                    name="specs.features.comfort"
                    id="specs.features.comfort"
                    rows={3}
                    value={carInput.specs.features?.comfort?.join('\n') || ''}
                    onChange={(e) => {
                      const comfortFeatures = e.target.value.split('\n').filter(feature => feature.trim() !== '');
                      handleInputChange({
                        target: {
                          name: 'specs.features.comfort',
                          value: comfortFeatures
                        }
                      });
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Enter comfort features, one per line"
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="specs.features.safety" className="block text-sm font-medium text-gray-700">
                    Safety Features
                  </label>
                  <textarea
                    name="specs.features.safety"
                    id="specs.features.safety"
                    rows={3}
                    value={carInput.specs.features?.safety?.join('\n') || ''}
                    onChange={(e) => {
                      const safetyFeatures = e.target.value.split('\n').filter(feature => feature.trim() !== '');
                      handleInputChange({
                        target: {
                          name: 'specs.features.safety',
                          value: safetyFeatures
                        }
                      });
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Enter safety features, one per line"
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="specs.features.performance" className="block text-sm font-medium text-gray-700">
                    Performance Features
                  </label>
                  <textarea
                    name="specs.features.performance"
                    id="specs.features.performance"
                    rows={3}
                    value={carInput.specs.features?.performance?.join('\n') || ''}
                    onChange={(e) => {
                      const performanceFeatures = e.target.value.split('\n').filter(feature => feature.trim() !== '');
                      handleInputChange({
                        target: {
                          name: 'specs.features.performance',
                          value: performanceFeatures
                        }
                      });
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Enter performance features, one per line"
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="specs.features.technology" className="block text-sm font-medium text-gray-700">
                    Technology Features
                  </label>
                  <textarea
                    name="specs.features.technology"
                    id="specs.features.technology"
                    rows={3}
                    value={carInput.specs.features?.technology?.join('\n') || ''}
                    onChange={(e) => {
                      const technologyFeatures = e.target.value.split('\n').filter(feature => feature.trim() !== '');
                      handleInputChange({
                        target: {
                          name: 'specs.features.technology',
                          value: technologyFeatures
                        }
                      });
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Enter technology features, one per line"
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="specs.features.exterior" className="block text-sm font-medium text-gray-700">
                    Exterior Features
                  </label>
                  <textarea
                    name="specs.features.exterior"
                    id="specs.features.exterior"
                    rows={3}
                    value={carInput.specs.features?.exterior?.join('\n') || ''}
                    onChange={(e) => {
                      const exteriorFeatures = e.target.value.split('\n').filter(feature => feature.trim() !== '');
                      handleInputChange({
                        target: {
                          name: 'specs.features.exterior',
                          value: exteriorFeatures
                        }
                      });
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Enter exterior features, one per line"
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="specs.features.interior" className="block text-sm font-medium text-gray-700">
                    Interior Features
                  </label>
                  <textarea
                    name="specs.features.interior"
                    id="specs.features.interior"
                    rows={3}
                    value={carInput.specs.features?.interior?.join('\n') || ''}
                    onChange={(e) => {
                      const interiorFeatures = e.target.value.split('\n').filter(feature => feature.trim() !== '');
                      handleInputChange({
                        target: {
                          name: 'specs.features.interior',
                          value: interiorFeatures
                        }
                      });
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Enter interior features, one per line"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Warranty Tab */}
          <div className={activeTab === 'warranty' ? '' : 'hidden'}>
            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-2">
                <label htmlFor="specs.warranty.basic" className="block text-sm font-medium text-gray-700">
                  Basic Warranty
                </label>
                <input
                  type="text"
                  name="specs.warranty.basic"
                  id="specs.warranty.basic"
                  value={carInput.specs.warranty.basic}
                  onChange={handleInputChange}
                  placeholder="e.g., 3 years/36,000 miles"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div className="col-span-6 sm:col-span-2">
                <label htmlFor="specs.warranty.powertrain" className="block text-sm font-medium text-gray-700">
                  Powertrain Warranty
                </label>
                <input
                  type="text"
                  name="specs.warranty.powertrain"
                  id="specs.warranty.powertrain"
                  value={carInput.specs.warranty.powertrain}
                  onChange={handleInputChange}
                  placeholder="e.g., 5 years/60,000 miles"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div className="col-span-6 sm:col-span-2">
                <label htmlFor="specs.warranty.corrosion" className="block text-sm font-medium text-gray-700">
                  Corrosion Warranty
                </label>
                <input
                  type="text"
                  name="specs.warranty.corrosion"
                  id="specs.warranty.corrosion"
                  value={carInput.specs.warranty.corrosion}
                  onChange={handleInputChange}
                  placeholder="e.g., 7 years/unlimited miles"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div className="col-span-6 sm:col-span-2">
                <label htmlFor="specs.warranty.roadside" className="block text-sm font-medium text-gray-700">
                  Roadside Assistance
                </label>
                <input
                  type="text"
                  name="specs.warranty.roadside"
                  id="specs.warranty.roadside"
                  value={carInput.specs.warranty.roadside}
                  onChange={handleInputChange}
                  placeholder="e.g., 3 years/36,000 miles"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div className="col-span-6 sm:col-span-2">
                <label htmlFor="specs.warranty.maintenance" className="block text-sm font-medium text-gray-700">
                  Maintenance Coverage
                </label>
                <input
                  type="text"
                  name="specs.warranty.maintenance"
                  id="specs.warranty.maintenance"
                  value={carInput.specs.warranty.maintenance}
                  onChange={handleInputChange}
                  placeholder="e.g., 2 years/25,000 miles"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
            <button
              type="button"
              onClick={() => navigate('/admin/cars')}
              className="mr-3 inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creatingCar || updatingCar}
              className="inline-flex justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {creatingCar || updatingCar ? (
                <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
              ) : (
                'Save'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
