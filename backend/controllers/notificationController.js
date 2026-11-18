import Notification from '../models/Notification.js';
import { isDbConnected } from '../config/db.js';
import { fallbackStore } from '../config/fallbackStore.js';

// Helper to create a notification easily across controllers
export const sendNotification = async ({ recipient, title, message, type, link, relatedRental, relatedCar }) => {
  try {
    if (isDbConnected()) {
      try {
        return await Notification.create({
          recipient,
          title,
          message,
          type,
          link,
          relatedRental,
          relatedCar
        });
      } catch (err) {
        // Fallback
      }
    }
    return fallbackStore.createNotification({
      recipient,
      title,
      message,
      type,
      link,
      relatedRental,
      relatedCar
    });
  } catch (e) {
    console.error('Notification dispatch error:', e);
  }
};

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
export const getMyNotifications = async (req, res, next) => {
  try {
    const userId = (req.user.id || req.user._id).toString();

    if (isDbConnected()) {
      try {
        const notifications = await Notification.find({ recipient: userId })
          .sort({ createdAt: -1 })
          .limit(30);

        const unreadCount = await Notification.countDocuments({ recipient: userId, isRead: false });

        return res.status(200).json({
          success: true,
          unreadCount,
          data: notifications
        });
      } catch (err) {
        // Fallback
      }
    }

    const notifications = fallbackStore.getUserNotifications(userId);
    const unreadCount = notifications.filter((n) => !n.isRead).length;

    res.status(200).json({
      success: true,
      unreadCount,
      data: notifications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req, res, next) => {
  try {
    const userId = (req.user.id || req.user._id).toString();

    if (isDbConnected()) {
      try {
        if (req.params.id === 'all') {
          await Notification.updateMany({ recipient: userId, isRead: false }, { isRead: true });
          return res.status(200).json({ success: true, message: 'All notifications marked as read' });
        } else {
          const notif = await Notification.findOneAndUpdate(
            { _id: req.params.id, recipient: userId },
            { isRead: true },
            { new: true }
          );
          return res.status(200).json({ success: true, data: notif });
        }
      } catch (err) {
        // Fallback
      }
    }

    if (req.params.id === 'all') {
      fallbackStore.markAllNotificationsAsRead(userId);
      return res.status(200).json({ success: true, message: 'All notifications marked as read' });
    }

    const notif = fallbackStore.markNotificationAsRead(req.params.id, userId);
    res.status(200).json({ success: true, data: notif });
  } catch (error) {
    next(error);
  }
};
