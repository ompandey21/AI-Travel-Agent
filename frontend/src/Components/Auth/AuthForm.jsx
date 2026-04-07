import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import AuthFooter from './AuthFooter'
import { login as apiLogin, signup as apiSignup, forgetPassword as apiForget, createPassword as apiCreatePassword, verifyResetToken as apiVerifyReset } from './authApi'
import { acceptRequest } from '../Trip/TripAPI'

export default function AuthForm(){
    const [mode, setMode] = useState('login')
    const [form, setForm] = useState({ name: '', email: '', otp: '', password: '', cpassword: '' })
    const [otpDigits, setOtpDigits] = useState(new Array(6).fill(''))
    const otpRefs = useRef([])
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [resetUrl, setResetUrl] = useState('')
    const navigate = useNavigate()
    const { token } = useParams()
    const [searchParams] = useSearchParams();

    const inviteToken = searchParams.get("token");


    const onChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

    useEffect(() => {
        setForm({ name: '', email: '', otp: '', password: '', cpassword: '' })
        setOtpDigits(new Array(6).fill(''))
        setMessage('')
        setLoading(false)
    }, [mode])

    useEffect(() => {
        if (token) {
        setMode('reset')
        (async () => {
            try {
            const res = await apiVerifyReset(token)
            if (!res.data.valid) {
                setMessage(res.data.message || 'Invalid or expired reset token')
                setMode('login')
            }
            } catch (err) {
            setMessage(err?.response?.data?.message || 'Invalid or expired reset token')
            setMode('login')
            }
        })()
        }
    }, [token])

    useEffect(() => {
        if(inviteToken) {
            setMode('signup')
        };
    }, [inviteToken]);

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
            setMessage('Please enter your email and password')
            setLoading(false)
            return
        }
        }

        if (mode === 'signup') {
        if (!name || !email || !password || !cpassword) {
            setMessage('Please complete all signup fields')
            setLoading(false)
            return
        }
        if (password !== cpassword) {
            setMessage('Passwords do not match')
            setLoading(false)
            return
        }
        }

        if (mode === 'forgot') {
        if (!email) {
            setMessage('Please enter your email to reset your password')
            setLoading(false)
            return
        }
        }

        if (mode === 'reset') {
        const combinedOtp = otpDigits.join('').trim()
        if (!combinedOtp || combinedOtp.length !== 6) {
            setMessage('Please enter the 6-digit OTP sent to your email')
            setLoading(false)
            return
        }
        if (!password || !cpassword) {
            setMessage('Please enter and confirm your new password')
            setLoading(false)
            return
        }
        if (password !== cpassword) {
            setMessage('Passwords do not match')
            setLoading(false)
            return
        }
        form.otp = combinedOtp
        }

        // payload for api calls
        try {
            const payload = { email: form.email }
            let res

            if (mode === 'login') {
            payload.password = form.password
            res = await apiLogin(payload)
            } 
            else if (mode === 'signup') {
            payload.name = form.name
            payload.password = form.password
            payload.cpassword = form.cpassword
            res = await apiSignup(payload)
            if(inviteToken){
                await acceptRequest(inviteToken)
                .then(navigate('/profile'))
                .catch((e) => console.log(e));
            }
            
            } 
            else if (mode === 'forgot') {
            res = await apiForget(payload)
            }
            else if (mode === 'reset') {
            payload.otp = form.otp
            payload.password = form.password
            payload.cpassword = form.cpassword
            res = await apiCreatePassword(payload)
            }

            const data = res?.data

            if (mode === 'login' || mode === 'signup') {
            navigate('/profile')
            } else if (mode === 'forgot') {
            setMessage('OTP sent — check your email and enter OTP below')
            setMode('reset')
            setForm(f => ({ ...f, email: '' }))
            } else if (mode === 'reset') {
            setMessage(data.message || 'Password reset successful')
            navigate('/auth')
            }
        } 
        catch (err) {
            const msg = err?.response?.data?.message || err.message || 'Request failed'
            setMessage(msg)
        } 
        finally { setLoading(false) }
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
                <h2 className="text-3xl font-bold mb-1">{mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Create an account' : mode === 'reset' ? 'Reset your password' : 'Reset password'}</h2>
                <p className="text-sm text-white/60 mb-6">{mode === 'login' ? 'Sign in to access your itineraries.' : mode === 'signup' ? 'Join Iternation to start planning.' : mode === 'reset' ? 'Enter your new password below.' : 'We will send a reset link to your email.'}</p>

                {message && <div className="mb-4 text-sm text-red-500">{message}</div>}

                <form onSubmit={submit} className="space-y-4">
                    {mode === 'signup' && (
                        <input name="name" value={form.name} onChange={onChange} placeholder="Full name" className="w-full px-4 py-3 rounded-md bg-white/5 border border-black/20" />
                    )}

                    {mode !== 'reset' && (
                        <input name="email" value={form.email} onChange={onChange} placeholder="Email" type="email" className="w-full px-4 py-3 rounded-md bg-white/5 border border-black/20" />
                    )}

                    {mode === 'reset' && (
                    <div>
                        <div className="mb-3 text-sm text-white/60">Enter the 6-digit OTP</div>
                        <div className="flex gap-2">
                        {otpDigits.map((d, i) => (
                            <input
                            key={i}
                            ref={el => otpRefs.current[i] = el}
                            value={otpDigits[i]}
                            onChange={(e) => {
                                const val = e.target.value.replace(/[^0-9]/g, '')
                                if (!val) {
                                setOtpDigits(prev => { const next = [...prev]; next[i] = ''; return next })
                                return
                                }
                                const digit = val.slice(-1)
                                setOtpDigits(prev => { const next = [...prev]; next[i] = digit; return next })
                                // move focus to next
                                if (i < otpDigits.length - 1) otpRefs.current[i + 1]?.focus()
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Backspace' && !otpDigits[i] && i > 0) {
                                otpRefs.current[i - 1]?.focus()
                                }
                            }}
                            onPaste={(e) => {
                                e.preventDefault()
                                const paste = (e.clipboardData.getData('text') || '').replace(/[^0-9]/g, '').slice(0,6)
                                if (!paste) return
                                const chars = paste.split('')
                                setOtpDigits(prev => {
                                const next = [...prev]
                                for (let k = 0; k < chars.length; k++) next[k] = chars[k]
                                return next
                                })
                                const nextIndex = Math.min(chars.length, otpDigits.length - 1)
                                otpRefs.current[nextIndex]?.focus()
                            }}
                            inputMode="numeric"
                            maxLength={1}
                            className="w-10 h-10 text-center rounded border bg-white/5"
                            />
                        ))}
                        </div>
                    </div>
                    )}

                    {mode !== 'forgot' && (
                    <input name="password" value={form.password} onChange={onChange} placeholder="Password" type="password" className="w-full px-4 py-3 rounded-md bg-white/5 border border-black/20" />
                    )}

                    {(mode === 'signup' || mode === 'reset') && (
                    <input name="cpassword" value={form.cpassword} onChange={onChange} placeholder="Confirm password" type="password" className="w-full px-4 py-3 rounded-md bg-white/5 border border-black/20" />
                    )}

                    <button disabled={loading} type="submit" className="w-full py-3 rounded-lg bg-sky-500 hover:bg-sky-400 font-semibold">{loading ? 'Working…' : mode === 'login' ? 'Sign in' : mode === 'signup' ? 'Create account' : mode === 'reset' ? 'Reset password' : 'Send reset link'}</button>
                </form>

            <AuthFooter mode={mode} setMode={setMode} />
            </div>
        </div>
    </div>
  )
}
