const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const path = require('path')

const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'cricketTeam.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })

    app.listen(3000, () => {
      console.log('Server Successfully initialized on http://localhost:3000')
    })
  } catch (e) {
    console.log(`DB ERORR: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

//GET API 1 Path:/players/
app.get('/players/', async (request, response) => {
  const allPlayersQuery = `
    SELECT * FROM cricket_team;
    `
  const queryResponse = await db.all(allPlayersQuery)

  const responseToRequest = []
  for (let i of queryResponse) {
    const {player_id, player_name, jersey_number, role} = i
    responseToRequest.push({
      playerId: player_id,
      playerName: player_name,
      jerseyNumber: jersey_number,
      role: role,
    })
  }

  response.send(responseToRequest)
})

//POST API 2 Path:/players/
app.post('/players/', async (request, response) => {
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails

  const dbQueryToAddPlayerDetails = `
   INSERT INTO 
    cricket_team (player_name, jersey_number, role)
   VALUES ('${playerName}', ${jerseyNumber}, '${role}');
   `

  const dbResponse = await db.run(dbQueryToAddPlayerDetails)
  console.log(dbResponse)
  response.send(`Player Added to Team`)
})

//GET API 3 Path:/players/:playerId/
app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const dbPlayerIdQuery = `
  Select *
  from cricket_team
  Where player_id = ${playerId};
  `

  const dbResponse = await db.get(dbPlayerIdQuery)

  const {player_id, player_name, jersey_number, role} = dbResponse
  const respon = {
    playerId: player_id,
    playerName: player_name,
    jerseyNumber: jersey_number,
    role: role,
  }

  response.send(respon)
})

//PUT API 4 /player/:playerId/ update
app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails

  const dbQuery = `
  UPDATE cricket_team
  SET player_name = '${playerName}',
  jersey_number = ${jerseyNumber};
  role = '${role}'
  WHERE player_id = ${playerId};
  `

  await db.run(dbQuery)
  response.send('Player Details Updated')
})

//DETELE API 5 player/:playerID from the team
app.delete('/players/:playerID/', async (request, response) => {
  const {playerID} = request.params

  const dbDeleteQuery = `
  DELETE FROM 
    cricket_team
  WHERE player_id = ${playerID};
  `
  await db.run(dbDeleteQuery)
  response.send('Player Removed')
})

module.exports = app
