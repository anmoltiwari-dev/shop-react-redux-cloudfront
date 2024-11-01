import { DynamoDB, SNS } from 'aws-sdk';
import { SQSEvent } from 'aws-lambda';

const dynamoDb = new DynamoDB.DocumentClient();
const sns = new SNS();
const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE;
const SNS_TOPIC_ARN = process.env.SNS_TOPIC_ARN;

export const handler = async (event: SQSEvent) => {
  const records = event.Records.map(record => JSON.parse(record.body));

  for (const record of records) {
    const product = {
      id: record.id,
      title: record.title,
      description: record.description,
      price: record.price,
    };

    await dynamoDb.put({
      TableName: PRODUCTS_TABLE!,
      Item: product,
    }).promise();
  }

  // Publish a notification to SNS after batch processing
  await sns.publish({
    TopicArn: SNS_TOPIC_ARN,
    Message: 'Products successfully created in DynamoDB',
  }).promise();
};
