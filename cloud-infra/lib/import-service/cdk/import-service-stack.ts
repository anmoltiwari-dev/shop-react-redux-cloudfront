import { RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apiGateway from "aws-cdk-lib/aws-apigateway";
import { LambdaDestination } from "aws-cdk-lib/aws-s3-notifications";
import { ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import * as sqs from "aws-cdk-lib/aws-sqs";

interface ImportServiceStackProps extends StackProps {
  catalogItemsQueue: sqs.Queue;
}
export class ImportServiceStack extends Stack {
  public readonly importBucket: s3.Bucket;
  constructor(scope: Construct, id: string, props?: ImportServiceStackProps) {
    super(scope, id, props);

    this.importBucket = new s3.Bucket(this, "uploaded", {
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      cors: [
        {
          allowedOrigins: ["*"], // or specify your frontend URL e.g. ['http://localhost:3000']
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.POST,
            s3.HttpMethods.PUT,
            s3.HttpMethods.HEAD,
          ],
          allowedHeaders: ["*"],
        },
      ],
    });

    new BucketDeployment(this, "DeployUploadBucket", {
      destinationBucket: this.importBucket,
      sources: [Source.data("uploaded/.keep", "")],
    });

    /********************************************************/
    /** importProductsFileLambda */
    /********************************************************/

    const importProductsFileLambda = new lambda.Function(
      this,
      "importProductsFileLambda",
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: "importProductsFile.handler",
        code: lambda.Code.fromAsset("dist/import-service/lambda"),
        environment: {
          BUCKET_NAME: this.importBucket.bucketName as string,
        },
      }
    );

    this.importBucket.grantPut(importProductsFileLambda);

    /********************************************************/
    /** basicAuthorizerFunction */
    /********************************************************/

    const basicAuthorizerFunction = new lambda.Function(
      this,
      "basicAuthorizerFunction",
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: "basicAuthorizer.handler",
        code: lambda.Code.fromAsset("dist/authorization-service/lambda"),
      }
    );

    /********************************************************/
    /** importFileParser */
    /********************************************************/

    const importFileParserLambda = new lambda.Function(
      this,
      "importFileParser",
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: "importFileParser.handler",
        code: lambda.Code.fromAsset("dist/import-service/lambda"),
        environment: {
          BUCKET_NAME: this.importBucket.bucketName as string,
          CATALOG_ITEMS_QUEUE_URL: props?.catalogItemsQueue.queueUrl as string,
        },
      }
    );

    this.importBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new LambdaDestination(importFileParserLambda),
      { prefix: "uploaded/" }
    );

    importFileParserLambda.addPermission("AllowS3Invoke", {
      principal: new ServicePrincipal("s3.amazonaws.com"),
      sourceArn: this.importBucket.bucketArn,
    });

    this?.importBucket.grantRead(importFileParserLambda);

    const api = new apiGateway.RestApi(this, "ImportServiceAPI", {});

    const authorizer = new apiGateway.TokenAuthorizer(this, "TokenAuthorizer", {
      handler: basicAuthorizerFunction,
    });

    const importResource = api.root.addResource("import");
    importResource.addMethod(
      "GET",
      new apiGateway.LambdaIntegration(importProductsFileLambda),
      { authorizer, authorizationType: apiGateway.AuthorizationType.CUSTOM }
    );
    importResource.addCorsPreflight({
      allowOrigins: ["*"], // or use your localhost URL: http://localhost:5173
      allowMethods: ["GET", "POST"],
    });
  }
}
