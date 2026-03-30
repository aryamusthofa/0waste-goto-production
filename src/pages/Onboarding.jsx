import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

const slides = [
  {
    key: 'eco',
    bg: '#0d1117',
    icon: (
      <div className="w-28 h-28 rounded-full flex items-center justify-center text-6xl"
        style={{ background: 'rgba(62,201,118,0.15)', border: '2px solid rgba(62,201,118,0.3)' }}>
        ♻️
      </div>
    ),
    titleKey: 'onboarding_1_title',
    descKey: 'onboarding_1_desc',
  },
  {
    key: 'safety',
    bg: '#0d1117',
    icon: (
      <div className="w-28 h-28 rounded-full flex items-center justify-center text-6xl"
        style={{ background: 'rgba(62,201,118,0.15)', border: '2px solid rgba(62,201,118,0.3)' }}>
        🛡️
      </div>
    ),
    titleKey: 'onboarding_2_title',
    descKey: 'onboarding_2_desc',
  },
  {
    key: 'instant',
    bg: '#0d1117',
    icon: (
      <div className="w-28 h-28 rounded-full flex items-center justify-center text-6xl"
        style={{ background: 'rgba(62,201,118,0.15)', border: '2px solid rgba(62,201,118,0.3)' }}>
        ⚡
      </div>
    ),
    titleKey: 'onboarding_3_title',
    descKey: 'onboarding_3_desc',
  },
]

export default function Onboarding({ navigate }) {
  const { t } = useTranslation()
  const [current, setCurrent] = useState(0)

  const goNext = () => {
    if (current < slides.length - 1) setCurrent(c => c + 1)
    else navigate('welcome')
  }

  const slide = slides[current]

  return (
    <div className="flex flex-col min-h-screen" style={{ background: slide.bg }}>
      {/* Skip */}
      <div className="flex justify-end p-4">
        <button onClick={() => navigate('welcome')} className="text-gray-400 text-sm font-medium px-3 py-1">
          Skip
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8 gap-8 animate-fade-in">
        {slide.icon}

        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-white mb-3">{t(slide.titleKey)}</h2>
          <p className="text-gray-400 text-base leading-relaxed">{t(slide.descKey)}</p>
        </div>

        {/* Dots */}
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <div
              key={i}
              onClick={() => setCurrent(i)}
              className="rounded-full transition-all duration-300 cursor-pointer"
              style={{
                width: i === current ? 24 : 8,
                height: 8,
                background: i === current ? '#3ec976' : 'rgba(255,255,255,0.2)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Bottom */}
      <div className="p-6 pb-10 flex flex-col gap-3">
        <button
          onClick={goNext}
          className="w-full py-4 rounded-2xl font-bold text-white text-base"
          style={{ background: '#3ec976' }}
        >
          {current === slides.length - 1 ? t('get_started') : t('next')}
        </button>
        {current === slides.length - 1 && (
          <button
            onClick={() => navigate('login')}
            className="w-full py-4 rounded-2xl font-semibold text-gray-400 text-base border border-gray-700"
          >
            {t('sign_in')}
          </button>
        )}
        <p className="text-center text-gray-600 text-xs mt-1">{t('terms_agree')}</p>
      </div>
    </div>
  )
}
