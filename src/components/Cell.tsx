import React, { useEffect, useRef, useState } from 'react';
import type { Cell as CellType } from '../types/tetris';
import styles from './Cell.module.css';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
  opacity: number;
}

interface CellProps {
  cell: CellType;
  size?: number;
  isClearing?: boolean;
}

const Cell: React.FC<CellProps> = ({ cell, size = 30, isClearing = false }) => {
  const cellRef = useRef<HTMLDivElement>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const animationRef = useRef<number>(0);
  const lastClearingRef = useRef(false);

  // Handle the clearing animation
  useEffect(() => {
    if (isClearing && !lastClearingRef.current && cell.type) {
      // Create particles
      const newParticles: Particle[] = [];
      const particleCount = 8 + Math.floor(Math.random() * 5);
      
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount;
        const speed = 0.5 + Math.random() * 2;
        
        newParticles.push({
          id: Date.now() + i,
          x: 0.5,
          y: 0.5,
          size: 0.2 + Math.random() * 0.3,
          speedX: Math.cos(angle) * speed,
          speedY: Math.sin(angle) * speed,
          color: cell.color || '#ffffff',
          opacity: 1
        });
      }
      
      setParticles(newParticles);
      
      // Animate particles
      const startTime = Date.now();
      const duration = 800; // ms
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        setParticles(prevParticles => 
          prevParticles.map(p => ({
            ...p,
            x: p.x + p.speedX * 0.016,
            y: p.y + p.speedY * 0.016 + 0.05, // Add gravity
            opacity: 1 - progress,
            size: p.size * (1 + progress * 2)
          }))
        );
        
        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          setParticles([]);
        }
      };
      
      animationRef.current = requestAnimationFrame(animate);
    }
    
    lastClearingRef.current = isClearing;
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isClearing, cell.type, cell.color]);

  // Don't render empty cells in the final board
  if (!cell.type) {
    return (
      <div
        className={styles.cell}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      />
    );
  }

  // Don't render empty cells in the final board
  if (!cell.type) {
    return (
      <div
        className={styles.cell}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      />
    );
  }

  return (
    <div 
      ref={cellRef}
      className={`${styles.cell} ${isClearing ? styles.clearing : ''}`}
      style={{
        '--size': `${size}px`,
        '--color': cell.color,
      } as React.CSSProperties}
    >
      <div className={styles.innerCell}>
        {particles.map(particle => (
          <div 
            key={particle.id}
            className={styles.particle}
            style={{
              '--particle-x': `${particle.x * 100}%`,
              '--particle-y': `${particle.y * 100}%`,
              '--particle-size': `${particle.size}em`,
              '--particle-color': particle.color,
              '--particle-opacity': particle.opacity,
            } as React.CSSProperties}
          />
        ))}
      </div>
      <div className={styles.highlight} />
    </div>
  );
};

export default Cell;
