import { S3Event } from 'aws-lambda';
import { S3 } from 'aws-sdk';
import * as csv from 'csv-parser';
import { SQS } from "aws-sdk";

const s3 = new S3();
const sqs = new SQS();
const CATALOG_ITEMS_QUEUE_URL = process.env.CATALOG_ITEMS_QUEUE_URL!;

export const handler = async (event: S3Event): Promise<void> => {
  console.log('Triggered by S3 event:', JSON.stringify(event, null, 2));

  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));
    
    const s3Stream = s3.getObject({ Bucket: bucket, Key: key }).createReadStream();

    await new Promise<void>((resolve, reject) => {
      s3Stream
        .pipe(csv())
        .on('data', async (data) => {
          console.log('Parsed record:', data);
          await sqs
          .sendMessage({
            QueueUrl: CATALOG_ITEMS_QUEUE_URL,
            MessageBody: JSON.stringify(data),
          })
        })
        .on('end', () => {
          console.log('Finished parsing file.');
          resolve();
        })
        .on('error', (err) => {
          console.error('Error while reading/parsing:', err);
          reject(err);
        });
    });
  }
};
