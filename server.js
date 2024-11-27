const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { query } = require("./config/dataBase");
const routes = require("./routes/routes");

const PORT = process.env.PORT || 8000;
const app = express();
app.use(cors("*"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/test", async (req, res) => {
  try {
    await query("SELECT 1");
    res.status(200).send({
      status: "success",
      message: "API and database are working correctly.",
    });
  } catch (err) {
    res.status(500).send({
      status: "error",
      message: "API is working, but database connection failed.",
      error: err.message,
    });
  }
});

app.use("/", routes);

app.listen(PORT, () => {
  console.log(`Server running on port: http://localhost:${PORT}/`);
});
