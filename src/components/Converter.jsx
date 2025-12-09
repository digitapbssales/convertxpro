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
  const targets = ['image/png', 'image/jpeg', 'image/webp']
  if (supportsType('image/avif')) targets.push('image/avif')
  return targets
}

function supportsType(type) {
  try {
    const c = document.createElement('canvas')
    const url = c.toDataURL(type)
    return url.startsWith(`data:${type}`)
  } catch {
    return false
  }
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
  const [preset, setPreset] = useState('quality')
  const [lockFormat, setLockFormat] = useState(false)
  const [zoom, setZoom] = useState({ show: false, url: '', x: 0, y: 0 })
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
      const defaultQuality = preset === 'fast' ? 0.6 : 0.85
      const defaultMax = preset === 'fast' ? 2048 : 4096
      let width = null
      let height = null
      let previewUrl = ''
      if (isImage(file)) {
        previewUrl = URL.createObjectURL(file)
        const img = document.createElement('img')
        await new Promise((res) => {
          img.onload = () => {
            width = img.naturalWidth
            height = img.naturalHeight
            res()
          }
          img.src = previewUrl
        })
      }
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
        remainingSec: 0,
        targetWidth: defaultMax,
        targetHeight: defaultMax,
        quality: defaultQuality,
        progress: 0,
        previewUrl,
        width,
        height,
        errorMessage: ''
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
    try {
      setQueue((q) => q.map((f) => (f.id === item.id ? { ...f, status: 'processing', errorMessage: '' } : f)))
      let convertedBlob = null
      if (isImage(item.file) && item.output) {
        const opts = {
          fileType: item.output,
          maxWidth: item.targetWidth || 4096,
          maxHeight: item.targetHeight || 4096,
          initialQuality: typeof item.quality === 'number' ? item.quality : item.output === 'image/webp' ? 0.6 : 0.8,
          useWebWorker: true,
          onProgress: (p) => {
            setQueue((q) => q.map((f) => (f.id === item.id ? { ...f, progress: p } : f)))
          }
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
          const q = typeof item.quality === 'number' ? item.quality : mime.includes('jpeg') ? 0.8 : 0.92
          const dataUrl = canvas.toDataURL(mime, q)
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
                remainingSec: Math.ceil((countdownEnd - Date.now()) / 1000),
                errorMessage: ''
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
    } catch (e) {
      setQueue((q) => q.map((f) => (f.id === item.id ? { ...f, status: 'failed', errorMessage: String(e && e.message ? e.message : 'Conversion failed') } : f)))
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
    if (lockFormat) {
      setQueue((q) =>
        q.map((f) =>
          f.status === 'pending'
            ? { ...f, output: value, predicted: predictSizeChange(f.file, value) }
            : f
        )
      )
    } else {
      setQueue((q) =>
        q.map((f) => (f.id === id ? { ...f, output: value, predicted: predictSizeChange(f.file, value) } : f))
      )
    }
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

  const formats = useMemo(() => ['image/png', 'image/jpeg', 'image/webp', ...(supportsType('image/avif') ? ['image/avif'] : [])], [])

  useEffect(() => {
    const onPaste = async (e) => {
      const files = []
      if (e.clipboardData && e.clipboardData.items) {
        for (const it of e.clipboardData.items) {
          if (it.kind === 'file') {
            const f = it.getAsFile()
            if (f) files.push(f)
          }
        }
      }
      if (files.length) await addFiles(files)
    }
    window.addEventListener('paste', onPaste)
    return () => window.removeEventListener('paste', onPaste)
  }, [])

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
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs">
              <span>Preset:</span>
              <button
                className={`btn-ghost ${preset === 'fast' ? 'ring-1 ring-indigo-500' : ''}`}
                onClick={() => setPreset('fast')}
                title="Smaller, faster, lower quality"
              >
                Fast
              </button>
              <button
                className={`btn-ghost ${preset === 'quality' ? 'ring-1 ring-indigo-500' : ''}`}
                onClick={() => setPreset('quality')}
                title="Higher quality, larger files"
              >
                High Quality
              </button>
            </div>
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
            <button
              className="btn-ghost"
              onClick={() => setQueue((q) => q.filter((f) => f.status !== 'complete'))}
            >
              Clear Completed
            </button>
            <button
              className="btn-ghost"
              onClick={() => setQueue((q) => q.filter((f) => f.status !== 'pending'))}
            >
              Remove Pending
            </button>
            <button
              className="btn-ghost"
              onClick={() => setQueue((q) => q.filter((f) => f.status !== 'failed'))}
            >
              Remove Failed
            </button>
            <div className="flex items-center gap-1 text-xs ml-2">
              <span>Lock Format</span>
              <button
                className={`btn-ghost ${lockFormat ? 'ring-1 ring-indigo-500' : ''}`}
                onClick={() => setLockFormat((s) => !s)}
              >
                {lockFormat ? 'On' : 'Off'}
              </button>
            </div>
          </div>
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
                  {isImage(f.file) && (
                    <div className="flex items-center gap-2 mr-2">
                      <img
                        src={f.previewUrl}
                        alt="src"
                        className="h-10 w-10 object-cover rounded border border-slate-700"
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect()
                          setZoom({ show: true, url: f.previewUrl, x: rect.right + 8, y: rect.top })
                        }}
                        onMouseLeave={() => setZoom((z) => ({ ...z, show: false }))}
                        onMouseMove={(e) => setZoom((z) => ({ ...z, x: e.clientX + 12, y: e.clientY - 12 }))}
                      />
                      {f.status === 'complete' && (
                        <img
                          src={f.convertedUrl}
                          alt="out"
                          className="h-10 w-10 object-cover rounded border border-green-700"
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect()
                            setZoom({ show: true, url: f.convertedUrl, x: rect.right + 8, y: rect.top })
                          }}
                          onMouseLeave={() => setZoom((z) => ({ ...z, show: false }))}
                          onMouseMove={(e) => setZoom((z) => ({ ...z, x: e.clientX + 12, y: e.clientY - 12 }))}
                        />
                      )}
                    </div>
                  )}
                  <select
                    className="select"
                    value={f.output || ''}
                    onMouseEnter={() => {}}
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
                  <button
                    className="btn-ghost"
                    onClick={() => setQueue((q) => q.filter((x) => x.id !== f.id))}
                  >
                    Remove
                  </button>
                </div>
              </div>

              {isImage(f.file) && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-slate-400">Width</label>
                    <input
                      type="number"
                      min={1}
                      className="input w-full"
                      value={f.targetWidth || ''}
                      placeholder="auto"
                      onChange={(e) =>
                        setQueue((q) => q.map((x) => (x.id === f.id ? { ...x, targetWidth: e.target.value ? parseInt(e.target.value) : null } : x)))
                      }
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Height</label>
                    <input
                      type="number"
                      min={1}
                      className="input w-full"
                      value={f.targetHeight || ''}
                      placeholder="auto"
                      onChange={(e) =>
                        setQueue((q) => q.map((x) => (x.id === f.id ? { ...x, targetHeight: e.target.value ? parseInt(e.target.value) : null } : x)))
                      }
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Quality</label>
                    <input
                      type="range"
                      min={10}
                      max={100}
                      step={1}
                      value={Math.round((f.quality || 0.8) * 100)}
                      onChange={(e) =>
                        setQueue((q) => q.map((x) => (x.id === f.id ? { ...x, quality: parseInt(e.target.value) / 100 } : x)))
                      }
                    />
                  </div>
                </div>
              )}

              {isImage(f.file) && (
                <div className="mt-2 text-xs text-slate-400">
                  {(f.width && f.height) ? `${f.width}×${f.height}px` : ''}
                </div>
              )}

              {f.status === 'processing' && (
                <div className="mt-3">
                  <div className="h-2 w-full bg-slate-700 rounded">
                    <div
                      className="h-2 bg-indigo-500 rounded"
                      style={{ width: `${Math.min(100, Math.max(0, Math.round(f.progress || 0)))}%` }}
                    />
                  </div>
                  <div className="text-xs text-slate-400 mt-1">{Math.round(f.progress || 0)}%</div>
                </div>
              )}

              {f.status === 'complete' && (
                <div className="mt-3 flex items-center justify-between">
                  <a
                    href={f.convertedUrl}
                    download={(f.output && f.output.startsWith('image/'))
                      ? `${(f.name || 'file').replace(/\.[^./]+$/, '')}.${(f.output.split('/')[1] || 'png').replace('jpeg','jpg')}`
                      : f.name}
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
                  <button className="btn-ghost" onClick={() => setQueue((q) => q.filter((x) => x.id !== f.id))}>
                    Clean Now
                  </button>
                </div>
              )}

              {f.status === 'failed' && (
                <div className="mt-3 flex items-center justify-between">
                  <div className="text-xs text-red-400 truncate">{f.errorMessage}</div>
                  <button className="btn-ghost" onClick={() => convertItem(f)}>Retry</button>
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

      {zoom.show && zoom.url && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{ left: zoom.x, top: zoom.y }}
        >
          <img src={zoom.url} className="h-40 w-40 object-contain rounded-lg border border-indigo-500/40 shadow-lg" />
        </div>
      )}
    </div>
  )
}
