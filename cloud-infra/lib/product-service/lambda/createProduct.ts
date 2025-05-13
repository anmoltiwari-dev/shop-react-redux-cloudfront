import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { v4 as uuidv4 } from 'uuid';

const dbClient = new DynamoDBClient({});

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { title, description, price } = body;

    if (!title || price == null) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing required fields' }),
      };
    }

    const id = uuidv4();
    await dbClient.send(new PutItemCommand({
      TableName: process.env.PRODUCTS_TABLE,
      Item: {
        id: { S: id },
        title: { S: title },
        description: { S: description || '' },
        price: { N: String(price) },
      },
    }));

    return {
      statusCode: 201,
      body: JSON.stringify({ id, title, description, price }),
    };
  } catch (error) {
    console.error('Error creating product:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};
