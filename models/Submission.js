const mongoose = require('mongoose');
const { Schema, Types } = mongoose;

const submissionSchema = new Schema(
  {
    status: {
      type: String,
      enum: ['pending', 'published', 'rejected'],
      default: 'published', 
      index: true,
    },

    submittedBy: { type: Types.ObjectId, ref: 'User', index: true },

    contentId: { type: Types.ObjectId, ref: 'Content', index: true },

    payload: {
      type: Object,
      required: true,
    },

    client: {
      ip: String,
      ua: String,
    },
  },
  { timestamps: true }
);

submissionSchema.set('toJSON', {
  transform(_doc, ret) {
    return ret;
  },
});

module.exports = mongoose.model('Submission', submissionSchema, 'content_submissions');
