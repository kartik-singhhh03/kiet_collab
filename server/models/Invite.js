const mongoose = require('mongoose');

const InviteSchema = new mongoose.Schema(
  {
    fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    toUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', default: null, index: true },
    message: { type: String, default: '', maxlength: 1000 },
    status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending', index: true }
  },
  { timestamps: true }
);

InviteSchema.index({ toUserId: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('Invite', InviteSchema);
