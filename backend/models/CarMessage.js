import mongoose from 'mongoose';

const replySchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    senderName: {
      type: String,
      required: true
    },
    senderRole: {
      type: String,
      default: 'customer'
    },
    content: {
      type: String,
      required: [true, 'Reply content cannot be empty'],
      trim: true
    }
  },
  {
    timestamps: true
  }
);

const carMessageSchema = new mongoose.Schema(
  {
    car: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Car',
      required: [true, 'Message must be linked to a vehicle listing'],
      index: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    senderName: {
      type: String,
      required: true
    },
    senderRole: {
      type: String,
      default: 'customer'
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    subject: {
      type: String,
      default: 'Inquiry about vehicle availability'
    },
    content: {
      type: String,
      required: [true, 'Message content cannot be empty'],
      trim: true
    },
    replies: [replySchema]
  },
  {
    timestamps: true
  }
);

carMessageSchema.index({ car: 1, createdAt: -1 });

const CarMessage = mongoose.model('CarMessage', carMessageSchema);
export default CarMessage;
