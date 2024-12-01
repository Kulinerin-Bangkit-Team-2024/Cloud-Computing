const axios = require('axios');
const FormData = require('form-data');
const { query } = require("../config/dataBase");
require('dotenv').config();

const predictFood = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: "error",
        message: "No image uploaded. Please upload an image.",
      });
    }

    const flaskApiUrl = process.env.FLASK_API_URL;
    if (!flaskApiUrl) {
      return res.status(500).json({
        status: "error",
        message: "Flask API URL is not configured. Please check your .env file.",
      });
    }

    const form = new FormData();
    form.append('image', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const response = await axios.post(`${flaskApiUrl}/predict`, form, {
      headers: {
        ...form.getHeaders(),
      },
    });

    const predictedFoodName = response.data.predicted_class_name;
    const sqlQuery = "SELECT food_id, food_name, description FROM food WHERE food_name LIKE ?";
    const queryResult = await query(sqlQuery, [`%${predictedFoodName}%`]);

    return res.status(200).json({
      predictedFoodName: predictedFoodName,
      databaseResults: queryResult,
    });

  } catch (error) {
    console.error("Error during prediction:", error);
    return res.status(500).json({ error: "An error occurred during prediction." });
  }
};

module.exports = { predictFood };
