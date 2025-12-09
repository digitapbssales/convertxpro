import React, { useEffect, useMemo, useRef, useState } from 'react'
import imageCompression from 'browser-image-compression'

const dropSound = 'data:audio/mp3;base64,//uQZAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
const doneSound = 'data:audio/mp3;base64,//uQZAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'

function toHex(buffer) {
  const view = new Uint8Array(buffer)
  let s = ''
  for (let i = 0; i < view.length; i++) s += view[i].toString(16).padStart(2, '0')
  return s
}

async function sha256(file) {
  const ab = await file.arrayBuffer()
  const digest = await crypto.subtle.digest('SHA-256', ab)
  return toHex(digest)
}

function predictSizeChange(file, target) {
  const mb = file.size / (1024 * 1024)
  const type = file.type
  let predicted = mb
  if (type.includes('jpeg') || type.includes('jpg')) {
    if (target === 'image/webp') predicted = mb * 0.2
    else if (target === 'image/png') predicted = mb * 1.1
    else if (target === 'image/jpeg') predicted = mb * 0.8
  } else if (type.includes('png')) {
    if (target === 'image/webp') predicted = mb * 0.5
    else if (target === 'image/jpeg') predicted = mb * 0.9
    else predicted = mb
  } else {
    predicted = mb
  }
  return { fromMB: mb, toMB: predicted }
}

function formatMB(mb) {
  return `${mb.toFixed(1)}MB`
}

function isImage(file) {
  return file.type.startsWith('image/')
}

function getImageTargets(file) {
  if (!isImage(file)) return []
  return ['image/png', 'image/jpeg', 'image/webp']
}

function confettiBurst(canvas) {
  const ctx = canvas.getContext('2d')
  const w = canvas.width
  const h = canvas.height
  const parts = Array.from({ length: 80 }).map(() => ({
    x: Math.random() * w,
    y: -20,
    vx: (Math.random() - 0.5) * 4,
    vy: Math.random() * 3 + 2,
    size: Math.random() * 4 + 2,
    color: `hsl(${Math.floor(Math.random() * 360)},80%,60%)`,
    life: Math.random() * 80 + 40
  }))
  let frame = 0
  function step() {
    frame++
    ctx.clearRect(0, 0, w, h)
    for (const p of parts) {
      p.x += p.vx
      p.y += p.vy
      p.vy += 0.05
      p.life -= 1
      ctx.fillStyle = p.color
      ctx.fillRect(p.x, p.y, p.size, p.size)
    }
    if (frame < 160) requestAnimationFrame(step)
    else ctx.clearRect(0, 0, w, h)
  }
  step()
}

export default function Converter({ queue, setQueue, fileInputRef, fetchDefinition, warnAccessibility }) {
  const [hoverTip, setHoverTip] = useState({ text: '', x: 0, y: 0, show: false })
  const [released, setReleased] = useState('')
  const dropAudio = useRef(null)
  const doneAudio = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    dropAudio.current = new Audio(dropSound)
    doneAudio.current = new Audio(doneSound)
  }, [])

  const addFiles = async (files) => {
    const items = []
    for (const file of files) {
      const hash = await sha256(file)
      const targets = getImageTargets(file)
      const defaultTarget = targets.length ? targets[targets.length - 1] : ''
      const id = crypto.randomUUID()
      items.push({
        id,
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        hash,
        output: defaultTarget,
        status: 'pending',
        predicted: predictSizeChange(file, defaultTarget),
        convertedBlob: null,
        convertedUrl: '',
        countdownEnd: 0,
        remainingSec: 0
      })
    }
    setQueue((q) => [...q, ...items])
    if (dropAudio.current) dropAudio.current.play()
  }

  const onDrop = async (e) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (files && files.length) await addFiles(files)
  }

  const onSelect = async (e) => {
    const files = e.target.files
    if (files && files.length) await addFiles(files)
    e.target.value = ''
  }

  const convertItem = async (item) => {
    setQueue((q) => q.map((f) => (f.id === item.id ? { ...f, status: 'processing' } : f)))
    let convertedBlob = null
    if (isImage(item.file) && item.output) {
      const opts = {
        fileType: item.output,
        maxWidth: 4096,
        maxHeight: 4096,
        initialQuality: item.output === 'image/webp' ? 0.6 : 0.8,
        useWebWorker: true
      }
      try {
        convertedBlob = await imageCompression(item.file, opts)
      } catch {
        const img = document.createElement('img')
        const url = URL.createObjectURL(item.file)
        await new Promise((res) => {
          img.onload = res
          img.src = url
        })
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)
        const mime = item.output || 'image/png'
        const dataUrl = canvas.toDataURL(mime, mime.includes('jpeg') ? 0.8 : 0.92)
        const res = await fetch(dataUrl)
        convertedBlob = await res.blob()
        URL.revokeObjectURL(url)
      }
    } else {
      convertedBlob = item.file
    }
    const reader = new FileReader()
    const dataUrl = await new Promise((resolve) => {
      reader.onload = () => resolve(reader.result)
      reader.readAsDataURL(convertedBlob)
    })
    const countdownEnd = Date.now() + 5 * 60 * 1000
    setQueue((q) =>
      q.map((f) =>
        f.id === item.id
          ? {
              ...f,
              status: 'complete',
              convertedBlob,
              convertedUrl: dataUrl,
              countdownEnd,
              remainingSec: Math.ceil((countdownEnd - Date.now()) / 1000)
            }
          : f
      )
    )
    if (doneAudio.current) doneAudio.current.play()
    const c = canvasRef.current
    if (c) {
      c.width = c.offsetWidth
      c.height = c.offsetHeight
      confettiBurst(c)
    }
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setQueue((q) =>
        q
          .map((f) => {
            if (f.countdownEnd && f.status === 'complete') {
              const rem = Math.max(0, Math.ceil((f.countdownEnd - Date.now()) / 1000))
              return { ...f, remainingSec: rem }
            }
            return f
          })
          .filter((f) => {
            if (f.status === 'complete' && f.remainingSec === 0 && f.countdownEnd) {
              setReleased(f.name)
              return false
            }
            return true
          })
      )
    }, 1000)
    return () => clearInterval(timer)
  }, [setQueue])

  const onChangeOutput = async (id, value, e) => {
    setQueue((q) =>
      q.map((f) => (f.id === id ? { ...f, output: value, predicted: predictSizeChange(f.file, value) } : f))
    )
    if (value.toLowerCase().includes('pdf/a')) warnAccessibility('Converting to PDF/A may reduce accessibility tags')
    if (e) {
      const rect = e.target.getBoundingClientRect()
      const x = rect.left + rect.width / 2
      const y = rect.top - 8
      const text = await fetchDefinition('PDF/A')
      setHoverTip({ text, x, y, show: true })
      setTimeout(() => setHoverTip((t) => ({ ...t, show: false })), 2400)
    }
  }

  const startAll = async () => {
    for (const f of queue) {
      if (f.status === 'pending') await convertItem(f)
    }
  }

  const copyDataUrl = async (u) => {
    if (!u) return
    await navigator.clipboard.writeText(u)
  }

  const formats = useMemo(() => ['image/png', 'image/jpeg', 'image/webp', 'PDF/A'], [])

  return (
    <div className="relative">
      <div ref={canvasRef} className="absolute inset-0 pointer-events-none"></div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className="cyber-card rounded-xl p-6 border border-indigo-500/20 text-center cyber-hover"
      >
        <p className="text-slate-300">Drag and drop files here</p>
        <div className="mt-3 flex items-center justify-center gap-2">
          <button className="btn-primary" onClick={() => fileInputRef.current && fileInputRef.current.click()}>
            Browse Files
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            multiple
            onChange={onSelect}
          />
        </div>
      </div>

      {released && (
        <div className="mt-3 rounded-lg border border-green-500/40 bg-green-500/10 px-3 py-2 text-sm">
          Data Released: {released}
        </div>
      )}

      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Conversion Queue</h3>
          <button className="btn-primary" onClick={startAll}>
            {(() => {
              const pending = queue.filter((f) => f.status === 'pending')
              if (pending.length === 0) return 'Convert'
              const sample = pending[0]
              const pred = sample.predicted
              const ext = sample.output || ''
              if (pred && ext && isImage(sample.file)) {
                return `Convert ${formatMB(pred.fromMB)} ${sample.type.split('/')[1].toUpperCase()} to ${formatMB(pred.toMB)} ${ext.split('/')[1].toUpperCase()}`
              }
              return 'Convert'
            })()}
          </button>
        </div>

        <ul className="space-y-3">
          {queue.map((f) => (
            <li key={f.id} className="cyber-card rounded-lg p-4 border border-indigo-500/20">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium truncate">{f.name}</div>
                  <div className="text-xs text-slate-400">
                    {f.type} • {formatMB(f.size / (1024 * 1024))} • SHA-256 {f.hash.slice(0, 12)}…
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    className="select"
                    value={f.output || ''}
                    onMouseEnter={(e) => {
                      const opt = e.target.value
                      if (opt.toLowerCase().includes('pdf/a')) {
                        fetchDefinition('PDF/A').then((text) => {
                          const rect = e.target.getBoundingClientRect()
                          setHoverTip({ text, x: rect.left + rect.width / 2, y: rect.top - 8, show: true })
                          setTimeout(() => setHoverTip((t) => ({ ...t, show: false })), 2400)
                        })
                      }
                    }}
                    onChange={(e) => onChangeOutput(f.id, e.target.value, e)}
                  >
                    <option value="">{f.output ? f.output : 'Choose output'}</option>
                    {formats.map((fmt) => (
                      <option key={fmt} value={fmt}>
                        {fmt}
                      </option>
                    ))}
                  </select>
                  <button
                    className="btn-primary"
                    disabled={f.status !== 'pending'}
                    onClick={() => convertItem(f)}
                  >
                    {f.status === 'pending' ? 'Convert' : f.status === 'processing' ? 'Processing' : 'Done'}
                  </button>
                </div>
              </div>

              {f.status === 'complete' && (
                <div className="mt-3 flex items-center justify-between">
                  <a
                    href={f.convertedUrl}
                    download={f.name}
                    className="btn-ghost"
                  >
                    Download
                  </a>
                  <div className="text-xs text-slate-400">
                    Auto-clean in {f.remainingSec}s
                  </div>
                  <button className="btn-ghost" onClick={() => copyDataUrl(f.convertedUrl)}>
                    Copy Data URL
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      {hoverTip.show && hoverTip.text && (
        <div
          className="tooltip"
          style={{ left: hoverTip.x, top: hoverTip.y, transform: 'translate(-50%, -100%)' }}
        >
          {hoverTip.text}
        </div>
      )}
    </div>
  )
}
