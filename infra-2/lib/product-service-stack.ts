import * as cdk from 'aws-cdk-lib';
import { Stack, StackProps } from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { Construct } from 'constructs';
import * as path from 'path';

const ProductsTableName = 'Products';
const StockTableName = 'Stock';

export class ProductServiceStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const productsTable = new dynamodb.Table(this, 'ProductsTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      tableName: ProductsTableName,
    });

    const stockTable = new dynamodb.Table(this, 'StockTable', {
      partitionKey: { name: 'product_id', type: dynamodb.AttributeType.STRING },
      tableName: StockTableName,
    });

    // get all products
    const getProductsListLambda = new lambda.Function(this, 'getProductsListLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'getProductsListLambda.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, './getProductsListLambda')),
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
    });

    // get products by id
    const getProductsByIdLambda = new lambda.Function(this, 'getProductsByIdLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'getProductsByIdLambda.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, './getProductsByIdLambda')),
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
    });

    const createProductLambda = new lambda.Function(this, 'createProduct', {
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      handler: 'createProduct.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, './createProduct')),
      environment: {
        PRODUCTS_TABLE_NAME: ProductsTableName,
        STOCK_TABLE_NAME: StockTableName,
      }
    });

    productsTable.grantReadWriteData(createProductLambda);
    stockTable.grantReadWriteData(createProductLambda);

    productsTable.grantReadData(getProductsListLambda);
    stockTable.grantReadData(getProductsListLambda);

    productsTable.grantReadData(getProductsByIdLambda);
    stockTable.grantReadData(getProductsByIdLambda);

    // Define the API Gateway REST API
    const api = new apigateway.RestApi(this, 'ProductServiceAPI', {
      restApiName: 'Product Service',
    });

    // Integrate GET /products with `getProductsListLambda`
    const products = api.root.addResource('products');
    products.addMethod(
      'GET',
      new apigateway.LambdaIntegration(getProductsListLambda),
    );

    // Integrate GET /products/{productId} with `getProductByIdLambda`
    const product = products.addResource('{productId}');
    product.addMethod(
      'GET',
      new apigateway.LambdaIntegration(getProductsByIdLambda),
    );

    // Integrate POST /products/create-product WITH `createProductLambda`
    const createProduct = products.addResource('create-product');
    createProduct.addMethod(
      'POST',
      new apigateway.LambdaIntegration(createProductLambda),
    );
  }
}
