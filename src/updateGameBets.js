const AWS = require('aws-sdk')
AWS.config.update({region: 'us-east-1'})
const dbClient = new AWS.DynamoDB.DocumentClient()

const getPoints = (action) => {
  switch (action.message) {
    case 'pass':
      return 2

    case 'shotOnTarget':
      return 3

    case 'goalPass':
      return 5

    case 'goal':
      return 10
  }
}

const getScoresByGame = async (gameId) => {
  const params = {
    TableName: process.env.DYNAMO_SCORE_BY_GAME_TABLE,
    KeyConditionExpression: 'gameId = :gameId',
    ExpressionAttributeValues: {
      ':gameId': gameId.toString()
    }
  }

  try {
    return await dbClient.query(params).promise()
  } catch (error) {
    console.error(error)
  }
}

const updateScores = async (event) => {
  const scoresByGame = await getScoresByGame(event.gameId)
  const playerNumber = event.playerNumber
  const points = getPoints(event)

  scoresByGame.Items.forEach(async (score) => {
    if (score.players.find(p => p.playerNumber === playerNumber)) {
      const params = {
        TableName: process.env.DYNAMO_SCORE_BY_GAME_TABLE,
        Key: {
          'gameId': event.gameId.toString(),
          'userId': score.userId.toString()
        },
        UpdateExpression: 'ADD score :points',
        ExpressionAttributeValues: {
          ':points' : points
        }
      }

      try {
        await dbClient.update(params).promise()
      } catch (error) {
        console.error(error)
      }
    }
  })
}

module.exports.handler = async (event) => {
  const events = JSON.parse(event.Records[0].body)
  await updateScores(events)
}
