import React, { useEffect, useState } from 'react'

export default function SessionIndicator({ isActive }) {
  if (!isActive) return null

  return (
    <div className="flex items-center gap-2">
      <div className="relative w-2 h-2">
        <div className="absolute inset-0 bg-green-500 rounded-full animate-pulse"></div>
      </div>
      <span className="text-xs font-medium text-green-600 dark:text-green-400">Active Session</span>
    </div>
  )
}
