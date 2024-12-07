import { useState } from 'react'
import { useMutation } from '@apollo/client'
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid'
import { ADD_TO_FAVORITES, REMOVE_FROM_FAVORITES } from '../graphql/mutations'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

interface FavoriteButtonProps {
  carId: string
  isFavorited: boolean
  className?: string
}

export default function FavoriteButton({ carId, isFavorited: initialFavorited, className = '' }: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(initialFavorited)
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [addToFavorites] = useMutation(ADD_TO_FAVORITES, {
    onCompleted: () => setIsFavorited(true),
    refetchQueries: ['GetUserProfile', 'GetFavoriteCars'],
  })

  const [removeFromFavorites] = useMutation(REMOVE_FROM_FAVORITES, {
    onCompleted: () => setIsFavorited(false),
    refetchQueries: ['GetUserProfile', 'GetFavoriteCars'],
  })

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    try {
      if (isFavorited) {
        await removeFromFavorites({
          variables: { carId },
        })
      } else {
        await addToFavorites({
          variables: { carId },
        })
      }
    } catch (err) {
      console.error('Error toggling favorite:', err)
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`group relative inline-flex items-center rounded-full p-2 ${
        isFavorited ? 'text-red-500 hover:text-red-700' : 'text-gray-400 hover:text-gray-500'
      } ${className}`}
    >
      {isFavorited ? (
        <HeartSolid className="h-6 w-6" aria-hidden="true" />
      ) : (
        <HeartOutline className="h-6 w-6" aria-hidden="true" />
      )}
      <span className="sr-only">{isFavorited ? 'Remove from favorites' : 'Add to favorites'}</span>
    </button>
  )
}
