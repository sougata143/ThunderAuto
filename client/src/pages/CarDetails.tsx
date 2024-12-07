import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@apollo/client'
import { StarIcon } from '@heroicons/react/20/solid'
import { GET_CAR_DETAILS } from '../graphql/queries'
import { SpecificationGrid } from '../components/SpecificationCard'
import { getCarSpecifications } from '../utils/carSpecifications'
import ReviewForm from '../components/ReviewForm'
import FavoriteButton from '../components/FavoriteButton'

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function CarDetails() {
  const { id } = useParams<{ id: string }>()
  const [selectedImage, setSelectedImage] = useState(0)
  const { loading, error, data, refetch } = useQuery(GET_CAR_DETAILS, {
    variables: { id },
  })

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error || !data?.car) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Error loading car details. Please try again later.</p>
      </div>
    )
  }

  const { car } = data
  const specifications = getCarSpecifications(car)

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Car Header */}
        <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
          {/* Image Gallery */}
          <div className="flex flex-col">
            <div className="aspect-h-3 aspect-w-4 overflow-hidden rounded-lg">
              <img
                src={car.images[selectedImage] || '/placeholder-car.jpg'}
                alt={`${car.make} ${car.model}`}
                className="h-full w-full object-cover object-center"
              />
            </div>
            <div className="mt-4 grid grid-cols-4 gap-4">
              {car.images.map((image: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={classNames(
                    'relative aspect-h-3 aspect-w-4 overflow-hidden rounded-lg',
                    selectedImage === idx ? 'ring-2 ring-blue-500' : 'ring-1 ring-gray-200'
                  )}
                >
                  <img
                    src={image}
                    alt={`${car.make} ${car.model}`}
                    className="h-full w-full object-cover object-center"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Car Info */}
          <div className="mt-10 lg:mt-0">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              {car.year} {car.make} {car.model}
            </h1>

            <div className="mt-4 flex items-center justify-between">
              <p className="text-3xl tracking-tight text-gray-900">
                ${car.price?.toLocaleString()}
              </p>
              <FavoriteButton carId={car.id} isFavorited={false} />
            </div>

            {/* Rating */}
            <div className="mt-4">
              <div className="flex items-center">
                <div className="flex items-center">
                  {[0, 1, 2, 3, 4].map((rating) => (
                    <StarIcon
                      key={rating}
                      className={classNames(
                        car.rating > rating ? 'text-yellow-400' : 'text-gray-300',
                        'h-5 w-5 flex-shrink-0'
                      )}
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <p className="ml-3 text-sm text-gray-700">
                  {car.rating.toFixed(1)} out of 5 stars
                </p>
              </div>
            </div>

            {/* Quick Specs */}
            <div className="mt-8 border-t border-gray-200 pt-8">
              <h2 className="text-lg font-medium text-gray-900">Quick Specifications</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex justify-between border-b border-gray-200 py-2">
                  <span className="text-sm text-gray-500">Engine</span>
                  <span className="text-sm font-medium text-gray-900">{car.engineType}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 py-2">
                  <span className="text-sm text-gray-500">Power</span>
                  <span className="text-sm font-medium text-gray-900">{car.power} hp</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 py-2">
                  <span className="text-sm text-gray-500">Transmission</span>
                  <span className="text-sm font-medium text-gray-900">{car.transmission}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 py-2">
                  <span className="text-sm text-gray-500">0-60 mph</span>
                  <span className="text-sm font-medium text-gray-900">{car.acceleration}s</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Specifications */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-8">
            Detailed Specifications
          </h2>
          <SpecificationGrid specifications={specifications} />
        </div>

        {/* Reviews Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-8">
            Reviews
          </h2>
          <div className="space-y-8">
            <ReviewForm carId={car.id} onSuccess={() => refetch()} />
            {car.reviews.map((review: any) => (
              <div key={review.id} className="bg-white shadow sm:rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">{review.user.name}</h4>
                    <div className="mt-1 flex items-center">
                      {[0, 1, 2, 3, 4].map((rating) => (
                        <StarIcon
                          key={rating}
                          className={classNames(
                            review.rating > rating ? 'text-yellow-400' : 'text-gray-300',
                            'h-5 w-5 flex-shrink-0'
                          )}
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-4 text-gray-600">{review.comment}</p>
              </div>
            ))}
            {car.reviews.length === 0 && (
              <p className="text-center text-gray-500">No reviews yet. Be the first to review!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
