import { Amplify } from 'aws-amplify';

const awsConfig = {
  // 基础配置
  aws_project_region: process.env.NEXT_PUBLIC_AWS_REGION,
  
  // Auth 配置
  aws_cognito_region: process.env.NEXT_PUBLIC_AWS_REGION,
  aws_user_pools_id: process.env.NEXT_PUBLIC_USER_POOL_ID,
  aws_user_pools_web_client_id: process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID,
  
  // API 配置
  aws_appsync_graphqlEndpoint: process.env.NEXT_PUBLIC_API_URL,
  aws_appsync_region: process.env.NEXT_PUBLIC_AWS_REGION,
  aws_appsync_authenticationType: 'AMAZON_COGNITO_USER_POOLS',
  
  // 存储配置 (如果需要S3)
  aws_user_files_s3_bucket: process.env.NEXT_PUBLIC_S3_BUCKET,
  aws_user_files_s3_bucket_region: process.env.NEXT_PUBLIC_AWS_REGION,

  // 安全配置
  oauth: {
    domain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
    scope: ['email', 'openid', 'profile'],
    redirectSignIn: process.env.NEXT_PUBLIC_REDIRECT_SIGN_IN,
    redirectSignOut: process.env.NEXT_PUBLIC_REDIRECT_SIGN_OUT,
    responseType: 'code'
  }
};

// 配置Amplify
Amplify.configure(awsConfig);

export default awsConfig; 