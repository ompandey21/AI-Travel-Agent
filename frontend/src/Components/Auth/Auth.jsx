import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

axios.defaults.withCredentials = true

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export default function Auth(){
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '', cpassword: '' })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  const onChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  useEffect(() => {
    setForm({ name: '', email: '', password: '', cpassword: '' })
    setMessage('')
    setLoading(false)
  }, [mode])

  const submit = async (e) => {
    e.preventDefault()
    setMessage('')
    setLoading(true)

    // basic client-side validation
    const email = (form.email || '').trim()
    const password = (form.password || '').trim()
    const name = (form.name || '').trim()
    const cpassword = (form.cpassword || '').trim()

    if (mode === 'login') {
      if (!email || !password) {
        setMessage('Please enter your email and password.')
        setLoading(false)
        return
      }
    }

    if (mode === 'signup') {
      if (!name || !email || !password || !cpassword) {
        setMessage('Please complete all signup fields.')
        setLoading(false)
        return
      }
      if (password !== cpassword) {
        setMessage('Passwords do not match.')
        setLoading(false)
        return
      }
    }

    if (mode === 'forgot') {
      if (!email) {
        setMessage('Please enter your email to reset your password.')
        setLoading(false)
        return
      }
    }

    // auth api calls
    try {
      let endpoint = ''
      const payload = { email: form.email }

      if(mode === 'login'){
        endpoint = '/api/auth/login'
        payload.password = form.password
      } 
      else if(mode === 'signup'){
        endpoint = '/api/auth/signup'
        payload.name = form.name
        payload.password = form.password
      } 
      else if(mode === 'forgot'){
        endpoint = '/api/auth/forgetpassword'
      }

      const res = await axios.post(API_BASE + endpoint, payload, { withCredentials: true })
      const data = res.data

      if(mode === 'login' || mode === 'signup'){
        navigate('/')
      } else if(mode === 'forgot'){
        setMessage(data.url || data.message || 'Reset link generated — check server response')
        setMode('login')
      }
    }
    catch(err){
      const msg = err?.response?.data?.message || err.message || 'Request failed'
      setMessage(msg)
    }
    finally{ setLoading(false) }
  }

  const hero = import.meta.env.VITE_AUTH_IMG;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left: image and pitch */}
      <div className="hidden lg:flex lg:w-1/2 bg-cover bg-center relative" style={{ backgroundImage: `url(${hero})` }}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="relative z-10 p-12 flex flex-col justify-center max-w-lg text-white">
          <div className="bg-white/5 rounded-lg p-6 w-max mb-6">Iternation</div>
          <h1 className="text-4xl font-extrabold mb-4">Travel smarter with AI</h1>
          <p className="text-white/75">Personalized day-by-day plans, hidden gems, and group collaboration — all in one place.</p>
          <div className="mt-6 text-sm text-white/60">Secure, private, and fast. Sign in to pick up where you left off.</div>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md p-8 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-white/8 backdrop-blur-md shadow-xl">
          <h2 className="text-3xl font-bold mb-1">{mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Create an account' : 'Reset password'}</h2>
          <p className="text-sm text-white/60 mb-6">{mode === 'login' ? 'Sign in to access your itineraries.' : mode === 'signup' ? 'Join Iternation to start planning.' : 'We will send a reset link to your email.'}</p>

          {message && <div className="mb-4 text-sm text-red-500">{message}</div>}

          <form onSubmit={submit} className="space-y-4">
            {mode === 'signup' && (
              <input name="name" value={form.name} onChange={onChange} placeholder="Full name" className="w-full px-4 py-3 rounded-md bg-white/5 border border-black/20" />
            )}

            <input name="email" value={form.email} onChange={onChange} placeholder="Email" type="email" className="w-full px-4 py-3 rounded-md bg-white/5 border border-black/20" />

            {mode !== 'forgot' && (
              <input name="password" value={form.password} onChange={onChange} placeholder="Password" type="password" className="w-full px-4 py-3 rounded-md bg-white/5 border border-black/20" />
            )}

            {mode === 'signup' && (
              <input name="cpassword" value={form.cpassword} onChange={onChange} placeholder="Confirm password" type="password" className="w-full px-4 py-3 rounded-md bg-white/5 border border-black/20" />
            )}

            <button disabled={loading} type="submit" className="w-full py-3 rounded-lg bg-sky-500 hover:bg-sky-400 font-semibold">{loading ? 'Working…' : mode === 'login' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Send reset link'}</button>
          </form>

          <div className="mt-6 flex items-center justify-between text-sm text-black/60">
            <div>
              {mode !== 'signup' ? (
                <button
                  onClick={() => setMode('signup')}
                  className="underline cursor-pointer"
                >
                  Create account
                </button>
              ) : (
                <button
                  onClick={() => setMode('login')}
                  className="underline cursor-pointer"
                >
                  Back to login
                </button>
              )}
            </div>
            <button
              onClick={() => setMode(mode === 'forgot' ? 'login' : 'forgot')}
              className="underline cursor-pointer"
            >
              {mode === 'forgot' ? 'Cancel' : 'Forgot?'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
