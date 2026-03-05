import React from 'react'

export default function AuthFooter({ mode, setMode }){
  return (
    <div className="mt-6 flex items-center justify-between text-sm text-black/60">
      <div>
        {mode === 'login' && (
          <button
            onClick={() => setMode('signup')}
            className="underline cursor-pointer"
          >
            Create account
          </button>
        )}
        {(mode === 'signup' || mode === 'forgot' || mode === 'reset') && (
          <button
            onClick={() => setMode('login')}
            className="underline cursor-pointer"
          >
            Back to login
          </button>
        )}
      </div>

      <div>
        {mode === 'forgot' && (
          <button
            onClick={() => setMode('login')}
            className="underline cursor-pointer"
          >
            Cancel
          </button>
        )}

        {mode === 'login' && (
          <button
            onClick={() => setMode('forgot')}
            className="underline cursor-pointer"
          >
            Forgot?
          </button>
        )}
      </div>
    </div>
  )
}
