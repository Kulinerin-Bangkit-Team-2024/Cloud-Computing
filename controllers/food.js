const axios = require('axios');
const FormData = require('form-data');
const { query } = require("../config/dataBase");
require('dotenv').config();

const getAllFoods = async (req, res) => {
  try {
    const result = await query("SELECT food_id, food_name, place_of_origin, food_image FROM foods");

    const foods = result.map(food => ({
      ...food,
      food_image: food.food_image.trim(),
    }));

    res.status(200).json({
      status: "success",
      message: "Foods retrieved successfully",
      foods,
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
      const food = {
        ...result[0],
        food_image: result[0].food_image.trim(), 
      };

      res.status(200).json({
        status: "success",
        message: "Food retrieved successfully",
        food,
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
      const foods = result.map(food => ({
        ...food,
        food_image: food.food_image.trim(),
      }));

      res.status(200).json({
        status: "success",
        message: "Foods retrieved successfully",
        foods,
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
      const foods = result.map(food => ({
        ...food,
        food_image: food.food_image.trim(),
      }));

      res.status(200).json({
        status: "success",
        message: "Foods retrieved successfully",
        foods,
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

    console.log("Response from Flask API:", response.data);

    if (!response.data || !response.data.predicted_class_name) {
      return res.status(500).json({
        status: "error",
        message: "Invalid response from Flask API.",
        flaskResponse: response.data,
      });
    }

    const predictedFoodName = response.data.predicted_class_name;

    const sqlQuery = `
      SELECT food_id, food_name, place_of_origin, description 
      FROM foods 
      WHERE food_name LIKE ? 
    `;
    const queryResult = await query(sqlQuery, [`%${predictedFoodName}%`]);

    if (!queryResult || queryResult.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No matching food found in the database.",
      });
    }

    return res.status(200).json({
      status: "success",
      data: {
        predictedFoodName,
        queryResult,
      },
    });
  } catch (error) {
    console.error("Error during prediction:", error.message);
    return res.status(500).json({
      status: "error",
      message: "An error occurred during prediction.",
    });
  }
};



module.exports = { 
  getAllFoods,
  getFoodById,
  predictFood,
  searchFoodsByName,
  searchFoodsByOrigin
};