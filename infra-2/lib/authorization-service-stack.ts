import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import * as dotenv from 'dotenv';
import { Stack, StackProps } from 'aws-cdk-lib';
import path from 'path';

dotenv.config({ path: './authorization-service/.env' });

export class AuthorizationServiceStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const basicAuthorizer = new lambda.Function(this, 'BasicAuthorizer', {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset(path.join(__dirname, './basicAuthorizer')), // compiled code here
      handler: 'basicAuthorizer.handler',
      environment: process.env,
    });
  }
}
