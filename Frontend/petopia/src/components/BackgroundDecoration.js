'use client'

import React from 'react'

const CustomBackgroundDecoration = () => {
  // Array of SVG file names in the public/background folder
  const svgFiles = ['cat.svg', 'dog.svg','cat.svg','cat.svg','cat.svg','cat.svg','cat.svg', ]

  // Generate random positions for each SVG
  const svgPositions = svgFiles.map(() => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
  }))

  return (
    <div className="fixed inset-0 pointer-events-none z-0 opacity-20">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="blur-filter">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1" />
          </filter>
          <pattern id="custom-pattern" x="0" y="0" width="100%" height="100%" patternUnits="userSpaceOnUse">
            {svgFiles.map((file, index) => (
              <g key={file} className={`floating-${index + 1}`} filter="url(#blur-filter)">
                <image 
                  href={`/background/${file}`} 
                  width="100" 
                  height="100" 
                  x={`${svgPositions[index].x}%`} 
                  y={`${svgPositions[index].y}%`}
                />
              </g>
            ))}
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#custom-pattern)" />
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
      `}</style>
    </div>
  )
}

export default CustomBackgroundDecoration

