import { Link } from 'react-router-dom'
import SearchBar from '../components/SearchBar'
import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()

  const handleSearch = (query: string) => {
    navigate(`/cars?search=${encodeURIComponent(query)}`)
  }

  return (
    <div className="relative">
      {/* Hero section */}
      <div className="relative">
        <div className="absolute inset-0">
          <img
            className="h-full w-full object-cover"
            src="/hero-car.jpg"
            alt="Luxury car background"
          />
          <div className="absolute inset-0 bg-gray-900 opacity-70" />
        </div>
        <div className="relative mx-auto max-w-7xl py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Find Your Perfect Car
          </h1>
          <p className="mt-6 max-w-3xl text-xl text-gray-300">
            Explore detailed specifications, compare models, and read reviews to make an informed decision.
          </p>
          <div className="mt-10 max-w-xl">
            <SearchBar onSearch={handleSearch} placeholder="Search by make, model, or features..." />
          </div>
        </div>
      </div>

      {/* Features section */}
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-blue-600">
              Everything You Need
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Comprehensive Car Information
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Access detailed specifications, compare different models, and make informed decisions about your next vehicle.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  Detailed Specifications
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    Get comprehensive technical specifications, performance data, and features for any car model.
                  </p>
                  <p className="mt-6">
                    <Link to="/cars" className="text-sm font-semibold leading-6 text-blue-600">
                      Browse Cars <span aria-hidden="true">→</span>
                    </Link>
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  Compare Models
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    Compare different car models side by side to find the perfect match for your needs.
                  </p>
                  <p className="mt-6">
                    <Link to="/compare" className="text-sm font-semibold leading-6 text-blue-600">
                      Compare Cars <span aria-hidden="true">→</span>
                    </Link>
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  User Reviews
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    Read authentic user reviews and ratings to make informed decisions about your next car.
                  </p>
                  <p className="mt-6">
                    <Link to="/cars" className="text-sm font-semibold leading-6 text-blue-600">
                      Read Reviews <span aria-hidden="true">→</span>
                    </Link>
                  </p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}
