import { APIGatewayAuthorizerResult, APIGatewayTokenAuthorizerHandler } from 'aws-lambda';

export const handler: APIGatewayTokenAuthorizerHandler = async (event) => {
  const { authorizationToken } = event;

  if (!authorizationToken) {
    return generatePolicy('Deny', event.methodArn, 401);
  }

  // Parse token and decode
  const tokenParts = authorizationToken.split(' ');
  const encodedCredentials = tokenParts[1];
  const decodedCredentials = Buffer.from(encodedCredentials, 'base64').toString('utf-8');
  const [username, password] = decodedCredentials.split(':');

  // Validate credentials
  const storedPassword = process.env[username];
  if (storedPassword === password) {
    return generatePolicy('Allow', event.methodArn);
  } else {
    return generatePolicy('Deny', event.methodArn, 403);
  }
};

function generatePolicy(effect: 'Allow' | 'Deny', resource: string, statusCode: number = 200): APIGatewayAuthorizerResult {
  return {
    principalId: 'user',
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource,
        },
      ],
    },
    context: { statusCode },
  };
}
