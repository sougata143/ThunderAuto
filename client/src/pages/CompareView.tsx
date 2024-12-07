import React, { useState, useRef } from 'react'
import { useQuery } from '@apollo/client'
import { useReactToPrint } from 'react-to-print'
import { GET_CARS, GET_CAR_DETAILS } from '../graphql/queries'
import { SpecificationGrid } from '../components/SpecificationCard'
import { getCarSpecifications } from '../utils/carSpecifications'
import CarFilterSort from '../components/CarFilterSort'
import ComparisonPrintView from '../components/ComparisonPrintView'
import { ChevronUpIcon, ChevronDownIcon, PrinterIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'

interface Car {
  id: string
  make: string
  model: string
  year: number
  price: number
  images: string[]
  engineType: string
  transmission: string
  power: number
  acceleration: number
  specs: any
}

export default function CompareView() {
  const [selectedCars, setSelectedCars] = useState<string[]>([])
  const [filters, setFilters] = useState({
    make: 'All',
    priceRange: [0, 200000],
    year: [2015, 2024],
    engineType: 'All',
    transmission: 'All',
  })
  const [sortOption, setSortOption] = useState('price_asc')
  const [highlightDifferences, setHighlightDifferences] = useState(true)
  const printRef = useRef(null)

  const { data: carsData } = useQuery(GET_CARS)
  const { data: carDetails1 } = useQuery(GET_CAR_DETAILS, {
    variables: { id: selectedCars[0] },
    skip: !selectedCars[0],
  })
  const { data: carDetails2 } = useQuery(GET_CAR_DETAILS, {
    variables: { id: selectedCars[1] },
    skip: !selectedCars[1],
  })

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  })

  const handleExport = () => {
    const comparisonData = {
      date: new Date().toISOString(),
      cars: [carDetails1?.car, carDetails2?.car],
      specifications: [
        getCarSpecifications(carDetails1?.car),
        getCarSpecifications(carDetails2?.car),
      ],
    }

    const blob = new Blob([JSON.stringify(comparisonData, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `car-comparison-${new Date().toISOString()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleCarSelect = (carId: string, index: number) => {
    setSelectedCars((prev) => {
      const newSelected = [...prev]
      newSelected[index] = carId
      return newSelected
    })
  }

  const filteredCars = (carsData?.cars || []).filter((car: Car) => {
    if (filters.make !== 'All' && car.make !== filters.make) return false
    if (car.price < filters.priceRange[0] || car.price > filters.priceRange[1])
      return false
    if (car.year < filters.year[0] || car.year > filters.year[1]) return false
    if (filters.engineType !== 'All' && car.engineType !== filters.engineType)
      return false
    if (filters.transmission !== 'All' && car.transmission !== filters.transmission)
      return false
    return true
  })

  const sortedCars = [...filteredCars].sort((a: Car, b: Car) => {
    switch (sortOption) {
      case 'price_asc':
        return a.price - b.price
      case 'price_desc':
        return b.price - a.price
      case 'year_desc':
        return b.year - a.year
      case 'year_asc':
        return a.year - b.year
      case 'power_desc':
        return b.power - a.power
      case 'power_asc':
        return a.power - b.power
      default:
        return 0
    }
  })

  const car1 = carDetails1?.car
  const car2 = carDetails2?.car

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="space-y-12">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Compare Cars
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Select two cars to compare their specifications side by side.
            </p>
          </div>
          {car1 && car2 && (
            <div className="flex space-x-4">
              <button
                onClick={handlePrint}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PrinterIcon className="h-5 w-5 mr-2" />
                Print Comparison
              </button>
              <button
                onClick={handleExport}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                Export Data
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Filters */}
          <div className="col-span-3">
            <CarFilterSort
              filters={filters}
              onFilterChange={setFilters}
              sortOption={sortOption}
              onSortChange={setSortOption}
            />
          </div>

          {/* Main Content */}
          <div className="col-span-9">
            {/* Car Selection */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              {[0, 1].map((index) => (
                <div key={index} className="space-y-4">
                  <label
                    htmlFor={`car-select-${index}`}
                    className="block text-sm font-medium text-gray-700"
                  >
                    {`Select Car ${index + 1}`}
                  </label>
                  <select
                    id={`car-select-${index}`}
                    className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    value={selectedCars[index] || ''}
                    onChange={(e) => handleCarSelect(e.target.value, index)}
                  >
                    <option value="">Select a car...</option>
                    {sortedCars.map((car: Car) => (
                      <option key={car.id} value={car.id}>
                        {car.year} {car.make} {car.model} - ${car.price.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            {/* Comparison Content */}
            {car1 && car2 && (
              <>
                <div className="mb-8">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox h-4 w-4 text-blue-600"
                      checked={highlightDifferences}
                      onChange={(e) => setHighlightDifferences(e.target.checked)}
                    />
                    <span className="ml-2">Highlight differences</span>
                  </label>
                </div>

                {/* Visible Comparison */}
                <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-8">
                    {[car1, car2].map((car, index) => (
                      <div key={index} className="space-y-6">
                        <div className="aspect-h-3 aspect-w-4 overflow-hidden rounded-lg">
                          <img
                            src={car.images[0] || '/placeholder-car.jpg'}
                            alt={`${car.make} ${car.model}`}
                            className="h-full w-full object-cover object-center"
                          />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">
                            {car.year} {car.make} {car.model}
                          </h3>
                          <p className="mt-2 text-xl text-gray-900">
                            ${car.price?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    {[car1, car2].map((car, index) => (
                      <div key={index}>
                        <SpecificationGrid
                          specifications={getCarSpecifications(car)}
                          highlightDifferences={highlightDifferences}
                          comparedSpecs={getCarSpecifications(
                            index === 0 ? car2 : car1
                          )}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hidden Print View */}
                <div className="hidden">
                  <div ref={printRef}>
                    <ComparisonPrintView cars={[car1, car2]} />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
