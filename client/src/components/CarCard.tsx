import { Link } from 'react-router-dom'
import { StarIcon } from '@heroicons/react/20/solid'

interface CarCardProps {
  car: {
    id: string
    make: string
    model: string
    year: number
    price: number
    engineType: string
    transmission: string
    images?: string[]
    rating: number
  }
}

export default function CarCard({ car }: CarCardProps) {
  // Default image if no images are available
  const defaultImage = '/placeholder-car.jpg'
  const displayImage = car.images?.length ? car.images[0] : defaultImage

  return (
    <Link to={`/cars/${car.id}`} className="group">
      <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-gray-200 xl:aspect-h-8 xl:aspect-w-7">
        <img
          src={displayImage}
          alt={`${car.make} ${car.model}`}
          className="h-full w-full object-cover object-center group-hover:opacity-75"
        />
      </div>
      <div className="mt-4 space-y-2">
        <h3 className="text-sm text-gray-700">
          {car.year} {car.make} {car.model}
        </h3>
        <div className="flex items-center">
          <div className="flex items-center">
            {[0, 1, 2, 3, 4].map((rating) => (
              <StarIcon
                key={rating}
                className={`
                  ${car.rating > rating ? 'text-yellow-400' : 'text-gray-200'}
                  h-5 w-5 flex-shrink-0
                `}
                aria-hidden="true"
              />
            ))}
          </div>
          <p className="ml-2 text-sm text-gray-500">
            {car.rating?.toFixed(1) || '0.0'}
          </p>
        </div>
        <p className="text-lg font-medium text-gray-900">
          ${(car.price || 0).toLocaleString()}
        </p>
        <div className="flex space-x-4 text-sm text-gray-500">
          <p>{car.engineType}</p>
          <p>{car.transmission}</p>
        </div>
      </div>
    </Link>
  )
}
