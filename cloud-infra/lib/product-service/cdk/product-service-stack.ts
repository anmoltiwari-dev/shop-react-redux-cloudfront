import { CfnOutput, Duration, Stack, StackProps } from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apiGateway from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";
import { Table } from "aws-cdk-lib/aws-dynamodb";
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as sns from 'aws-cdk-lib/aws-sns';
import { EmailSubscription } from "aws-cdk-lib/aws-sns-subscriptions";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";

interface ProductServiceStackProps extends StackProps {
  productsTable: Table;
  stockTable: Table;
}

export class ProductServiceStack extends Stack {
  public readonly catalogItemsQueue: sqs.Queue;
  constructor(scope: Construct, id: string, props?: ProductServiceStackProps) {
    super(scope, id, props);

    /********************************************************/
    /** getProductsByIdLambda */
    /********************************************************/

    const getProductsByIdLambda = new lambda.Function(
      this,
      "getProductsByIdLambda",
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: "getProductById.handler",
        code: lambda.Code.fromAsset("dist/product-service/lambda"),
      }
    );

    getProductsByIdLambda.addEnvironment("PRODUCTS_TABLE", props?.productsTable.tableName as string)
    getProductsByIdLambda.addEnvironment("STOCK_TABLE", props?.stockTable.tableName as string);
    props?.productsTable.grantReadData(getProductsByIdLambda);
    props?.stockTable.grantReadData(getProductsByIdLambda);

    /********************************************************/
    /** getProductsListLambda */
    /********************************************************/

    const getProductsListLambda = new lambda.Function(
      this,
      "getProductsListLambda",
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: "getProductsList.handler",
        code: lambda.Code.fromAsset("dist/product-service/lambda"),
      }
    );

    getProductsListLambda.addEnvironment("PRODUCTS_TABLE", props?.productsTable.tableName as string)
    getProductsListLambda.addEnvironment("STOCK_TABLE", props?.stockTable.tableName as string);
    props?.productsTable.grantReadData(getProductsListLambda);
    props?.stockTable.grantReadData(getProductsListLambda);

    /********************************************************/
    /** CreateProductLambda */
    /********************************************************/

    const createProductLambda = new lambda.Function(this, 'CreateProductLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'createProduct.handler',
      code: lambda.Code.fromAsset('dist/product-service/lambda'),
    });

    createProductLambda.addEnvironment("PRODUCTS_TABLE", props?.productsTable.tableName as string)
    createProductLambda.addEnvironment("STOCK_TABLE", props?.stockTable.tableName as string);
    props?.productsTable.grantWriteData(createProductLambda);
    props?.stockTable.grantWriteData(createProductLambda);

    /********************************************************/
    /** CatalogBatchProcess */
    /********************************************************/
    
    /** SQS Queue: CatalogItemsQueue */
    this.catalogItemsQueue = new sqs.Queue(this, 'CatalogItemsQueue', {
      visibilityTimeout: Duration.seconds(30),
    });

    /** SNS Topic: CreateProductTopic */
    const createProductTopic = new sns.Topic(this, 'CreateProductTopic', {
      displayName: 'Product Creation Topic',
    });

    createProductTopic.addSubscription(
      new EmailSubscription('anmoltiwari0225@gmail.com')
    );

    const catalogBatchProcess = new lambda.Function(this, 'CatalogBatchProcess', {
      runtime:  lambda.Runtime.NODEJS_20_X,
      handler: 'catalogBatchProcess.handler',
      code: lambda.Code.fromAsset('dist/product-service/lambda'),
      environment: {
        PRODUCTS_TABLE: props?.productsTable.tableName as string,
        CREATE_PRODUCT_TOPIC_ARN: createProductTopic.topicArn,
      }
    });

    catalogBatchProcess.addEventSource(
      new SqsEventSource(this.catalogItemsQueue, {
        batchSize: 5,
      })
    );

    props?.productsTable.grantWriteData(catalogBatchProcess);
    createProductTopic.grantPublish(catalogBatchProcess);

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
