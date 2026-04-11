const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { TripMember, ChatMessage, UserAuth } = require('./db');

const parseCookies = (cookieHeader = '') => {
  return cookieHeader.split(';').reduce((cookies, pair) => {
    const [name, ...rest] = pair.split('=');
    const value = rest.join('=');
    if (!name || !value) return cookies;
    cookies[name.trim()] = decodeURIComponent(value.trim());
    return cookies;
  }, {});
};

const initializeSocketServer = (server) => {
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: true,
    },
  });

  const userSockets = new Map();

  const verifySocketUser = async (socket, next) => {
    try {
      const token = parseCookies(socket.handshake.headers.cookie || '').token;
      if (!token) {
        return next(new Error('Unauthorized'));
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await UserAuth.findByPk(decoded.id);
      if (!user) {
        return next(new Error('Unauthorized'));
      }
      socket.user = user;
      next();
    } 
    catch (e){
      console.error('Socket auth failed', e);
      return next(new Error('Unauthorized'));
    }
  };

  io.use(verifySocketUser);

  io.on('connection', (socket) => {
    const userId = socket.user.id;
    userSockets.set(userId, userSockets.get(userId) ? [...userSockets.get(userId), socket] : [socket]);

    socket.on('joinTrip', async ({ tripId }) => {
      if (!tripId) return;
      const membership = await TripMember.findOne({ where: { tripId, userId, status: 'accepted' } });
      if (!membership) return;
      socket.join(`trip:${tripId}`);
    });

    socket.on('leaveTrip', ({ tripId }) => {
      if (!tripId) return;
      socket.leave(`trip:${tripId}`);
    });

    socket.on('groupMessage', async ({ tripId, message }) => {
      if (!tripId || !message || !message.trim()) return;
      const membership = await TripMember.findOne({ where: { tripId, userId, status: 'accepted' } });
      if (!membership) return;

      const chat = await ChatMessage.create({
        tripId,
        senderId: userId,
        message: message.trim(),
        type: 'group',
      });

      const payload = {
        id: chat.id,
        tripId,
        senderId: userId,
        senderName: socket.user.name,
        message: chat.message,
        type: 'group',
        createdAt: chat.createdAt,
      };

      io.to(`trip:${tripId}`).emit('groupMessage', payload);
    });

    socket.on('privateMessage', async ({ tripId, recipientId, message }) => {
      if (!tripId || !recipientId || !message || !message.trim()) return;
      const senderMember = await TripMember.findOne({ where: { tripId, userId, status: 'accepted' } });
      const recipientMember = await TripMember.findOne({ where: { tripId, userId: recipientId, status: 'accepted' } });
      if (!senderMember || !recipientMember) return;

      const chat = await ChatMessage.create({
        tripId,
        senderId: userId,
        recipientId,
        message: message.trim(),
        type: 'private',
      });

      const payload = {
        id: chat.id,
        tripId,
        senderId: userId,
        senderName: socket.user.name,
        recipientId,
        message: chat.message,
        type: 'private',
        createdAt: chat.createdAt,
      };

      const sockets = userSockets.get(recipientId) || [];
      sockets.forEach((recipientSocket) => recipientSocket.emit('privateMessage', payload));
      socket.emit('privateMessage', payload);
    });

    socket.on('disconnect', () => {
      const sockets = userSockets.get(userId) || [];
      userSockets.set(userId, sockets.filter((s) => s.id !== socket.id));
    });
  });
};

module.exports = initializeSocketServer;
