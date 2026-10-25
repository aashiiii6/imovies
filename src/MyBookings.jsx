
import { useEffect, useState } from 'react'
import './MyBookings.css'
const API_URL = import.meta.env.VITE_API_URL
function MyBookings({ onBack }) {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchBookings = async () => {
      const token = localStorage.getItem('imoviesToken')

      if (!token) {
        setError('Please sign in to view your bookings.')
        setLoading(false)
        return
      }

      try {
        const response = await fetch(
          `${API_URL}/api/bookings/my-bookings`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Could not load bookings.')
        }

        setBookings(data.bookings || [])
      } catch (err) {
        setError(err.message || 'Cannot connect to server.')
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [])

  return (
    <div className="my-bookings-page">
      <button className="bookings-back-btn" onClick={onBack}>
        ← Back to Movies
      </button>

      <h1>My Bookings</h1>
      <p className="bookings-subtitle">
        Your movie tickets, all in one place.
      </p>

      {loading && <p className="bookings-message">Loading bookings...</p>}

      {!loading && error && (
        <p className="bookings-message">{error}</p>
      )}

      {!loading && !error && bookings.length === 0 && (
        <div className="empty-bookings">
          <h2>No bookings yet!</h2>
          <p>Your booked movie tickets will appear here.</p>
        </div>
      )}

      {!loading && !error && bookings.length > 0 && (
        <div className="bookings-list">
          {bookings.map((booking) => (
            <div className="booking-history-card" key={booking._id}>
              <div className="booking-history-header">
                <h2>{booking.movie}</h2>
                <span className={`booking-status ${booking.status}`}>
                  {booking.status}
                </span>
              </div>

              <p>
                <strong>Showtime:</strong> {booking.showtime}
              </p>

              <p>
                <strong>Seats:</strong> {booking.seats.join(', ')}
              </p>

              <p>
                <strong>Total Amount:</strong> ₹{booking.totalAmount}
              </p>

              <p className="booking-reference">
                <strong>Booking ID:</strong> {booking._id}
              </p>

              <p className="booking-date">
                Booked on:{' '}
                {new Date(booking.createdAt).toLocaleString('en-IN')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyBookings
