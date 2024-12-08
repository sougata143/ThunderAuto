import { useState } from 'react'
import { useQuery } from '@apollo/client'
import { useSearchParams } from 'react-router-dom'
import { FunnelIcon } from '@heroicons/react/20/solid'
import SearchBar from '../components/SearchBar'
import FilterPanel from '../components/FilterPanel'
import CarCard from '../components/CarCard'
import { GET_CARS } from '../graphql/queries'

export default function CarList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({})

  const searchQuery = searchParams.get('search') || ''

  const { loading, error, data } = useQuery(GET_CARS, {
    variables: {
      filter: {
        ...selectedFilters,
        search: searchQuery,
      },
    },
  })

  const handleSearch = (query: string) => {
    setSearchParams({ search: query })
  }

  const handleFilterChange = (filterId: string, value: string) => {
    setSelectedFilters((prev) => {
      const current = prev[filterId] || []
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value]

      return {
        ...prev,
        [filterId]: updated,
      }
    })
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Error loading cars. Please try again later.</p>
      </div>
    )
  }

  return (
    <div className="bg-white">
      <div>
        {/* Mobile filter dialog */}
        <FilterPanel
          mobileFiltersOpen={mobileFiltersOpen}
          setMobileFiltersOpen={setMobileFiltersOpen}
          selectedFilters={selectedFilters}
          onFilterChange={handleFilterChange}
          isMobile={true}
        />

        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-baseline justify-between border-b border-gray-200 pb-6 pt-24">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">Cars</h1>

            <div className="flex items-center gap-4">
              {Object.keys(selectedFilters).length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedFilters({})}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Clear filters
                </button>
              )}
              <button
                type="button"
                className="lg:hidden p-2 text-gray-400 hover:text-gray-500"
                onClick={() => setMobileFiltersOpen(true)}
              >
                <span className="sr-only">Filters</span>
                <FunnelIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="my-8">
            <SearchBar onSearch={handleSearch} />
          </div>

          <section aria-labelledby="products-heading" className="pb-24 pt-6">
            <h2 id="products-heading" className="sr-only">
              Cars
            </h2>

            <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4">
              {/* Filters */}
              <div className="hidden lg:block">
                <FilterPanel
                  mobileFiltersOpen={mobileFiltersOpen}
                  setMobileFiltersOpen={setMobileFiltersOpen}
                  selectedFilters={selectedFilters}
                  onFilterChange={handleFilterChange}
                  isMobile={false}
                />
              </div>

              {/* Car grid */}
              <div className="lg:col-span-3">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
                    {data?.cars.map((car: any) => (
                      <CarCard key={car.id} car={car} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
