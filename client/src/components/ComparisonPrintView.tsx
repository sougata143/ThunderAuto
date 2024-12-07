import React from 'react'
import { getCarSpecifications } from '../utils/carSpecifications'

interface Car {
  id: string
  make: string
  model: string
  year: number
  price: number
  images: string[]
  specs: any
}

interface ComparisonPrintViewProps {
  cars: Car[]
}

const ComparisonPrintView: React.FC<ComparisonPrintViewProps> = ({ cars }) => {
  const [car1, car2] = cars
  const specs1 = getCarSpecifications(car1)
  const specs2 = getCarSpecifications(car2)

  return (
    <div className="p-8 max-w-7xl mx-auto print:max-w-none">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Car Comparison Report</h1>
        <p className="text-gray-500 mt-2">
          Generated on {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Car Basic Info */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        {[car1, car2].map((car, index) => (
          <div key={index} className="text-center">
            <img
              src={car.images[0] || '/placeholder-car.jpg'}
              alt={`${car.make} ${car.model}`}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <h2 className="text-2xl font-bold">
              {car.year} {car.make} {car.model}
            </h2>
            <p className="text-xl text-gray-900 mt-2">
              ${car.price?.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Specifications Comparison */}
      {specs1.map((section, sectionIndex) => {
        const comparedSection = specs2[sectionIndex]
        return (
          <div key={section.title} className="mb-8">
            <h3 className="text-xl font-bold border-b pb-2 mb-4">
              {section.title}
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {section.items.map((item, itemIndex) => {
                const comparedItem = comparedSection.items[itemIndex]
                const isDifferent = item.value !== comparedItem.value

                return (
                  <div
                    key={item.label}
                    className={`p-4 rounded ${
                      isDifferent ? 'bg-yellow-50' : 'bg-gray-50'
                    }`}
                  >
                    <div className="text-sm font-medium text-gray-500">
                      {item.label}
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <div className="text-xs text-gray-500">Car 1</div>
                        <div className="text-sm font-medium">
                          {item.unit
                            ? `${item.value} ${item.unit}`
                            : `${item.value}`}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Car 2</div>
                        <div className="text-sm font-medium">
                          {comparedItem.unit
                            ? `${comparedItem.value} ${comparedItem.unit}`
                            : `${comparedItem.value}`}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Footer */}
      <div className="text-center text-gray-500 text-sm mt-8 pt-8 border-t">
        <p>ThunderAuto Car Comparison Report</p>
        <p>
          Generated on {new Date().toLocaleDateString()} at{' '}
          {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  )
}

export default ComparisonPrintView
