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
    const foundUser = headers['X-user-id']
    return !!foundUser && typeof foundUser === 'string';
}

const hasPlayer = (body) => {
    return !!body.players && typeof body.players === 'array';
}

const validateParams = (event)  => {
    const body = JSON.parse(event.body);
    console.log("@@@@@@@@@@@@@@@@@@@@@@@@2", event);

    if (!hasUserHeader(event.headers) && !hasGameId(event.pathParameters) && hasPlayer(body)) {
        return null;
    }

    let userId = event.headers['x-user-id'] || event.headers['X-user-id'];
    userId = Array.isArray(userId) ? userId[0] : userId
    let gameId = event.pathParameters.gameId;
    let players = body.players;
    if(!gameId || !players || !userId) {
        throw new Error(gameId, players, userId)
    }

    let params = {
        TableName: process.env.DYNAMO_SCORE_BY_GAME_TABLE,
        Key: {
            "gameId": gameId.toString(),
            "userId": userId.toString()
        },
        UpdateExpression: "SET #attrName = :newFavPlayers",
        ExpressionAttributeNames : {
            "#attrName" : "players"
        },
        ExpressionAttributeValues: {
            ':newFavPlayers': players
        },
    };

    return params;
};

const getUserFavoritePlayer = (params) => {
    return new Promise((resolve, reject) => { 
        dbClient.update(params)
            .promise()
            .then((data) => {
                resolve(response);
            }).catch((err) => {
                response.statusCode = err.statusCode || 503;
                response.body = JSON.stringify(err.message);
                reject(response);
            });
    });
};

module.exports.handler = async(event) => {
    try {
        let params = validateParams(event);

        if (params === null) {
            response.status = 401;
            response.body = JSON.stringify('Invalid request parameters');
            return response;
        }

        return await getUserFavoritePlayer(params);
    } catch(err) {
        console.log(err)
    }
};
