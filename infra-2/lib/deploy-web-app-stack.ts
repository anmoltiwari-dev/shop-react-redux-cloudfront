import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { DeploymentService } from './deployment-service';
import { ProductServiceStack } from './product-service-stack';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class DeployWebAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'Infra2Queue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
    new DeploymentService(this, "deployment");
    //new ProductServiceStack(this, "deployment");
  }
}
