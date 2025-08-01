const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const dbProm = db.promise();

db.connect(async (err) => {
  if (err) {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  } else {
    console.log('✅ Connected to MySQL');
    try {
      await createTables(); 
    } catch (e) {
      console.error(' Error creating tables:', e.message);
    }
  }
});

// Create tables if they don't exist
async function createTables() {
  await dbProm.query(`
    CREATE TABLE IF NOT EXISTS users (
      user_id INT AUTO_INCREMENT PRIMARY KEY,
      first_name VARCHAR(50) NOT NULL,
      last_name VARCHAR(50) NOT NULL,
      full_name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      phone VARCHAR(15),
      password VARCHAR(255) NOT NULL,
      user_type ENUM('customer', 'admin') DEFAULT 'customer',
      address TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await dbProm.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      tracking_id VARCHAR(50) UNIQUE NOT NULL,
      sender_full_name VARCHAR(100),
      sender_email VARCHAR(100),
      sender_phone VARCHAR(20),
      sender_address TEXT,
      receiver_full_name VARCHAR(100),
      receiver_email VARCHAR(100),
      receiver_phone VARCHAR(20),
      receiver_address TEXT,
      package_description VARCHAR(255),
      package_weight DECIMAL(6,2),
      package_length DECIMAL(6,2),
      package_width DECIMAL(6,2),
      package_height DECIMAL(6,2),
      special_instructions TEXT,
      preferred_date DATE,
      time_slot VARCHAR(50),
      delivery_type VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      current_latitude DECIMAL(10,8),
      current_longitude DECIMAL(11,8),
      CONSTRAINT fk_user_order FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    );
  `);

  await dbProm.query(`
    CREATE TABLE IF NOT EXISTS order_status_updates (
      id INT AUTO_INCREMENT PRIMARY KEY,
      tracking_id VARCHAR(50) NOT NULL,
      status ENUM(
        'Order Placed',
        'Package Collected',
        'In Transit',
        'Arrived at Destination Hub',
        'Out for Delivery',
        'Delivered',
        'Delivery Failed',
        'Returned to Sender'
      ) NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_tracking_status FOREIGN KEY (tracking_id) REFERENCES orders(tracking_id) ON DELETE CASCADE
    );
  `);

  console.log('✅ All tables checked/created successfully');
}

module.exports = {
  db,
  dbProm
};
