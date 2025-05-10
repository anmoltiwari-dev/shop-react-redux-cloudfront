// products:
// id -  uuid (Primary key)
// title - text, not null
// description - text
// price - integer

import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export class ProductDBStack extends Stack {
    public readonly productsTable: dynamodb.Table;
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);
        
        this.productsTable = new dynamodb.Table(this, "products", {
            tableName: "products",
            partitionKey: {
                name: "id",
                type: dynamodb.AttributeType.STRING,
            },
        });
    }
}