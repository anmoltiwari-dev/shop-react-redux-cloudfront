import { S3Handler } from 'aws-lambda';
import { S3, SQS } from 'aws-sdk';
import csv from 'csv-parser';

const s3 = new S3();
const sqs = new SQS();
const BUCKET_NAME = process.env.BUCKET_NAME;
const QUEUE_URL = process.env.QUEUE_URL; // Set in CDK stack environment

export const handler: S3Handler = async (event) => {
  const record = event.Records[0];
  const bucket = record.s3.bucket.name;
  const key = record.s3.object.key;

  const s3Stream = s3.getObject({ Bucket: bucket, Key: key }).createReadStream();

  s3Stream.pipe(csv())
    .on('data', async (data) => {
      // Send each record to SQS
      await sqs.sendMessage({
        QueueUrl: QUEUE_URL!,
        MessageBody: JSON.stringify(data),
      }).promise();
    })
    .on('end', () => {
      console.log('File processed and records sent to SQS.');
    });
};
