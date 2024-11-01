import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3Notifications from 'aws-cdk-lib/aws-s3-notifications';
import path from 'path';

export class ImportServiceStack extends Stack {
  public readonly bucket: s3.Bucket;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // S3 Bucket for importing files
    this.bucket = new s3.Bucket(this, 'ImportBucket', {
      bucketName: 'import-service-bucket',
    });

    // Lambda function for importProductsFile
    const importProductsFileLambda = new lambda.Function(this, 'ImportProductsFileLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset(path.join(__dirname, './importProductsFile')),
      handler: 'importProductsFile.handler',
      environment: {
        BUCKET_NAME: this.bucket.bucketName,
      },
    });

    // Lambda function for file parsing
    const importFileParserLambda = new lambda.Function(this, 'ImportFileParserLambda', {
        runtime: lambda.Runtime.NODEJS_20_X,
        code: lambda.Code.fromAsset(path.join(__dirname, './importFileParser')),
        handler: 'importFileParser.handler',
        environment: {
          BUCKET_NAME: this.bucket.bucketName,
        },
      });
  
      // Grant S3 read access to Lambda
      this.bucket.grantRead(importFileParserLambda);
  
      // S3 event notification configuration for Lambda
      this.bucket.addEventNotification(
        s3.EventType.OBJECT_CREATED,
        new s3Notifications.LambdaDestination(importFileParserLambda),
        { prefix: 'uploaded/' }
      );
  

    // Grant Lambda permissions to interact with S3 bucket
    this.bucket.grantReadWrite(importProductsFileLambda);

    // API Gateway integration
    const api = new apigateway.RestApi(this, 'ImportApi', {
      restApiName: 'Import Service',
    });

    const basicAuthorizer = lambda.Function.fromFunctionArn(this, 'BasicAuthorizer', 'arn:aws:lambda:...');

    const authorizer = new apigateway.TokenAuthorizer(this, 'TokenAuthorizer', {
      handler: basicAuthorizer,
    });

    const importResource = api.root.addResource('import');
    importResource.addMethod('GET', new apigateway.LambdaIntegration(importProductsFileLambda), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.CUSTOM,
    });
  }
}
