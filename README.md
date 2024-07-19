# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `cdk deploy` deploy this stack to your default AWS account/region
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template

# Invoking the lambda function locally

1.  Start the dynamodb docker image:
    `docker run -p 8000:8000 amazon/dynamodb-local`
2.  Create the local tables using a JSON file. Example: create the teams table:
    `aws dynamodb create-table --cli-input-json file://local/local.teams.table.json --endpoint-url http://localhost:8000`
3.  Run `cdk synth`
4.  Execute the lambda function. Set the template from the cdk.out folder and point to the JSON event. Example:
    `sam local invoke -t ./cdk.out/OmniApiStack.template.json  -e events/post.teams.json`
