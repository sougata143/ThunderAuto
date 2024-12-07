import { useState } from 'react'
import { useMutation } from '@apollo/client'
import { StarIcon } from '@heroicons/react/20/solid'
import { CREATE_REVIEW } from '../graphql/mutations'
import { useAuth } from '../context/AuthContext'

interface ReviewFormProps {
  carId: string
  onSuccess: () => void
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function ReviewForm({ carId, onSuccess }: ReviewFormProps) {
  const { isAuthenticated } = useAuth()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')
  const [hover, setHover] = useState(-1)

  const [createReview, { loading }] = useMutation(CREATE_REVIEW, {
    onCompleted: () => {
      setRating(0)
      setComment('')
      onSuccess()
    },
    onError: (error) => {
      setError(error.message)
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!isAuthenticated) {
      setError('Please sign in to submit a review')
      return
    }

    if (rating === 0) {
      setError('Please select a rating')
      return
    }

    try {
      await createReview({
        variables: {
          input: {
            carId,
            rating,
            comment,
          },
        },
      })
    } catch (err) {
      // Error is handled by onError callback
    }
  }

  return (
    <div className="bg-white px-4 py-6 shadow sm:rounded-lg sm:px-6">
      <div className="space-y-8 divide-y divide-gray-200">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900">Write a Review</h3>
            <p className="mt-1 text-sm text-gray-500">
              Share your experience with this car to help others make informed decisions.
            </p>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Rating</label>
              <div className="mt-2 flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon
                    key={star}
                    className={classNames(
                      star <= (hover !== -1 ? hover : rating)
                        ? 'text-yellow-400'
                        : 'text-gray-300',
                      'h-8 w-8 flex-shrink-0 cursor-pointer'
                    )}
                    aria-hidden="true"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(-1)}
                  />
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
                Comment
              </label>
              <div className="mt-2">
                <textarea
                  id="comment"
                  name="comment"
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Share your thoughts about this car..."
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
