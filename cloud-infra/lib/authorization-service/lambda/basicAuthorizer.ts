import { APIGatewayTokenAuthorizerEvent } from "aws-lambda";
import * as dotenv from "dotenv";

dotenv.config();

export const handler = async (event: APIGatewayTokenAuthorizerEvent) => {
  if (!event.authorizationToken) {
    throw "Unauthorized";
  }

  try {
    const token = event.authorizationToken.split(" ")[1];
    const [username, password] = Buffer.from(token, "base64")
      .toString("utf-8")
      .split("=");
      console.log(username, password, process.env['anmoltiwaridev'])
    const envPassword = process.env[username];
    if (envPassword && password === envPassword) {
      return {
        principalId: username,
        policyDocument: {
          Version: "2012-10-17",
          Statement: [
            {
              Action: "execute-api:Invoke",
              Effect: "Allow",
              Resource: event.methodArn,
            },
          ],
        },
      };
    }
    return {
      principalId: "unauthorized",
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Action: "execute-api:Invoke",
            Effect: "Deny",
            Resource: event.methodArn,
          },
        ],
      },
    };
  } catch (err) {
    throw "Unauthorized";
  }
};
