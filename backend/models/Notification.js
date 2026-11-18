import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['request_approved', 'request_declined', 'payment_success', 'new_request', 'new_message', 'message_reply'],
      default: 'new_request'
    },
    link: {
      type: String,
      default: '/my-rentals'
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    },
    relatedRental: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rental'
    },
    relatedCar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Car'
    }
  },
  {
    timestamps: true
  }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
