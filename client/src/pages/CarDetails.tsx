import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_CAR_BY_ID } from '../graphql/queries';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const CarDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { loading, error, data } = useQuery(GET_CAR_BY_ID, {
    variables: { id },
  });

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error.message} />;
  if (!data?.car) return <div>Car not found</div>;

  const { car } = data;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Car Header */}
        <div className="relative h-96">
          <img
            src={car.images[0]?.url || '/placeholder-car.jpg'}
            alt={car.fullName}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
            <h1 className="text-4xl font-bold text-white">{car.fullName}</h1>
            <p className="text-xl text-gray-200">Year: {car.year}</p>
          </div>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          <InfoCard title="Price" value={`$${car.price.toLocaleString()}`} />
          <InfoCard title="Rating" value={`${car.rating}/5`} />
          <InfoCard title="Engine Type" value={car.engineType} />
          <InfoCard title="Transmission" value={car.transmission} />
          <InfoCard title="Power" value={`${car.power} hp`} />
          <InfoCard title="Acceleration" value={`${car.acceleration} s (0-60)`} />
        </div>

        {/* Detailed Specs */}
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Detailed Specifications</h2>
          
          {/* Engine */}
          <SpecSection title="Engine">
            <SpecGrid>
              <SpecItem label="Displacement" value={`${car.specs.engine.displacement}L`} />
              <SpecItem label="Cylinders" value={car.specs.engine.cylinders} />
              <SpecItem label="Configuration" value={car.specs.engine.configuration} />
              <SpecItem label="Fuel Injection" value={car.specs.engine.fuelInjection} />
              <SpecItem label="Turbocharger" value={car.specs.engine.turbocharger ? "Yes" : "No"} />
              <SpecItem label="Supercharger" value={car.specs.engine.supercharger ? "Yes" : "No"} />
            </SpecGrid>
          </SpecSection>

          {/* Performance */}
          <SpecSection title="Performance">
            <SpecGrid>
              <SpecItem label="Power to Weight" value={`${car.specs.performance.powerToWeight} hp/ton`} />
              <SpecItem label="Top Speed" value={`${car.specs.performance.topSpeed} mph`} />
              <SpecItem label="0-60 mph" value={`${car.specs.performance.acceleration060} s`} />
              <SpecItem label="Quarter Mile" value={`${car.specs.performance.quarterMile} s`} />
            </SpecGrid>
          </SpecSection>

          {/* Dimensions */}
          <SpecSection title="Dimensions">
            <SpecGrid>
              <SpecItem label="Length" value={`${car.specs.dimensions.length} mm`} />
              <SpecItem label="Width" value={`${car.specs.dimensions.width} mm`} />
              <SpecItem label="Height" value={`${car.specs.dimensions.height} mm`} />
              <SpecItem label="Wheelbase" value={`${car.specs.dimensions.wheelbase} mm`} />
              <SpecItem label="Weight" value={`${car.specs.dimensions.weight} kg`} />
            </SpecGrid>
          </SpecSection>

          {/* Interior */}
          <SpecSection title="Interior">
            <SpecGrid>
              <SpecItem label="Seating Capacity" value={car.specs.interior.seatingCapacity} />
              <SpecItem label="Trunk Capacity" value={`${car.specs.interior.trunkCapacity}L`} />
              <SpecItem label="Infotainment" value={car.specs.interior.infotainmentScreen} />
              <SpecItem label="Sound System" value={car.specs.interior.soundSystem} />
              <SpecItem label="Climate Zones" value={car.specs.interior.climateZones} />
            </SpecGrid>
          </SpecSection>

          {/* Safety */}
          <SpecSection title="Safety">
            <SpecGrid>
              <SpecItem label="Airbags" value={car.specs.safety.airbags} />
              <SpecItem label="ABS" value={car.specs.safety.abs ? "Yes" : "No"} />
              <SpecItem label="Stability Control" value={car.specs.safety.stabilityControl ? "Yes" : "No"} />
              <SpecItem label="Parking Sensors" value={car.specs.safety.parkingSensors ? "Yes" : "No"} />
              <SpecItem label="Camera System" value={car.specs.safety.camera} />
            </SpecGrid>
          </SpecSection>
        </div>

        {/* Reviews Section */}
        <div className="p-6 bg-gray-50">
          <h2 className="text-2xl font-bold mb-4">Reviews</h2>
          {car.reviews.map((review: any) => (
            <div key={review.id} className="mb-4 p-4 bg-white rounded-lg shadow">
              <div className="flex items-center mb-2">
                <span className="font-semibold mr-2">
                  {review.user.firstName} {review.user.lastName}
                </span>
                <span className="text-yellow-500">{'★'.repeat(Math.round(review.rating))}</span>
              </div>
              <p className="text-gray-600">{review.comment}</p>
              <p className="text-sm text-gray-400 mt-2">
                {new Date(review.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Helper Components
const InfoCard: React.FC<{ title: string; value: string | number }> = ({ title, value }) => (
  <div className="bg-gray-50 p-4 rounded-lg">
    <h3 className="text-gray-500 text-sm">{title}</h3>
    <p className="text-xl font-semibold">{value}</p>
  </div>
);

const SpecSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-8">
    <h3 className="text-xl font-semibold mb-4">{title}</h3>
    {children}
  </div>
);

const SpecGrid: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {children}
  </div>
);

const SpecItem: React.FC<{ label: string; value: string | number | boolean }> = ({ label, value }) => (
  <div className="flex justify-between p-2 bg-gray-50 rounded">
    <span className="text-gray-600">{label}</span>
    <span className="font-medium">{value}</span>
  </div>
);

export default CarDetails;
