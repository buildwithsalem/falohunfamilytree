import React from 'react'
import { ToastMsg } from '../../App'

interface Props {
  toast: ToastMsg
  onClose: () => void
}

const icons = { success: '✅', error: '❌', info: 'ℹ️' }
const colors = {
  success: 'bg-leaf/10 border-leaf/30 text-leaf',
  error: 'bg-terracotta/10 border-terracotta/30 text-terracotta',
  info: 'bg-gold/10 border-gold/30 text-gold-dark',
}

export default function Toast({ toast, onClose }: Props) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border card-shadow bg-warm-white animate-fade-in max-w-sm ${colors[toast.type]}`}>
      <span className="text-lg flex-shrink-0">{icons[toast.type]}</span>
      <p className="text-sm font-medium flex-1">{toast.message}</p>
      <button onClick={onClose} className="opacity-50 hover:opacity-100 ml-2 text-sm">✕</button>
    </div>
  )
}
