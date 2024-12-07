import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { StarIcon } from '@heroicons/react/20/solid'
import { HeartIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import { GET_USER_PROFILE } from '../graphql/queries'
import { UPDATE_PROFILE, REMOVE_FROM_FAVORITES } from '../graphql/mutations'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function Profile() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [activeTab, setActiveTab] = useState<'reviews' | 'favorites'>('reviews')

  const { data, loading, error } = useQuery(GET_USER_PROFILE)
  
  const [updateProfile] = useMutation(UPDATE_PROFILE, {
    onCompleted: () => setIsEditing(false),
  })

  const [removeFromFavorites] = useMutation(REMOVE_FROM_FAVORITES, {
    refetchQueries: ['GetUserProfile'],
  })

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateProfile({
        variables: {
          input: { name, email },
        },
      })
    } catch (err) {
      console.error('Error updating profile:', err)
    }
  }

  const handleRemoveFromFavorites = async (carId: string) => {
    try {
      await removeFromFavorites({
        variables: { carId },
      })
    } catch (err) {
      console.error('Error removing from favorites:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Error loading profile. Please try again later.</p>
      </div>
    )
  }

  const { me } = data

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="space-y-6">
        {/* Profile Section */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="sm:flex sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">Profile Information</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Update your personal information and manage your account.
                </p>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="mt-3 sm:mt-0 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={handleUpdateProfile} className="mt-6 space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="mt-6 border-t border-gray-200 pt-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Name</dt>
                    <dd className="mt-1 text-sm text-gray-900">{me.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900">{me.email}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Member Since</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(me.createdAt).toLocaleDateString()}
                    </dd>
                  </div>
                </dl>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('reviews')}
              className={classNames(
                activeTab === 'reviews'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
              )}
            >
              Reviews
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={classNames(
                activeTab === 'favorites'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
              )}
            >
              Favorites
            </button>
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'reviews' ? (
          <div className="space-y-6">
            {me.reviews.map((review: any) => (
              <div key={review.id} className="bg-white shadow sm:rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">
                      {review.car.year} {review.car.make} {review.car.model}
                    </h4>
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
            {me.reviews.length === 0 && (
              <p className="text-center text-gray-500">You haven't written any reviews yet.</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {me.favorites.map((car: any) => (
              <div key={car.id} className="bg-white shadow sm:rounded-lg overflow-hidden">
                <div className="aspect-w-3 aspect-h-2">
                  <img
                    src={car.images[0] || '/placeholder-car.jpg'}
                    alt={`${car.make} ${car.model}`}
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-medium text-gray-900">
                      {car.year} {car.make} {car.model}
                    </h4>
                    <button
                      onClick={() => handleRemoveFromFavorites(car.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <HeartIconSolid className="h-6 w-6" />
                    </button>
                  </div>
                  <p className="mt-2 text-xl font-semibold text-gray-900">
                    ${car.price?.toLocaleString()}
                  </p>
                  <div className="mt-4">
                    <Link
                      to={`/cars/${car.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            {me.favorites.length === 0 && (
              <p className="text-center text-gray-500 col-span-full">
                You haven't added any cars to your favorites yet.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
