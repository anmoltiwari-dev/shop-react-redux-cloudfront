import { RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apiGateway from "aws-cdk-lib/aws-apigateway";
import { LambdaDestination } from "aws-cdk-lib/aws-s3-notifications";
import { ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";

export class ImportServiceStack extends Stack {
  public readonly importBucket: s3.Bucket;
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.importBucket = new s3.Bucket(this, "uploaded", {
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    new BucketDeployment(this, "DeployUploadBucket", {
      destinationBucket: this.importBucket,
      sources: [Source.data("uploaded/.keep", "")],
    });

    const importProductsFileLambda = new lambda.Function(
      this,
      "importProductsFileLambda",
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: "importProductsFile.handler",
        code: lambda.Code.fromAsset("dist"),
        environment: {
          BUCKET_NAME: this.importBucket.bucketName as string,
        },
      }
    );

    this.importBucket.grantPut(importProductsFileLambda);

    const importFileParserLambda = new lambda.Function(
      this,
      "importFileParser",
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: "importFileParser.handler",
        code: lambda.Code.fromAsset("dist"),
        environment: {
          BUCKET_NAME: this.importBucket.bucketName as string,
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

    const importResource = api.root.addResource("import");
    importResource.addMethod(
      "GET",
      new apiGateway.LambdaIntegration(importProductsFileLambda)
    );
  }
}
