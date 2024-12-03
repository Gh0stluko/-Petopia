'use client'

import React, { useState, useEffect } from 'react'

const CustomBackgroundDecoration = () => {
  const [mounted, setMounted] = useState(false)

  // Конфігурація SVG файлів та їх кількості
  const svgConfig = [
    { file: 'cat.svg', count: 5 },
    { file: 'dog.svg', count: 2 },
  ]

  // Генерація екземплярів SVG на основі конфігурації
  const svgInstances = svgConfig.flatMap(({ file, count }) =>
    Array(count).fill(file)
  )

  // Кількість рядків і стовпців для розміщення SVG
  const gridRows = 3
  const gridCols = 3

  // Генерація позицій для кожного SVG екземпляра
  const [svgPositions, setSvgPositions] = useState([])

  useEffect(() => {
    setMounted(true)

    // Створення сітки для розміщення SVG
    const grid = Array(gridRows).fill().map(() => Array(gridCols).fill(false))

    // Розміщення SVG на сітці
    const positions = svgInstances.map((_, index) => {
      let row, col
      do {
        row = Math.floor(Math.random() * gridRows)
        col = Math.floor(Math.random() * gridCols)
      } while (grid[row][col])

      grid[row][col] = true

      return {
        x: (col / gridCols) * 100 + Math.random() * (100 / gridCols / 2),
        y: (row / gridRows) * 100 + Math.random() * (100 / gridRows / 2),
      }
    })

    setSvgPositions(positions)
  }, [])

  if (!mounted) {
    return null // Повертаємо null на стороні сервера
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-0 opacity-20">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="blur-filter">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" />
          </filter>
        </defs>
        {svgInstances.map((file, index) => (
          <image
            key={`${file}-${index}`}
            href={`/background/${file}`}
            width="100"
            height="100"
            x={`${svgPositions[index]?.x || 0}%`}
            y={`${svgPositions[index]?.y || 0}%`}
            className="brown-svg"
            style={{ filter: 'url(#blur-filter)' }}
          />
        ))}
      </svg>
      <style jsx>{`
        @keyframes float-1 {
          0% { transform: translate(0px, 0px) rotate(0deg); }
          50% { transform: translate(15px, 15px) rotate(3deg); }
          100% { transform: translate(0px, 0px) rotate(0deg); }
        }
        @keyframes float-2 {
          0% { transform: translate(0px, 0px) rotate(0deg); }
          50% { transform: translate(-15px, 10px) rotate(-2deg); }
          100% { transform: translate(0px, 0px) rotate(0deg); }
        }
        .floating-1 {
          animation: float-1 12s ease-in-out infinite;
        }
        .floating-2 {
          animation: float-2 15s ease-in-out infinite;
        }
        .brown-svg {
          filter: url(#blur-filter);
          fill: brown;
        }
      `}</style>
    </div>
  )
}

export default CustomBackgroundDecoration