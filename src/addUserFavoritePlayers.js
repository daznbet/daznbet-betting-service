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

const hasUserHeader = (headers) => {
    return 'X-user-id' in headers && typeof headers['X-user-id'] === 'string';
}

const hasPlayer = (body) => {
    return !!body.players && typeof body.players === 'array';
}

const validateParams = (event)  => {
    const body = JSON.parse(event.body);

    if (!hasUserHeader(event.headers) && !hasGameId(event.pathParameters) && hasPlayers(body)) {
        return null;
    }

    let userId = event.headers['X-user-id'];
    let gameId = event.pathParameters.gameId;
    let players = body.players;

    let params = {
        TableName: process.env.DYNAMO_SCORE_BY_GAME_TABLE,
        Item: {
            "gameId": gameId,
            "range": userId
        },
        UpdateExpression: "ADD #attrName = :newFavPlayers",
        ExpressionAttributeNames : {
            "#attrName" : "players"
        },
        ExpressionAttributeValues: {
            ':newFavPlayers': { "L": players }
        },
    };

    return params;
};

const getUserFavoritePlayer = (params) => {
    return new Promise((resolve, reject) => { 
        dbClient.put(params)
            .promise()
            .then((data) => {
                response.body = JSON.stringify(data);
                response.data = params;
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
