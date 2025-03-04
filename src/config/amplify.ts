import { Amplify } from 'aws-amplify';

Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID as string,
        userPoolClientId: process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID as string,
        loginWith: {
          username: true
        }
      }
    },
    API: {
      GraphQL: {
        endpoint: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT as string,
        region: process.env.NEXT_PUBLIC_AWS_REGION as string,
        defaultAuthMode: 'userPool'
      }
    }
  }); 