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

module.exports.handler = async(event) => {
    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(currentGameMock)
    }
};