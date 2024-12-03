'use client'

import React from 'react';

const BackgroundDecoration = () => {
    return (
        <div className="fixed inset-0 pointer-events-none z-0 opacity-20">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <filter id="blur-filter">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
                    </filter>
                    <pattern id="pet-pattern" x="0" y="0" width="400" height="400" patternUnits="userSpaceOnUse">
                        <g className="floating" filter="url(#blur-filter)">
                            {/* Dog */}
                            <path 
                                d="M50 120 Q 65 90, 80 120 Q 95 90, 110 120 L 110 140 Q 80 160, 50 140 Z" 
                                fill="#A0522D" 
                            />
                            <circle cx="70" cy="115" r="4" fill="#FFF" />
                            <circle cx="90" cy="115" r="4" fill="#FFF" />
                            <path d="M75 125 Q 80 130, 85 125" fill="none" stroke="#FFF" strokeWidth="2" />
                            
                            {/* Cat */}
                            <path 
                                d="M200 60 L 220 40 L 240 60 L 230 70 Q 240 80, 230 90 L 240 100 L 220 120 L 200 100 L 210 90 Q 200 80, 210 70 Z" 
                                fill="#A0522D" 
                            />
                            <circle cx="215" cy="75" r="3" fill="#FFF" />
                            <circle cx="225" cy="75" r="3" fill="#FFF" />
                            <path d="M217 85 L 223 85" stroke="#FFF" strokeWidth="2" />
                            
                            {/* Hamster */}
                            <circle cx="320" cy="280" r="28" fill="#CD853F" />
                            <circle cx="310" cy="270" r="4" fill="#FFF" />
                            <circle cx="330" cy="270" r="4" fill="#FFF" />
                            <path d="M315 285 Q 320 292, 325 285" fill="none" stroke="#FFF" strokeWidth="2" />
                            <ellipse cx="320" cy="300" rx="12" ry="6" fill="#FFD700" />
                            
                            {/* Fish */}
                            <path 
                                d="M40 350 Q 60 340, 80 350 T 120 350 Q 100 370, 80 350 T 40 350 Z" 
                                fill="#FFA07A" 
                            />
                            <circle cx="110" cy="345" r="3" fill="#FFF" />
                            
                            {/* Bird */}
                            <path d="M350 130 Q 370 110, 390 130 L 370 150 Z" fill="#FFDAB9" />
                            <circle cx="375" cy="125" r="3" fill="#FFF" />
                            <path d="M365 140 Q 370 145, 375 140" fill="none" stroke="#FFF" strokeWidth="2" />
                            
                            {/* Rabbit */}
                            <ellipse cx="150" cy="210" rx="24" ry="34" fill="#CDAA7D" />
                            <ellipse cx="135" cy="180" rx="10" ry="22" fill="#CDAA7D" />
                            <ellipse cx="165" cy="180" rx="10" ry="22" fill="#CDAA7D" />
                            <circle cx="145" cy="200" r="3" fill="#FFF" />
                            <circle cx="155" cy="200" r="3" fill="#FFF" />
                            <path d="M147 210 Q 150 215, 153 210" fill="none" stroke="#FFF" strokeWidth="2" />
                            
                            {/* Paw prints */}
                            <g fill="#CDAA7D">
                                <circle cx="50" cy="50" r="5" />
                                <circle cx="65" cy="55" r="5" />
                                <circle cx="60" cy="40" r="5" />
                                <circle cx="75" cy="45" r="5" />
                                <ellipse cx="62" cy="60" rx="10" ry="7" />
                            </g>
                            
                            {/* Pet toy (ball) */}
                            <circle cx="250" cy="360" r="18" fill="#A0522D" />
                            <path 
                                d="M235 360 Q 250 345, 265 360 Q 250 375, 235 360" 
                                fill="none" 
                                stroke="#FFF" 
                                strokeWidth="2" 
                            />
                        </g>
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#pet-pattern)" />
            </svg>
            <style jsx>{`
                @keyframes float {
                    0% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(15px) rotate(3deg); }
                    100% { transform: translateY(0px) rotate(0deg); }
                }
                .floating {
                    animation: float 12s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default BackgroundDecoration;
