const { DynamoDBClient, GetItemCommand } = require("@aws-sdk/client-dynamodb");

const tableSuffix = process.env.JOKE_TABLE_SUFFIX
  ? process.env.JOKE_TABLE_SUFFIX
  : "";

const ddb = new DynamoDBClient();

exports.handler = async (event) => {
  const cmd = new GetItemCommand({
    TableName: `jokes${tableSuffix}`,
    Key: { ID: { N: event.jokeID } },
  });
  const response = await ddb.send(cmd);

  return response.Item;
};
