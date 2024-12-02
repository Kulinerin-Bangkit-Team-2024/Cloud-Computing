const axios = require('axios');
const FormData = require('form-data');
const { query } = require("../config/dataBase");
require('dotenv').config();

const getAllFoods = async (req, res) => {
  try {
    const result = await query("SELECT food_id, food_name, place_of_origin, food_image FROM foods");
    res.status(200).json({
      status: "success",
      message: "Foods retrieved successfully",
      foods: result,
    });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

const getFoodById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await query("SELECT * FROM foods WHERE food_id = ?", [id]);
    if (result.length > 0) {
      res.status(200).json({
        status: "success",
        message: "Food retrieved successfully",
        food: result[0],
      });
    } else {
      res.status(404).json({
        status: "error",
        message: "Food not found",
      });
    }
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

const searchFoodsByName = async (req, res) => {
  const { name } = req.query;
  
  if (!name) {
    return res.status(400).json({
      status: "error",
      message: "Please provide a food name to search.",
    });
  }

  try {
    const result = await query(
      "SELECT food_id, food_name, place_of_origin, food_image FROM foods WHERE food_name LIKE ?",
      [`%${name}%`]
    );
    if (result.length > 0) {
      res.status(200).json({
        status: "success",
        message: "Foods retrieved successfully",
        foods: result,
      });
    } else {
      res.status(404).json({
        status: "error",
        message: "No foods found with the given name.",
      });
    }
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

// Search food by place of origin (query param)
const searchFoodsByOrigin = async (req, res) => {
  const { origin } = req.query;
  if (!origin) {
    return res.status(400).json({
      status: "error",
      message: "Please provide a place of origin to search.",
    });
  }

  try {
    const result = await query(
      "SELECT food_id, food_name, place_of_origin, food_image FROM foods WHERE place_of_origin LIKE ?",
      [`%${origin}%`]
    );
    if (result.length > 0) {
      res.status(200).json({
        status: "success",
        message: "Foods retrieved successfully",
        foods: result,
      });
    } else {
      res.status(404).json({
        status: "error",
        message: "No foods found with the given place of origin.",
      });
    }
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

const predictFood = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: "error",
        message: "No image uploaded. Please upload an image.",
      });
    }

    const flaskApiUrl = process.env.ML_MODEL;
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
    const sqlQuery = "SELECT food_id, food_name, description FROM foods WHERE food_name LIKE ?";
    const queryResult = await query(sqlQuery, [`%${predictedFoodName}%`]);

    return res.status(200).json({
      queryResult,
    });

  } catch (error) {
    console.error("Error during prediction:", error);
    return res.status(500).json({ error: "An error occurred during prediction." });
  }
};

module.exports = { 
  getAllFoods,
  getFoodById,
  predictFood,
  searchFoodsByName,
  searchFoodsByOrigin
};