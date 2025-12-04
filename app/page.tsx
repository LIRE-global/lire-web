'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import GlobeComponent from './components/Globe';
import StatsCounter from './components/StatsCounter';
import RegistrationForm from './components/RegistrationForm';

export default function Home() {
  const [particles, setParticles] = useState<Array<{ left: number; top: number; duration: number; delay: number }>>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // 只在客户端生成随机位置，避免 hydration 错误
    // 使用 setTimeout 延迟设置，避免同步 setState
    const timer = setTimeout(() => {
      setParticles(
        Array.from({ length: 20 }, () => ({
          left: Math.random() * 100,
          top: Math.random() * 100,
          duration: 3 + Math.random() * 2,
          delay: Math.random() * 2,
        }))
      );
    }, 0);
    
    return () => clearTimeout(timer);
  }, []);

  const playPronunciation = () => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    // 发音类似 Larry，但第二个音节是 "ri" (短音 i)
    const utterance = new SpeechSynthesisUtterance('liri');
    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-900 via-gray-800 to-gray-900 text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-gray-900/80 backdrop-blur-md border-b border-green-500/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-6 md:space-x-8">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🔋</span>
              <span className="text-xl font-bold bg-linear-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                LIRE Network
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <a href="#home" className="hover:text-green-400 transition-colors">Home</a>
              <a href="#technology" className="hover:text-green-400 transition-colors">Technology</a>
              <a href="#network" className="hover:text-green-400 transition-colors">Network</a>
              <a href="#stats" className="hover:text-green-400 transition-colors">Stats</a>
              <a href="#news" className="hover:text-green-400 transition-colors">News</a>
              {/* <button onClick={() => setIsModalOpen(true)} className="hover:text-green-400 transition-colors">Join Us</button> */}
            </div>
          </div>
          <div className="flex items-center">
            <motion.a
              href="https://jup.ag/swap"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-linear-to-r from-green-500 to-emerald-500 rounded-lg font-semibold hover:shadow-lg hover:shadow-green-500/50 transition-all text-sm md:text-base"
            >
              Buy LIRE
            </motion.a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center pt-20">
        <div className="absolute inset-0 bg-linear-to-r from-green-500/10 via-transparent to-emerald-500/10"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="bg-linear-to-r from-green-400 via-emerald-400 to-green-500 bg-clip-text text-transparent">
                  LIRE
                </span>
                <span className="text-xl md:text-2xl font-normal text-gray-400 italic">
                  /ˈliri/
                </span>
                <button
                  onClick={playPronunciation}
                  disabled={isPlaying}
                  className="text-gray-400 hover:text-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center w-6 h-6 md:w-7 md:h-7 shrink-0"
                  aria-label="play pronunciation"
                >
                  <Volume2 className="w-full h-full" />
                </button>
              </div>
              <span className="text-white block mt-1">Lithium Recycle Global Network</span>
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Powering the Lithium-ion Battery Recycling Network and circular economy ecosystem.
            </p>
            <div className="flex flex-wrap gap-4">
              <motion.button
                onClick={() => setIsModalOpen(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-linear-to-r from-green-500 to-emerald-500 rounded-lg font-semibold hover:shadow-lg hover:shadow-green-500/50 transition-all"
              >
                Join Now
              </motion.button>
              <motion.a
                href="https://developer.doura.fi/lire/"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 border-2 border-green-500 rounded-lg font-semibold hover:bg-green-500/10 transition-all"
              >
                View Whitepaper
              </motion.a>
            </div>
          </div>

          <div className="h-[500px] lg:h-[600px]">
            <GlobeComponent />
          </div>
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {particles.map((particle, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-green-400 rounded-full"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                delay: particle.delay,
              }}
            />
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-20 px-6 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-linear-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Real-Time Statistics
              </span>
            </h2>
            <p className="text-gray-400 text-lg">
              Global Lithium Battery Recycling Network Live Data
            </p>
          </div>
          <StatsCounter />
        </div>
      </section>

      {/* Technology Section */}
      <section id="technology" className="py-20 px-6 bg-gray-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-linear-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Our Technology
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-3xl mx-auto">
              Advanced blockchain-powered infrastructure enabling efficient, transparent, and incentivized lithium battery recycling worldwide
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {[
              {
                icon: '🔗',
                title: 'Blockchain Infrastructure',
                description: 'Built on Solana blockchain for fast, low-cost transactions and transparent tracking of recycling activities',
              },
              {
                icon: '📊',
                title: 'Smart Contracts',
                description: 'Automated reward distribution and verification system ensuring fair compensation for all participants',
              },
              {
                icon: '🌐',
                title: 'Decentralized Network',
                description: 'Peer-to-peer network connecting recycling stations, manufacturers, and consumers globally',
              },
              {
                icon: '🔐',
                title: 'Secure & Transparent',
                description: 'Immutable records of all recycling transactions with full traceability and accountability',
              },
            ].map((tech, index) => (
              <div
                key={index}
                className="bg-linear-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-green-500/20 hover:border-green-500/40 transition-all duration-300 hover:scale-105"
              >
                <div className="text-4xl mb-3">{tech.icon}</div>
                <h3 className="text-xl font-bold mb-2 text-green-400">{tech.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{tech.description}</p>
              </div>
            ))}
          </div>

          {/* Process Flow */}
          <div className="mt-20">
            <h3 className="text-3xl font-bold text-center mb-12 text-green-400">How It Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                {
                  step: '01',
                  title: 'Collection',
                  description: 'Users deposit used batteries at certified recycling stations worldwide',
                },
                {
                  step: '02',
                  title: 'Verification',
                  description: 'Smart contracts verify and record battery data on the blockchain',
                },
                {
                  step: '03',
                  title: 'Processing',
                  description: 'Batteries are safely recycled, extracting valuable materials',
                },
                {
                  step: '04',
                  title: 'Rewards',
                  description: 'Participants receive LIRE tokens as incentives for contributing to the circular economy',
                },
              ].map((step, index) => (
                <div
                  key={index}
                  className="relative"
                >
                  {index < 3 && (
                    <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-linear-to-r from-green-500/50 to-transparent z-0" style={{ width: 'calc(100% - 2rem)' }} />
                  )}
                  <div className="relative bg-linear-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-green-500/20 hover:border-green-500/40 transition-all duration-300">
                    <div className="text-5xl font-bold text-green-400/30 mb-2">{step.step}</div>
                    <h4 className="text-xl font-bold mb-2 text-green-400">{step.title}</h4>
                    <p className="text-gray-400 text-sm">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Network Section */}
      <section id="network" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-linear-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Global Network
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-3xl mx-auto">
              Connecting recycling facilities, manufacturers, and communities across continents to build a sustainable battery ecosystem
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[
              {
                icon: '🌍',
                title: 'Global Network',
                description: 'Building a worldwide lithium battery recycling and carbon reduction network, connecting recycling stations across the globe',
                stats: '156+ Stations',
              },
              {
                icon: '♻️',
                title: 'Circular Economy',
                description: 'Promoting the circular use of lithium battery materials, reducing resource waste, and protecting the environment',
                stats: '85K+ Tons Recycled',
              },
              {
                icon: '💰',
                title: 'Blockchain Incentives',
                description: 'Decentralized incentive mechanism based on Solana blockchain, rewarding individuals and organizations participating in recycling',
                stats: '$2.5M+ Rewarded',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-linear-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-green-500/20 hover:border-green-500/40 transition-all duration-300 hover:scale-105"
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-2xl font-bold mb-3 text-green-400">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed mb-4">{feature.description}</p>
                <div className="text-green-400 font-semibold">{feature.stats}</div>
              </div>
            ))}
          </div>

          {/* Key Regions */}
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-center mb-8 text-green-400">Active Regions</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {['Asia-Pacific', 'North America', 'Europe', 'Latin America', 'Africa'].map((region, index) => (
                <div
                  key={index}
                  className="bg-linear-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-4 text-center border border-green-500/20 hover:border-green-500/40 transition-all"
                >
                  <div className="text-gray-300 font-medium">{region}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-gray-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-linear-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Why Choose LIRE
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: '⚡',
                title: 'High Efficiency',
                description: 'Streamlined process with blockchain verification reduces processing time by up to 60%',
              },
              {
                icon: '🌱',
                title: 'Environmental Impact',
                description: 'Significant carbon reduction through efficient recycling and material recovery',
              },
              {
                icon: '💎',
                title: 'Material Recovery',
                description: 'Up to 95% recovery rate of valuable battery materials including lithium, cobalt, and nickel',
              },
              {
                icon: '🔒',
                title: 'Data Security',
                description: 'Enterprise-grade security with blockchain immutability protecting all transaction records',
              },
              {
                icon: '📈',
                title: 'Scalable Solution',
                description: 'Modular infrastructure that grows with the network, supporting millions of transactions',
              },
              {
                icon: '🤝',
                title: 'Community Driven',
                description: 'Built by and for the community, with transparent governance and fair reward distribution',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-linear-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-green-500/20 hover:border-green-500/40 transition-all duration-300 hover:scale-105"
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-2xl font-bold mb-3 text-green-400">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* News Section */}
      <section id="news" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-linear-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Latest Updates
              </span>
            </h2>
            <p className="text-gray-400 text-lg">
              Stay informed about our progress and the future of battery recycling
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                date: '2025-12-04',
                title: 'Rapid Growth: Community Engagement Soars',
                description: 'Following the LIRE token launch, community participation has surged with thousands of new members joining the network in just two days.',
                category: 'Community',
              },
              {
                date: '2025-12-03',
                title: 'LIRE Token Launch Success',
                description: 'LIRE token officially launched on December 2nd, marking a major milestone in building the decentralized battery recycling economy.',
                category: 'Launch',
              },
              {
                date: '2025-12-02',
                title: 'LIRE Token Official Launch',
                description: 'LIRE Network officially launches its native token, enabling decentralized incentives for global lithium battery recycling efforts.',
                category: 'Launch',
              },
            ].map((news, index) => (
              <div
                key={index}
                className="bg-linear-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-green-500/20 hover:border-green-500/40 transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-green-400 font-semibold uppercase tracking-wide">{news.category}</span>
                  <span className="text-xs text-gray-500">{news.date}</span>
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">{news.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{news.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-linear-to-r from-green-500/10 via-emerald-500/10 to-green-500/10">
        <div className="max-w-4xl mx-auto text-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-linear-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Join the Revolution
              </span>
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Be part of the global movement transforming battery waste into valuable resources. Together, we&apos;re building a sustainable future.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <motion.button
                onClick={() => setIsModalOpen(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-linear-to-r from-green-500 to-emerald-500 rounded-lg font-semibold hover:shadow-lg hover:shadow-green-500/50 transition-all"
              >
                Get Started
              </motion.button>
              <motion.a
                href="https://developer.doura.fi/lire/"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 border-2 border-green-500 rounded-lg font-semibold hover:bg-green-500/10 transition-all"
              >
                Learn More
              </motion.a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-green-500/20 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-2xl">🔋</span>
                <span className="text-xl font-bold bg-linear-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  LIRE Network
                </span>
              </div>
              <p className="text-gray-400 text-sm">
                Building the Global On-Chain Infrastructure for Lithium Battery Circular Economy
              </p>
            </div>
            <div>
              <h4 className="text-green-400 font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#home" className="text-gray-400 hover:text-green-400 transition-colors">Home</a></li>
                <li><a href="#technology" className="text-gray-400 hover:text-green-400 transition-colors">Technology</a></li>
                <li><a href="#network" className="text-gray-400 hover:text-green-400 transition-colors">Network</a></li>
                <li><a href="#stats" className="text-gray-400 hover:text-green-400 transition-colors">Statistics</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-green-400 font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="https://developer.doura.fi/lire/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-green-400 transition-colors">Whitepaper</a></li>
                <li><a href="#news" className="text-gray-400 hover:text-green-400 transition-colors">Latest News</a></li>
                <li><button onClick={() => setIsModalOpen(true)} className="text-gray-400 hover:text-green-400 transition-colors">Join Us</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-green-400 font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="https://jup.ag/swap" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-green-400 transition-colors">Buy LIRE</a></li>
                <li className="text-gray-400">Community</li>
                <li className="text-gray-400">Support</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-green-500/20 pt-8 text-center">
            <p className="text-gray-400 mb-2">
              Lithium Recycling Global - Building the Future of Green Energy
            </p>
            <p className="text-sm text-gray-500">
              © 2025 LIRE Network. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Join Us Modal */}
      {isModalOpen && (
        <div
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl"
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 z-10 text-gray-400 hover:text-white transition-colors text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full bg-gray-800/50 hover:bg-gray-700/50"
            >
              ×
            </button>
            <RegistrationForm onSuccess={() => setIsModalOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
