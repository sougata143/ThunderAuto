import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils';
import { defaultFieldResolver, GraphQLSchema, GraphQLError } from 'graphql';

export function authDirectiveTransformer(schema: GraphQLSchema): GraphQLSchema {
  return mapSchema(schema, {
    // Handle field-level directives
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      const authDirective = getDirective(schema, fieldConfig, 'auth')?.[0];

      if (authDirective) {
        const { requires } = authDirective;
        const { resolve = defaultFieldResolver } = fieldConfig;

        // Replace the original resolver with a function that checks auth first
        fieldConfig.resolve = async function (source, args, context, info) {
          const user = context.user;

          if (!user) {
            throw new GraphQLError('You must be logged in', {
              extensions: { code: 'UNAUTHENTICATED' }
            });
          }

          if (requires === 'ADMIN' && user.role !== 'ADMIN') {
            throw new GraphQLError('You must be an admin', {
              extensions: { code: 'FORBIDDEN' }
            });
          }

          return resolve(source, args, context, info);
        };
      }
      return fieldConfig;
    },
  });
}
