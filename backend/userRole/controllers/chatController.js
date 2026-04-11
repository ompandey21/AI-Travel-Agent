const { Op } = require('sequelize');
const { ChatMessage, TripMember, UserAuth } = require('../../config/db');

const verifyTripMember = async (tripId, userId) => {
  return TripMember.findOne({
    where: { tripId, userId, status: 'accepted' },
  });
};

exports.getChatHistory = async (req, res) => {
  try {
    const { tripId } = req.params;
    const recipientId = req.query.recipientId;
    const userId = req.user.id;

    if (!tripId) {
      return res.status(400).json({ message: 'Trip ID is required' });
    }

    const member = await verifyTripMember(tripId, userId);
    if (!member) {
      return res.status(403).json({ message: 'You are not a member of this trip' });
    }

    let where = { tripId };
    if (recipientId) {
      const otherMember = await verifyTripMember(tripId, recipientId);
      if (!otherMember) {
        return res.status(403).json({ message: 'Recipient is not a member of this trip' });
      }
      where = {
        tripId,
        type: 'private',
        [Op.or]: [
          { senderId: userId, recipientId },
          { senderId: recipientId, recipientId: userId },
        ],
      };
    } else {
      where.type = 'group';
    }

    const messages = await ChatMessage.findAll({
      where,
      order: [['createdAt', 'ASC']],
      include: [
        {
          model: UserAuth,
          as: 'sender',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: UserAuth,
          as: 'recipient',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    const payload = messages.map((message) => ({
      id: message.id,
      tripId: message.tripId,
      senderId: message.senderId,
      recipientId: message.recipientId,
      senderName: message.sender?.name || 'Unknown',
      recipientName: message.recipient?.name || null,
      message: message.message,
      type: message.type,
      createdAt: message.createdAt,
    }));

    return res.status(200).json(payload);
  } catch (e) {
    console.error('Chat history error', e);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
