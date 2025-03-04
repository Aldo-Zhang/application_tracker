import { Amplify } from 'aws-amplify';

const awsConfig = {
  Auth: {
    region: process.env.NEXT_PUBLIC_AWS_REGION!,
    userPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID!,
    userPoolWebClientId: process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID!,
  },
  aws_appsync_graphqlEndpoint: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT!,
  aws_appsync_region: process.env.NEXT_PUBLIC_AWS_REGION!,
  aws_appsync_authenticationType: 'AMAZON_COGNITO_USER_POOLS',
};

// @ts-expect-error Amplify is not typed
Amplify.configure(awsConfig); 

export default awsConfig;
