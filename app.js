const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "cricketTeam.db");
const app = express();
app.use(express.json());
let databaseObject = null;
const initializeDBandServer = async () => {
  try {
    databaseObject = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBandServer();
const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

//GET PLAYER DETAILS

app.get("/players/", async (request, response) => {
  const players = `
    SELECT
      * 
    FROM
      cricket_team;`;
  const playersArray = await databaseObject.all(players);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

//GET PLAYER DETAILS BY ID

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerIdsQuery = `
    SELECT
      * 
    FROM
      cricket_team
    WHERE
      player_id= ${playerId};`;
  const playerDetailers = await databaseObject.get(playerIdsQuery);
  response.send(convertDbObjectToResponseObject(playerDetailers));
});

//ADD NEW PLAYER
app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const playerQuery = `
  INSERT INTO
    cricket_team (player_name, jersey_number, role)
  VALUES
    ('${playerName}',${jerseyNumber},'${role}');`;
  const newPlayer = await databaseObject.run(playerQuery);
  response.send("Player Added to Team");
});

//UPDATE PLAYER DETAILS

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = request.body;
  const playerUpdateQuery = `
  UPDATE
    cricket_team
  SET
    player_name= '${playerName}',
    jersey_number= ${jerseyNumber},
    role= '${role}'
  WHERE
    player_id=${playerId};`;
  const updatePlayer = await databaseObject.run(playerUpdateQuery);
  response.send("Player Details Updated");
});

//DELETE PLAYER

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDeleteQuarry = `
  DELETE FROM
    cricket_team
  WHERE
    player_id=${playerId};`;
  await databaseObject.run(playerDeleteQuarry);
  response.send("Player Removed");
});
module.exports = app;
