const express = require('express');
const { handleOrderPlace, handleOrderDetails, getOrderStatusTimestamps, updateOrderStatus, getOrderStatus, getUserOrders, getAllOrders } = require('../controllers/orderController');
const router = express.Router();

router.post('/place', handleOrderPlace);
router.get('/all', getAllOrders); 
router.get('/:trackingId', handleOrderDetails);
router.get("/:trackingId/status-history", getOrderStatusTimestamps);
router.post('/update-status', updateOrderStatus);
router.get('/status/:tracking_id', getOrderStatus);
router.get('/user/:userId', getUserOrders);

module.exports = router;
