import { APIGatewayProxyHandler } from "aws-lambda";
import { S3 } from "aws-sdk";

const s3 = new S3({ region: "us-east-1" });
const BUCKET = process.env.BUCKET_NAME!;

export const handler: APIGatewayProxyHandler = async (event) => {
  const fileName = event.queryStringParameters?.name;
  if (!fileName) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Missing "name" query parameter' }),
    };
  }

  const bucketParams = {
    Bucket: BUCKET,
    Key: `uploaded/${fileName}`,
    Expires: 60,
    ContentType: "text/csv",
  };

  try {
    const signedUrl = await s3.getSignedUrlPromise("putObject", bucketParams);
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ url: signedUrl }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to create signed URL", err }),
    };
  }
};
