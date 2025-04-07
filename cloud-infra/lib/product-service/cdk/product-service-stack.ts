import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apiGateway from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";
import * as path from "path";

export class ProductServiceStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const getProductsByIdLambda = new lambda.Function(
      this,
      "getProductsByIdLambda",
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: "getProductById.handler",
        code: lambda.Code.fromAsset(path.join("dist")),
      }
    );

    const getProductsListLambda = new lambda.Function(
      this,
      "getProductsListLambda",
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: "getProductsList.handler",
        code: lambda.Code.fromAsset(path.join("dist")),
      }
    );

    const api = new apiGateway.RestApi(this, "ProductServiceAPI", {
      restApiName: "Product Service",
    });

    new CfnOutput(this, "ProductServiceApiUrl", {
      value: api.url,
      description: "Base URL for Product Service API Gateway",
    });

    const products = api.root.addResource("products");

    products.addMethod(
      "GET",
      new apiGateway.LambdaIntegration(getProductsListLambda),
      {}
    );

    products.addCorsPreflight({
      allowOrigins: ["*"], // or use your localhost URL: http://localhost:5173
      allowMethods: ["GET"],
    });

    const singleProduct = products.addResource("{productId}");
    singleProduct.addMethod(
      "POST",
      new apiGateway.LambdaIntegration(getProductsByIdLambda),
      {}
    );

    singleProduct.addCorsPreflight({
      allowOrigins: ["*"], // or use your localhost URL: http://localhost:5173
      allowMethods: ["POST"],
    });
  }
}
