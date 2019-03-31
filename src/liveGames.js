const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
const dbClient = new AWS.DynamoDB.DocumentClient();

const currentGameMock = {
    gameId: 5,
    teams: [
        {
            teamName: 'Empoli',
            players: [
                { playerName: 'Bartlomiej Dragowski', playerNumber: 69},
                { playerName: 'Frederic Veseli', playerNumber: 5},
                { playerName: 'Domenico Maietta', playerNumber: 22},
                { playerName: 'Cristian Dell\'Orco', playerNumber: 39},
                { playerName: 'Giovanni Di Lorenzo', playerNumber: 2},
                { playerName: 'Rade Krunic', playerNumber: 33},
                { playerName: 'Ismael Dragowski', playerNumber: 10},
                { playerName: 'Hamed Junior Traore', playerNumber: 8},
                { playerName: 'Marko Pajac', playerNumber: 6},
                { playerName: 'Diego Farias', playerNumber: 17},
                { playerName: 'Francesco Caputo', playerNumber: 11},
            ]
        },
        {
            teamName: 'Juventus',
            players: [
                { playerName: 'Wojciech Szczesny', playerNumber: 1},
                { playerName: 'Joao Cancelo', playerNumber: 20},
                { playerName: 'Daniele Rugani', playerNumber: 24},
                { playerName: 'Giorgio Chiellini', playerNumber: 3},
                { playerName: 'Alex Sandro', playerNumber: 12},
                { playerName: 'Rodrigo Bentancur', playerNumber: 30},
                { playerName: 'Emre Can', playerNumber: 23},
                { playerName: 'Miralem Pjanic', playerNumber: 5},
                { playerName: 'Blaise Matudi', playerNumber: 14},
                { playerName: 'Mario Mandzukic', playerNumber: 17},
                { playerName: 'Frederico Bernardeschi', playerNumber: 33},
            ]
        }
    ]
};

const response = {
    statusCode: 200,
    headers: {
        'Access-Control-Allow-Origin': '*'
    },
    body: ''
}

const getStartedTime = () => {
    const params = {
        TableName: process.env.DYNAMO_GAMES_TABLE,
        Key: {
            "id": "5"
        }
    };
    
    return new Promise((resolve, reject) => { 
        dbClient.get(params)
            .promise()
            .then((data) => {
                const streamingTime = getStreamingTime(data)
                response.body = JSON.stringify({
                    ...currentGameMock,
                    streamingTime
                });
                resolve(response);
            }).catch((err) => {
                response.statusCode = err.statusCode || 503;
                response.body = JSON.stringify(err.message);
                resolve(response);
            });
    });
} 

const getStreamingTime = (data) => {
    const now = Math.floor(new Date().getTime() / 1000);
    const startedAt = !!data.Item.startedAt ? data.Item.startedAt : now;
    
    return now - startedAt;
};

module.exports.handler = async(event) => {
    return await getStartedTime();
};