"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

type MochiState = 'default' | 'blink' | 'closed' | 'peek' | 'mad' | 'surprised' | 'sleepy';

interface MochiMascotProps {
  status: 'idle' | 'typing' | 'error' | 'success';
  capsLockOn?: boolean;
}

const IMGS = {
  base: '/mochi/original.png',
  eyes: '/mochi/eyes.png',
  blink: '/mochi/blink.png',
  closed: '/mochi/closed.png',
  peek: '/mochi/peek.png',
  mad: '/mochi/mad.png',
  surprised: '/mochi/surprised.png',
  sleepy: '/mochi/sleepy.png',
};

export default function MochiMascot({ status, capsLockOn = false }: MochiMascotProps) {
  const [mochiState, setMochiState] = useState<MochiState>('default');
  const [eyeTransform, setEyeTransform] = useState("translate(0px, 0px)");
  const charWrapRef = useRef<HTMLDivElement>(null);

  // Timers
  const blinkTimerRef = useRef<NodeJS.Timeout | null>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const resetTimerRef = useRef<NodeJS.Timeout | null>(null);

  // --- Core State Management ---
  useEffect(() => {
    // Clear any pending reset if status changes
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }

    if (status === 'error') {
      setMochiState('mad');
      resetTimerRef.current = setTimeout(() => setMochiState('default'), 2500);
    } else if (status === 'success') {
      setMochiState('surprised');
      resetTimerRef.current = setTimeout(() => setMochiState('default'), 1500);
    } else if (status === 'typing') {
      if (capsLockOn) {
        setMochiState('peek');
      } else {
        setMochiState('closed');
      }
    } else {
      // Idle status
      setMochiState('default');
    }
  }, [status, capsLockOn]);

  // --- Blink & Sleepy System ---
  useEffect(() => {
    if (mochiState !== 'default') {
      if (blinkTimerRef.current) clearTimeout(blinkTimerRef.current);
      return;
    }

    const scheduleNextBlink = () => {
      if (blinkTimerRef.current) clearTimeout(blinkTimerRef.current);
      blinkTimerRef.current = setTimeout(() => {
        if (mochiState !== 'default') return;
        
        // Blink
        setMochiState('blink');
        setTimeout(() => {
          setMochiState('default');
          // Double blink?
          if (Math.random() < 0.25) {
            setTimeout(() => {
              setMochiState('blink');
              setTimeout(() => setMochiState('default'), 140);
            }, 60);
          }
        }, 140);

      }, 3000 + Math.random() * 3000);
    };

    scheduleNextBlink();

    return () => {
      if (blinkTimerRef.current) clearTimeout(blinkTimerRef.current);
    };
  }, [mochiState]);

  // --- Idle Sleepy System ---
  useEffect(() => {
    const startIdleTimer = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        setMochiState((prev) => (prev === 'default' ? 'sleepy' : prev));
      }, 10000);
    };

    const resetIdle = () => {
      setMochiState((prev) => {
        if (prev === 'sleepy') return 'default';
        return prev;
      });
      startIdleTimer();
    };

    window.addEventListener('mousemove', resetIdle);
    window.addEventListener('keydown', resetIdle);
    startIdleTimer();

    return () => {
      window.removeEventListener('mousemove', resetIdle);
      window.removeEventListener('keydown', resetIdle);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, []);

  // --- Eye Tracking ---
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (mochiState !== 'default') return;
      if (!charWrapRef.current) return;

      const rect = charWrapRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width * 0.5;
      const cy = rect.top + rect.height * 0.42;

      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const angle = Math.atan2(dy, dx);
      
      const dist = Math.min(Math.sqrt(dx * dx + dy * dy), 220);
      const f = dist / 220;

      const rawX = Math.cos(angle) * f * 14;
      const clampedX = rawX < 0 ? Math.max(rawX, -5) : rawX;
      const moveY = Math.sin(angle) * f * 10;

      setEyeTransform(`translate(${clampedX.toFixed(1)}px, ${moveY.toFixed(1)}px)`);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mochiState]);

  // Determine which expression image to show
  const showEyes = mochiState === 'default';
  const exprSrc = mochiState !== 'default' ? IMGS[mochiState] : null;

  return (
    <div 
      ref={charWrapRef}
      className="relative w-full max-w-[550px] aspect-[5/6] mx-auto cursor-pointer select-none"
      onClick={() => {
        setMochiState('mad');
        if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
        resetTimerRef.current = setTimeout(() => setMochiState('default'), 700);
      }}
    >
      {/* Base Body */}
      <Image 
        src={IMGS.base} 
        alt="Mochi Mascot" 
        fill 
        className="object-contain z-10" 
        priority
      />
      
      {/* Dynamic Eyes */}
      <div 
        className="absolute inset-0 z-20 transition-transform duration-[50ms] linear"
        style={{ transform: eyeTransform, display: showEyes ? 'block' : 'none' }}
      >
        <Image src={IMGS.eyes} alt="" fill className="object-contain" priority />
      </div>

      {/* Expression Overlay */}
      {exprSrc && (
        <Image 
          src={exprSrc} 
          alt={mochiState} 
          fill 
          className="object-contain z-30 transition-opacity duration-200" 
          priority
        />
      )}
    </div>
  );
}
