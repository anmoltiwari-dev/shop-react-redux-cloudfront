import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apiGateway from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";
import * as path from "path";
import { Table } from "aws-cdk-lib/aws-dynamodb";

interface ProductServiceStackProps extends StackProps {
  productsTable: Table;
  stockTable: Table;
}

export class ProductServiceStack extends Stack {
  constructor(scope: Construct, id: string, props?: ProductServiceStackProps) {
    super(scope, id, props);

    const getProductsByIdLambda = new lambda.Function(
      this,
      "getProductsByIdLambda",
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: "getProductById.handler",
        code: lambda.Code.fromAsset("dist"),
      }
    );

    getProductsByIdLambda.addEnvironment("PRODUCTS_TABLE", props?.productsTable.tableName as string)
    getProductsByIdLambda.addEnvironment("STOCK_TABLE", props?.stockTable.tableName as string);
    props?.productsTable.grantReadData(getProductsByIdLambda);
    props?.stockTable.grantReadData(getProductsByIdLambda);

    const getProductsListLambda = new lambda.Function(
      this,
      "getProductsListLambda",
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: "getProductsList.handler",
        code: lambda.Code.fromAsset("dist"),
      }
    );

    getProductsListLambda.addEnvironment("PRODUCTS_TABLE", props?.productsTable.tableName as string)
    getProductsListLambda.addEnvironment("STOCK_TABLE", props?.stockTable.tableName as string);
    props?.productsTable.grantReadData(getProductsListLambda);
    props?.stockTable.grantReadData(getProductsListLambda);

    const createProductLambda = new lambda.Function(this, 'CreateProductLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'createProduct.handler',
      code: lambda.Code.fromAsset('dist'),
    });

    createProductLambda.addEnvironment("PRODUCTS_TABLE", props?.productsTable.tableName as string)
    createProductLambda.addEnvironment("STOCK_TABLE", props?.stockTable.tableName as string);
    props?.productsTable.grantWriteData(createProductLambda);
    props?.stockTable.grantWriteData(createProductLambda);

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

    products.addMethod(
      "POST",
      new apiGateway.LambdaIntegration(createProductLambda),
      {}
    );

    products.addCorsPreflight({
      allowOrigins: ["*"], // or use your localhost URL: http://localhost:5173
      allowMethods: ["GET", "POST"],
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
