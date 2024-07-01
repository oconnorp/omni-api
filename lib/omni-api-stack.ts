import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as ddb from "aws-cdk-lib/aws-dynamodb";

export class OmniApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const table = new ddb.Table(this, "TeamsTable", {
      partitionKey: {
        name: "id",
        type: ddb.AttributeType.STRING,
      },
    });

    // Create an environment variable with the table name
    const tableNameEnv = new cdk.CfnOutput(this, "TableNameEnv", {
      value: table.tableName,
      exportName: "TEAM_TABLE_NAME",
    });

    // Define the Lambda function resource
    const createTeamFunction = new lambda.Function(this, "CreateTeamFunction", {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset("lambda"),
      handler: "team.handler",
      environment: {
        TEAM_TABLE_NAME: tableNameEnv.value,
      },
    });

    const api = new apigateway.LambdaRestApi(this, "OmniApi", {
      handler: createTeamFunction,
      proxy: false,
    });

    // Define the '/team' resource with a GET method
    const teamResource = api.root.addResource("team");
    teamResource.addMethod("GET");
  }
}
