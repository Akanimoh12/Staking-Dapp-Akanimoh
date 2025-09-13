import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

// The Graph Studio endpoint - replace this with your actual subgraph endpoint
// For now using a placeholder URL that you'll need to update after deployment
const SUBGRAPH_URL = import.meta.env.VITE_SUBGRAPH_URL || 'https://api.studio.thegraph.com/query/120718/subgraph-implementation/0.0.1';

const httpLink = createHttpLink({
  uri: SUBGRAPH_URL,
});

export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache({
    typePolicies: {
      User: {
        keyFields: ['id'],
      },
      StakingPosition: {
        keyFields: ['id'],
      },
      Transaction: {
        keyFields: ['id'],
      },
      StakingProtocol: {
        keyFields: ['id'],
      },
      DailyStats: {
        keyFields: ['id'],
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
      fetchPolicy: 'cache-and-network',
    },
    query: {
      errorPolicy: 'all',
      fetchPolicy: 'cache-first',
    },
  },
});