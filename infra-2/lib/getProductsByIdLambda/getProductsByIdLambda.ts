import { DynamoDB } from "aws-sdk";

const dynamoDb = new DynamoDB.DocumentClient();
const PRODUCTS_TABLE_NAME = process.env.PRODUCTS_TABLE_NAME!;
const STOCK_TABLE_NAME = process.env.STOCK_TABLE_NAME!;

export async function handler(event: any) {
  const productId = event.pathParameters.productId;

  // Fetch the product
  const product = await dynamoDb
    .get({
      TableName: PRODUCTS_TABLE_NAME,
      Key: { id: productId },
    })
    .promise();

  // Fetch the stock count
  const stock = await dynamoDb
    .get({
      TableName: STOCK_TABLE_NAME,
      Key: { product_id: productId },
    })
    .promise();

  if (!product.Item) {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: "Product not found" }),
    };
  }

  const result = {
    ...product.Item,
    count: stock.Item ? stock.Item.count : 0,
  };

  return {
    statusCode: 200,
    body: JSON.stringify(result),
  };
}
