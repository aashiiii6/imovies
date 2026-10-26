const authMiddleware = require('./authMiddleware')
const express = require('express')
const adminMiddleware = require('./adminMiddleware')
const cors = require('cors')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const User = require('./models/User')
const Booking = require('./models/Booking')
const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to IMovies Backend!',
    status: 'Server is running'
  })
})

// Signup API
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Please fill all fields'
      })
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters'
      })
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase().trim()
    })

    if (existingUser) {
      return res.status(409).json({
        message: 'Email is already registered'
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password: hashedPassword
    })

    res.status(201).json({
      message: 'Account created successfully!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    })
  } catch (error) {
    console.error('Signup error:', error.message)
    res.status(500).json({
      message: 'Signup failed. Please try again.'
    })
  }
})

 // Login API
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        message: 'Please enter email and password'
      })
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim()
    })

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password'
      })
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    )

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: 'Invalid email or password'
      })
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    })
  } catch (error) {
    console.error('Login error:', error.message)

    res.status(500).json({
      message: 'Login failed. Please try again.'
    })
  }
})

 // Create Booking API


app.post('/api/bookings', authMiddleware, async (req, res) => {
  try {
    const { movie, showtime, seats, totalAmount } = req.body

    // Validate booking details
    if (
      !movie ||
      !showtime ||
      !Array.isArray(seats) ||
      seats.length === 0 ||
      seats.some(
        seat => typeof seat !== 'string' || !seat.trim()
      ) ||
      new Set(seats).size !== seats.length ||
      !Number.isFinite(totalAmount) ||
      totalAmount < 0
    ) {
      return res.status(400).json({
        message: 'Please provide valid booking details.'
      })
    }

    // Check whether any selected seat is already booked
    const existingBookings = await Booking.find({
      movie: movie.trim(),
      showtime,
      status: 'confirmed',
      seats: { $in: seats }
    }).select('seats')

    const bookedSeats = [
      ...new Set(
        existingBookings.flatMap(booking => booking.seats)
          .filter(seat => seats.includes(seat))
      )
    ]

    if (bookedSeats.length > 0) {
      return res.status(409).json({
        message: `These seats are already booked: ${bookedSeats.join(', ')}. Please select different seats.`,
        bookedSeats
      })
    }

    // Save booking if all selected seats are available
    const booking = await Booking.create({
      user: req.userId,
      movie: movie.trim(),
      showtime,
      seats,
      totalAmount,
      status: 'confirmed'
    })

    return res.status(201).json({
      message: 'Booking saved successfully!',
      booking
    })
  } catch (error) {
    console.error('Booking error:', error.message)

    return res.status(500).json({
      message: 'Could not complete booking. Please try again.'
    })
  }
})


app.get('/api/bookings/my-bookings', authMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find({
      user: req.userId
    }).sort({ createdAt: -1 })

    res.json({
      message: 'Booking history fetched successfully!',
      bookings
    })
  } catch (error) {
    console.error('Booking history error:', error.message)

    res.status(500).json({
      message: 'Unable to fetch booking history'
    })
  }
})

 // Admin: Get all bookings
app.get('/api/admin/bookings', adminMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })

    res.json({
      message: 'All bookings fetched successfully!',
      totalBookings: bookings.length,
      bookings
    })
  } catch (error) {
    console.error('Admin bookings error:', error.message)

    res.status(500).json({
      message: 'Unable to fetch all bookings.'
    })
  }
})

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully!')

    const PORT = process.env.PORT || 5000

    app.listen(PORT, () => {
      console.log(`IMovies backend running on port ${PORT}`)
    })
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message)
  })
