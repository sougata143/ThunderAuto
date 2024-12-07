import React from 'react'

interface SpecificationItem {
  label: string
  value: string | number | boolean | string[]
  unit?: string
}

interface SpecificationSection {
  title: string
  items: SpecificationItem[]
}

interface SpecificationGridProps {
  specifications: SpecificationSection[]
  highlightDifferences?: boolean
  comparedSpecs?: SpecificationSection[]
}

const formatValue = (value: string | number | boolean | string[], unit?: string): string => {
  if (Array.isArray(value)) {
    return value.join(', ')
  }
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No'
  }
  return unit ? `${value} ${unit}` : `${value}`
}

const isDifferent = (value1: any, value2: any): boolean => {
  if (Array.isArray(value1) && Array.isArray(value2)) {
    return (
      value1.length !== value2.length ||
      value1.some((v, i) => v !== value2[i])
    )
  }
  return value1 !== value2
}

export const SpecificationGrid: React.FC<SpecificationGridProps> = ({
  specifications,
  highlightDifferences = false,
  comparedSpecs = [],
}) => {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      {specifications.map((section, sectionIndex) => (
        <div
          key={section.title}
          className="overflow-hidden rounded-lg bg-white shadow"
        >
          <div className="bg-gray-50 px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              {section.title}
            </h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6">
              {section.items.map((item, itemIndex) => {
                const comparedValue = comparedSpecs[sectionIndex]?.items[itemIndex]?.value
                const different = highlightDifferences && comparedValue !== undefined && 
                  isDifferent(item.value, comparedValue)

                return (
                  <div
                    key={item.label}
                    className={`sm:col-span-1 ${
                      different ? 'bg-yellow-50 -mx-4 px-4 py-2 rounded' : ''
                    }`}
                  >
                    <dt className="text-sm font-medium text-gray-500">
                      {item.label}
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formatValue(item.value, item.unit)}
                      {different && (
                        <span className="ml-2 text-xs text-gray-500">
                          vs {formatValue(comparedValue, item.unit)}
                        </span>
                      )}
                    </dd>
                  </div>
                )
              })}
            </dl>
          </div>
        </div>
      ))}
    </div>
  )
}

interface SpecificationCardProps {
  title: string
  items: SpecificationItem[]
  highlightDifferences?: boolean
  comparedItems?: SpecificationItem[]
}

export const SpecificationCard: React.FC<SpecificationCardProps> = ({
  title,
  items,
  highlightDifferences = false,
  comparedItems = [],
}) => {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow">
      <div className="bg-gray-50 px-4 py-5 sm:px-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">{title}</h3>
      </div>
      <div className="px-4 py-5 sm:p-6">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          {items.map((item, index) => {
            const comparedValue = comparedItems[index]?.value
            const different = highlightDifferences && comparedValue !== undefined &&
              isDifferent(item.value, comparedValue)

            return (
              <div
                key={item.label}
                className={`sm:col-span-1 ${
                  different ? 'bg-yellow-50 -mx-4 px-4 py-2 rounded' : ''
                }`}
              >
                <dt className="text-sm font-medium text-gray-500">{item.label}</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {formatValue(item.value, item.unit)}
                  {different && (
                    <span className="ml-2 text-xs text-gray-500">
                      vs {formatValue(comparedValue, item.unit)}
                    </span>
                  )}
                </dd>
              </div>
            )
          })}
        </dl>
      </div>
    </div>
  )
}
