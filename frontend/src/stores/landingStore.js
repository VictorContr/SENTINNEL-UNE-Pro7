import { defineStore } from 'pinia'

export const useLandingStore = defineStore('landing', () => {
  const navLinks_sm_vc = [
    { label_sm_vc: 'Inicio',        href_sm_vc: '#hero',         icon_sm_vc: 'home' },
    { label_sm_vc: 'Beneficios',    href_sm_vc: '#beneficios',   icon_sm_vc: 'star' },
    { label_sm_vc: 'Vista Previa',  href_sm_vc: '#demo',         icon_sm_vc: 'preview' },
    { label_sm_vc: 'Testimonios',   href_sm_vc: '#testimonios',  icon_sm_vc: 'chat_bubble' },
    { label_sm_vc: 'Preguntas',     href_sm_vc: '#faq',          icon_sm_vc: 'help' }
  ]

  return { navLinks_sm_vc }
})
