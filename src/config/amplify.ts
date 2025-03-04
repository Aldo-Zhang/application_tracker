import { Amplify } from 'aws-amplify';
import { fetchAuthSession } from '@aws-amplify/auth';

Amplify.configure({
    Auth: {
      userPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID as string,
      userPoolWebClientId: process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID as string,
      region: process.env.NEXT_PUBLIC_AWS_REGION as string,
    },
    API: {
      endpoints: [{
        name: 'default',
        endpoint: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT,
        custom_header: async () => {
          try {
            const session = await fetchAuthSession();
            if (!session.tokens?.idToken) {
              throw new Error('No ID token found in session');
            }
            return {
              Authorization: session.tokens.idToken.toString()
            };
          } catch (error) {
            console.error('Error fetching auth session:', error);
            return {};
          }
        }
      }]
    }
  }); 