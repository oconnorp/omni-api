import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";

const client = new DynamoDBClient({});

const ddbDocClient = DynamoDBDocumentClient.from(client); // client is DynamoDB client

const tableName = process.env.TEAM_TABLE_NAME;

console.log(`Using DynamoDB table: ${tableName}`);

export const handler = async (event, context) => {
  let body = "SUCCESS";
  let statusCode = 200;
  const headers = {
    "Content-Type": "application/json",
  };

  // Add a new team
  console.log("POST /teams invoked");
  console.log(`This is the parsed req: ${event.body}`);
  const req = await JSON.parse(event.body);

  const input = {
    TableName: tableName,
    Item: {
      id: "12345678999999999", //uuidv4(),
      name: req.name,
    },
  };
  const command = new PutCommand(input);
  body = await ddbDocClient.send(command);

  return {
    statusCode,
    body,
    headers,
  };
};
