import { useState, useEffect } from 'react'

export const useTimeLeft = (expiryTime) => {
  const [timeLeft, setTimeLeft] = useState('')
  const [isExpired, setIsExpired] = useState(false)
  const [urgency, setUrgency] = useState('normal') // normal | warning | critical

  useEffect(() => {
    if (!expiryTime) return
    const calc = () => {
      const now = new Date()
      const expiry = new Date(expiryTime)
      const diff = expiry - now
      if (diff <= 0) {
        setTimeLeft('Expired')
        setIsExpired(true)
        setUrgency('critical')
        return
      }
      const hours = Math.floor(diff / 3600000)
      const mins = Math.floor((diff % 3600000) / 60000)
      if (hours < 2) setUrgency('critical')
      else if (hours < 6) setUrgency('warning')
      else setUrgency('normal')
      if (hours > 0) setTimeLeft(`${hours}h ${mins}m`)
      else setTimeLeft(`${mins}m`)
    }
    calc()
    const interval = setInterval(calc, 30000)
    return () => clearInterval(interval)
  }, [expiryTime])

  return { timeLeft, isExpired, urgency }
}
