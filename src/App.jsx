
import React from 'react'
import './App.css'
import './Auth.css'
import Booking from './Booking'
import Auth from './Auth'
import MyBookings from './MyBookings'
import AdminDashboard from './AdminDashboard'

function App() {
  const [selectedMovie, setSelectedMovie] = React.useState(null)
  const [authMode, setAuthMode] = React.useState(null)
  const [showMyBookings, setShowMyBookings] = React.useState(false)
  const [showAdminDashboard, setShowAdminDashboard] = React.useState(false)
  const [isAdmin, setIsAdmin] = React.useState(false)

  const [loggedInUser, setLoggedInUser] = React.useState(() => {
    try {
      return JSON.parse(localStorage.getItem('imoviesUser'))
    } catch {
      return null
    }
  })

  // Verify the logged-in user's role through the backend
  React.useEffect(() => {
    let cancelled = false

    const verifyUser = async () => {
      const token = localStorage.getItem('imoviesToken')

      if (!token) {
        setIsAdmin(false)
        setLoggedInUser(null)
        return
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

        if (!response.ok) {
          throw new Error('Unable to verify user')
        }

        const data = await response.json()

        if (cancelled) return

        setLoggedInUser(data.user || null)
        setIsAdmin(data.user?.role === 'admin')

        localStorage.setItem(
          'imoviesUser',
          JSON.stringify(data.user)
        )
      } catch (error) {
        if (cancelled) return

        setIsAdmin(false)
        localStorage.removeItem('imoviesUser')
        setLoggedInUser(null)
      }
    }

    verifyUser()

    return () => {
      cancelled = true
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('imoviesToken')
    localStorage.removeItem('imoviesUser')

    setLoggedInUser(null)
    setIsAdmin(false)
    setShowAdminDashboard(false)
    setShowMyBookings(false)
  }

  if (showAdminDashboard) {
    return (
      <AdminDashboard
        onBack={() => setShowAdminDashboard(false)}
      />
    )
  }

  if (showMyBookings) {
    return (
      <MyBookings
        onBack={() => setShowMyBookings(false)}
      />
    )
  }

  if (selectedMovie) {
    return (
      <Booking
        movie={selectedMovie}
        onBack={() => setSelectedMovie(null)}
      />
    )
  }

  if (authMode) {
    return (
      <Auth
        mode={authMode}
        onBack={() => setAuthMode(null)}
        onSwitchMode={(mode) => setAuthMode(mode)}
      />
    )
  }

  return (
    <div className="app">
      <nav className="navbar">
        <h2 className="logo">
          i<span>Movies</span>
        </h2>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#movies">Movies</a>
          <a href="#about">About</a>
        </div>

        <div className="auth-buttons">
          {loggedInUser ? (
            <>
              <span className="welcome-user">
                Hi, {loggedInUser.name}
              </span>

              <button
                className="login-btn"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                className="login-btn"
                onClick={() => setAuthMode('login')}
              >
                Sign In
              </button>

              <button
                className="signup-btn"
                onClick={() => setAuthMode('signup')}
              >
                Sign Up
              </button>
            </>
          )}

          <button
            className="login-btn"
            onClick={() => setShowMyBookings(true)}
          >
            My Bookings
          </button>

          {isAdmin && (
            <button
              className="login-btn"
              onClick={() => setShowAdminDashboard(true)}
            >
              Admin Dashboard
            </button>
          )}
        </div>
      </nav>

      <section className="hero-section" id="home">
        <div className="hero-content">
          <p className="tagline">YOUR CINEMA, YOUR EXPERIENCE</p>

          <h1>
            Every Movie.
            <br />
            Every Emotion.
            <br />
            <span>One Place.</span>
          </h1>

          <p className="description">
            Discover the latest movies, find your perfect showtime,
            and book your favourite seats with iMovies.
          </p>

          <a href="#movies" className="explore-btn">
            Explore Movies →
          </a>
        </div>

        <div className="hero-art">
          <div className="film-icon">▶</div>
          <p>YOUR NEXT MOVIE NIGHT STARTS HERE</p>
          <div className="film-strip">
            IMAX · CINEMA · EXPERIENCE
          </div>
        </div>
      </section>

      <section className="movies-section" id="movies">
        <div className="section-heading">
          <div>
            <p className="tagline">HANDPICKED FOR YOU</p>
            <h2>Now Showing</h2>
          </div>

          <span className="movie-count">EXPLORE CINEMA</span>
        </div>

        <div className="movie-grid">
          <article className="movie-card">
            <div className="poster poster-one">
              <span>01</span>
              <h3>
                THE
                <br />
                DARK
                <br />
                HORIZON
              </h3>
              <p>A WORLD BEYOND</p>
            </div>

            <h3>The Dark Horizon</h3>
            <p>Sci-Fi · 2h 18m</p>

            <button
              className="book-btn"
              onClick={() => setSelectedMovie('The Dark Horizon')}
            >
              Book Tickets
            </button>
          </article>

          <article className="movie-card">
            <div className="poster poster-two">
              <span>02</span>
              <h3>
                THE LAST
                <br />
                KINGDOM
              </h3>
              <p>A LEGEND RETURNS</p>
            </div>

            <h3>The Last Kingdom</h3>
            <p>Action · 2h 05m</p>

            <button
              className="book-btn"
              onClick={() => setSelectedMovie('The Last Kingdom')}
            >
              Book Tickets
            </button>
          </article>

          <article className="movie-card">
            <div className="poster poster-three">
              <span>03</span>
              <h3>
                BEYOND
                <br />
                THE STARS
              </h3>
              <p>LOVE HAS NO LIMITS</p>
            </div>

            <h3>Beyond the Stars</h3>
            <p>Adventure · 1h 56m</p>

            <button
              className="book-btn"
              onClick={() => setSelectedMovie('Beyond the Stars')}
            >
              Book Tickets
            </button>
          </article>
        </div>
      </section>

      <footer id="about">
        <h2>iMovies</h2>
        <p>Your next favourite movie is just a ticket away.</p>
        <p>© 2026 iMovies. Made for movie lovers.</p>
      </footer>
    </div>
  )
}

export default App
