
import { useEffect, useState } from 'react'
import './AdminDashboard.css'

const API_URL = import.meta.env.VITE_API_URL

function AdminDashboard({ onBack }) {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem('imoviesToken')

        const response = await fetch(`${API_URL}/api/admin/bookings`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Unable to load bookings')
        }

        setBookings(data.bookings || [])
      } catch (err) {
        setError(err.message || 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [])

  const totalRevenue = bookings.reduce(
    (total, booking) =>
      booking.status === 'confirmed'
        ? total + (Number(booking.totalAmount) || 0)
        : total,
    0
  )

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div>
          <p className="admin-eyebrow">IMOVIES MANAGEMENT</p>
          <h1>Admin Dashboard</h1>
          <p>Manage your cinema bookings in one place.</p>
        </div>

        <button className="admin-back-btn" onClick={onBack}>
          Back to Website
        </button>
      </header>

      {loading ? (
        <p className="admin-message">Loading bookings...</p>
      ) : error ? (
        <p className="admin-error">{error}</p>
      ) : (
        <>
          <section className="admin-stats">
            <article className="admin-stat-card">
              <span>Total Bookings</span>
              <strong>{bookings.length}</strong>
            </article>

            <article className="admin-stat-card">
              <span>Confirmed Bookings</span>
              <strong>
                {bookings.filter(b => b.status === 'confirmed').length}
              </strong>
            </article>

            <article className="admin-stat-card">
              <span>Total Booking Amount</span>
              <strong>₹{totalRevenue.toLocaleString('en-IN')}</strong>
            </article>
          </section>

          <section className="admin-bookings-section">
            <h2>All Bookings</h2>

            {bookings.length === 0 ? (
              <p>No bookings found.</p>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Movie</th>
                      <th>Showtime</th>
                      <th>Seats</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {bookings.map(booking => (
                      <tr key={booking._id}>
                        <td>
                          <strong>
                            {booking.user?.name || 'Unknown'}
                          </strong>
                          <small>
                            {booking.user?.email || 'No email'}
                          </small>
                        </td>
                        <td>{booking.movie}</td>
                        <td>{booking.showtime}</td>
                        <td>{booking.seats?.join(', ')}</td>
                        <td>
                          ₹{Number(booking.totalAmount || 0).toLocaleString('en-IN')}
                        </td>
                        <td>
                          <span className={`admin-status ${booking.status}`}>
                            {booking.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}

export default AdminDashboard
