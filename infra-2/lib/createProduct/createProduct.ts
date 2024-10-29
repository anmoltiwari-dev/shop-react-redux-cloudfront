import { DynamoDB } from "aws-sdk";
import { v4 as uuidv4 } from "uuid";

const dynamoDb = new DynamoDB.DocumentClient();
const PRODUCTS_TABLE_NAME = process.env.PRODUCTS_TABLE_NAME!;
const STOCK_TABLE_NAME = process.env.STOCK_TABLE_NAME!;

export const handler = async (event: any) => {
  const { title, description, price, count } = JSON.parse(event.body);

  if (!title || !price || typeof count === "undefined") {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing required fields" }),
    };
  }

  const productId = uuidv4();

  // Store in `products` table
  const product = {
    id: productId,
    title,
    description,
    price,
  };

  // Store in `stock` table
  const stock = {
    product_id: productId,
    count,
  };

  try {
    await dynamoDb
      .put({ TableName: PRODUCTS_TABLE_NAME, Item: product })
      .promise();

    await dynamoDb.put({ TableName: STOCK_TABLE_NAME, Item: stock }).promise();

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: "Product created successfully",
        product,
      }),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to create product",
        error: error,
      }),
    };
  }
};
