import { IContext } from '../../types/context'
import { User } from '../../models/User'

export const userResolvers = {
  Query: {
    users: async (_: unknown, __: unknown, { user }: IContext) => {
      // Check if user is admin
      if (!user || user.role !== 'ADMIN') {
        throw new Error('Not authorized')
      }

      try {
        const users = await User.find({})
        return users
      } catch (error) {
        console.error('Error fetching users:', error)
        throw new Error('Failed to fetch users')
      }
    },

    user: async (_: unknown, { id }: { id: string }, { user }: IContext) => {
      // Check if user is admin or requesting their own data
      if (!user || (user.role !== 'ADMIN' && user.id !== id)) {
        throw new Error('Not authorized')
      }

      try {
        const foundUser = await User.findById(id)
        if (!foundUser) {
          throw new Error('User not found')
        }
        return foundUser
      } catch (error) {
        console.error('Error fetching user:', error)
        throw new Error('Failed to fetch user')
      }
    },

    me: (_: unknown, __: unknown, { user }: IContext) => {
      if (!user) {
        throw new Error('Not authenticated')
      }
      return user
    }
  },

  Mutation: {
    updateUserPreferences: async (
      _: unknown,
      { theme, notifications, language }: { theme?: string, notifications?: boolean, language?: string },
      { user }: IContext
    ) => {
      if (!user) {
        throw new Error('Not authenticated')
      }

      try {
        const updatedUser = await User.findByIdAndUpdate(
          user.id,
          {
            $set: {
              'preferences.theme': theme || user.preferences.theme,
              'preferences.notifications': notifications ?? user.preferences.notifications,
              'preferences.language': language || user.preferences.language
            }
          },
          { new: true }
        )

        if (!updatedUser) {
          throw new Error('User not found')
        }

        return updatedUser
      } catch (error) {
        console.error('Error updating user preferences:', error)
        throw new Error('Failed to update user preferences')
      }
    },

    updateUserRole: async (
      _: unknown,
      { userId, role }: { userId: string, role: string },
      { user }: IContext
    ) => {
      // Only admin can update roles
      if (!user || user.role !== 'ADMIN') {
        throw new Error('Not authorized')
      }

      try {
        const updatedUser = await User.findByIdAndUpdate(
          userId,
          { role },
          { new: true }
        )

        if (!updatedUser) {
          throw new Error('User not found')
        }

        return updatedUser
      } catch (error) {
        console.error('Error updating user role:', error)
        throw new Error('Failed to update user role')
      }
    }
  }
}
