const {db, dbProm} = require('../config/dbConnect');
require('dotenv').config();
const crypto = require('crypto');

const shipmentStatusSubtext = {
  "Order Placed": "The shipment has been scheduled and is waiting for pickup.",
  "Package Collected": "The courier has picked up the package from the sender.",
  "In Transit": "The package is being transported toward the destination.",
  "Arrived at Destination Hub": "The package has reached the hub closest to the delivery address.",
  "Out for Delivery": "The package is with the delivery agent and en route to the receiver.",
  "Delivered": "The package was successfully delivered to the recipient.",
  "Delivery Failed": "Delivery couldn’t be completed.",
  "Returned to Sender": "The package is being returned to the sender."
};
async function handleOrderPlace(req, res) {
    const {
        user_id,
        sFullName, sEmail, sPhoneNumber, sAddress,
        rFullName, rEmail, rPhoneNumber, rAddress,
        pDescription, pWeight, pLength, pWidth, pHeight,
        pInstructions, prefDate, timeSlot, deliveryType
    } = req.body;

    if (!user_id || !sFullName || !rFullName || !pDescription || !prefDate || !deliveryType) {
        return res.status(400).json({ message: "Missing required fields." });
    }

    const randomSuffix = crypto.randomBytes(3).toString("hex").toUpperCase();
    const trackingId = `TRK-${Date.now()}-${randomSuffix}`;

    try {
        // Start a transaction directly using the promise API
        await dbProm.beginTransaction();

        // Insert order
        const insertOrderQuery = `
            INSERT INTO orders (
                user_id, tracking_id,
                sender_full_name, sender_email, sender_phone, sender_address,
                receiver_full_name, receiver_email, receiver_phone, receiver_address,
                package_description, package_weight, package_length, package_width, package_height,
                special_instructions, preferred_date, time_slot, delivery_type
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            user_id, trackingId,
            sFullName, sEmail, sPhoneNumber, sAddress,
            rFullName, rEmail, rPhoneNumber, rAddress,
            pDescription, pWeight, pLength, pWidth, pHeight,
            pInstructions, prefDate, timeSlot, deliveryType
        ];

        await dbProm.query(insertOrderQuery, values);

        // Insert initial order status
        const insertStatusQuery = `
            INSERT INTO order_status_updates (tracking_id, status)
            VALUES (?, ?)
        `;
        await dbProm.query(insertStatusQuery, [trackingId, 'Order Placed']);

        // Commit the transaction
        await dbProm.commit();
        res.status(201).json({ message: "✅ Order placed successfully", tracking_id: trackingId });

    } catch (error) {
        // Rollback transaction on error
        await dbProm.rollback();
        console.error("❌ Error placing order:", error);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
}



async function handleOrderDetails(req, res) {
    const { trackingId } = req.params;

    try {
        // Modified to select current_latitude and current_longitude
        const [rows] = await db.promise().query(
            "SELECT *, current_latitude, current_longitude FROM orders WHERE tracking_id = ?",
            [trackingId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error("Error fetching order:", error);
        res.status(500).json({ message: "Server error" });
    }
}


async function getOrderStatusTimestamps(req, res) {
    const { trackingId } = req.params;

    const pivotQuery = `
        SELECT
            tracking_id,
            MAX(CASE WHEN status = 'Order Placed' THEN updated_at END) AS order_placed_time,
            MAX(CASE WHEN status = 'Package Collected' THEN updated_at END) AS collected_time,
            MAX(CASE WHEN status = 'In Transit' THEN updated_at END) AS in_transit_time,
            MAX(CASE WHEN status = 'Arrived at Destination Hub' THEN updated_at END) AS arrived_at_hub_time,
            MAX(CASE WHEN status = 'Out for Delivery' THEN updated_at END) AS out_for_delivery_time,
            MAX(CASE WHEN status = 'Delivered' THEN updated_at END) AS delivered_time,
            MAX(CASE WHEN status = 'Delivery Failed' THEN updated_at END) AS delivery_failed_time,
            MAX(CASE WHEN status = 'Returned to Sender' THEN updated_at END) AS returned_time
        FROM order_status_updates
        WHERE tracking_id = ?
        GROUP BY tracking_id
    `;

    try {
        const [rows] = await db.promise().query(pivotQuery, [trackingId]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "No status history found for this tracking ID." });
        }

        res.status(200).json(rows[0]);
    } catch (err) {
        console.error("❌ Error fetching status history:", err);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
}


// Update order status by tracking ID
const updateOrderStatus = async (req, res) => {
  const { tracking_id, new_status } = req.body;

  if (!tracking_id || !new_status) {
    return res.status(400).json({ message: 'Tracking ID and new status are required' });
  }

  try {
    const [result] = await dbProm.query(
      "UPDATE order_status_updates SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE tracking_id = ?",
      [new_status, tracking_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'No order found with this tracking ID' });
    }

    return res.status(200).json({ message: 'Order status updated successfully' });
  } catch (err) {
    console.error('Error updating order:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// In orderController.js
const getOrderStatus = async (req, res) => {
  const { tracking_id } = req.params;

  try {
    const [rows] = await dbProm.query(
      'SELECT status FROM order_status_updates WHERE tracking_id = ?',
      [tracking_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Tracking ID not found' });
    }

    res.json({ status: rows[0].status });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// New function to update current location in DB
async function updateOrderCurrentLocationInDB(trackingId, latitude, longitude) {
    try {
        const [result] = await dbProm.query(
            "UPDATE orders SET current_latitude = ?, current_longitude = ? WHERE tracking_id = ?",
            [latitude, longitude, trackingId]
        );
        return result.affectedRows > 0;
    } catch (error) {
        console.error("Error updating current location in DB:", error);
        throw error; // Re-throw to be caught by the Socket.IO handler
    }
}

async function getUserOrders(req, res) {
    const { userId } = req.params;
    try {
        // Fetch orders for a specific user
        const [orders] = await dbProm.query(
            `SELECT
                o.id,
                o.tracking_id,
                o.receiver_full_name,
                o.package_description,
                osu.status AS current_status, -- Get the latest status
                o.created_at
            FROM orders o
            JOIN (
                SELECT tracking_id, status, updated_at
                FROM order_status_updates
                WHERE (tracking_id, updated_at) IN (
                    SELECT tracking_id, MAX(updated_at)
                    FROM order_status_updates
                    GROUP BY tracking_id
                )
            ) osu ON o.tracking_id = osu.tracking_id
            WHERE o.user_id = ?
            ORDER BY o.created_at DESC`,
            [userId]
        );
        res.json(orders);
    } catch (error) {
        console.error("❌ Error fetching user orders:", error);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
}

// THIS IS THE FUNCTION THAT NEEDS TO BE CORRECTLY EXPORTED AND USED
async function getAllOrders(req, res) {
    try {
        // This query joins orders with their latest status update
        const [allOrders] = await dbProm.query(
            `SELECT
                o.id,
                o.user_id,
                o.tracking_id,
                o.sender_full_name,
                o.sender_email,
                o.sender_phone,
                o.sender_address,
                o.receiver_full_name,
                o.receiver_email,
                o.receiver_phone,
                o.receiver_address,
                o.package_description,
                o.package_weight,
                o.package_length,
                o.package_width,
                o.package_height,
                o.special_instructions,
                o.preferred_date,
                o.time_slot,
                o.delivery_type,
                o.created_at,
                osu.status AS current_status -- Get the latest status
            FROM orders o
            JOIN (
                SELECT tracking_id, status, updated_at
                FROM order_status_updates
                WHERE (tracking_id, updated_at) IN (
                    SELECT tracking_id, MAX(updated_at)
                    FROM order_status_updates
                    GROUP BY tracking_id
                )
            ) osu ON o.tracking_id = osu.tracking_id
            ORDER BY o.created_at DESC`
        );
        res.json(allOrders);
    } catch (error) {
        console.error("❌ Error fetching all orders:", error);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
}


module.exports = {
    handleOrderPlace,
    handleOrderDetails,
    getOrderStatusTimestamps,
    updateOrderStatus,
    getOrderStatus,
    updateOrderCurrentLocationInDB,
    getUserOrders,
    getAllOrders, 
};
