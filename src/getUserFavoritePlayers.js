const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
const dbClient = new AWS.DynamoDB.DocumentClient();

const response = {
    statusCode: 200,
    body: ''
};

module.exports.handler = async(event) => {
    let userId = event.headers['X-user-id'];
    let gameId = event.pathParameters.gameId;

    let params = {
        TableName: process.env.DYNAMO_USER_TABLE,
        Items: {
            "userId": userId,
            "gameId": gameId
        }
    };

    return await new Promise((resolve, reject) => { 
        dbClient.put(params, (err, data) => {
            if (!!err) {
                response.statusCode = err.statusCode || 503;
                response.body = JSON.stringify(err.message);
            } else {
                response.body = JSON.stringify(data);
            }
            
            resolve(response);
        })
    })
};
