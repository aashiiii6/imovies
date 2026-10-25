
const mongoose = require('mongoose')

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    movie: {
      type: String,
      required: true,
      trim: true
    },

    showtime: {
      type: String,
      required: true
    },

    seats: {
      type: [String],
      required: true,
      validate: {
        validator: function (seats) {
          return seats.length > 0 &&
            new Set(seats).size === seats.length
        },
        message: 'Seats must not be empty or duplicated.'
      }
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },

    status: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed'
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Booking', bookingSchema)
