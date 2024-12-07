import { AuthService } from '../../services/auth.service'
import { IContext } from '../../types/context'

interface LoginInput {
  email: string
  password: string
}

interface RegisterInput {
  name: string
  email: string
  password: string
}

export const authResolvers = {
  Mutation: {
    login: async (_: unknown, { input }: { input: LoginInput }, _context: IContext) => {
      const { email, password } = input
      return AuthService.loginUser(email, password)
    },

    register: async (_: unknown, { input }: { input: RegisterInput }, _context: IContext) => {
      const { name, email, password } = input
      return AuthService.registerUser(name, email, password)
    }
  }
}
