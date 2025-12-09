import React, { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [dark, setDark] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('cx-theme')
    if (saved) setDark(saved === 'dark')
    else setDark(true)
  }, [])

  useEffect(() => {
    const root = document.documentElement
    if (dark) root.classList.add('dark')
    else root.classList.remove('dark')
    localStorage.setItem('cx-theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <button
      className="btn-ghost flex items-center gap-2"
      onClick={() => setDark((d) => !d)}
      aria-label="Toggle theme"
    >
      <span className="h-4 w-4 rounded-full bg-indigo-500" />
      <span>{dark ? 'Dark' : 'Light'}</span>
    </button>
  )
}
