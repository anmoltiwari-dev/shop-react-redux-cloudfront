import { RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";

export class ImportBucketStack extends Stack {
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
  }
}
