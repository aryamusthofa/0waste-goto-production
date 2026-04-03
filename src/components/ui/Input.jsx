import React, { useState } from 'react'

export default function Input({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  error,
  icon: Icon,
  disabled = false,
  className = '',
  required = false,
  autoComplete = 'off',
  onFocus,
  onBlur,
}) {
  const [focused, setFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const isPassword = type === 'password'
  const currentType = isPassword && showPassword ? 'text' : type

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}

      <div className="relative group">
        {Icon && (
          <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${focused ? 'text-[#3ec976]' : 'text-gray-400'}`}>
            {Icon}
          </div>
        )}

        <input
          type={currentType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          onFocus={(e) => {
            setFocused(true)
            onFocus && onFocus(e)
          }}
          onBlur={(e) => {
            setFocused(false)
            onBlur && onBlur(e)
          }}
          className={`
            w-full text-[15px] font-bold transition-all duration-300 outline-none
            ${Icon ? 'pl-11' : 'pl-5'} ${isPassword ? 'pr-12' : 'pr-5'}
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
          style={{
            height: 54,
            background: '#F4F4F9',
            borderRadius: 20,
            border: `1.5px solid ${error ? '#ef4444' : focused ? '#3ec976' : 'transparent'}`,
            color: '#1a1a2e',
            boxShadow: focused ? '0 0 0 4px rgba(62,201,118,0.1)' : 'none',
          }}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xl text-gray-400 active:scale-90 transition-all"
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        )}
      </div>

      {error && <p className="text-[11px] font-bold text-red-500 pl-1 mt-0.5 animate-slide-up">{error}</p>}
    </div>
  )
}
