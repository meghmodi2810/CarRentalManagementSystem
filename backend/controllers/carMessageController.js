import CarMessage from '../models/CarMessage.js';
import Car from '../models/Car.js';
import { isDbConnected } from '../config/db.js';
import { fallbackStore } from '../config/fallbackStore.js';
import { sendNotification } from './notificationController.js';

// @desc    Get all messages / inquiries for a car
// @route   GET /api/cars/:id/messages
// @access  Public / Protected
export const getCarMessages = async (req, res, next) => {
  try {
    const carId = req.params.id;

    if (isDbConnected()) {
      try {
        const messages = await CarMessage.find({ car: carId })
          .populate('sender', 'name role')
          .populate('replies.sender', 'name role')
          .sort({ createdAt: -1 });

        return res.status(200).json({
          success: true,
          count: messages.length,
          data: messages
        });
      } catch (err) {
        // Fallback
      }
    }

    const messages = fallbackStore.getCarMessages(carId);
    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Post a message / inquiry to the car owner
// @route   POST /api/cars/:id/messages
// @access  Private (Authenticated users)
export const postCarMessage = async (req, res, next) => {
  try {
    const carId = req.params.id;
    const { content, subject } = req.body;
    const user = req.user;
    const userId = (user.id || user._id).toString();

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }

    let car = null;
    if (isDbConnected()) {
      try {
        car = await Car.findById(carId);
      } catch (e) {}
    }
    if (!car) {
      car = fallbackStore.getCarById(carId);
    }

    if (!car) {
      return res.status(404).json({ success: false, message: 'Car not found' });
    }

    const recipientId = (car.owner?._id || car.owner)?.toString();

    const messageData = {
      car: carId,
      sender: userId,
      senderName: user.name || 'Verified User',
      senderRole: user.role || 'customer',
      recipient: recipientId || null,
      subject: subject || `Inquiry about ${car.make} ${car.model}`,
      content: content.trim()
    };

    let savedMessage = null;

    if (isDbConnected()) {
      try {
        savedMessage = await CarMessage.create(messageData);
      } catch (err) {
        // Fallback
      }
    }

    if (!savedMessage) {
      savedMessage = fallbackStore.createCarMessage(messageData);
    }

    // Send notification to vehicle host
    if (recipientId && recipientId !== userId) {
      await sendNotification({
        recipient: recipientId,
        title: `New Inquiry on ${car.make} ${car.model}`,
        message: `${user.name} asked: "${content.slice(0, 80)}${content.length > 80 ? '...' : ''}"`,
        type: 'new_message',
        link: `/cars/${carId}`,
        relatedCar: carId
      });
    }

    res.status(201).json({
      success: true,
      message: 'Message sent to vehicle host successfully',
      data: savedMessage
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reply to an existing inquiry
// @route   POST /api/cars/:id/messages/:messageId/reply
// @access  Private
export const replyCarMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    const user = req.user;
    const userId = (user.id || user._id).toString();

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Reply content cannot be empty' });
    }

    const replyData = {
      sender: userId,
      senderName: user.name,
      senderRole: user.role || 'customer',
      content: content.trim()
    };

    let updatedMessage = null;

    if (isDbConnected()) {
      try {
        updatedMessage = await CarMessage.findByIdAndUpdate(
          messageId,
          { $push: { replies: replyData } },
          { new: true }
        );
      } catch (e) {}
    }

    if (!updatedMessage) {
      updatedMessage = fallbackStore.replyCarMessage(messageId, replyData);
    }

    if (!updatedMessage) {
      return res.status(404).json({ success: false, message: 'Message thread not found' });
    }

    // Notify the original sender if the replier is not the sender
    const origSenderId = (updatedMessage.sender?._id || updatedMessage.sender)?.toString();
    if (origSenderId && origSenderId !== userId) {
      await sendNotification({
        recipient: origSenderId,
        title: `New Reply from ${user.name}`,
        message: `"${content.slice(0, 80)}${content.length > 80 ? '...' : ''}"`,
        type: 'message_reply',
        link: `/cars/${req.params.id}`,
        relatedCar: req.params.id
      });
    }

    res.status(200).json({
      success: true,
      message: 'Reply posted successfully',
      data: updatedMessage
    });
  } catch (error) {
    next(error);
  }
};

