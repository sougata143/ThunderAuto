import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useNavigate } from 'react-router-dom'
import { GET_CARS, DELETE_CAR } from '../graphql/queries'
import { useAuth } from '../contexts/AuthContext'

export default function AdminCarManagement() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [selectedCar, setSelectedCar] = useState<string | null>(null)

  // Fetch cars
  const { loading, error, data } = useQuery(GET_CARS)

  // Delete car mutation
  const [deleteCar] = useMutation(DELETE_CAR, {
    refetchQueries: [{ query: GET_CARS }],
  })

  // Handle car deletion
  const handleDelete = async (carId: string) => {
    if (window.confirm('Are you sure you want to delete this car?')) {
      try {
        await deleteCar({
          variables: { id: carId },
        })
      } catch (error) {
        console.error('Error deleting car:', error)
      }
    }
  }

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Access denied. Admin privileges required.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Error loading cars. Please try again later.</p>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">Cars</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all cars in the database including their make, model, year, and price.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            onClick={() => navigate('/admin/cars/new')}
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Add car
          </button>
        </div>
      </div>
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Make & Model
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Year
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Price
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Engine Type
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {data?.cars.map((car: any) => (
                    <tr key={car.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {car.make} {car.carModel}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{car.year}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        ${car.price.toLocaleString()}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{car.engineType}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span
                          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            car.status === 'PUBLISHED'
                              ? 'bg-green-100 text-green-800'
                              : car.status === 'DRAFT'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {car.status.toLowerCase()}
                        </span>
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => navigate(`/admin/cars/${car.id}/edit`)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <PencilIcon className="h-5 w-5" aria-hidden="true" />
                            <span className="sr-only">Edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(car.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <TrashIcon className="h-5 w-5" aria-hidden="true" />
                            <span className="sr-only">Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
