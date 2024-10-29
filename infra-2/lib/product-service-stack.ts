import * as cdk from 'aws-cdk-lib';
import { Stack, StackProps } from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import * as path from 'path';

export class ProductServiceStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Define the Lambda function
    const getProductsListLambda = new lambda.Function(this, 'getProductsListLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'getProductsListLambda.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, './')),
    });

    const getProductsByIdLambda = new lambda.Function(this, 'getProductsByIdLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'getProductsByIdLambda.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, './')),
    });

    // Define the API Gateway REST API
    const api = new apigateway.RestApi(this, 'ProductServiceAPI', {
      restApiName: 'Product Service',
    });

    // Define the /products resource with GET method
    const productsResource = api.root.addResource('products');
    productsResource.addMethod('GET', new apigateway.LambdaIntegration(getProductsListLambda));
    const product = productsResource.addResource('{productId}');
    product.addMethod('GET', new apigateway.LambdaIntegration(getProductsByIdLambda));
  }
}
