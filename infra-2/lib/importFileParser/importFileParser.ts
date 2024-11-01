import { S3Handler } from 'aws-lambda';
import { S3 } from 'aws-sdk';
import csv from 'csv-parser';

const s3 = new S3();
const BUCKET_NAME = process.env.BUCKET_NAME;

export const handler: S3Handler = async (event) => {
  const record = event.Records[0];
  const bucket = record.s3.bucket.name;
  const key = record.s3.object.key;

  try {
    const s3Stream = s3.getObject({ Bucket: bucket, Key: key }).createReadStream();

    s3Stream
      .pipe(csv())
      .on('data', (data) => {
        console.log('Parsed Record:', data);
      })
      .on('end', () => {
        console.log('File processing completed.');
      })
      .on('error', (error) => {
        console.error('Error processing file:', error);
      });
  } catch (error) {
    console.error('Error retrieving file from S3:', error);
  }
};
