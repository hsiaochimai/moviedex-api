require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");

const MOVIES = require("./movies-data-small.json");
console.log(process.env.API_TOKEN);
const app = express();
app.use(morgan("dev"));
app.use(cors());
app.use(helmet());

app.use(function validateBearerToken(req, res, next) {
  const apiToken = process.env.API_TOKEN;
  const authToken = req.get("Authorization");
  if (!authToken || authToken.split(" ")[1] !== apiToken) {
    return res.status(401).json({ error: "Unauthorized Request" });
  }
  next();
});
function handleGetMovies(req, res) {
  let results = [...MOVIES];

  if (req.query.genre) {
    results = results.filter(movie =>
      movie.genre.toLowerCase().includes(req.query.genre.toLowerCase())
    );
  }

  if (req.query.country) {
    results = results.filter(movie =>
      movie.country
        .toLowerCase()
        .split(" ")
        .join("")
        .includes(
          req.query.country
            .toLowerCase()
            .split(" ")
            .join("")
        )
    );
  }

  if (req.query.avg_vote) {
    const numVote = parseFloat(req.query.avg_vote);
    console.log(`numVote is`, numVote);
    if (numVote < 0 || numVote > 10) {
      return res
        .status(400)
        .json({ message: `The average vote is out of bounds` });
    }

    results = results.filter(movie => {
      return movie.avg_vote >= req.query.avg_vote;
    });
  }
  res.json(results);
}

app.get("/movie", handleGetMovies);

const PORT = 8000;

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
