import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import products from './products.json'; // Import mock data

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  return {
    statusCode: 200,
    body: JSON.stringify(products),
    headers: {
      'Content-Type': 'application/json',
    },
  };
};
