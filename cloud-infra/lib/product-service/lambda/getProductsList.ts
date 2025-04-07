import { products } from "../mock/products";
import { APIGatewayProxyHandler } from 'aws-lambda';

export const handler: APIGatewayProxyHandler = async (event) => {
    return {
        body: JSON.stringify(products),
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
    };
};