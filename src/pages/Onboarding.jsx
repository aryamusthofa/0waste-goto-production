import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

// UI Atoms
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

const slides = [
  {
    key: 'eco',
    bg: '#0d1117',
    icon: '♻️',
    acc: 'rgba(62,201,118,0.2)',
    titleKey: 'onboarding_1_title',
    descKey: 'onboarding_1_desc',
  },
  {
    key: 'safety',
    bg: '#0d1117',
    icon: '🛡️',
    acc: 'rgba(59,130,246,0.2)',
    titleKey: 'onboarding_2_title',
    descKey: 'onboarding_2_desc',
  },
  {
    key: 'instant',
    bg: '#0d1117',
    icon: '⚡',
    acc: 'rgba(245,158,11,0.2)',
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
    <div className="flex flex-col min-h-screen transition-all duration-700 overflow-hidden" style={{ background: slide.bg }}>
      {/* Top Navigation Overlay */}
      <div className="flex justify-between items-center p-8 absolute top-0 left-0 right-0 z-50">
         <div className="flex gap-2">
            {slides.map((_, i) => (
              <div
                key={i}
                className="h-1 rounded-full transition-all duration-500"
                style={{
                  width: i === current ? 32 : 12,
                  background: i === current ? '#3ec976' : 'rgba(255,255,255,0.1)',
                }}
              />
            ))}
         </div>
         <button 
           onClick={() => navigate('welcome')} 
           className="text-[10px] font-black text-gray-500 uppercase tracking-[0.25em] hover:text-white transition-colors"
         >
           Skip
         </button>
      </div>

      {/* Main Narrative Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-10 pb-12 gap-12 relative">
         {/* Background Ambient Glow */}
         <div 
           className="absolute w-[300px] h-[300px] blur-[120px] rounded-full transition-all duration-1000"
           style={{ background: slide.acc, opacity: 0.6 }}
         />

         {/* Visual Anchor */}
         <div className="relative group animate-pop-in">
            <Card 
              className="w-32 h-32 rounded-[40px] flex items-center justify-center text-6xl shadow-2xl relative z-10 border-0"
              style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)' }}
              padding="p-0"
            >
               <span className="select-none">{slide.icon}</span>
            </Card>
            <div className="absolute -inset-4 bg-white/5 blur-2xl rounded-full animate-pulse" />
         </div>

         {/* Text Content */}
         <div className="text-center flex flex-col gap-4 animate-fade-in stagger-2 relative z-10">
            <h2 className="text-[28px] font-black text-white leading-tight tracking-tight uppercase">
              {t(slide.titleKey)}
            </h2>
            <p className="text-[15px] font-bold text-gray-400 leading-relaxed max-w-[280px] mx-auto">
              {t(slide.descKey)}
            </p>
         </div>
      </div>

      {/* Action Suite (Bottom Bar Style) */}
      <div className="px-8 pb-16 flex flex-col gap-4 relative z-10 animate-slide-up stagger-3">
         <Button 
            onClick={goNext} 
            className="!h-16 !text-lg !font-black !rounded-[24px] !bg-[#3ec976] !text-white shadow-[0_12px_40px_rgba(62,201,118,0.25)]"
         >
            {current === slides.length - 1 ? t('get_started') : t('next')}
         </Button>

         {current === slides.length - 1 && (
           <Button 
             variant="dark" 
             onClick={() => navigate('login')}
             className="!h-14 !text-xs !font-black !rounded-2xl !uppercase !tracking-widest !bg-white/5 !text-gray-400 !border-0"
           >
             {t('sign_in')}
           </Button>
         )}

         <p className="text-center text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mt-2">
           {t('terms_agree')}
         </p>
      </div>
      
      {/* Decorative Branding */}
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#3ec976] blur-[150px] opacity-10 pointer-events-none" />
    </div>
  )
}
