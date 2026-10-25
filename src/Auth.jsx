
import React from 'react'

function Auth({ mode, onBack, onSwitchMode }) {
  const [name, setName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [message, setMessage] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  const isSignup = mode === 'signup'

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')
    setLoading(true)

    try {
      const endpoint = isSignup ? 'signup' : 'login'

      const response = await fetch(
        `http://localhost:5000/api/auth/${endpoint}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...(isSignup ? { name } : {}),
            email,
            password
          })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong')
      }

     if (!isSignup && data.token) {
  localStorage.setItem('imoviesToken', data.token)
  localStorage.setItem('imoviesUser', JSON.stringify(data.user))
  onBack()
  window.location.reload()
  return
}

      if (isSignup) {
        setMessage('Account created successfully! You can now sign in.')
        setPassword('')
      } else {
        setMessage(`Welcome back, ${data.user?.name || 'movie lover'}!`)
      }
    } catch (error) {
      setMessage(
        error.message === 'Failed to fetch'
          ? 'Cannot connect to server. Please check your backend.'
          : error.message
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <button className="auth-back-btn" onClick={onBack}>
        ← Back to Movies
      </button>

      <div className="auth-card">
        <h2 className="auth-logo">
          i<span>Movies</span>
        </h2>

        <h1>{isSignup ? 'Create Account' : 'Welcome Back'}</h1>

        <p className="auth-subtitle">
          {isSignup
            ? 'Join iMovies and make your movie nights special.'
            : 'Sign in to continue your movie experience.'}
        </p>

        <form onSubmit={handleSubmit}>
          {isSignup && (
            <div className="auth-field">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>

          <button
            className="auth-submit-btn"
            type="submit"
            disabled={loading}
          >
            {loading
              ? 'Please wait...'
              : isSignup
                ? 'Create Account'
                : 'Sign In'}
          </button>
        </form>

        {message && (
          <p className="auth-message" role="status">
            {message}
          </p>
        )}

        <p className="auth-switch">
          {isSignup
            ? 'Already have an account?'
            : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => {
              setMessage('')
              onSwitchMode(isSignup ? 'login' : 'signup')
            }}
          >
            {isSignup ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  )
}

export default Auth
