const AWS = require('aws-sdk')
const dbClient = new AWS.DynamoDB.DocumentClient()

const getPoints = (action) => {
  switch (event.message) {
    case 'pass':
      return 3

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
    TableName: process.env.DYNAMO_USER_TABLE,
    Item: {
      'id': gameId
    }
  }

  try {
    return await dbClient.get(params)
  } catch (error) {
    console.error(error)
  }
}

const updateScores = async (event) => {
  const scoresByGame = await getScoresByGame(event.gameId)
  const playerNumber = 0 // TODO
  const points = getPoints(event)

  scoresByGame.forEach(score => {
    if (score.players.find(p => p.playerNumber === playerNumber)) {
      const params = {
        TableName: process.env.DYNAMO_USER_TABLE,
        Key: {
          'gameId': event.gameId,
          'userId': score.userId
        },
        UpdateExpression: 'ADD score = :points',
        ExpressionAttributeValues: {
          ':points' : points
        }
      }

      try {
        await dbClient.update(params)
      } catch (error) {
        console.error(error)
      }
    }
  })
}

module.exports.handler = async (event) => {
  const event = JSON.parse(event.Records[0].body)
  await updateScores(event)
}
