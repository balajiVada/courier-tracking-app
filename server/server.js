const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require("socket.io");
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const { updateOrderCurrentLocationInDB } = require('./controllers/orderController');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('join_room', (trackingId) => {
        if (trackingId) {
            socket.join(trackingId);
            console.log(`User ${socket.id} joined room: ${trackingId}`);
        }
    });

    socket.on('admin_location_update', async ({ trackingId, latitude, longitude }) => {
        if (trackingId && latitude !== null && longitude !== null) {
            console.log(`Admin for ${trackingId} updated location to: ${latitude}, ${longitude}`);
            io.to(trackingId).emit('courier_location_update', { latitude, longitude });

            try {
                await updateOrderCurrentLocationInDB(trackingId, latitude, longitude);
                console.log(`Location for ${trackingId} saved to DB.`);
            } catch (error) {
                console.error(`Failed to save location for ${trackingId} to DB:`, error);
            }
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
