import { DynamoDBClient, QueryCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { APIGatewayProxyHandler } from 'aws-lambda';

const dbClient = new DynamoDBClient({});

export const handler: APIGatewayProxyHandler = async (event) => {
    const productsTable = process.env.PRODUCTS_TABLE!;
    const stockTable = process.env.STOCK_TABLE!;

    const productsData = await dbClient.send(new ScanCommand({ TableName: productsTable }));
    const products = productsData.Items?.map((value) => unmarshall(value)) ?? [];
    
    const productsList = [];
    for (const product of products) {
        const stockData = await dbClient.send(new QueryCommand({
            TableName: stockTable,
            KeyConditionExpression: "product_id = :id",
            ExpressionAttributeValues: { ":id": { S: product.id } }
        }));
        const stock = stockData.Items?.[0] ? unmarshall(stockData.Items[0]) : { count: 0 };

        productsList.push({
        ...product,
        count: stock.count ?? 0,
        });
    }

    return {
        body: JSON.stringify(productsList),
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
    };
};