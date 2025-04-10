import { aws_cloudfront, aws_cloudfront_origins, aws_s3, aws_s3_deployment, CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";

const path = './resources/build';

export class DeploymentServiceFrontend extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);
        const hostingBucket = new aws_s3.Bucket(this, "fe-bucket", {
            blockPublicAccess: aws_s3.BlockPublicAccess.BLOCK_ALL,
        });

        const distribution = new aws_cloudfront.Distribution(this, "cloudfront-distribution", {
            defaultBehavior: {
                origin: aws_cloudfront_origins.S3BucketOrigin.withOriginAccessControl(hostingBucket),
                viewerProtocolPolicy: aws_cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            },
            defaultRootObject: "index.html",
            errorResponses: [
                {
                    httpStatus: 404,
                    responseHttpStatus: 200,
                    responsePagePath: '/index.html',
                },
            ],
        });

        new aws_s3_deployment.BucketDeployment(this, "BucketDeploy", {
            sources: [aws_s3_deployment.Source.asset(path)],
            destinationBucket: hostingBucket,
            distribution,
            distributionPaths: ['/*'],
        });

        new CfnOutput(this, 'CloudFrontUri', {
            value: distribution.domainName,
            description: 'The distribution URL',
            exportName: 'CloudfrontUri',
        });

        new CfnOutput(this, 'Bucket', {
            value: hostingBucket.bucketName,
            description: 'The name of the S3 bucket',
            exportName: 'Bucket',
        })
    }
}