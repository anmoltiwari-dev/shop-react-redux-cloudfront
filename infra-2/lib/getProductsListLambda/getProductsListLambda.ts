import { DynamoDB } from "aws-sdk";

const dynamoDb = new DynamoDB.DocumentClient();
const PRODUCTS_TABLE_NAME = process.env.PRODUCTS_TABLE_NAME!;
const STOCK_TABLE_NAME = process.env.STOCK_TABLE_NAME!;

export const handler = async () => {
  // Get all products
  const products = await dynamoDb
    .scan({ TableName: PRODUCTS_TABLE_NAME })
    .promise();

  // Get all stock items
  const stockItems = await dynamoDb
    .scan({ TableName: STOCK_TABLE_NAME })
    .promise();

  // Join products with stock data
  const result = products.Items?.map((product) => {
    const stockItem = stockItems.Items?.find(
      (stock) => stock.product_id === product.id
    );
    return {
      ...product,
      count: stockItem ? stockItem.count : 0,
    };
  });

  return {
    statusCode: 200,
    body: JSON.stringify(result),
  };
};
