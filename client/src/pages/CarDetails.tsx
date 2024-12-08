import React, { useState, useRef, ChangeEvent } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_CAR_BY_ID } from '../graphql/queries';
import { UPDATE_CAR, ADD_CAR_IMAGE, UPLOAD_CAR_IMAGE } from '../graphql/mutations';
import { useAuth } from '../contexts/AuthContext';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const CarDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedCar, setEditedCar] = useState<any>(null);
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

  const [addCarImage, { loading: addingImage }] = useMutation(ADD_CAR_IMAGE, {
    onCompleted: () => {
      setIsAddingImage(false);
      setNewImage({ url: '', caption: '', isFeatured: false });
      refetch();
    },
    onError: (error) => {
      console.error('Error adding image:', error);
    },
  });

  const [uploadCarImage, { loading: uploading }] = useMutation(UPLOAD_CAR_IMAGE, {
    onCompleted: () => {
      setIsAddingImage(false);
      setNewImage({ url: '', caption: '', isFeatured: false });
      setSelectedFile(null);
      refetch();
    },
    onError: (error) => {
      console.error('Error uploading image:', error);
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

  const handleAddImage = () => {
    setIsAddingImage(true);
  };

  const handleCancelAddImage = () => {
    setIsAddingImage(false);
    setNewImage({ url: '', caption: '', isFeatured: false });
    setSelectedFile(null);
  };

  const handleSaveImage = async () => {
    try {
      if (uploadMethod === 'url') {
        await addCarImage({
          variables: {
            carId: car.id,
            input: newImage
          }
        });
      } else if (selectedFile) {
        await uploadCarImage({
          variables: {
            carId: car.id,
            file: selectedFile,
            caption: newImage.caption,
            isFeatured: newImage.isFeatured
          }
        });
      }
    } catch (error) {
      console.error('Error adding/uploading image:', error);
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

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
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
                <div className="space-x-2">
                  <button
                    onClick={handleEdit}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                  >
                    Edit Car
                  </button>
                  <button
                    onClick={handleAddImage}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                  >
                    Add Image
                  </button>
                </div>
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

          {/* Add Image Form */}
          {isAddingImage && (
            <div className="mt-4 p-4 border rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Add New Image</h3>
              <div className="space-y-4">
                {/* Upload Method Selection */}
                <div className="flex space-x-4 mb-4">
                  <button
                    onClick={() => setUploadMethod('url')}
                    className={`px-4 py-2 rounded-lg ${
                      uploadMethod === 'url'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Enter URL
                  </button>
                  <button
                    onClick={() => setUploadMethod('file')}
                    className={`px-4 py-2 rounded-lg ${
                      uploadMethod === 'file'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Upload File
                  </button>
                </div>

                {/* URL Input */}
                {uploadMethod === 'url' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Image URL</label>
                    <input
                      type="text"
                      value={newImage.url}
                      onChange={(e) => setNewImage({ ...newImage, url: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter image URL"
                    />
                  </div>
                )}

                {/* File Upload */}
                {uploadMethod === 'file' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Upload Image</label>
                    <div className="mt-1 flex items-center">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Choose File
                      </button>
                      {selectedFile && (
                        <span className="ml-3 text-sm text-gray-600">
                          {selectedFile.name}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Caption */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Caption</label>
                  <input
                    type="text"
                    value={newImage.caption}
                    onChange={(e) => setNewImage({ ...newImage, caption: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter image caption"
                  />
                </div>

                {/* Featured Image Checkbox */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newImage.isFeatured}
                    onChange={(e) => setNewImage({ ...newImage, isFeatured: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Set as featured image
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={handleSaveImage}
                    disabled={
                      uploading ||
                      addingImage ||
                      (uploadMethod === 'url' ? !newImage.url : !selectedFile)
                    }
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
                  >
                    {uploading || addingImage ? 'Saving...' : 'Save Image'}
                  </button>
                  <button
                    onClick={handleCancelAddImage}
                    disabled={uploading || addingImage}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
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
          {Object.entries(car.specs || {}).filter(([key]) => key !== '__typename').map(([category, specs]: [string, any]) => (
            <div key={category} className="mb-6">
              <h3 className="text-xl font-medium mb-3 capitalize">
                {category.replace(/([A-Z])/g, ' $1').trim()}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(specs || {}).filter(([key]) => key !== '__typename').map(([field, value]: [string, any]) => (
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
                        {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : 
                         Array.isArray(value) ? value.join(', ') : 
                         value?.toString() || 'N/A'}
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
