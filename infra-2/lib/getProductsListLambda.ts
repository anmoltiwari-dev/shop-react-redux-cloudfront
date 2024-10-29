import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { products } from './mockData/products';

async function handler (
    event: APIGatewayProxyEvent
  ): Promise<APIGatewayProxyResult> {
  return {
    statusCode: 200,
    body: JSON.stringify(products),
    headers: {
      'Content-Type': 'application/json',
    },
  };
};

exports.handler;
