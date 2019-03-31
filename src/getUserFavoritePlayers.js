const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
const dbClient = new AWS.DynamoDB.DocumentClient();

const response = {
    statusCode: 200,
    headers: {
        'Access-Control-Allow-Origin': '*'
    },
    body: ''
};

const hasGameId = (pathParameters) => {
    return !!pathParameters && pathParameters.gameId && typeof pathParameters.gameId === 'string';
}

const hasUserHeader = (event) => {
    const headers = event.headers || {}
    const xUserId = headers['X-user-id']
    return !!xUserId;
}

const validateParams = (event)  => {
    if (!hasUserHeader(event) && !hasGameId(event.pathParameters)) {
        return null;
    }

    let userId = event.headers['X-user-id'];
    let gameId = event.pathParameters.gameId;

    let params = {
        TableName: process.env.DYNAMO_SCORE_BY_GAME_TABLE,
        Key: {
            "gameId": gameId,
            "userId": userId
        }
    };

    return params;
};

const getUserFavoritePlayer = (params) => {
    return new Promise((resolve, reject) => { 
        dbClient.get(params)
            .promise()
            .then((data) => {
                response.body = JSON.stringify(data.Item);
                resolve(response);
            }).catch((err) => {
                response.statusCode = err.statusCode || 503;
                response.body = JSON.stringify(err.message);
                resolve(response);
            });
    });
};

module.exports.handler = async(event) => {
    let params = validateParams(event);

    if (params === null) {
        response.status = 401;
        response.body = JSON.stringify('Invalid request parameters');
        return response;
    }

    return await getUserFavoritePlayer(params);
};
