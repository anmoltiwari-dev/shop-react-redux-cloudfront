import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { products } from "../mockData/products";

async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  const productId = event?.pathParameters?.productId;
  const product = products.find((p) => p.id === productId);

  if (product) {
    return {
      statusCode: 200,
      body: JSON.stringify(product),
    };
  } else {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: "Product not found" }),
    };
  }
}

exports.handler;
