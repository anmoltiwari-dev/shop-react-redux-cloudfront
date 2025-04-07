#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { DeploymentServiceFrontend } from '../lib/deployment-service-frontend';

const app = new cdk.App();

new DeploymentServiceFrontend(app, "deployment-frontend-code", {});