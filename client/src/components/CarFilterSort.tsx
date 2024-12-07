import React from 'react'
import { Disclosure } from '@headlessui/react'
import { ChevronUpIcon } from '@heroicons/react/24/outline'

interface Filters {
  make: string
  priceRange: [number, number]
  year: [number, number]
  engineType: string
  transmission: string
}

interface CarFilterSortProps {
  filters: Filters
  onFilterChange: (filters: Filters) => void
  sortOption: string
  onSortChange: (option: string) => void
}

const engineTypes = ['All', 'Gas', 'Diesel', 'Hybrid', 'Electric']
const transmissionTypes = ['All', 'Automatic', 'Manual', 'CVT', 'DCT']
const carMakes = [
  'All',
  'Acura',
  'Audi',
  'BMW',
  'Chevrolet',
  'Ford',
  'Honda',
  'Hyundai',
  'Lexus',
  'Mercedes-Benz',
  'Tesla',
  'Toyota',
  'Volkswagen',
]

const sortOptions = [
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'year_desc', label: 'Year: Newest First' },
  { value: 'year_asc', label: 'Year: Oldest First' },
  { value: 'power_desc', label: 'Power: High to Low' },
  { value: 'power_asc', label: 'Power: Low to High' },
]

const CarFilterSort: React.FC<CarFilterSortProps> = ({
  filters,
  onFilterChange,
  sortOption,
  onSortChange,
}) => {
  const handleFilterChange = (key: keyof Filters, value: any) => {
    onFilterChange({
      ...filters,
      [key]: value,
    })
  }

  return (
    <div className="space-y-6">
      {/* Sort Options */}
      <div>
        <label
          htmlFor="sort"
          className="block text-sm font-medium text-gray-700"
        >
          Sort By
        </label>
        <select
          id="sort"
          name="sort"
          className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          value={sortOption}
          onChange={(e) => onSortChange(e.target.value)}
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Filters</h3>

        {/* Make Filter */}
        <Disclosure defaultOpen>
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between rounded-lg bg-gray-50 px-4 py-2 text-left text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus-visible:ring focus-visible:ring-blue-500">
                <span>Make</span>
                <ChevronUpIcon
                  className={`${
                    open ? 'rotate-180 transform' : ''
                  } h-5 w-5 text-gray-500`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className="px-4 pt-4 pb-2">
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  value={filters.make}
                  onChange={(e) => handleFilterChange('make', e.target.value)}
                >
                  {carMakes.map((make) => (
                    <option key={make} value={make}>
                      {make}
                    </option>
                  ))}
                </select>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        {/* Price Range Filter */}
        <Disclosure defaultOpen>
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between rounded-lg bg-gray-50 px-4 py-2 text-left text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus-visible:ring focus-visible:ring-blue-500">
                <span>Price Range</span>
                <ChevronUpIcon
                  className={`${
                    open ? 'rotate-180 transform' : ''
                  } h-5 w-5 text-gray-500`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className="px-4 pt-4 pb-2">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Min Price: ${filters.priceRange[0].toLocaleString()}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="200000"
                      step="1000"
                      value={filters.priceRange[0]}
                      onChange={(e) =>
                        handleFilterChange('priceRange', [
                          parseInt(e.target.value),
                          filters.priceRange[1],
                        ])
                      }
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Max Price: ${filters.priceRange[1].toLocaleString()}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="200000"
                      step="1000"
                      value={filters.priceRange[1]}
                      onChange={(e) =>
                        handleFilterChange('priceRange', [
                          filters.priceRange[0],
                          parseInt(e.target.value),
                        ])
                      }
                      className="w-full"
                    />
                  </div>
                </div>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        {/* Year Range Filter */}
        <Disclosure defaultOpen>
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between rounded-lg bg-gray-50 px-4 py-2 text-left text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus-visible:ring focus-visible:ring-blue-500">
                <span>Year Range</span>
                <ChevronUpIcon
                  className={`${
                    open ? 'rotate-180 transform' : ''
                  } h-5 w-5 text-gray-500`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className="px-4 pt-4 pb-2">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      From Year: {filters.year[0]}
                    </label>
                    <input
                      type="range"
                      min="2015"
                      max="2024"
                      value={filters.year[0]}
                      onChange={(e) =>
                        handleFilterChange('year', [
                          parseInt(e.target.value),
                          filters.year[1],
                        ])
                      }
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      To Year: {filters.year[1]}
                    </label>
                    <input
                      type="range"
                      min="2015"
                      max="2024"
                      value={filters.year[1]}
                      onChange={(e) =>
                        handleFilterChange('year', [
                          filters.year[0],
                          parseInt(e.target.value),
                        ])
                      }
                      className="w-full"
                    />
                  </div>
                </div>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        {/* Engine Type Filter */}
        <Disclosure defaultOpen>
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between rounded-lg bg-gray-50 px-4 py-2 text-left text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus-visible:ring focus-visible:ring-blue-500">
                <span>Engine Type</span>
                <ChevronUpIcon
                  className={`${
                    open ? 'rotate-180 transform' : ''
                  } h-5 w-5 text-gray-500`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className="px-4 pt-4 pb-2">
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  value={filters.engineType}
                  onChange={(e) => handleFilterChange('engineType', e.target.value)}
                >
                  {engineTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        {/* Transmission Filter */}
        <Disclosure defaultOpen>
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between rounded-lg bg-gray-50 px-4 py-2 text-left text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus-visible:ring focus-visible:ring-blue-500">
                <span>Transmission</span>
                <ChevronUpIcon
                  className={`${
                    open ? 'rotate-180 transform' : ''
                  } h-5 w-5 text-gray-500`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className="px-4 pt-4 pb-2">
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  value={filters.transmission}
                  onChange={(e) =>
                    handleFilterChange('transmission', e.target.value)
                  }
                >
                  {transmissionTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
      </div>
    </div>
  )
}

export default CarFilterSort
