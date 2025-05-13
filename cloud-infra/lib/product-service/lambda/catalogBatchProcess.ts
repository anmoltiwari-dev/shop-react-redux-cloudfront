import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { SNS } from "aws-sdk";
import { SQSEvent } from "aws-lambda";

const dbClient = new DynamoDBClient({});
const sns = new SNS();

const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE!;
const CREATE_PRODUCT_TOPIC_ARN = process.env.CREATE_PRODUCT_TOPIC_ARN!;

export const handler = async (event: SQSEvent) => {
  console.log("Received SQS event:", JSON.stringify(event));

  for (const record of event.Records) {
    try {
      const productData = JSON.parse(record.body);
      console.log("Processing product: ", productData);

      const newProduct = {
        id: productData.id,
        title: productData.title,
        description: productData.description,
        price: productData.price,
      };

      await dbClient.send(new PutItemCommand({
        TableName: PRODUCTS_TABLE,
        Item: newProduct,
      }));
      console.log('Inserted product into DynamoDB', newProduct);
      await sns
      .publish({
        Subject: 'New Product Created',
        Message: JSON.stringify(newProduct),
        TopicArn: CREATE_PRODUCT_TOPIC_ARN,
      });
      console.log('Published SNS notification for product:', newProduct);
    } catch (err) {
        console.error('Error processing record:', record, err);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal Server Error' }),
        };
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Batch processed successfully' }),
  };
};
