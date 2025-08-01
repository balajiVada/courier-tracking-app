const bcrypt = require('bcrypt');
const { dbProm } = require('../config/dbConnect'); 
const {db} = require('../config/dbConnect');
require('dotenv').config();


function validateUser(data) {
  const requiredFields = ['first_name', 'last_name', 'email', 'password', 'address'];
  for (const field of requiredFields) {
    if (!data[field] || typeof data[field] !== 'string') {
      return `Invalid or missing field: ${field}`;
    }
  }
  return null;
}

async function handleUserSignUp(req, res) {
    const {
        first_name,
        last_name,
        email,
        phone,
        password,
        user_type = 'customer',
        address,
    } = req.body;

    const validationError = validateUser(req.body);
    if (validationError) {
        return res.status(400).json({ error: validationError });
    }

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        const full_name = `${first_name} ${last_name}`;

        const sql = `
      INSERT INTO users (first_name, last_name, full_name, email, phone, password, user_type, address)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

        db.query(sql, [first_name, last_name, full_name, email, phone, hashedPassword, user_type, address], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({ error: 'Email already exists' });
                }
                console.error(err);
                return res.status(500).json({ error: 'Database error' });
            }

            res.status(201).json({ message: 'User created successfully', user_id: result.insertId });
        });
    } catch (error) {
        console.error('Hashing error:', error);
        res.status(500).json({ error: 'Server error' });
    }
}


async function handleUserLogin(req, res) {
    const { email, password } = req.body;

    const sql = "SELECT * FROM users WHERE email = ?";
    db.query(sql, [email], async (err, results) => {
        if (err) return res.status(500).json({ message: "DB error" });
        if (results.length === 0) {
            return res.status(401).json({ message: "User not found" });
        }

        const user = results[0];

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // optional: send JWT token
        res.json({ message: "Login successful", user: { id: user.user_id, email: user.email } });
    });
}




async function getUserDetails(req, res) {
    const { userId } = req.params;
    try {
        const [rows] = await dbProm.query(
            "SELECT user_id, first_name, last_name, full_name, email, phone, address, user_type, created_at FROM users WHERE user_id = ?",
            [userId]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error("❌ Error fetching user details:", error);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
}



async function updateUserDetails(req, res) {
    const { userId } = req.params;
    const { first_name, last_name, email, phone, address } = req.body;

    if (!first_name || !last_name || !email) {
        return res.status(400).json({ message: "First name, last name, and email are required." });
    }

    const full_name = `${first_name} ${last_name}`;

    try {
        const [result] = await dbProm.query(
            "UPDATE users SET first_name = ?, last_name = ?, full_name = ?, email = ?, phone = ?, address = ? WHERE user_id = ?",
            [first_name, last_name, full_name, email, phone, address, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "User not found or no changes made." });
        }

        // Fetch the updated user data to send back
        const [updatedUserRows] = await dbProm.query(
            "SELECT user_id, first_name, last_name, full_name, email, phone, address, user_type, created_at FROM users WHERE user_id = ?",
            [userId]
        );

        res.status(200).json({ success: true, message: "User profile updated successfully.", updatedUser: updatedUserRows[0] });

    } catch (error) {
        console.error("❌ Error updating user details:", error);
        res.status(500).json({ success: false, message: "Server error. Please try again later." });
    }
}




module.exports = {
    handleUserSignUp,
    handleUserLogin,
    getUserDetails,
    updateUserDetails,
}