import { useEffect } from 'react'

export default function useHotkeys({ openFiles, toggleChat }) {
  useEffect(() => {
    const handler = (e) => {
      const isMod = e.ctrlKey || e.metaKey
      if (!isMod) return
      const key = e.key.toLowerCase()
      if (key === 'u') {
        e.preventDefault()
        if (openFiles) openFiles()
      } else if (key === 'c') {
        e.preventDefault()
        if (toggleChat) toggleChat()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [openFiles, toggleChat])
}
