import React from 'react'
import { useTranslation } from 'react-i18next'

// UI Atoms
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

export default function Welcome({ navigate }) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col min-h-screen bg-white overflow-y-auto no-scrollbar">
      {/* Hero Visual Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-10 pt-20 pb-10 gap-10">
        {/* Modern Logo Concept */}
        <div className="relative group animate-pop-in">
           <div className="absolute inset-0 bg-[#3ec976] blur-[42px] opacity-20 group-hover:opacity-40 transition-opacity duration-700" />
           <div 
             className="w-32 h-32 rounded-[40px] flex items-center justify-center text-6xl shadow-[0_20px_50px_rgba(62,201,118,0.3)] relative z-10"
             style={{ background: 'linear-gradient(135deg, #3ec976 0%, #28a35a 100%)' }}
           >
             <span className="select-none group-hover:scale-110 transition-transform duration-500">🌿</span>
           </div>
           {/* Decorative Orbitals */}
           <div className="absolute -top-4 -right-4 w-10 h-10 bg-[#1a1a2e] rounded-2xl flex items-center justify-center text-lg shadow-soft animate-bounce stagger-1">♻️</div>
           <div className="absolute -bottom-2 -left-6 w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-xl shadow-float animate-pulse stagger-2">🍱</div>
        </div>

        {/* Text Area */}
        <div className="text-center flex flex-col gap-3 animate-fade-in stagger-3">
           <h1 className="text-[34px] font-black text-[#1a1a2e] leading-tight tracking-tight">
             {t('app_name')}
           </h1>
           <p className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em] px-4">
             {t('app_tagline')}
           </p>
        </div>

        {/* Pillar List */}
        <div className="w-full flex flex-col gap-3.5 mt-2 animate-slide-up stagger-4 max-w-[320px]">
           {[
             { icon: '🌍', title: 'Eco-Technology', desc: 'Sistem cerdas penyelamat jejak karbon.' },
             { icon: '🛡️', title: 'Safe Protocols', desc: 'Jaminan kualitas produk layak konsumsi.' },
             { icon: '🤝', title: 'Circular Impact', desc: 'Misi berbagi untuk komunitas lebih baik.' },
           ].map((item, idx) => (
             <Card 
               key={idx} 
               padding="p-4" 
               className="flex items-center gap-5 border border-gray-50 hover:border-[#3ec976]/20 transition-all duration-300 group !rounded-[24px]"
             >
               <div className="w-12 h-12 rounded-2xl bg-[#F9FAFB] flex items-center justify-center text-2xl group-hover:rotate-12 transition-transform shadow-inner">
                 {item.icon}
               </div>
               <div className="flex-1 flex flex-col gap-0.5">
                 <p className="text-sm font-black text-[#1a1a2e]">{item.title}</p>
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{item.desc}</p>
               </div>
             </Card>
           ))}
        </div>
      </div>

      {/* Action Suite (Expanded Spacing) */}
      <div className="px-10 pb-20 pt-4 flex flex-col gap-4 animate-slide-up stagger-5 bg-white relative z-20 shadow-[0_-20px_40px_rgba(255,255,255,1)]">
         <Button 
           onClick={() => navigate('register')} 
           className="!h-16 !text-lg !font-black !rounded-[24px] shadow-lg"
         >
           {t('sign_up')}
         </Button>
         
         <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="secondary" 
              onClick={() => navigate('login')}
              className="!h-14 !text-sm !font-black !rounded-2xl !bg-[#F9FAFB] !border-0"
            >
              Log In
            </Button>
            <Button 
              variant="dark" 
              onClick={() => navigate('home')}
              className="!h-14 !text-[10px] !font-black !rounded-2xl !uppercase !tracking-widest"
            >
              Guest View
            </Button>
         </div>

         <div className="flex flex-col items-center gap-1 mt-6 opacity-40">
            <p className="text-center text-[9px] font-black text-gray-400 uppercase tracking-[0.25em]">
              Verified Circular Marketplace
            </p>
            <div className="w-1 h-1 rounded-full bg-gray-300" />
         </div>
      </div>
    </div>
  )
}
