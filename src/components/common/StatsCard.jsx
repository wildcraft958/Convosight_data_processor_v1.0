import React from 'react'

export default function StatsCard({ label, value, color = 'blue' }) {
  const colors = {
    blue: 'text-primary-700 bg-primary-50',
    green: 'text-green-700 bg-green-50',
    red: 'text-red-700 bg-red-50',
    gray: 'text-gray-700 bg-gray-50'
  }

  return (
    <div className={`card p-4 flex flex-col gap-1 ${colors[color]}`}>
      <div className="text-2xl font-extrabold">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  )
}