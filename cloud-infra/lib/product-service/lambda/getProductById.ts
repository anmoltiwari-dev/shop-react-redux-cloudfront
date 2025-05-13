import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { APIGatewayProxyHandler } from 'aws-lambda';

const dbClient = new DynamoDBClient({});

export const handler: APIGatewayProxyHandler = async (event) => {
    const productId = event.pathParameters?.productId || '';

    const productsTable = process.env.PRODUCTS_TABLE!;
    const stockTable = process.env.STOCK_TABLE!;
  
    const productData = await dbClient.send(new QueryCommand({
      TableName: productsTable,
      KeyConditionExpression: "id = :id",
      ExpressionAttributeValues: { ":id": { S: productId } }
    }));
  
    const product = productData.Items?.[0] ? unmarshall(productData.Items[0]) : null;
  
    if (!product) {
        return {
            statusCode: 404,
            body: JSON.stringify({ message: "Product not found!" }),
        }
    }

    const stockData = await dbClient.send(new QueryCommand({
        TableName: stockTable,
        KeyConditionExpression: "product_id = :id",
        ExpressionAttributeValues: { ":id": { S: productId } }
      }));
    
      const stock = stockData.Items?.[0] ? unmarshall(stockData.Items[0]) : { count: 0 };
    
      return {
        statusCode: 200,
        body: JSON.stringify({ ...product, count: stock.count ?? 0 }),
      };
};
