import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { GetCommand } from "@aws-sdk/lib-dynamodb";

let env = {};

if (process.env.ENVIRONMENT === "local") {
  env = {
    endpointUrl: "http://host.docker.internal:8000", // Local endpoint
    region: "local",
  };
} else {
  env = {
    region: "us-east-1",
  };
}

const client = new DynamoDBClient(env);

const ddbDocClient = DynamoDBDocumentClient.from(client); // client is DynamoDB client

const tableName = process.env.TEAM_TABLE_NAME;

console.log(`Using DynamoDB table: ${tableName}`);

export const handler = async (event, context) => {
  let body = "Success";
  let statusCode = 200;
  const headers = {
    "Content-Type": "application/json",
  };

  const req = await JSON.parse(event.body);

  try {
    if (event.httpMethod === "POST" && event.path === "/teams") {
      console.log("POST /teams invoked");
      body = await addTeam(req);
      console.log(`response from addTeam: ${JSON.stringify(body)}`);
    } else if (event.httpMethod === "GET" && event.resource === "/teams/{id}") {
      // Get a team by id
      console.log("GET /teams/id invoked");
      const teamId = event.pathParameters.id;
      body = await getTeam(teamId);
    }
  } catch (err) {
    statusCode = 400;
    body = err.message;
  }

  body = JSON.stringify(body, null, 2);

  return {
    statusCode,
    body,
    headers,
  };
};

async function addTeam(team) {
  const input = {
    TableName: tableName,
    Item: {
      id: uuidv4(),
      name: team.name,
    },
  };
  console.log(`input: ${JSON.stringify(input)}`);
  const command = new PutCommand(input);
  await ddbDocClient.send(command);
  return input.Item;
}

async function getTeam(teamId) {
  const input = {
    TableName: tableName,
    Key: {
      id: teamId,
    },
  };
  console.log(`input: ${JSON.stringify(input)}`);
  const command = new GetCommand(input);
  const response = await ddbDocClient.send(command);
  console.log(`response: ${JSON.stringify(response)}`);
  return response.Item;
}
