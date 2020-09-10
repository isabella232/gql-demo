import { UserInputError } from 'apollo-server-core';
import { AuthMutations } from '../authorization/resolvers';


export default {
    Mutation: {
      ...AuthMutations,
    }
}

//TODO: consolidate other resolvers into this one to be used in the index