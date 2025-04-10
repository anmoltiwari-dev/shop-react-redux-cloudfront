#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { ProductServiceStack } from '../lib/product-service/cdk/product-service-stack';
import { ProductDBStack } from '../lib/dbs/products-db-stack';
import { StockDBStack } from '../lib/dbs/stock-db-stack';

const app = new cdk.App();

const productDBStack = new ProductDBStack(app, 'ProductDBStack', {});
const stockDBStack = new StockDBStack(app, 'StockDBStack', {});
new ProductServiceStack(app, 'ProductServiceStack', {
  productsTable: productDBStack.productsTable,
  stockTable: stockDBStack.stockTable,
});