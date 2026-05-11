"use client"

import { useEffect, useRef } from "react"

interface TesseractProps {
  size?: number
  className?: string
}

export function Tesseract({ size = 40, className }: TesseractProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")!
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = size * dpr
    canvas.height = size * dpr
    ctx.scale(dpr, dpr)

    let angle = 0
    let animId: number

    const TAU = Math.PI * 2
    const nodes3D: [number, number, number][] = []

    // Center node
    nodes3D.push([0, 0, 0])

    // Inner ring (6 nodes) — alternating Z for 3D depth
    for (let i = 0; i < 6; i++) {
      const a = (TAU / 6) * i - Math.PI / 2
      const z = i % 2 === 0 ? 0.8 : -0.8
      nodes3D.push([Math.cos(a), Math.sin(a), z])
    }

    // Outer ring (6 nodes) — opposite Z pattern, stronger depth
    for (let i = 0; i < 6; i++) {
      const a = (TAU / 6) * i - Math.PI / 2 + TAU / 12
      const z = i % 2 === 0 ? -1.2 : 1.2
      nodes3D.push([Math.cos(a) * 2, Math.sin(a) * 2, z])
    }

    // All 78 connections
    const edges: [number, number][] = []
    for (let i = 0; i < 13; i++) {
      for (let j = i + 1; j < 13; j++) {
        edges.push([i, j])
      }
    }

    function rotateY(x: number, y: number, z: number, a: number): [number, number, number] {
      const c = Math.cos(a)
      const s = Math.sin(a)
      return [x * c + z * s, y, -x * s + z * c]
    }

    function rotateX(x: number, y: number, z: number, a: number): [number, number, number] {
      const c = Math.cos(a)
      const s = Math.sin(a)
      return [x, y * c - z * s, y * s + z * c]
    }

    function draw() {
      ctx.clearRect(0, 0, size, size)
      const cx = size / 2
      const cy = size / 2
      const scale = size * 0.16

      const breath = Math.sin(angle * 0.5) * 0.4
      const camDist = 6 - breath * 2

      const projected = nodes3D.map(([x, y, z]) => {
        let [rx, ry, rz] = rotateY(x, y, z, angle)
        ;[rx, ry, rz] = rotateX(rx, ry, rz, angle * 0.3)
        const perspective = camDist / (camDist - rz)
        return {
          px: cx + rx * scale * perspective,
          py: cy + ry * scale * perspective,
          depth: perspective,
        }
      })

      // Sort edges by average depth (back to front)
      const sortedEdges = [...edges].sort((a, b) => {
        const da = (projected[a[0]].depth + projected[a[1]].depth) / 2
        const db = (projected[b[0]].depth + projected[b[1]].depth) / 2
        return da - db
      })

      sortedEdges.forEach(([i, j]) => {
        const a = projected[i]
        const b = projected[j]
        const avgDepth = (a.depth + b.depth) / 2
        const alpha = Math.max(0.04, Math.min(0.55, (avgDepth - 0.7) * 0.5))

        ctx.beginPath()
        ctx.moveTo(a.px, a.py)
        ctx.lineTo(b.px, b.py)
        ctx.strokeStyle = `rgba(124, 92, 252, ${alpha})`
        ctx.lineWidth = Math.max(0.2, avgDepth * 0.8)
        ctx.stroke()
      })

      // Sort nodes by depth (back to front)
      const sortedNodes = projected.map((p, i) => ({ ...p, i })).sort((a, b) => a.depth - b.depth)

      sortedNodes.forEach(({ px, py, depth, i }) => {
        const r = i === 0
          ? Math.max(2, depth * 3.5)
          : i <= 6
            ? Math.max(1.2, depth * 2.5)
            : Math.max(1, depth * 2)

        const alpha = Math.max(0.3, Math.min(1, depth * 0.9))

        ctx.beginPath()
        ctx.arc(px, py, r, 0, TAU)

        if (i === 0) {
          ctx.fillStyle = `rgba(124, 92, 252, ${alpha})`
        } else if (i <= 6) {
          ctx.fillStyle = `rgba(192, 132, 252, ${alpha})`
        } else {
          ctx.fillStyle = `rgba(168, 112, 252, ${alpha * 0.8})`
        }
        ctx.fill()
      })

      angle += 0.008
      animId = requestAnimationFrame(draw)
    }

    draw()

    return () => cancelAnimationFrame(animId)
  }, [size])

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size }}
    />
  )
}
