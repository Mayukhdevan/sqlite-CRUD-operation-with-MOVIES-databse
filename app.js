const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => console.log("Server listening at port 3000..."));
  } catch (err) {
    console.log(`DB error: ${err.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

// GET API: Returns a list of all movie names in the movie table.
app.get("/movies/", async (req, res) => {
  const getMoviesQuery = `
        SELECT
          *
        FROM
          movie
        ORDER BY
          movie_id;`;
  const movieNameArray = await db.all(getMoviesQuery);
  res.send(
    movieNameArray.map((movieObj) => ({ movieName: movieObj.movie_name }))
  );
});

// POST API: Creates a new movie in the movie table.
app.post("/movies/", async (req, res) => {
  const movieDetails = req.body;
  const { directorId, movieName, leadActor } = movieDetails;

  const postMoviesQuery = `
          INSERT INTO
            movie (director_id, movie_name, lead_actor)
          VALUES
            (${directorId}, '${movieName}', '${leadActor}');`;

  await db.run(postMoviesQuery);
  res.send("Movie Successfully Added");
});

// GET API: Returns a movie based on the movie ID.
app.get("/movies/:movieId/", async (req, res) => {
  const { movieId } = req.params;

  const getMovieQuery = `
        SELECT * FROM
          movie
        WHERE
          movie_id = ${movieId};`;

  const movieDetails = await db.get(getMovieQuery);

  res.send({
    movieId: movieDetails.movie_id,
    directorId: movieDetails.director_id,
    movieName: movieDetails.movie_name,
    leadActor: movieDetails.lead_actor,
  });
});

// PUT API: Updates the details of a movie in the movie table based on the movie ID.
app.put("/movies/:movieId/", async (req, res) => {
  const { movieId } = req.params;
  const movieDetails = req.body;
  const { directorId, movieName, leadActor } = movieDetails;

  const updateMovieQuery = `
    UPDATE
      movie
    SET
      director_id = ${directorId},
      movie_name = "${movieName}",
      lead_actor = "${leadActor}"
    WHERE
      movie_id = ${movieId};`;

  await db.run(updateMovieQuery);
  res.send("Movie Details Updated");
});

// DELETE API: Deletes a movie from the movie table based on the movie ID.
app.delete("/movies/:movieId/", async (req, res) => {
  const { movieId } = req.params;

  const deleteMovieQuery = `
      DELETE FROM
        movie
      WHERE
        movie_id = ${movieId};`;

  await db.run(deleteMovieQuery);
  res.send("Movie Removed");
});

// GET API: Returns a list of all directors in the director table.
app.get("/directors/", async (req, res) => {
  const getDirectorsQuery = `
        SELECT
          *
        FROM
          director
        ORDER BY
          director_id;`;
  const directorArray = await db.all(getDirectorsQuery);
  res.send(
    directorArray.map((directorObj) => ({
      directorId: directorObj.director_id,
      directorName: directorObj.director_name,
    }))
  );
});

// GET API: Returns a list of all movie names directed by a specific director.
app.get("/directors/:directorId/movies/", async (req, res) => {
  const { directorId } = req.params;

  const getDirectorMoviesQuery = `
        SELECT
          movie_name
        FROM
          movie
        WHERE
          director_id = ${directorId};`;

  const moviesDetails = await db.all(getDirectorMoviesQuery);

  res.send(
    moviesDetails.map((movieObj) => ({ movieName: movieObj.movie_name }))
  );
});

module.exports = app;
