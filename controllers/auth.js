const { query } = require('../config/dataBase');
const jwt = require('jsonwebtoken');

const registerUser = async (req, res) => {
  const { name, email, pass } = req.body;

  try {
    if (!name || !email || !pass) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const result = await query('CALL RegisterUsers(?, ?, ?);', [name, email, pass]);

    const message = result[0]?.[0]?.message;

    if (message === 'Registration Successful') {
      res.status(200).json({
        message,
        user: { name, email },
      });
    } else {
      res.status(400).json({ error: message });
    }
  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({ error: 'Failed to register user' });
  }
};

const loginUser = async (req, res) => {
  const { email, pass } = req.body;

  try {
    if (!email || !pass) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await query('CALL LoginUsers(?, ?);', [email, pass]);

    const user = result[0]?.[0];
    const { user_id, user_name, user_email, message } = user;

    if (message === 'Login successfull') {
      const tokenPayload = { user_id, user_email: email };
      const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '1h' });

      res.status(200).json({
        message,
        token,
        user: { user_id, user_name, user_email },
      });
    } else {
      res.status(401).json({ error: message });
    }
  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { registerUser, loginUser };
