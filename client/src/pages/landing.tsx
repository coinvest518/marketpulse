import { useState, useEffect, useRef } from "react"
import { motion, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring } from "framer-motion"
import {
  Menu,
  X,
  ArrowRight,
  Sparkles,
  ChevronDown,
  Brain,
  Database,
  MessageSquare,
  Play,
  BarChart3,
  Globe,
  Target,
} from "lucide-react"

export default function UltraModernLanding() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isLoaded, setIsLoaded] = useState(false)
  const [activeSection, setActiveSection] = useState<number | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll()

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { stiffness: 100, damping: 30 })
  const springY = useSpring(mouseY, { stiffness: 100, damping: 30 })

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"])
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
  const scaleProgress = useTransform(scrollYProgress, [0, 0.5], [1, 1.1])

  const handleLogin = async () => {
    try {
      console.log('Starting Google sign-in...');
      const { signInWithGoogle } = await import('@/lib/firebase');
      const result = await signInWithGoogle();
      console.log('Sign-in successful:', result.user?.email);
      // User will be redirected automatically by the auth state change
    } catch (error) {
      console.error('Error signing in:', error);
      // Show more detailed error information
      if (error instanceof Error) {
        alert(`Sign-in failed: ${error.message}\n\nPlease check the FIREBASE_SETUP.md file for setup instructions.`);
      } else {
        alert('Sign-in failed. Please check your Firebase configuration in FIREBASE_SETUP.md');
      }
    }
  };

  // Development mode login bypass (remove in production)
  const handleDevLogin = () => {
    console.log('Using development mode login...');
    // Create a mock user for development
    const mockUser = {
      id: 'dev-user-123',
      email: 'developer@example.com',
      firstName: 'Dev',
      lastName: 'User',
      profileImageUrl: 'https://via.placeholder.com/150'
    };
    
    // Store mock token
    localStorage.setItem('firebase_token', 'dev-mock-token');
    localStorage.setItem('dev_user', JSON.stringify(mockUser));
    
    // Reload to trigger auth state change
    window.location.reload();
  };

  useEffect(() => {
    setIsLoaded(true)

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e
      setMousePosition({ x: clientX, y: clientY })
      mouseX.set(clientX)
      mouseY.set(clientY)
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [mouseX, mouseY])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 30, opacity: 0, scale: 0.95 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20,
      },
    },
  }


  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"
        />
      </div>
    )
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-black text-white overflow-hidden relative font-sans">
      {/* Advanced Background System */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Animated Grid */}
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(16, 185, 129, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(16, 185, 129, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: "50px 50px",
              transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`,
              backgroundPositionY: backgroundY.get(),
              scale: scaleProgress.get(),
            }}
          />
        </div>

        {/* Dynamic Orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-emerald-500/30 to-teal-500/30 rounded-full blur-3xl"
          animate={{
            x: springX.get() * 0.02,
            y: springY.get() * 0.02,
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY }}
        />

        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-full blur-3xl"
          animate={{
            x: springX.get() * -0.03,
            y: springY.get() * -0.02,
            scale: [1.2, 1, 1.2],
          }}
          transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY }}
        />

        <motion.div
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-2xl"
          animate={{
            x: springX.get() * 0.015,
            y: springY.get() * 0.025,
            rotate: [0, 360],
          }}
          transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />

        {/* Floating Particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-emerald-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, -100, -20],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Number.POSITIVE_INFINITY,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Ultra-Modern Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="fixed top-0 w-full z-50 backdrop-blur-2xl bg-black/20 border-b border-emerald-500/20"
      >
        <div className="max-w-8xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <motion.div whileHover={{ scale: 1.05 }} className="flex items-center space-x-3">
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-lg flex items-center justify-center"
                >
                  <Brain className="w-6 h-6 text-black" />
                </motion.div>
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-lg blur opacity-30" />
              </div>
              <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                SentimentAI
              </span>
            </motion.div>

            {/* Advanced Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {["Platform", "Agents", "Analytics", "Pricing", "Docs"].map((item, index) => (
                <motion.a
                  key={item}
                  href="#"
                  className={`relative group text-white/80 hover:text-white transition-all duration-300 font-medium text-[15px] tracking-wide ${activeSection === index ? 'text-white' : ''}`}
                  whileHover={{ y: -2 }}
                  onHoverStart={() => setActiveSection(index)}
                  onMouseLeave={() => setActiveSection(null)}
                >
                  <span className="relative z-10">{item}</span>
                  <motion.div
                    className="absolute -bottom-2 left-0 w-full h-0.5 bg-gradient-to-r from-emerald-400 to-cyan-400 origin-left"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: activeSection === index ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                  />
                  <motion.div
                    className="absolute -inset-2 bg-emerald-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    layoutId="navHover"
                  />
                </motion.a>
              ))}
            </nav>

            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogin}
                className="hidden lg:block px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full font-semibold text-[15px] tracking-wide hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300"
              >
                Start Free Trial
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 rounded-lg bg-white/10 backdrop-blur-sm"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-black/90 backdrop-blur-2xl border-t border-emerald-500/20"
            >
              <div className="px-6 py-8 space-y-6">
                {["Platform", "Agents", "Analytics", "Pricing", "Docs"].map((item, index) => (
                  <motion.a
                    key={item}
                    href="#"
                    className="block text-white/80 hover:text-white transition-colors duration-300 text-lg font-medium tracking-wide"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ x: 10 }}
                  >
                    {item}
                  </motion.a>
                ))}
                <motion.button
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogin}
                  className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 px-6 py-4 rounded-full font-semibold mt-6 text-[15px] tracking-wide"
                >
                  Start Free Trial
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Revolutionary Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-24">
        <motion.div style={{ y: textY }} className="text-center max-w-7xl mx-auto">
          {/* Floating Badge */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-12 inline-block"
          >
            <div className="relative">
              <div className="flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 backdrop-blur-xl border border-emerald-500/30">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                >
                  <Sparkles className="w-5 h-5 mr-3 text-emerald-400" />
                </motion.div>
                <span className="text-sm font-semibold tracking-wider uppercase bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  Next-Gen AI Market Intelligence
                </span>
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/30 to-cyan-500/30 rounded-full blur-lg opacity-50" />
            </div>
          </motion.div>

          {/* Revolutionary Headline */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="mb-10"
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-[0.85] mb-8 tracking-tighter">
              <span className="block bg-gradient-to-r from-white via-emerald-200 to-cyan-200 bg-clip-text text-transparent">
                Take Control of
              </span>
              <motion.span
                className="block bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY }}
                style={{ backgroundSize: "200% 200%" }}
              >
                Market Intelligence
              </motion.span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg md:text-xl lg:text-2xl text-white/80 mb-16 max-w-5xl mx-auto leading-relaxed font-light tracking-wide"
          >
            SentimentAI offers a seamless, intelligent experience for analyzing market sentiment.{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent font-medium">
              Real-time insights, optimized accuracy, and premium AI agents.
            </span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20"
          >
            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: "0 25px 50px rgba(16, 185, 129, 0.4)",
              }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogin}
              className="group relative px-10 py-5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full font-bold text-lg tracking-wide overflow-hidden"
            >
              <span className="relative z-10 flex items-center space-x-3">
                <span>Launch Platform</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-emerald-500"
                initial={{ x: "100%" }}
                whileHover={{ x: "0%" }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group px-10 py-5 rounded-full font-bold text-lg tracking-wide border-2 border-emerald-500/50 hover:border-emerald-500 hover:bg-emerald-500/10 transition-all duration-300 flex items-center space-x-3"
            >
              <Play className="w-5 h-5" />
              <span>Watch Demo</span>
            </motion.button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="mb-16"
          >
            <p className="text-white/60 text-sm font-medium tracking-wider uppercase mb-8">
              Trusted by Industry Leaders
            </p>
            <div className="flex justify-center items-center flex-wrap gap-8 md:gap-12">
              {[
                { name: "Microsoft", logo: "🔷" },
                { name: "Google", logo: "🟨" },
                { name: "Amazon", logo: "🟠" },
                { name: "Meta", logo: "🔵" },
                { name: "OpenAI", logo: "⚡" }
              ].map((company, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 + index * 0.1 }}
                  whileHover={{ scale: 1.1, opacity: 1 }}
                  className="flex items-center space-x-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-6 py-4 hover:bg-white/10 transition-all duration-300"
                >
                  <span className="text-2xl">{company.logo}</span>
                  <span className="text-white/60 font-semibold text-base tracking-wide">
                    {company.name}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Floating Stats */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
          >
            {[
              { number: "99.9%", label: "Accuracy Rate", icon: Target },
              { number: "10M+", label: "Data Points Analyzed", icon: Database },
              { number: "24/7", label: "Real-time Monitoring", icon: Globe },
            ].map((stat, index) => (
              <motion.div key={index} whileHover={{ y: -5, scale: 1.05 }} className="relative group">
                <div className="bg-white/5 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
                  <div className="flex items-center justify-center mb-6">
                    <stat.icon className="w-8 h-8 text-emerald-400" />
                  </div>
                  <div className="text-3xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-3 tracking-tight">
                    {stat.number}
                  </div>
                  <div className="text-white/70 font-medium tracking-wide">{stat.label}</div>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.div>
            ))}
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.8 }}
            className="mt-24"
          >
            <motion.div
              animate={{ y: [0, 15, 0] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              className="flex justify-center"
            >
              <div className="p-3 rounded-full border border-emerald-500/30 bg-emerald-500/10">
                <ChevronDown className="w-6 h-6 text-emerald-400" />
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Why Choose SentimentAI Section */}
      <section className="py-32 px-6 relative">
        <div className="max-w-8xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="text-center mb-20"
          >
            <motion.h2
              variants={itemVariants}
              className="text-4xl md:text-5xl lg:text-6xl font-black mb-8 tracking-tighter bg-gradient-to-r from-white via-emerald-200 to-cyan-200 bg-clip-text text-transparent"
            >
              Why Choose SentimentAI?
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-lg md:text-xl lg:text-2xl text-white/70 max-w-4xl mx-auto leading-relaxed font-light tracking-wide"
            >
              Benefits designed to provide a seamless, secure, and intelligent experience for all users.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {[
              {
                icon: <Target className="w-10 h-10" />,
                title: "Maximum Accuracy",
                description: "Your insights are powered by cutting-edge AI protocols with 99.9% precision.",
                color: "from-emerald-400 to-teal-500",
              },
              {
                icon: <Globe className="w-10 h-10" />,
                title: "Real-time Analysis",
                description: "Execute your market research in real-time, without delays or compromises.",
                color: "from-cyan-400 to-blue-500",
              },
              {
                icon: <BarChart3 className="w-10 h-10" />,
                title: "Advanced Analytics",
                description: "Get comprehensive insights with advanced AI-powered analytics and reporting.",
                color: "from-purple-400 to-pink-500",
              },
              {
                icon: <MessageSquare className="w-10 h-10" />,
                title: "Smart Conversations",
                description: "Interact with your data through natural language conversations and queries.",
                color: "from-emerald-400 to-cyan-500",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group relative"
              >
                <div className="bg-white/5 backdrop-blur-xl border border-emerald-500/20 rounded-3xl p-8 h-full hover:bg-white/10 transition-all duration-300">
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-white">{feature.title}</h3>
                  <p className="text-white/70 leading-relaxed">{feature.description}</p>
                </div>
                <div className={`absolute -inset-1 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 rounded-3xl`} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Advanced Features Grid */}
      <section className="relative py-32 px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="max-w-8xl mx-auto"
        >
          <motion.div variants={itemVariants} className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-6 bg-gradient-to-r from-white to-emerald-100 bg-clip-text text-transparent leading-tight">
              Ultra-Intelligent Features
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-white/70 max-w-4xl mx-auto leading-relaxed">
              Experience next-generation AI capabilities designed for modern market intelligence
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: "Advanced Neural Processing",
                description: "Deep learning algorithms analyze sentiment with unprecedented accuracy across multiple languages and contexts.",
                gradient: "from-emerald-500 to-teal-500",
              },
              {
                icon: Database,
                title: "Real-Time Data Fusion", 
                description: "Lightning-fast data aggregation from thousands of sources with instant processing and analysis.",
                gradient: "from-cyan-500 to-blue-500",
              },
              {
                icon: MessageSquare,
                title: "Intelligent Conversational AI",
                description: "Natural language interface for complex queries with contextual understanding and smart responses.",
                gradient: "from-purple-500 to-pink-500",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -5 }}
                className="group relative overflow-hidden"
              >
                <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 h-full">
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-white">{feature.title}</h3>
                  <p className="text-white/70 leading-relaxed">{feature.description}</p>
                </div>
                <div className={`absolute -inset-1 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 rounded-3xl`} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Revolutionary AI Agents Section */}
      <section className="py-32 px-6 relative">
        <div className="max-w-8xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="text-center mb-20"
          >
            <motion.h2
              variants={itemVariants}
              className="text-3xl md:text-4xl lg:text-5xl font-black mb-8 tracking-tighter bg-gradient-to-r from-white via-emerald-200 to-cyan-200 bg-clip-text text-transparent"
            >
              All AI Agents,
              <br />
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                One Platform
              </span>
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-base md:text-lg lg:text-xl text-white/70 max-w-4xl mx-auto leading-relaxed font-light tracking-wide"
            >
              Deploy, analyze, and optimize all major AI capabilities on a single platform. A seamless experience with no compromises.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12"
          >
            {[
              {
                icon: <Globe className="w-12 h-12" />,
                title: "Crawler Agent",
                subtitle: "Web Intelligence Engine",
                description: "Advanced web crawling with Tavily API, processing millions of data points in real-time across global markets and social platforms with unprecedented speed and accuracy.",
                color: "from-emerald-400 to-teal-500",
              },
              {
                icon: <Brain className="w-12 h-12" />,
                title: "Sentiment AI Agent",
                subtitle: "OpenAI GPT-4o Integration",
                description: "State-of-the-art sentiment analysis using OpenAI's latest models, understanding context, emotion, and intent with human-level comprehension across all content types.",
                color: "from-cyan-400 to-blue-500",
              },
              {
                icon: <Database className="w-12 h-12" />,
                title: "Memory Agent",
                subtitle: "Mem0 Smart Memory",
                description: "Intelligent memory management with Mem0 technology, learning from every interaction to provide personalized insights and contextual recommendations.",
                color: "from-purple-400 to-pink-500",
              },
              {
                icon: <MessageSquare className="w-12 h-12" />,
                title: "Chat Agent",
                subtitle: "Conversational Intelligence",
                description: "Natural language interface for instant insights, allowing you to query your data, generate reports, and get answers through simple conversations.",
                color: "from-emerald-400 to-cyan-500",
              },
            ].map((agent, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -10 }}
                className="group relative"
              >
                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 h-full hover:bg-white/10 transition-all duration-500">
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${agent.color} mb-6 shadow-lg`}>
                    {agent.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">{agent.title}</h3>
                  <h4 className="text-sm font-medium text-emerald-400 mb-4 tracking-wide uppercase">{agent.subtitle}</h4>
                  <p className="text-white/70 leading-relaxed font-light tracking-wide">{agent.description}</p>
                </div>
                <div className={`absolute -inset-1 bg-gradient-to-r ${agent.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl blur-xl`} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Ultra-Premium CTA Section */}
      <section className="relative py-32 px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="max-w-6xl mx-auto text-center"
        >
          <motion.div variants={itemVariants} className="mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-8 bg-gradient-to-r from-white via-emerald-100 to-cyan-100 bg-clip-text text-transparent leading-tight">
              Ready to Transform Your Intelligence?
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-white/70 max-w-4xl mx-auto leading-relaxed">
              Join thousands of forward-thinking companies using our AI platform to gain competitive advantages through superior market intelligence.
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-8 justify-center items-center"
          >
            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: "0 25px 50px rgba(16, 185, 129, 0.4)",
              }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogin}
              className="px-12 py-6 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full font-bold text-lg tracking-wide hover:shadow-2xl transition-all duration-300"
            >
              Start Your AI Journey
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDevLogin}
              className="px-8 py-4 rounded-full font-medium text-sm tracking-wide border border-orange-500/50 text-orange-400 hover:border-orange-500 hover:bg-orange-500/10 transition-all duration-300"
            >
              🚧 Dev Login (Testing)
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-12 py-6 rounded-full font-bold text-lg tracking-wide border-2 border-emerald-500/50 hover:border-emerald-500 hover:bg-emerald-500/10 transition-all duration-300"
            >
              Schedule Demo
            </motion.button>
          </motion.div>
        </motion.div>
      </section>

      {/* Ultra-Modern Footer */}
      <motion.footer
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
        className="border-t border-emerald-500/20 py-16 px-6"
      >
        <div className="max-w-8xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-center">
            <motion.div variants={itemVariants} className="flex items-center space-x-3 mb-8 lg:mb-0">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-xl flex items-center justify-center">
                <Brain className="w-7 h-7 text-black" />
              </div>
              <span className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                SentimentAI
              </span>
            </motion.div>

            <motion.div variants={itemVariants} className="text-white/50 text-center lg:text-right">
              <p className="text-base font-light tracking-wide">© 2025 SentimentAI. Redefining Market Intelligence.</p>
              <p className="text-sm mt-2 font-light tracking-wider">
                Secure, fast, and seamless AI-powered insights. SentimentAI makes market analysis effortless.
              </p>
            </motion.div>
          </div>
        </div>
      </motion.footer>
    </div>
  )
}