import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";

export class OmniApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Define the Lambda function resource
    const createTeamFunction = new lambda.Function(this, "CreateTeamFunction", {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset("lambda"),
      handler: "team.handler",
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
