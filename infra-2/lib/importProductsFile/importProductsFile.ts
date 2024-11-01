import { S3 } from 'aws-sdk';

const s3 = new S3();
const BUCKET_NAME = process.env.BUCKET_NAME;

export const handler = async (event: any) => {
  const fileName = event.queryStringParameters?.name;

  if (!fileName) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'File name is required as a query parameter.' }),
    };
  }

  const key = `uploaded/${fileName}`;

  // Generate a signed URL for the specified file
  const url = s3.getSignedUrl('putObject', {
    Bucket: BUCKET_NAME,
    Key: key,
    Expires: 60 * 5, // URL expiration in seconds
    ContentType: 'text/csv',
  });

  return {
    statusCode: 200,
    body: JSON.stringify({ url }),
  };
};
