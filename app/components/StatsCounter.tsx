'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Stat {
  value: number;
  suffix: string;
  label: string;
  icon: string;
}

const stats: Stat[] = [
  { value: 1250000, suffix: '+', label: 'Batteries Charging', icon: '🔋' },
  { value: 85000, suffix: ' tons', label: 'Batteries Recycled', icon: '♻️' },
  { value: 125000, suffix: ' tons', label: 'Carbon Reduced', icon: '🌱' },
  { value: 156, suffix: '+', label: 'Global Stations', icon: '🌍' },
];

export default function StatsCounter() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-sm rounded-2xl p-6 border border-green-500/20 hover:border-green-500/40 transition-all duration-300 hover:scale-105"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="text-4xl">{stat.icon}</div>
            <div className="text-sm text-gray-400">{stat.label}</div>
          </div>
          <div className="text-3xl font-bold text-green-400 tracking-tight">
            {stat.value.toLocaleString()}{stat.suffix}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
