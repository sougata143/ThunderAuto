import { Fragment, useState } from 'react'
import { Dialog, Disclosure, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { ChevronDownIcon } from '@heroicons/react/20/solid'

const filters = [
  {
    id: 'make',
    name: 'Make',
    options: [
      { value: 'tesla', label: 'Tesla' },
      { value: 'porsche', label: 'Porsche' },
      { value: 'lucid', label: 'Lucid' },
      { value: 'bmw', label: 'BMW' },
      { value: 'mercedes', label: 'Mercedes-Benz' },
    ],
  },
  {
    id: 'year',
    name: 'Year',
    options: [
      { value: '2024', label: '2024' },
      { value: '2023', label: '2023' },
      { value: '2022', label: '2022' },
      { value: '2021', label: '2021' },
    ],
  },
  {
    id: 'price',
    name: 'Price Range',
    options: [
      { value: '0-50000', label: 'Under $50,000' },
      { value: '50000-100000', label: '$50,000 - $100,000' },
      { value: '100000-200000', label: '$100,000 - $200,000' },
      { value: '200000+', label: 'Over $200,000' },
    ],
  },
  {
    id: 'engineType',
    name: 'Engine Type',
    options: [
      { value: 'electric', label: 'Electric' },
      { value: 'gasoline', label: 'Gasoline' },
      { value: 'hybrid', label: 'Hybrid' },
      { value: 'diesel', label: 'Diesel' },
    ],
  },
  {
    id: 'transmission',
    name: 'Transmission',
    options: [
      { value: 'automatic', label: 'Automatic' },
      { value: 'manual', label: 'Manual' },
      { value: 'dual-clutch', label: 'Dual-Clutch' },
      { value: 'single-speed', label: 'Single-Speed' },
    ],
  },
  {
    id: 'performance',
    name: 'Performance',
    options: [
      { value: 'acceleration-under-3', label: '0-60 mph < 3s' },
      { value: 'acceleration-3-5', label: '0-60 mph 3-5s' },
      { value: 'acceleration-over-5', label: '0-60 mph > 5s' },
    ],
  },
  {
    id: 'bodyType',
    name: 'Body Type',
    options: [
      { value: 'sedan', label: 'Sedan' },
      { value: 'coupe', label: 'Coupe' },
      { value: 'suv', label: 'SUV' },
      { value: 'convertible', label: 'Convertible' },
    ],
  },
  {
    id: 'features',
    name: 'Features',
    options: [
      { value: 'adaptive-cruise', label: 'Adaptive Cruise Control' },
      { value: 'lane-departure', label: 'Lane Departure Warning' },
      { value: 'blind-spot', label: 'Blind Spot Monitoring' },
      { value: 'night-vision', label: 'Night Vision' },
      { value: '360-camera', label: '360° Camera' },
    ],
  },
  {
    id: 'interior',
    name: 'Interior',
    options: [
      { value: 'leather', label: 'Leather Seats' },
      { value: 'heated-seats', label: 'Heated Seats' },
      { value: 'ventilated-seats', label: 'Ventilated Seats' },
      { value: 'massage', label: 'Massage Function' },
    ],
  },
  {
    id: 'technology',
    name: 'Technology',
    options: [
      { value: 'apple-carplay', label: 'Apple CarPlay' },
      { value: 'android-auto', label: 'Android Auto' },
      { value: 'wireless-charging', label: 'Wireless Charging' },
      { value: 'premium-audio', label: 'Premium Audio System' },
    ],
  }
]

interface FilterPanelProps {
  mobileFiltersOpen: boolean
  setMobileFiltersOpen: (open: boolean) => void
  selectedFilters: Record<string, string[]>
  onFilterChange: (filterId: string, value: string) => void
  isMobile: boolean
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function FilterPanel({
  mobileFiltersOpen,
  setMobileFiltersOpen,
  selectedFilters,
  onFilterChange,
  isMobile,
}: FilterPanelProps) {
  const renderFilters = () => (
    <form className={classNames(isMobile ? 'mt-4' : '')}>
      {filters.map((section) => (
        <Disclosure
          as="div"
          key={section.id}
          className={classNames(
            isMobile ? 'border-t border-gray-200 px-4 py-6' : 'border-b border-gray-200 py-6'
          )}
          defaultOpen={!isMobile}
        >
          {({ open }) => (
            <>
              <h3 className="-my-3 flow-root">
                <Disclosure.Button className="flex w-full items-center justify-between bg-white py-3 text-sm text-gray-400 hover:text-gray-500">
                  <span className="font-medium text-gray-900">{section.name}</span>
                  <span className="ml-6 flex items-center">
                    <ChevronDownIcon
                      className={classNames(open ? '-rotate-180' : 'rotate-0', 'h-5 w-5 transform')}
                      aria-hidden="true"
                    />
                  </span>
                </Disclosure.Button>
              </h3>
              <Disclosure.Panel className="pt-6">
                <div className="space-y-4">
                  {section.options.map((option, optionIdx) => {
                    const isSelected = (selectedFilters[section.id] || []).includes(option.value)
                    return (
                      <div key={option.value} className="flex items-center">
                        <input
                          id={`filter-${section.id}-${optionIdx}`}
                          name={`${section.id}[]`}
                          defaultValue={option.value}
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onFilterChange(section.id, option.value)}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label
                          htmlFor={`filter-${section.id}-${optionIdx}`}
                          className="ml-3 text-sm text-gray-600"
                        >
                          {option.label}
                        </label>
                      </div>
                    )
                  })}
                </div>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
      ))}
    </form>
  )

  if (isMobile) {
    return (
      <Transition.Root show={mobileFiltersOpen} as={Fragment}>
        <Dialog as="div" className="relative z-40 lg:hidden" onClose={setMobileFiltersOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 z-40 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <Dialog.Panel className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-white py-4 pb-6 shadow-xl">
                <div className="flex items-center justify-between px-4">
                  <h2 className="text-lg font-medium text-gray-900">Filters</h2>
                  <button
                    type="button"
                    className="-mr-2 flex h-10 w-10 items-center justify-center p-2 text-gray-400 hover:text-gray-500"
                    onClick={() => setMobileFiltersOpen(false)}
                  >
                    <span className="sr-only">Close menu</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                {/* Mobile Filters */}
                {renderFilters()}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    )
  }

  // Desktop filters
  return renderFilters()
}
