const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const db = require("./config/dataBase");

const PORT = process.env.PORT || 8000;
const app = express();
app.use(cors("*"));
app.use(bodyParser.json());

app.get("/test", async (req, res) => {
  db.query("SELECT 1", (err) => {
    if (err) {
      return res.status(500).send({
        status: "error",
        message: "API is working, but database connection failed.",
        error: err.message,
      });
    }

    res.status(200).send({
      status: "success",
      message: "API and database are working correctly.",
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port: http://localhost:${PORT}/`);
});
