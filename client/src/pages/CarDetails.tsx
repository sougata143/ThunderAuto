import React, { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_CAR_BY_ID } from '../graphql/queries';
import { UPDATE_CAR, ADD_CAR_IMAGE, UPLOAD_CAR_IMAGE } from '../graphql/mutations';
import { useAuth } from '../contexts/AuthContext';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { Tab } from '@headlessui/react';
import { StarIcon } from '@heroicons/react/20/solid';
import classNames from 'classnames';
import '../styles/automotive.css';

interface CarSpecs {
  transmission?: {
    gears?: number | string;
  };
  interior?: {
    seatingCapacity?: number | string;
    doors?: number | string;
    climateZones?: number | string;
  };
}

const safeNumberConvert = (value: any, defaultValue: number = 0): number => {
  // If value is null, undefined, or not a number, return default
  if (value === null || value === undefined) return defaultValue;
  
  // Try to convert to number
  const converted = Number(value);
  
  // If conversion fails or results in NaN, return default
  return Number.isNaN(converted) ? defaultValue : converted;
};

const CarDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedCar, setEditedCar] = useState<any>(null);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [isAddingImage, setIsAddingImage] = useState(false);
  const [newImage, setNewImage] = useState<{
    url: string;
    caption: string;
    isFeatured: boolean;
  }>({
    url: '',
    caption: '',
    isFeatured: false
  });
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('url');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { loading, error, data, refetch } = useQuery(GET_CAR_BY_ID, {
    variables: { id },
    onCompleted: (data) => {
      console.log('Car data received:', data.car);
      
      const initializedCar = {
        ...data.car,
        specs: {
          ...data.car.specs,
          transmission: {
            ...data.car.specs?.transmission,
            gears: safeNumberConvert(data.car.specs?.transmission?.gears)
          },
          interior: {
            ...data.car.specs?.interior,
            seatingCapacity: safeNumberConvert(data.car.specs?.interior?.seatingCapacity),
            doors: safeNumberConvert(data.car.specs?.interior?.doors),
            climateZones: safeNumberConvert(data.car.specs?.interior?.climateZones)
          }
        }
      };

      setEditedCar(initializedCar);
    },
    onError: (error) => {
      console.error('Query error:', error);
      setFormErrors(prev => ({
        ...prev,
        queryError: error.message
      }));
    }
  });

  const [updateCar, { loading: updating }] = useMutation(UPDATE_CAR);
  const [addCarImage] = useMutation(ADD_CAR_IMAGE);
  const [uploadCarImage] = useMutation(UPLOAD_CAR_IMAGE);

  const handleSave = async () => {
    // Validate numeric fields explicitly
    const errors: {[key: string]: string} = {};

    // Transmission gears validation
    const gears = editedCar?.specs?.transmission?.gears;
    if (gears === undefined || gears === null || Number.isNaN(Number(gears))) {
      errors['specs.transmission.gears'] = 'Invalid gears value';
      console.error('Invalid gears:', gears);
    }

    // Seating capacity validation
    const seatingCapacity = editedCar?.specs?.interior?.seatingCapacity;
    if (seatingCapacity === undefined || seatingCapacity === null || Number.isNaN(Number(seatingCapacity))) {
      errors['specs.interior.seatingCapacity'] = 'Invalid seating capacity';
      console.error('Invalid seating capacity:', seatingCapacity);
    }

    // Doors validation
    const doors = editedCar?.specs?.interior?.doors;
    if (doors === undefined || doors === null || Number.isNaN(Number(doors))) {
      errors['specs.interior.doors'] = 'Invalid doors count';
      console.error('Invalid doors:', doors);
    }

    // Climate zones validation
    const climateZones = editedCar?.specs?.interior?.climateZones;
    if (climateZones === undefined || climateZones === null || Number.isNaN(Number(climateZones))) {
      errors['specs.interior.climateZones'] = 'Invalid climate zones';
      console.error('Invalid climate zones:', climateZones);
    }

    // If there are errors, set them and prevent save
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      console.error('Form validation errors:', errors);
      return;
    }

    try {
      await updateCar({
        variables: {
          id: editedCar.id,
          input: {
            make: editedCar.make,
            model: editedCar.model,
            year: editedCar.year,
            price: editedCar.price,
            status: editedCar.status,
            specs: {
              engine: {
                type: editedCar.specs?.engine?.type,
                code: editedCar.specs?.engine?.code,
                displacement: editedCar.specs?.engine?.displacement,
                cylinders: editedCar.specs?.engine?.cylinders,
                powerOutput: editedCar.specs?.engine?.powerOutput,
                torque: editedCar.specs?.engine?.torque,
                compressionRatio: editedCar.specs?.engine?.compressionRatio,
                bore: editedCar.specs?.engine?.bore,
                stroke: editedCar.specs?.engine?.stroke,
                valveSystem: editedCar.specs?.engine?.valveSystem,
                valvesPerCylinder: editedCar.specs?.engine?.valvesPerCylinder,
                fuelInjection: editedCar.specs?.engine?.fuelInjection,
                aspiration: editedCar.specs?.engine?.aspiration,
                boostPressure: editedCar.specs?.engine?.boostPressure,
                redlineRpm: editedCar.specs?.engine?.redlineRpm,
                idleRpm: editedCar.specs?.engine?.idleRpm,
                position: editedCar.specs?.engine?.position,
                orientation: editedCar.specs?.engine?.orientation,
                weight: editedCar.specs?.engine?.weight,
                oilCapacity: editedCar.specs?.engine?.oilCapacity,
                coolingSystem: editedCar.specs?.engine?.coolingSystem
              },
              performance: {
                powerToWeightRatio: editedCar.specs?.performance?.powerToWeightRatio,
                topSpeed: editedCar.specs?.performance?.topSpeed,
                zeroToSixty: editedCar.specs?.performance?.zeroToSixty,
                zeroToHundred: editedCar.specs?.performance?.zeroToHundred,
                quarterMileTime: editedCar.specs?.performance?.quarterMileTime,
                quarterMileSpeed: editedCar.specs?.performance?.quarterMileSpeed,
                brakingDistance: editedCar.specs?.performance?.brakingDistance,
                lateralG: editedCar.specs?.performance?.lateralG,
                nurburgringTime: editedCar.specs?.performance?.nurburgringTime,
                passingAcceleration: editedCar.specs?.performance?.passingAcceleration,
                standingKm: editedCar.specs?.performance?.standingKm,
                elasticity: editedCar.specs?.performance?.elasticity,
                launchControl: editedCar.specs?.performance?.launchControl,
                performanceMode: editedCar.specs?.performance?.performanceMode
              },
              chassis: {
                bodyType: editedCar.specs?.chassis?.bodyType,
                platform: editedCar.specs?.chassis?.platform,
                frontSuspension: editedCar.specs?.chassis?.frontSuspension,
                rearSuspension: editedCar.specs?.chassis?.rearSuspension,
                frontBrakes: editedCar.specs?.chassis?.frontBrakes,
                rearBrakes: editedCar.specs?.chassis?.rearBrakes,
                wheelSize: editedCar.specs?.chassis?.wheelSize,
                tireSize: editedCar.specs?.chassis?.tireSize
              },
              dimensions: {
                length: editedCar.specs?.dimensions?.length,
                width: editedCar.specs?.dimensions?.width,
                height: editedCar.specs?.dimensions?.height,
                wheelbase: editedCar.specs?.dimensions?.wheelbase,
                groundClearance: editedCar.specs?.dimensions?.groundClearance,
                weight: editedCar.specs?.dimensions?.weight,
                weightDistribution: editedCar.specs?.dimensions?.weightDistribution,
                dragCoefficient: editedCar.specs?.dimensions?.dragCoefficient
              },
              transmission: {
                type: editedCar.specs?.transmission?.type || '',
                gears: safeNumberConvert(editedCar.specs?.transmission?.gears),
                clutchType: editedCar.specs?.transmission?.clutchType || '',
                driveType: editedCar.specs?.transmission?.driveType || '',
                differential: editedCar.specs?.transmission?.differential || ''
              },
              fuel: {
                type: editedCar.specs?.fuel?.type,
                system: editedCar.specs?.fuel?.system,
                tankCapacity: editedCar.specs?.fuel?.tankCapacity,
                cityMpg: editedCar.specs?.fuel?.cityMpg,
                highwayMpg: editedCar.specs?.fuel?.highwayMpg,
                combinedMpg: editedCar.specs?.fuel?.combinedMpg,
                emissionStandard: editedCar.specs?.fuel?.emissionStandard
              },
              interior: {
                seatingCapacity: safeNumberConvert(editedCar.specs?.interior?.seatingCapacity),
                doors: safeNumberConvert(editedCar.specs?.interior?.doors),
                trunkCapacity: editedCar.specs?.interior?.trunkCapacity || 0,
                infotainmentScreen: editedCar.specs?.interior?.infotainmentScreen || '',
                soundSystem: editedCar.specs?.interior?.soundSystem || '',
                climateZones: safeNumberConvert(editedCar.specs?.interior?.climateZones),
                upholsteryMaterial: editedCar.specs?.interior?.upholsteryMaterial || ''
              },
              safety: {
                airbags: editedCar.specs?.safety?.airbags,
                abs: editedCar.specs?.safety?.abs,
                stabilityControl: editedCar.specs?.safety?.stabilityControl,
                tractionControl: editedCar.specs?.safety?.tractionControl,
                parkingSensors: editedCar.specs?.safety?.parkingSensors,
                camera: editedCar.specs?.safety?.camera,
                blindSpotMonitoring: editedCar.specs?.safety?.blindSpotMonitoring,
                laneDepartureWarning: editedCar.specs?.safety?.laneDepartureWarning,
                collisionWarning: editedCar.specs?.safety?.collisionWarning,
                nightVision: editedCar.specs?.safety?.nightVision
              },
              technology: {
                infotainmentSystem: editedCar.specs?.technology?.infotainmentSystem,
                screenSize: editedCar.specs?.technology?.screenSize,
                appleCarPlay: editedCar.specs?.technology?.appleCarPlay,
                androidAuto: editedCar.specs?.technology?.androidAuto,
                adaptiveCruiseControl: editedCar.specs?.technology?.adaptiveCruiseControl,
                laneKeepAssist: editedCar.specs?.technology?.laneKeepAssist,
                blindSpotMonitoring: editedCar.specs?.technology?.blindSpotMonitoring,
                parkingAssist: editedCar.specs?.technology?.parkingAssist,
                nightVision: editedCar.specs?.technology?.nightVision,
                headUpDisplay: editedCar.specs?.technology?.headUpDisplay,
                surroundViewCamera: editedCar.specs?.technology?.surroundViewCamera,
                digitalKey: editedCar.specs?.technology?.digitalKey,
                mobileApp: editedCar.specs?.technology?.mobileApp,
                overTheAirUpdates: editedCar.specs?.technology?.overTheAirUpdates,
                voiceControl: editedCar.specs?.technology?.voiceControl,
                voiceAssistantName: editedCar.specs?.technology?.voiceAssistantName,
                connectivity: {
                  bluetooth: editedCar.specs?.technology?.connectivity?.bluetooth,
                  wirelessCharging: editedCar.specs?.technology?.connectivity?.wirelessCharging,
                  wifi: editedCar.specs?.technology?.connectivity?.wifi,
                  soundSystem: editedCar.specs?.technology?.connectivity?.soundSystem,
                  speakers: editedCar.specs?.technology?.connectivity?.speakers
                }
              },
              warranty: {
                basic: editedCar.specs?.warranty?.basic,
                powertrain: editedCar.specs?.warranty?.powertrain,
                corrosion: editedCar.specs?.warranty?.corrosion,
                roadside: editedCar.specs?.warranty?.roadside,
                maintenance: editedCar.specs?.warranty?.maintenance
              }
            }
          },
        },
      });
      setIsEditing(false);
      refetch();
    } catch (error) {
      console.error('Error saving car:', error);
      setFormErrors(prev => ({
        ...prev,
        saveError: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setEditedCar((prev: any) => ({ ...prev, [field]: value }));
  };

  const renderEditableField = (
    label: string,
    value: any,
    onChange: (value: any) => void,
    type: 'text' | 'number' | 'select' | 'checkbox' | 'multiselect' = 'text',
    options?: { value: string; label: string }[]
  ) => {
    if (type === 'checkbox') {
      return (
        <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
          <dt className="text-sm font-medium text-gray-500">{label}</dt>
          <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => onChange(e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
          </dd>
        </div>
      );
    }

    if (type === 'select') {
      return (
        <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
          <dt className="text-sm font-medium text-gray-500">{label}</dt>
          <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
            <select
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Select {label}</option>
              {options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </dd>
        </div>
      );
    }

    if (type === 'multiselect') {
      const selectedValues = Array.isArray(value) ? value : [];
      return (
        <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
          <dt className="text-sm font-medium text-gray-500">{label}</dt>
          <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
            <select
              multiple
              value={selectedValues}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, (option) => option.value);
                onChange(values);
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              {options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </dd>
        </div>
      );
    }

    return (
      <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
        <dt className="text-sm font-medium text-gray-500">{label}</dt>
        <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
          <input
            type={type}
            value={value || ''}
            onChange={(e) => onChange(type === 'number' ? parseFloat(e.target.value) : e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </dd>
      </div>
    );
  };

  const renderEditableTabContent = (tabContent: string) => {
    const handleSpecChange = (category: string, field: string, value: any) => {
      setEditedCar((prev: any) => ({
        ...prev,
        specs: {
          ...prev.specs,
          [category]: {
            ...prev.specs?.[category],
            [field]: value,
          },
        },
      }));
    };

    switch (tabContent) {
      case 'overview':
        return (
          <div className="space-y-4">
            {renderEditableField('Make', editedCar.make, (value) => handleInputChange('make', value))}
            {renderEditableField('Model', editedCar.model, (value) => handleInputChange('model', value))}
            {renderEditableField('Year', editedCar.year, (value) => handleInputChange('year', value), 'number')}
            {renderEditableField('Price', editedCar.price, (value) => handleInputChange('price', value), 'number')}
            {renderEditableField('Status', editedCar.status, (value) => handleInputChange('status', value), 'select', [
              { value: 'AVAILABLE', label: 'Available' },
              { value: 'SOLD', label: 'Sold' },
              { value: 'PENDING', label: 'Pending' },
              { value: 'MAINTENANCE', label: 'Maintenance' }
            ])}
          </div>
        );

      case 'engine':
        return (
          <div className="space-y-4">
            {renderEditableField('Engine Type', editedCar.specs?.engine?.type,
              (value) => handleSpecChange('engine', 'type', value), 'select', [
                { value: 'inline', label: 'Inline' },
                { value: 'v', label: 'V-Type' },
                { value: 'boxer', label: 'Boxer' },
                { value: 'rotary', label: 'Rotary' },
                { value: 'electric', label: 'Electric' },
                { value: 'hybrid', label: 'Hybrid' }
              ])}
            {renderEditableField('Engine Code', editedCar.specs?.engine?.code,
              (value) => handleSpecChange('engine', 'code', value))}
            {renderEditableField('Displacement (cc)', editedCar.specs?.engine?.displacement,
              (value) => handleSpecChange('engine', 'displacement', value), 'number')}
            {renderEditableField('Cylinders', editedCar.specs?.engine?.cylinders,
              (value) => handleSpecChange('engine', 'cylinders', value), 'number')}
            {renderEditableField('Power Output (HP)', editedCar.specs?.engine?.powerOutput,
              (value) => handleSpecChange('engine', 'powerOutput', value), 'number')}
            {renderEditableField('Torque (Nm)', editedCar.specs?.engine?.torque,
              (value) => handleSpecChange('engine', 'torque', value), 'number')}
            {renderEditableField('Compression Ratio', editedCar.specs?.engine?.compressionRatio,
              (value) => handleSpecChange('engine', 'compressionRatio', value), 'number')}
            {renderEditableField('Bore (mm)', editedCar.specs?.engine?.bore,
              (value) => handleSpecChange('engine', 'bore', value), 'number')}
            {renderEditableField('Stroke (mm)', editedCar.specs?.engine?.stroke,
              (value) => handleSpecChange('engine', 'stroke', value), 'number')}
            {renderEditableField('Valve System', editedCar.specs?.engine?.valveSystem,
              (value) => handleSpecChange('engine', 'valveSystem', value), 'select', [
                { value: 'sohc', label: 'SOHC' },
                { value: 'dohc', label: 'DOHC' },
                { value: 'ohv', label: 'OHV' },
                { value: 'vvt', label: 'VVT' }
              ])}
            {renderEditableField('Valves per Cylinder', editedCar.specs?.engine?.valvesPerCylinder,
              (value) => handleSpecChange('engine', 'valvesPerCylinder', value), 'number')}
            {renderEditableField('Fuel Injection', editedCar.specs?.engine?.fuelInjection,
              (value) => handleSpecChange('engine', 'fuelInjection', value), 'select', [
                { value: 'direct', label: 'Direct Injection' },
                { value: 'port', label: 'Port Injection' },
                { value: 'sequential', label: 'Sequential' },
                { value: 'multipoint', label: 'Multipoint' }
              ])}
            {renderEditableField('Aspiration', editedCar.specs?.engine?.aspiration,
              (value) => handleSpecChange('engine', 'aspiration', value), 'select', [
                { value: 'natural', label: 'Naturally Aspirated' },
                { value: 'turbo', label: 'Turbocharged' },
                { value: 'supercharged', label: 'Supercharged' },
                { value: 'twinturbo', label: 'Twin-Turbo' }
              ])}
            {renderEditableField('Boost Pressure (bar)', editedCar.specs?.engine?.boostPressure,
              (value) => handleSpecChange('engine', 'boostPressure', value), 'number')}
            {renderEditableField('Redline RPM', editedCar.specs?.engine?.redlineRpm,
              (value) => handleSpecChange('engine', 'redlineRpm', value), 'number')}
            {renderEditableField('Idle RPM', editedCar.specs?.engine?.idleRpm,
              (value) => handleSpecChange('engine', 'idleRpm', value), 'number')}
            {renderEditableField('Engine Position', editedCar.specs?.engine?.position,
              (value) => handleSpecChange('engine', 'position', value), 'select', [
                { value: 'front', label: 'Front' },
                { value: 'mid', label: 'Mid' },
                { value: 'rear', label: 'Rear' }
              ])}
            {renderEditableField('Engine Orientation', editedCar.specs?.engine?.orientation,
              (value) => handleSpecChange('engine', 'orientation', value), 'select', [
                { value: 'longitudinal', label: 'Longitudinal' },
                { value: 'transverse', label: 'Transverse' }
              ])}
            {renderEditableField('Engine Weight (kg)', editedCar.specs?.engine?.weight,
              (value) => handleSpecChange('engine', 'weight', value), 'number')}
            {renderEditableField('Engine Oil Capacity (L)', editedCar.specs?.engine?.oilCapacity,
              (value) => handleSpecChange('engine', 'oilCapacity', value), 'number')}
            {renderEditableField('Cooling System', editedCar.specs?.engine?.coolingSystem,
              (value) => handleSpecChange('engine', 'coolingSystem', value), 'select', [
                { value: 'liquid', label: 'Liquid Cooled' },
                { value: 'air', label: 'Air Cooled' },
                { value: 'oil', label: 'Oil Cooled' }
              ])}
          </div>
        );

      case 'performance':
        return (
          <div className="space-y-4">
            {renderEditableField('Power to Weight Ratio (hp/ton)', editedCar.specs?.performance?.powerToWeightRatio,
              (value) => handleSpecChange('performance', 'powerToWeightRatio', value), 'number')}
            {renderEditableField('Top Speed (km/h)', editedCar.specs?.performance?.topSpeed,
              (value) => handleSpecChange('performance', 'topSpeed', value), 'number')}
            {renderEditableField('0-60 mph (seconds)', editedCar.specs?.performance?.zeroToSixty,
              (value) => handleSpecChange('performance', 'zeroToSixty', value), 'number')}
            {renderEditableField('0-100 km/h (seconds)', editedCar.specs?.performance?.zeroToHundred,
              (value) => handleSpecChange('performance', 'zeroToHundred', value), 'number')}
            {renderEditableField('Quarter Mile Time (seconds)', editedCar.specs?.performance?.quarterMileTime,
              (value) => handleSpecChange('performance', 'quarterMileTime', value), 'number')}
            {renderEditableField('Quarter Mile Speed (km/h)', editedCar.specs?.performance?.quarterMileSpeed,
              (value) => handleSpecChange('performance', 'quarterMileSpeed', value), 'number')}
            {renderEditableField('Braking 100-0 km/h (meters)', editedCar.specs?.performance?.brakingDistance,
              (value) => handleSpecChange('performance', 'brakingDistance', value), 'number')}
            {renderEditableField('Lateral G-Force', editedCar.specs?.performance?.lateralG,
              (value) => handleSpecChange('performance', 'lateralG', value), 'number')}
            {renderEditableField('Nürburgring Lap Time', editedCar.specs?.performance?.nurburgringTime,
              (value) => handleSpecChange('performance', 'nurburgringTime', value))}
            {renderEditableField('Acceleration 50-75 mph (seconds)', editedCar.specs?.performance?.passingAcceleration,
              (value) => handleSpecChange('performance', 'passingAcceleration', value), 'number')}
            {renderEditableField('Standing Start 1km (seconds)', editedCar.specs?.performance?.standingKm,
              (value) => handleSpecChange('performance', 'standingKm', value), 'number')}
            {renderEditableField('Elasticity 80-120 km/h (seconds)', editedCar.specs?.performance?.elasticity,
              (value) => handleSpecChange('performance', 'elasticity', value), 'number')}
            {renderEditableField('Launch Control', editedCar.specs?.performance?.launchControl,
              (value) => handleSpecChange('performance', 'launchControl', value), 'checkbox')}
            {renderEditableField('Performance Mode', editedCar.specs?.performance?.performanceMode,
              (value) => handleSpecChange('performance', 'performanceMode', value), 'multiselect', [
                { value: 'eco', label: 'Eco' },
                { value: 'normal', label: 'Normal' },
                { value: 'sport', label: 'Sport' },
                { value: 'sport_plus', label: 'Sport+' },
                { value: 'race', label: 'Race' },
                { value: 'individual', label: 'Individual' }
              ])}
          </div>
        );

      case 'chassis':
        return (
          <div className="space-y-4">
            {renderEditableField('Body Type', editedCar.specs?.chassis?.bodyType,
              (value) => handleSpecChange('chassis', 'bodyType', value), 'select', [
                { value: 'sedan', label: 'Sedan' },
                { value: 'suv', label: 'SUV' },
                { value: 'coupe', label: 'Coupe' },
                { value: 'hatchback', label: 'Hatchback' },
                { value: 'wagon', label: 'Wagon' },
                { value: 'convertible', label: 'Convertible' }
              ])}
            {renderEditableField('Platform', editedCar.specs?.chassis?.platform,
              (value) => handleSpecChange('chassis', 'platform', value))}
            {renderEditableField('Front Suspension', editedCar.specs?.chassis?.frontSuspension,
              (value) => handleSpecChange('chassis', 'frontSuspension', value))}
            {renderEditableField('Rear Suspension', editedCar.specs?.chassis?.rearSuspension,
              (value) => handleSpecChange('chassis', 'rearSuspension', value))}
            {renderEditableField('Front Brakes', editedCar.specs?.chassis?.frontBrakes,
              (value) => handleSpecChange('chassis', 'frontBrakes', value))}
            {renderEditableField('Rear Brakes', editedCar.specs?.chassis?.rearBrakes,
              (value) => handleSpecChange('chassis', 'rearBrakes', value))}
            {renderEditableField('Wheel Size', editedCar.specs?.chassis?.wheelSize,
              (value) => handleSpecChange('chassis', 'wheelSize', value))}
            {renderEditableField('Tire Size', editedCar.specs?.chassis?.tireSize,
              (value) => handleSpecChange('chassis', 'tireSize', value))}
          </div>
        );

      case 'dimensions':
        return (
          <div className="space-y-4">
            {renderEditableField('Length', editedCar.specs?.dimensions?.length,
              (value) => handleSpecChange('dimensions', 'length', value), 'number')}
            {renderEditableField('Width', editedCar.specs?.dimensions?.width,
              (value) => handleSpecChange('dimensions', 'width', value), 'number')}
            {renderEditableField('Height', editedCar.specs?.dimensions?.height,
              (value) => handleSpecChange('dimensions', 'height', value), 'number')}
            {renderEditableField('Wheelbase', editedCar.specs?.dimensions?.wheelbase,
              (value) => handleSpecChange('dimensions', 'wheelbase', value), 'number')}
            {renderEditableField('Ground Clearance', editedCar.specs?.dimensions?.groundClearance,
              (value) => handleSpecChange('dimensions', 'groundClearance', value), 'number')}
            {renderEditableField('Weight', editedCar.specs?.dimensions?.weight,
              (value) => handleSpecChange('dimensions', 'weight', value), 'number')}
            {renderEditableField('Weight Distribution', editedCar.specs?.dimensions?.weightDistribution,
              (value) => handleSpecChange('dimensions', 'weightDistribution', value))}
            {renderEditableField('Drag Coefficient', editedCar.specs?.dimensions?.dragCoefficient,
              (value) => handleSpecChange('dimensions', 'dragCoefficient', value), 'number')}
          </div>
        );

      case 'transmission':
        return (
          <div className="space-y-4">
            {renderEditableField('Transmission Type', editedCar.specs?.transmission?.type,
              (value) => handleSpecChange('transmission', 'type', value), 'select', [
                { value: 'manual', label: 'Manual' },
                { value: 'automatic', label: 'Automatic' },
                { value: 'cvt', label: 'CVT' },
                { value: 'dct', label: 'Dual-Clutch' }
              ])}
            {renderEditableField('Gears', editedCar.specs?.transmission?.gears,
              (value) => handleSpecChange('transmission', 'gears', value), 'number')}
            {renderEditableField('Clutch Type', editedCar.specs?.transmission?.clutchType,
              (value) => handleSpecChange('transmission', 'clutchType', value))}
            {renderEditableField('Drive Type', editedCar.specs?.transmission?.driveType,
              (value) => handleSpecChange('transmission', 'driveType', value), 'select', [
                { value: 'fwd', label: 'Front-Wheel Drive' },
                { value: 'rwd', label: 'Rear-Wheel Drive' },
                { value: 'awd', label: 'All-Wheel Drive' },
                { value: '4wd', label: '4-Wheel Drive' }
              ])}
            {renderEditableField('Differential', editedCar.specs?.transmission?.differential,
              (value) => handleSpecChange('transmission', 'differential', value))}
          </div>
        );

      case 'fuel':
        return (
          <div className="space-y-4">
            {renderEditableField('Fuel Type', editedCar.specs?.fuel?.type,
              (value) => handleSpecChange('fuel', 'type', value), 'select', [
                { value: 'gasoline', label: 'Gasoline' },
                { value: 'diesel', label: 'Diesel' },
                { value: 'electric', label: 'Electric' },
                { value: 'hybrid', label: 'Hybrid' },
                { value: 'plugin_hybrid', label: 'Plug-in Hybrid' }
              ])}
            {renderEditableField('Fuel System', editedCar.specs?.fuel?.system,
              (value) => handleSpecChange('fuel', 'system', value))}
            {renderEditableField('Tank Capacity', editedCar.specs?.fuel?.tankCapacity,
              (value) => handleSpecChange('fuel', 'tankCapacity', value), 'number')}
            {renderEditableField('City MPG', editedCar.specs?.fuel?.cityMpg,
              (value) => handleSpecChange('fuel', 'cityMpg', value), 'number')}
            {renderEditableField('Highway MPG', editedCar.specs?.fuel?.highwayMpg,
              (value) => handleSpecChange('fuel', 'highwayMpg', value), 'number')}
            {renderEditableField('Combined MPG', editedCar.specs?.fuel?.combinedMpg,
              (value) => handleSpecChange('fuel', 'combinedMpg', value), 'number')}
            {renderEditableField('Emission Standard', editedCar.specs?.fuel?.emissionStandard,
              (value) => handleSpecChange('fuel', 'emissionStandard', value))}
          </div>
        );

      case 'interior':
        return (
          <div className="space-y-4">
            {renderEditableField('Seating Capacity', editedCar.specs?.interior?.seatingCapacity,
              (value) => handleSpecChange('interior', 'seatingCapacity', value), 'number')}
            {renderEditableField('Doors', editedCar.specs?.interior?.doors,
              (value) => handleSpecChange('interior', 'doors', value), 'number')}
            {renderEditableField('Trunk Capacity', editedCar.specs?.interior?.trunkCapacity,
              (value) => handleSpecChange('interior', 'trunkCapacity', value))}
            {renderEditableField('Infotainment Screen', editedCar.specs?.interior?.infotainmentScreen,
              (value) => handleSpecChange('interior', 'infotainmentScreen', value))}
            {renderEditableField('Sound System', editedCar.specs?.interior?.soundSystem,
              (value) => handleSpecChange('interior', 'soundSystem', value))}
            {renderEditableField('Climate Zones', editedCar.specs?.interior?.climateZones,
              (value) => handleSpecChange('interior', 'climateZones', value), 'number')}
            {renderEditableField('Upholstery Material', editedCar.specs?.interior?.upholsteryMaterial,
              (value) => handleSpecChange('interior', 'upholsteryMaterial', value), 'select', [
                { value: 'leather', label: 'Leather' },
                { value: 'cloth', label: 'Cloth' },
                { value: 'alcantara', label: 'Alcantara' },
                { value: 'vinyl', label: 'Vinyl' }
              ])}
          </div>
        );

      case 'safety':
        return (
          <div className="space-y-4">
            {renderEditableField('Airbags', editedCar.specs?.safety?.airbags,
              (value) => handleSpecChange('safety', 'airbags', value), 'number')}
            {renderEditableField('ABS', editedCar.specs?.safety?.abs,
              (value) => handleSpecChange('safety', 'abs', value), 'checkbox')}
            {renderEditableField('Stability Control', editedCar.specs?.safety?.stabilityControl,
              (value) => handleSpecChange('safety', 'stabilityControl', value), 'checkbox')}
            {renderEditableField('Traction Control', editedCar.specs?.safety?.tractionControl,
              (value) => handleSpecChange('safety', 'tractionControl', value), 'checkbox')}
            {renderEditableField('Parking Sensors', editedCar.specs?.safety?.parkingSensors,
              (value) => handleSpecChange('safety', 'parkingSensors', value), 'multiselect', [
                { value: 'front', label: 'Front' },
                { value: 'rear', label: 'Rear' },
                { value: '360', label: '360 Degree' }
              ])}
            {renderEditableField('Camera System', editedCar.specs?.safety?.camera,
              (value) => handleSpecChange('safety', 'camera', value), 'multiselect', [
                { value: 'rear', label: 'Rear' },
                { value: 'front', label: 'Front' },
                { value: 'surround', label: 'Surround View' }
              ])}
            {renderEditableField('Blind Spot Monitoring', editedCar.specs?.safety?.blindSpotMonitoring,
              (value) => handleSpecChange('safety', 'blindSpotMonitoring', value), 'checkbox')}
            {renderEditableField('Lane Departure Warning', editedCar.specs?.safety?.laneDepartureWarning,
              (value) => handleSpecChange('safety', 'laneDepartureWarning', value), 'checkbox')}
            {renderEditableField('Collision Warning', editedCar.specs?.safety?.collisionWarning,
              (value) => handleSpecChange('safety', 'collisionWarning', value), 'checkbox')}
            {renderEditableField('Night Vision', editedCar.specs?.safety?.nightVision,
              (value) => handleSpecChange('safety', 'nightVision', value), 'checkbox')}
          </div>
        );

      case 'technology':
        return (
          <div className="space-y-4">
            {renderEditableField('Connectivity', editedCar.specs?.technology?.connectivity,
              (value) => handleSpecChange('technology', 'connectivity', value), 'multiselect', [
                { value: 'bluetooth', label: 'Bluetooth' },
                { value: 'wifi', label: 'Wi-Fi' },
                { value: 'usb', label: 'USB' }
              ])}
            {renderEditableField('Smartphone Integration', editedCar.specs?.technology?.smartphone,
              (value) => handleSpecChange('technology', 'smartphone', value), 'multiselect', [
                { value: 'apple_carplay', label: 'Apple CarPlay' },
                { value: 'android_auto', label: 'Android Auto' }
              ])}
            {renderEditableField('Navigation System', editedCar.specs?.technology?.navigation,
              (value) => handleSpecChange('technology', 'navigation', value), 'checkbox')}
            {renderEditableField('Headlight Type', editedCar.specs?.technology?.headlightType,
              (value) => handleSpecChange('technology', 'headlightType', value), 'select', [
                { value: 'halogen', label: 'Halogen' },
                { value: 'led', label: 'LED' },
                { value: 'xenon', label: 'Xenon' },
                { value: 'laser', label: 'Laser' }
              ])}
            {renderEditableField('Adaptive Cruise Control', editedCar.specs?.technology?.adaptiveCruiseControl,
              (value) => handleSpecChange('technology', 'adaptiveCruiseControl', value), 'checkbox')}
            {renderEditableField('Keyless Entry', editedCar.specs?.technology?.keylessEntry,
              (value) => handleSpecChange('technology', 'keylessEntry', value), 'checkbox')}
            {renderEditableField('Start System', editedCar.specs?.technology?.startSystem,
              (value) => handleSpecChange('technology', 'startSystem', value), 'select', [
                { value: 'key', label: 'Traditional Key' },
                { value: 'button', label: 'Push Button' },
                { value: 'remote', label: 'Remote Start' }
              ])}
            {renderEditableField('Driver Assistance Features', editedCar.specs?.technology?.driverAssistance,
              (value) => handleSpecChange('technology', 'driverAssistance', value), 'multiselect', [
                { value: 'lane_keep', label: 'Lane Keep Assist' },
                { value: 'parking_assist', label: 'Parking Assist' },
                { value: 'traffic_sign', label: 'Traffic Sign Recognition' }
              ])}
          </div>
        );

      case 'warranty':
        return (
          <div className="space-y-4">
            {renderEditableField('Basic Warranty', editedCar.specs?.warranty?.basic,
              (value) => handleSpecChange('warranty', 'basic', value))}
            {renderEditableField('Powertrain Warranty', editedCar.specs?.warranty?.powertrain,
              (value) => handleSpecChange('warranty', 'powertrain', value))}
            {renderEditableField('Corrosion Warranty', editedCar.specs?.warranty?.corrosion,
              (value) => handleSpecChange('warranty', 'corrosion', value))}
            {renderEditableField('Roadside Assistance', editedCar.specs?.warranty?.roadside,
              (value) => handleSpecChange('warranty', 'roadside', value))}
            {renderEditableField('Maintenance Coverage', editedCar.specs?.warranty?.maintenance,
              (value) => handleSpecChange('warranty', 'maintenance', value))}
          </div>
        );

      default:
        return null;
    }
  };

  const renderTechnologyTab = () => {
    return (
      <div className="space-y-8 fade-in">
        {/* Infotainment Section */}
        <div className="spec-section">
          <div className="spec-header">
            <svg className="w-6 h-6 tech-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h3 className="text-xl font-semibold">Infotainment</h3>
          </div>
          <div className="spec-grid">
            {renderSpecItem('Infotainment System', car.specs.technology.infotainmentSystem)}
            {renderSpecItem('Screen Size', car.specs.technology.screenSize ? `${car.specs.technology.screenSize} inches` : null)}
            {renderSpecItem('Apple CarPlay', car.specs.technology.appleCarPlay)}
            {renderSpecItem('Android Auto', car.specs.technology.androidAuto)}
          </div>
        </div>

        {/* Driver Assistance Section */}
        <div className="spec-section">
          <div className="spec-header">
            <svg className="w-6 h-6 tech-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <h3 className="text-xl font-semibold">Driver Assistance</h3>
          </div>
          <div className="spec-grid">
            {renderSpecItem('Adaptive Cruise Control', car.specs.technology.adaptiveCruiseControl)}
            {renderSpecItem('Lane Keep Assist', car.specs.technology.laneKeepAssist)}
            {renderSpecItem('Blind Spot Monitoring', car.specs.technology.blindSpotMonitoring)}
            {renderSpecItem('Parking Assist', car.specs.technology.parkingAssist)}
            {renderSpecItem('Night Vision', car.specs.technology.nightVision)}
            {renderSpecItem('Head-Up Display', car.specs.technology.headUpDisplay)}
            {renderSpecItem('360° Camera', car.specs.technology.surroundViewCamera)}
          </div>
        </div>

        {/* Connectivity Section */}
        <div className="spec-section">
          <div className="spec-header">
            <svg className="w-6 h-6 tech-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
            </svg>
            <h3 className="text-xl font-semibold">Connectivity</h3>
          </div>
          <div className="spec-grid">
            {renderSpecItem('Bluetooth', car.specs.technology.bluetooth)}
            {renderSpecItem('Wireless Charging', car.specs.technology.wirelessCharging)}
            {renderSpecItem('Wi-Fi Hotspot', car.specs.technology.wifi)}
            {renderSpecItem('Sound System', car.specs.technology.soundSystem)}
            {renderSpecItem('Number of Speakers', car.specs.technology.speakers)}
          </div>
        </div>

        {/* Digital Experience Section */}
        <div className="spec-section">
          <div className="spec-header">
            <svg className="w-6 h-6 tech-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <h3 className="text-xl font-semibold">Digital Experience</h3>
          </div>
          <div className="spec-grid">
            {renderSpecItem('Digital Key', car.specs.technology.digitalKey)}
            {renderSpecItem('Mobile App Integration', car.specs.technology.mobileApp)}
            {renderSpecItem('Over-the-Air Updates', car.specs.technology.overTheAirUpdates)}
            {renderSpecItem('Voice Control', car.specs.technology.voiceControl)}
            {car.specs.technology.voiceControl && renderSpecItem('Voice Assistant', car.specs.technology.voiceAssistantName)}
          </div>
        </div>
      </div>
    );
  };

  const renderSpecItem = (label: string, value: any) => {
    let displayValue = value;
    if (value === null || value === undefined || value === '') {
      displayValue = 'NA';
    } else if (typeof value === 'boolean') {
      displayValue = value ? (
        <span className="feature-badge">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Available
        </span>
      ) : (
        <span className="feature-badge" style={{ background: 'linear-gradient(135deg, #475569 0%, #334155 100%)' }}>
          Not Available
        </span>
      );
    }

    return (
      <div className="spec-item slide-in">
        <div className="spec-label">{label}</div>
        <div className="spec-value">{displayValue}</div>
      </div>
    );
  };

  const renderTabContent = (tabContent: string) => {
    switch (tabContent) {
      case 'overview':
        return (
          <div className="space-y-4">
            {renderSpecRow('Make', car.make)}
            {renderSpecRow('Model', car.model)}
            {renderSpecRow('Year', car.year)}
            {renderSpecRow('Price', `$${car.price?.toLocaleString()}`)}
            {renderSpecRow('Status', car.status)}
            <div className="flex items-center">
              <div className="flex items-center">
                {[0, 1, 2, 3, 4].map((rating) => (
                  <StarIcon
                    key={rating}
                    className={classNames(
                      car.rating > rating ? 'text-yellow-400' : 'text-gray-200',
                      'h-5 w-5 flex-shrink-0'
                    )}
                  />
                ))}
              </div>
              <p className="ml-2 text-sm text-gray-500">{car.rating?.toFixed(1) || '0.0'}</p>
            </div>
          </div>
        );

      case 'engine':
        return (
          <div className="space-y-4">
            {renderSpecRow('Engine Type', specs.engine?.type)}
            {renderSpecRow('Engine Code', specs.engine?.code)}
            {renderSpecRow('Displacement (cc)', specs.engine?.displacement)}
            {renderSpecRow('Cylinders', specs.engine?.cylinders)}
            {renderSpecRow('Power Output (HP)', specs.engine?.powerOutput)}
            {renderSpecRow('Torque (Nm)', specs.engine?.torque)}
            {renderSpecRow('Compression Ratio', specs.engine?.compressionRatio)}
            {renderSpecRow('Bore (mm)', specs.engine?.bore)}
            {renderSpecRow('Stroke (mm)', specs.engine?.stroke)}
            {renderSpecRow('Valve System', specs.engine?.valveSystem)}
            {renderSpecRow('Valves per Cylinder', specs.engine?.valvesPerCylinder)}
            {renderSpecRow('Fuel Injection', specs.engine?.fuelInjection)}
            {renderSpecRow('Aspiration', specs.engine?.aspiration)}
            {renderSpecRow('Boost Pressure (bar)', specs.engine?.boostPressure)}
            {renderSpecRow('Redline RPM', specs.engine?.redlineRpm)}
            {renderSpecRow('Idle RPM', specs.engine?.idleRpm)}
            {renderSpecRow('Engine Position', specs.engine?.position)}
            {renderSpecRow('Engine Orientation', specs.engine?.orientation)}
            {renderSpecRow('Engine Weight (kg)', specs.engine?.weight)}
            {renderSpecRow('Engine Oil Capacity (L)', specs.engine?.oilCapacity)}
            {renderSpecRow('Cooling System', specs.engine?.coolingSystem)}
          </div>
        );

      case 'performance':
        return (
          <div className="space-y-4">
            {renderSpecRow('Power to Weight Ratio (hp/ton)', specs.performance?.powerToWeightRatio)}
            {renderSpecRow('Top Speed (km/h)', specs.performance?.topSpeed)}
            {renderSpecRow('0-60 mph (seconds)', specs.performance?.zeroToSixty)}
            {renderSpecRow('0-100 km/h (seconds)', specs.performance?.zeroToHundred)}
            {renderSpecRow('Quarter Mile Time (seconds)', specs.performance?.quarterMileTime)}
            {renderSpecRow('Quarter Mile Speed (km/h)', specs.performance?.quarterMileSpeed)}
            {renderSpecRow('Braking 100-0 km/h (meters)', specs.performance?.brakingDistance)}
            {renderSpecRow('Lateral G-Force', specs.performance?.lateralG)}
            {renderSpecRow('Nürburgring Lap Time', specs.performance?.nurburgringTime)}
            {renderSpecRow('Acceleration 50-75 mph (seconds)', specs.performance?.passingAcceleration)}
            {renderSpecRow('Standing Start 1km (seconds)', specs.performance?.standingKm)}
            {renderSpecRow('Elasticity 80-120 km/h (seconds)', specs.performance?.elasticity)}
            {renderSpecRow('Launch Control', specs.performance?.launchControl)}
            {renderSpecRow('Performance Mode', specs.performance?.performanceMode)}
          </div>
        );

      case 'chassis':
        return (
          <div className="space-y-4">
            {renderSpecRow('Body Type', specs.chassis?.bodyType)}
            {renderSpecRow('Platform', specs.chassis?.platform)}
            {renderSpecRow('Front Suspension', specs.chassis?.frontSuspension)}
            {renderSpecRow('Rear Suspension', specs.chassis?.rearSuspension)}
            {renderSpecRow('Front Brakes', specs.chassis?.frontBrakes)}
            {renderSpecRow('Rear Brakes', specs.chassis?.rearBrakes)}
            {renderSpecRow('Wheel Size', specs.chassis?.wheelSize)}
            {renderSpecRow('Tire Size', specs.chassis?.tireSize)}
          </div>
        );

      case 'dimensions':
        return (
          <div className="space-y-4">
            {renderSpecRow('Length', specs.dimensions?.length)}
            {renderSpecRow('Width', specs.dimensions?.width)}
            {renderSpecRow('Height', specs.dimensions?.height)}
            {renderSpecRow('Wheelbase', specs.dimensions?.wheelbase)}
            {renderSpecRow('Ground Clearance', specs.dimensions?.groundClearance)}
            {renderSpecRow('Weight', specs.dimensions?.weight)}
            {renderSpecRow('Weight Distribution', specs.dimensions?.weightDistribution)}
            {renderSpecRow('Drag Coefficient', specs.dimensions?.dragCoefficient)}
          </div>
        );

      case 'transmission':
        return (
          <div className="space-y-4">
            {renderSpecRow('Transmission Type', specs.transmission?.type)}
            {renderSpecRow('Gears', specs.transmission?.gears)}
            {renderSpecRow('Clutch Type', specs.transmission?.clutchType)}
            {renderSpecRow('Drive Type', specs.transmission?.driveType)}
            {renderSpecRow('Differential', specs.transmission?.differential)}
          </div>
        );

      case 'fuel':
        return (
          <div className="space-y-4">
            {renderSpecRow('Fuel Type', specs.fuel?.type)}
            {renderSpecRow('Fuel System', specs.fuel?.system)}
            {renderSpecRow('Tank Capacity', specs.fuel?.tankCapacity)}
            {renderSpecRow('City MPG', specs.fuel?.cityMpg)}
            {renderSpecRow('Highway MPG', specs.fuel?.highwayMpg)}
            {renderSpecRow('Combined MPG', specs.fuel?.combinedMpg)}
            {renderSpecRow('Emission Standard', specs.fuel?.emissionStandard)}
          </div>
        );

      case 'interior':
        return (
          <div className="space-y-4">
            {renderSpecRow('Seating Capacity', specs.interior?.seatingCapacity)}
            {renderSpecRow('Doors', specs.interior?.doors)}
            {renderSpecRow('Trunk Capacity', specs.interior?.trunkCapacity)}
            {renderSpecRow('Infotainment Screen', specs.interior?.infotainmentScreen)}
            {renderSpecRow('Sound System', specs.interior?.soundSystem)}
            {renderSpecRow('Climate Zones', specs.interior?.climateZones)}
            {renderSpecRow('Upholstery Material', specs.interior?.upholsteryMaterial)}
          </div>
        );

      case 'safety':
        return (
          <div className="space-y-4">
            {renderSpecRow('Airbags', specs.safety?.airbags)}
            {renderSpecRow('ABS', specs.safety?.abs)}
            {renderSpecRow('Stability Control', specs.safety?.stabilityControl)}
            {renderSpecRow('Traction Control', specs.safety?.tractionControl)}
            {renderSpecRow('Parking Sensors', specs.safety?.parkingSensors)}
            {renderSpecRow('Camera System', specs.safety?.camera)}
            {renderSpecRow('Blind Spot Monitoring', specs.safety?.blindSpotMonitoring)}
            {renderSpecRow('Lane Departure Warning', specs.safety?.laneDepartureWarning)}
            {renderSpecRow('Collision Warning', specs.safety?.collisionWarning)}
            {renderSpecRow('Night Vision', specs.safety?.nightVision)}
          </div>
        );

      case 'technology':
        return (
          <div className="space-y-4">
            {renderSpecRow('Connectivity', specs.technology?.connectivity)}
            {renderSpecRow('Smartphone Integration', specs.technology?.smartphone)}
            {renderSpecRow('Navigation System', specs.technology?.navigation)}
            {renderSpecRow('Headlight Type', specs.technology?.headlightType)}
            {renderSpecRow('Adaptive Cruise Control', specs.technology?.adaptiveCruiseControl)}
            {renderSpecRow('Keyless Entry', specs.technology?.keylessEntry)}
            {renderSpecRow('Start System', specs.technology?.startSystem)}
            {renderSpecRow('Driver Assistance Features', specs.technology?.driverAssistance)}
          </div>
        );

      case 'warranty':
        return (
          <div className="space-y-4">
            {renderSpecRow('Basic Warranty', specs.warranty?.basic)}
            {renderSpecRow('Powertrain Warranty', specs.warranty?.powertrain)}
            {renderSpecRow('Corrosion Warranty', specs.warranty?.corrosion)}
            {renderSpecRow('Roadside Assistance', specs.warranty?.roadside)}
            {renderSpecRow('Maintenance Coverage', specs.warranty?.maintenance)}
          </div>
        );

      default:
        return null;
    }
  };

  const renderSpecRow = (label: string, value: any) => {
    let displayValue = value;

    // Handle different types of values
    if (value === null || value === undefined || value === '') {
      displayValue = 'NA';
    } else if (typeof value === 'boolean') {
      displayValue = value ? 'Yes' : 'No';
    } else if (Array.isArray(value)) {
      displayValue = value.length > 0 ? value.join(', ') : 'NA';
    }

    return (
      <div className="grid grid-cols-2 gap-4 py-2 border-b border-gray-200">
        <div className="text-sm font-medium text-gray-500">{label}</div>
        <div className="text-sm text-gray-900">{displayValue}</div>
      </div>
    );
  };

  const TechnologySection = ({ car, isEditing, onEdit }: any) => {
    return (
      <div className="spec-section">
        <div className="spec-header">
          <h3>Technology Features</h3>
        </div>
        <div className="spec-grid">
          {/* Infotainment */}
          <div className="spec-card">
            <h4 className="text-lg font-semibold mb-4">Infotainment</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="tech-icon">📱</span>
                <span>{car.specs.technology.infotainmentSystem || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="tech-icon">📺</span>
                <span>{car.specs.technology.screenSize ? `${car.specs.technology.screenSize}" Display` : 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={classNames('tech-icon', { 'text-green-500': car.specs.technology.appleCarPlay })}>
                  🍎
                </span>
                <span>Apple CarPlay {car.specs.technology.appleCarPlay ? '✓' : '✗'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={classNames('tech-icon', { 'text-green-500': car.specs.technology.androidAuto })}>
                  🤖
                </span>
                <span>Android Auto {car.specs.technology.androidAuto ? '✓' : '✗'}</span>
              </div>
            </div>
          </div>

          {/* Driver Assistance */}
          <div className="spec-card">
            <h4 className="text-lg font-semibold mb-4">Driver Assistance</h4>
            <div className="space-y-3">
              {Object.entries({
                'Adaptive Cruise Control': car.specs.technology.adaptiveCruiseControl,
                'Lane Keep Assist': car.specs.technology.laneKeepAssist,
                'Blind Spot Monitoring': car.specs.technology.blindSpotMonitoring,
                'Parking Assist': car.specs.technology.parkingAssist,
                'Night Vision': car.specs.technology.nightVision,
                'Head-Up Display': car.specs.technology.headUpDisplay,
                '360° Camera': car.specs.technology.surroundViewCamera,
              }).map(([feature, enabled]) => (
                <div key={feature} className="flex items-center gap-2">
                  <span className={classNames('tech-icon', { 'text-green-500': enabled })}>
                    {enabled ? '✓' : '✗'}
                  </span>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Connectivity */}
          <div className="spec-card">
            <h4 className="text-lg font-semibold mb-4">Connectivity</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className={classNames('tech-icon', { 'text-green-500': car.specs.technology.bluetooth })}>
                  📶
                </span>
                <span>Bluetooth {car.specs.technology.bluetooth ? '✓' : '✗'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={classNames('tech-icon', { 'text-green-500': car.specs.technology.wirelessCharging })}>
                  🔋
                </span>
                <span>Wireless Charging {car.specs.technology.wirelessCharging ? '✓' : '✗'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={classNames('tech-icon', { 'text-green-500': car.specs.technology.wifi })}>
                  📡
                </span>
                <span>Wi-Fi Hotspot {car.specs.technology.wifi ? '✓' : '✗'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="tech-icon">🔊</span>
                <span>{car.specs.technology.soundSystem || 'Standard Audio'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="tech-icon">🔈</span>
                <span>{car.specs.technology.speakers || 'N/A'} Speakers</span>
              </div>
            </div>
          </div>

          {/* Digital Experience */}
          <div className="spec-card">
            <h4 className="text-lg font-semibold mb-4">Digital Experience</h4>
            <div className="space-y-3">
              {Object.entries({
                'Digital Key': car.specs.technology.digitalKey,
                'Mobile App': car.specs.technology.mobileApp,
                'Over-the-Air Updates': car.specs.technology.overTheAirUpdates,
                'Voice Control': car.specs.technology.voiceControl,
              }).map(([feature, enabled]) => (
                <div key={feature} className="flex items-center gap-2">
                  <span className={classNames('tech-icon', { 'text-green-500': enabled })}>
                    {enabled ? '✓' : '✗'}
                  </span>
                  <span>{feature}</span>
                </div>
              ))}
              {car.specs.technology.voiceAssistantName && (
                <div className="flex items-center gap-2">
                  <span className="tech-icon">🎤</span>
                  <span>Voice Assistant: {car.specs.technology.voiceAssistantName}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error.message} />;
  if (!data?.car) return <ErrorMessage message="Car not found" />;

  const { car } = data;
  const specs = car.specs || {};

  const tabs = [
    { name: 'Overview', content: 'overview' },
    { name: 'Engine', content: 'engine' },
    { name: 'Performance', content: 'performance' },
    { name: 'Chassis', content: 'chassis' },
    { name: 'Dimensions', content: 'dimensions' },
    { name: 'Transmission', content: 'transmission' },
    { name: 'Fuel', content: 'fuel' },
    { name: 'Interior', content: 'interior' },
    { name: 'Safety', content: 'safety' },
    { name: 'Technology', content: 'technology' },
    { name: 'Warranty', content: 'warranty' }
  ];

  const renderFormErrors = () => {
    return Object.entries(formErrors).map(([key, error]) => (
      <div key={key} className="text-red-500 text-sm mb-2">
        {error}
      </div>
    ));
  };

  return (
    <div>
      {renderFormErrors()}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Image Gallery */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {car.images?.map((image: string, index: number) => (
              <img
                key={index}
                src={image}
                alt={`${car.make} ${car.model} - Image ${index + 1}`}
                className="h-64 w-full object-cover rounded-lg"
              />
            ))}
          </div>

          {/* Admin Controls */}
          {user?.role === 'ADMIN' && (
            <div className="flex space-x-4">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                {isEditing ? 'Cancel Edit' : 'Edit Car'}
              </button>
              <button
                onClick={() => setIsAddingImage(!isAddingImage)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
              >
                Add Image
              </button>
              {isEditing && (
                <button
                  onClick={handleSave}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  Save Changes
                </button>
              )}
            </div>
          )}

          {/* Specifications Tabs */}
          <Tab.Group>
            <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
              {tabs.map((tab) => (
                <Tab
                  key={tab.name}
                  className={({ selected }) =>
                    classNames(
                      'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                      'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                      selected
                        ? 'bg-white text-blue-700 shadow'
                        : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                    )
                  }
                >
                  {tab.name}
                </Tab>
              ))}
            </Tab.List>
            <Tab.Panels className="mt-2">
              {tabs.map((tab) => (
                <Tab.Panel
                  key={tab.content}
                  className={classNames(
                    'rounded-xl bg-white p-3',
                    'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'
                  )}
                >
                  {isEditing ? (tab.content === 'technology' ? renderTechnologyTab() : renderEditableTabContent(tab.content)) : renderTabContent(tab.content)}
                </Tab.Panel>
              ))}
            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>
    </div>
  );
};

export default CarDetails;
