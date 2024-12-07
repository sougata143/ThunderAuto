import { useState } from 'react'
import { useQuery } from '@apollo/client'
import { GET_CARS, GET_COMPARE_CARS } from '../graphql/queries'
import SearchBar from '../components/SearchBar'

interface Car {
  id: string
  make: string
  model: string
  year: number
  price: number
  engineType: string
  transmission: string
  fuelType: string
  power: number
  acceleration: number
  topSpeed: number
  specs: {
    dimensions: {
      length: number
      width: number
      height: number
      wheelbase: number
    }
    weight: number
    fuelCapacity: number
    trunkCapacity: number
    seatingCapacity: number
  }
}

export default function Compare() {
  const [selectedCars, setSelectedCars] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  const { data: searchData } = useQuery(GET_CARS, {
    variables: { filter: { search: searchQuery } },
    skip: !searchQuery,
  })

  const { data: compareData } = useQuery(GET_COMPARE_CARS, {
    variables: { ids: selectedCars },
    skip: selectedCars.length === 0,
  })

  const handleAddCar = (carId: string) => {
    if (selectedCars.length < 3) {
      setSelectedCars([...selectedCars, carId])
      setSearchQuery('')
    }
  }

  const handleRemoveCar = (carId: string) => {
    setSelectedCars(selectedCars.filter(id => id !== carId))
  }

  const renderComparisonTable = () => {
    if (!compareData?.compareCars || compareData.compareCars.length === 0) {
      return null
    }

    const cars = compareData.compareCars

    return (
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                    Specification
                  </th>
                  {cars.map((car: Car) => (
                    <th key={car.id} scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      {car.year} {car.make} {car.model}
                      <button
                        onClick={() => handleRemoveCar(car.id)}
                        className="ml-2 text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900">Price</td>
                  {cars.map((car: Car) => (
                    <td key={car.id} className="px-3 py-4 text-sm text-gray-500">
                      ${car.price?.toLocaleString()}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900">Engine Type</td>
                  {cars.map((car: Car) => (
                    <td key={car.id} className="px-3 py-4 text-sm text-gray-500">
                      {car.engineType}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900">Transmission</td>
                  {cars.map((car: Car) => (
                    <td key={car.id} className="px-3 py-4 text-sm text-gray-500">
                      {car.transmission}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900">Power</td>
                  {cars.map((car: Car) => (
                    <td key={car.id} className="px-3 py-4 text-sm text-gray-500">
                      {car.power} hp
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900">Acceleration (0-60)</td>
                  {cars.map((car: Car) => (
                    <td key={car.id} className="px-3 py-4 text-sm text-gray-500">
                      {car.acceleration}s
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900">Top Speed</td>
                  {cars.map((car: Car) => (
                    <td key={car.id} className="px-3 py-4 text-sm text-gray-500">
                      {car.topSpeed} mph
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900">Dimensions (L/W/H)</td>
                  {cars.map((car: Car) => (
                    <td key={car.id} className="px-3 py-4 text-sm text-gray-500">
                      {car.specs.dimensions.length}/{car.specs.dimensions.width}/{car.specs.dimensions.height} mm
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900">Weight</td>
                  {cars.map((car: Car) => (
                    <td key={car.id} className="px-3 py-4 text-sm text-gray-500">
                      {car.specs.weight} kg
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-3xl font-semibold leading-6 text-gray-900">Compare Cars</h1>
          <p className="mt-2 text-sm text-gray-700">
            Compare up to 3 different car models side by side.
          </p>
        </div>
      </div>

      {selectedCars.length < 3 && (
        <div className="mt-8 max-w-xl">
          <SearchBar
            onSearch={(query) => setSearchQuery(query)}
            placeholder="Search for a car to compare..."
          />
          
          {searchData?.cars && searchQuery && (
            <div className="mt-4 space-y-2">
              {searchData.cars.map((car: Car) => (
                <button
                  key={car.id}
                  onClick={() => handleAddCar(car.id)}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded-md"
                >
                  {car.year} {car.make} {car.model}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedCars.length > 0 && renderComparisonTable()}

      {selectedCars.length === 0 && (
        <div className="mt-8 text-center text-gray-500">
          Search and select cars to start comparing
        </div>
      )}
    </div>
  )
}
