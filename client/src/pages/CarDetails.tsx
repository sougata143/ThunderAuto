import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_CAR_BY_ID } from '../graphql/queries';
import { UPDATE_CAR } from '../graphql/mutations';
import { useAuth } from '../contexts/AuthContext';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const CarDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedCar, setEditedCar] = useState<any>(null);

  const { loading, error, data } = useQuery(GET_CAR_BY_ID, {
    variables: { id },
    onCompleted: (data) => {
      setEditedCar(data.car);
    },
  });

  const [updateCar, { loading: updating }] = useMutation(UPDATE_CAR, {
    onCompleted: () => {
      setIsEditing(false);
    },
    onError: (error) => {
      console.error('Error updating car:', error);
    },
  });

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error.message} />;
  if (!data?.car) return <ErrorMessage message="Car not found" />;

  const { car } = data;

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedCar(car);
  };

  const handleSave = async () => {
    try {
      await updateCar({
        variables: {
          id: car.id,
          input: {
            make: editedCar.make,
            carModel: editedCar.carModel,
            year: editedCar.year,
            price: editedCar.price,
            engineType: editedCar.engineType,
            transmission: editedCar.transmission,
            power: editedCar.power,
            acceleration: editedCar.acceleration,
            status: editedCar.status,
            specs: editedCar.specs,
          },
        },
      });
    } catch (error) {
      console.error('Error saving car:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setEditedCar((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSpecsChange = (category: string, field: string, value: any) => {
    setEditedCar((prev: any) => ({
      ...prev,
      specs: {
        ...prev.specs,
        [category]: {
          ...prev.specs[category],
          [field]: value,
        },
      },
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Header with Edit Button for Admin */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{car.fullName}</h1>
          {user?.role === 'ADMIN' && (
            <div>
              {isEditing ? (
                <div className="space-x-2">
                  <button
                    onClick={handleSave}
                    disabled={updating}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                  >
                    {updating ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={updating}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleEdit}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Edit Car
                </button>
              )}
            </div>
          )}
        </div>

        {/* Car Images */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {car.images.map((image: any, index: number) => (
              <div key={index} className="relative">
                <img
                  src={image.url}
                  alt={image.caption || `${car.fullName} - Image ${index + 1}`}
                  className="w-full h-64 object-cover rounded-lg shadow-md"
                />
                {image.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 rounded-b-lg">
                    <p className="text-sm">{image.caption}</p>
                  </div>
                )}
                {image.isFeatured && (
                  <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-sm">
                    Featured
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {isEditing ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">Make</label>
                <input
                  type="text"
                  value={editedCar.make}
                  onChange={(e) => handleInputChange('make', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Model</label>
                <input
                  type="text"
                  value={editedCar.carModel}
                  onChange={(e) => handleInputChange('carModel', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Year</label>
                <input
                  type="number"
                  value={editedCar.year}
                  onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Price</label>
                <input
                  type="number"
                  value={editedCar.price}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <h2 className="text-xl font-semibold mb-2">Basic Information</h2>
                <p>
                  <span className="font-medium">Make:</span> {car.make}
                </p>
                <p>
                  <span className="font-medium">Model:</span> {car.carModel}
                </p>
                <p>
                  <span className="font-medium">Year:</span> {car.year}
                </p>
                <p>
                  <span className="font-medium">Price:</span> ${car.price.toLocaleString()}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Car Specifications */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Specifications</h2>
          {Object.entries(car.specs).map(([category, specs]: [string, any]) => (
            <div key={category} className="mb-6">
              <h3 className="text-xl font-medium mb-3 capitalize">{category}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(specs).map(([field, value]: [string, any]) => (
                  <div key={field}>
                    {isEditing ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 capitalize">
                          {field.replace(/([A-Z])/g, ' $1').trim()}
                        </label>
                        <input
                          type={typeof value === 'number' ? 'number' : 'text'}
                          value={editedCar.specs[category][field]}
                          onChange={(e) =>
                            handleSpecsChange(
                              category,
                              field,
                              typeof value === 'number' ? parseFloat(e.target.value) : e.target.value
                            )
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    ) : (
                      <p>
                        <span className="font-medium capitalize">
                          {field.replace(/([A-Z])/g, ' $1').trim()}:
                        </span>{' '}
                        {Array.isArray(value) ? value.join(', ') : value.toString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Last Updated Info */}
        <div className="mt-8 text-sm text-gray-500">
          <p>Last updated by: {car.lastUpdatedBy.firstName} {car.lastUpdatedBy.lastName}</p>
          <p>Last updated: {new Date(car.updatedAt).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default CarDetails;
