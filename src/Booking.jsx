
import './Booking.css'
import { useState } from 'react'
const API_URL = import.meta.env.VITE_API_URL
function Booking({ movie, onBack }) {
  const [selectedTime, setSelectedTime] = useState('')
  const [showSeats, setShowSeats] = useState(false)
  const [selectedSeats, setSelectedSeats] = useState([])
  const [bookingConfirmed, setBookingConfirmed] = useState(false)
  const [savingBooking, setSavingBooking] = useState(false)
  const [bookingError, setBookingError] = useState('')
  const [bookingId, setBookingId] = useState('')

  const totalAmount = selectedSeats.length * 200

  const handleConfirmBooking = async () => {
    setBookingError('')

    const token = localStorage.getItem('imoviesToken')

    if (!token) {
      setBookingError('Please sign in before booking your tickets.')
      return
    }

    if (!selectedTime || selectedSeats.length === 0) {
      setBookingError('Please select a showtime and at least one seat.')
      return
    }

    setSavingBooking(true)

    try {
      const response = await fetch(
        `${API_URL}/api/bookings`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            movie,
            showtime: selectedTime,
            seats: selectedSeats,
            totalAmount
          })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Booking failed.')
      }

      setBookingId(data.booking?._id || '')
      setBookingConfirmed(true)
    } catch (error) {
      setBookingError(
        error.message === 'Failed to fetch'
          ? 'Cannot connect to the server. Please check your backend.'
          : error.message
      )
    } finally {
      setSavingBooking(false)
    }
  }

  if (bookingConfirmed) {
    return (
      <div className="booking-page confirmation-page">
        <div className="confirmation-card">
          <div className="success-icon">✓</div>

          <p className="booking-tag">IMOVIES PRESENTS</p>

          <h1>Booking Confirmed!</h1>

          <p className="booking-description">
            Your movie night is all set!
          </p>

          <div className="confirmation-details">
            <p>
              <strong>Movie:</strong> {movie}
            </p>

            <p>
              <strong>Showtime:</strong> {selectedTime}
            </p>

            <p>
              <strong>Selected Seats:</strong>{' '}
              {selectedSeats.join(', ')}
            </p>

            <p>
              <strong>Total Amount:</strong> ₹{totalAmount}
            </p>

            {bookingId && (
              <p>
                <strong>Booking ID:</strong> {bookingId}
              </p>
            )}
          </div>

          <button
            className="continue-btn"
            onClick={onBack}
          >
            Back to Movies →
          </button>
        </div>
      </div>
    )
  }

  if (showSeats) {
    return (
      <div className="booking-page">
        <button
          className="back-btn"
          onClick={() => {
            setShowSeats(false)
            setBookingError('')
          }}
        >
          ← Back to Showtime
        </button>

        <p className="booking-tag">YOUR CINEMA EXPERIENCE</p>

        <h1>Select Your Seats</h1>

        <p className="booking-description">
          {movie} · {selectedTime}
        </p>

        <p className="booking-description">
          Selected seats: {selectedSeats.length}
        </p>

        <p className="booking-description">
          Total price: ₹{totalAmount}
        </p>

        <div className="screen">SCREEN</div>

        <p className="booking-note">
          Choose your seats below
        </p>

        <div className="seat-grid">
          {Array.from({ length: 24 }, (_, index) => {
            const seat =
              `${String.fromCharCode(65 + Math.floor(index / 8))}${(index % 8) + 1}`

            const isSelected = selectedSeats.includes(seat)

            return (
              <button
                key={seat}
                className={`seat ${isSelected ? 'selected-seat' : ''}`}
                onClick={() => {
                  setBookingError('')

                  setSelectedSeats((previousSeats) =>
                    previousSeats.includes(seat)
                      ? previousSeats.filter((item) => item !== seat)
                      : [...previousSeats, seat]
                  )
                }}
              >
                {seat}
              </button>
            )
          })}
        </div>

        {selectedSeats.length > 0 && (
          <div className="continue-section">
            <button
              className="continue-btn"
              onClick={handleConfirmBooking}
              disabled={savingBooking}
            >
              {savingBooking
                ? 'Saving Booking...'
                : 'Confirm Booking →'}
            </button>
          </div>
        )}

        {bookingError && (
          <p className="booking-description" role="alert">
            {bookingError}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="booking-page">
      <button className="back-btn" onClick={onBack}>
        ← Back to Movies
      </button>

      <p className="booking-tag">YOUR CINEMA EXPERIENCE</p>

      <h1>Book Your Tickets</h1>

      <p className="booking-description">
        You selected:
      </p>

      <div className="selected-movie">
        <h2>{movie}</h2>
        <p>Choose your showtime and get ready for the movie!</p>
      </div>

      <h3>Select a Showtime</h3>

      <div className="showtimes">
        {['10:00 AM', '1:30 PM', '5:00 PM', '8:30 PM'].map(
          (time) => (
            <button
              key={time}
              className={selectedTime === time ? 'active-time' : ''}
              onClick={() => setSelectedTime(time)}
            >
              {time}
            </button>
          )
        )}
      </div>

      {selectedTime && (
        <div className="continue-section">
          <p>
            Selected showtime: <strong>{selectedTime}</strong>
          </p>

          <button
            className="continue-btn"
            onClick={() => setShowSeats(true)}
          >
            Continue to Seats →
          </button>
        </div>
      )}

      <p className="booking-note">
        Select a showtime to continue with your booking.
      </p>
    </div>
  )
}

export default Booking
