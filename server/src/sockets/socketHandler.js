const { getMockDB, saveMockDB } = require('../config/db');
const { Order, Courier } = require('../models/Schemas');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join room event (for orders, stores, admins)
    socket.on('join', (roomName) => {
      socket.join(roomName);
      console.log(`Socket ${socket.id} joined room: ${roomName}`);
    });

    // Courier live location updates broadcasted to order channel
    socket.on('courier:update_location', async (data) => {
      const { courierId, orderId, lat, lng } = data;
      console.log(`Courier ${courierId} location update: [${lat}, ${lng}] for Order ${orderId}`);

      // Broadcast coordinate update to the order tracking room (Customer receives it)
      io.to(`order_${orderId}`).emit('courier:location_changed', { lat, lng });

      // Persist the location update in DB
      try {
        const isMock = process.env.USE_MOCK_DB === 'true';
        if (isMock) {
          const db = getMockDB();
          const order = db.orders.find(o => o.orderId === orderId);
          if (order && order.courier) {
            order.courier.lat = lat;
            order.courier.lng = lng;
          }
          const courier = db.couriers.find(c => c.user === courierId);
          if (courier) {
            courier.currentCoordinates = { lat, lng };
          }
          saveMockDB();
        } else {
          await Order.findOneAndUpdate({ orderId }, {
            $set: { 'courier.lat': lat, 'courier.lng': lng }
          });
          await Courier.findOneAndUpdate({ user: courierId }, {
            $set: { currentCoordinates: { lat, lng } }
          });
        }
      } catch (err) {
        console.error('Socket location save error:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};
