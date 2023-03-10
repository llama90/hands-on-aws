#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { VpcStack } from '../lib/vpc-stack';
import { KafkaStack } from '../lib/kafka-stack';
import { SecretsManagerStack } from '../lib/secretsmanager-stack';
import { KafkaSecretsStack } from '../lib/kafka-secrets-stack';
import { Ec2BastionStack } from '../lib/ec2-bastion';
import { LambdaKafkaAdminStack } from '../lib/lambda-kafka-admin-stack';
import { KafkaStorageAutoScalingStack } from '../lib/kafka-storage-autoscaling-stack';

const app = new cdk.App();

const prefix = 'public-msk';
const vpcStack = new VpcStack(app, `${prefix}-vpc-stack`);
const secretsManagerStack = new SecretsManagerStack(app, `${prefix}-secretsmanager-stack`);

const kafkaStack = new KafkaStack(vpcStack, secretsManagerStack, app, `${prefix}-kafka-stack`);
kafkaStack.dependencies.push(vpcStack);

const kafkaSecretsStack = new KafkaSecretsStack(kafkaStack, secretsManagerStack, app, `${prefix}-kafka-secrets-mapping-stack`);
kafkaSecretsStack.dependencies.push(kafkaStack);
kafkaSecretsStack.dependencies.push(secretsManagerStack);

const kafkaStorageAutoScalingStack = new KafkaStorageAutoScalingStack(kafkaStack, app, `${prefix}-kafka-storage-auto-scaling-stack`);
kafkaStorageAutoScalingStack.dependencies.push(kafkaStack);

const lambdaKafkaAdminStack = new LambdaKafkaAdminStack(vpcStack, kafkaStack, app, `${prefix}-lambda-kafka-admin-stack`);
lambdaKafkaAdminStack.dependencies.push(vpcStack);
lambdaKafkaAdminStack.dependencies.push(kafkaStack);

const ec2BastionStack = new Ec2BastionStack(vpcStack, app, `${prefix}-ec2-bastion-stack`);
ec2BastionStack.dependencies.push(vpcStack);
