import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export class VpcStack extends cdk.Stack {
    public readonly vpc: ec2.Vpc;
    public readonly kafkaSecurityGroup: ec2.SecurityGroup;
    public readonly lambdaSecurityGroup: ec2.SecurityGroup;
    public readonly ec2BastionSecurityGroup: ec2.SecurityGroup;
    public readonly fargateSecurityGroup: ec2.SecurityGroup;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        this.vpc = new ec2.Vpc(this, 'vpc');

        this.kafkaSecurityGroup = new ec2.SecurityGroup(this, 'kafkaSecurityGroup', {
            securityGroupName: 'kafkaSecurityGroup',
            vpc: this.vpc,
            allowAllOutbound: true
        });

        this.lambdaSecurityGroup = new ec2.SecurityGroup(this, 'lambdaSecurityGroup', {
            securityGroupName: 'lambdaSecurityGroup',
            vpc: this.vpc,
            allowAllOutbound: true
        });

        this.ec2BastionSecurityGroup = new ec2.SecurityGroup(this, 'ec2BastionSecurityGroup', {
            securityGroupName: 'ec2BastionSecurityGroup',
            vpc: this.vpc,
            allowAllOutbound: true
        });
        this.ec2BastionSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'Allow SSH from anywhere');

        this.fargateSecurityGroup = new ec2.SecurityGroup(this, 'fargateSecurityGroup', {
            securityGroupName: 'fargateSecurityGroup',
            vpc: this.vpc,
            allowAllOutbound: true
        });

        this.kafkaSecurityGroup.connections.allowFrom(this.lambdaSecurityGroup, ec2.Port.allTraffic(), 'allowFromLambdaToKafka');
        this.kafkaSecurityGroup.connections.allowFrom(this.ec2BastionSecurityGroup, ec2.Port.allTraffic(), 'allowFromEc2BastionToKafka');
        this.fargateSecurityGroup.connections.allowFrom(this.kafkaSecurityGroup, ec2.Port.allTraffic(), "allowFromKafkaToFargate");
    }
}