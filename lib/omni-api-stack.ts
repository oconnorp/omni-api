import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as ddb from "aws-cdk-lib/aws-dynamodb";
import { ServicePrincipal } from "aws-cdk-lib/aws-iam";

export class OmniApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const table = new ddb.Table(this, "TeamsTable", {
      partitionKey: {
        name: "id",
        type: ddb.AttributeType.STRING,
      },
    });

    console.log(`Generated table name: ${table.tableName}`);

    // Create an environment variable with the table name
    const tableNameEnv = new cdk.CfnOutput(this, "TableNameEnv", {
      value: table.tableName,
      exportName: "TeamTableName",
    });

    // Define the Lambda function resource
    const teamFunction = new lambda.Function(this, "TeamFunction", {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset("lambda"),
      handler: "team.handler",
      timeout: cdk.Duration.seconds(10),
      environment: {
        TEAM_TABLE_NAME: tableNameEnv.value,
      },
    });

    // IMPORTANT: Lambda grant invoke to APIGateway
    teamFunction.grantInvoke(new ServicePrincipal("apigateway.amazonaws.com"));

    const api = new apigateway.LambdaRestApi(this, "OmniApi", {
      handler: teamFunction,
      proxy: false,
      restApiName: "Omni API",
      apiKeySourceType: apigateway.ApiKeySourceType.HEADER,
    });

    const plan = api.addUsagePlan("UsagePlan", {
      name: "omni-usage-plan",
      throttle: {
        rateLimit: 10,
        burstLimit: 2,
      },
      quota: {
        limit: 10000,
        period: apigateway.Period.MONTH,
      },
    });

    const key = api.addApiKey("ApiKey");
    plan.addApiKey(key);
    plan.addApiStage({ api: api, stage: api.deploymentStage });

    // Define the '/teams' resource with a GET method
    const teams = api.root.addResource("teams", {
      defaultMethodOptions: {
        apiKeyRequired: true,
      },
    });
    teams.addMethod("POST");

    const teamById = teams.addResource("{id}");
    teamById.addMethod("GET");

    table.grantReadWriteData(teamFunction);
  }
}
