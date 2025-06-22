import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Trophy, Shield, Globe, Zap, Gem, TrendingUp } from "lucide-react";
import SpotlightCard from "./Card";

export function Features() {
  const featuresRef = useRef(null);
  const inView = useInView(featuresRef, { once: true, margin: "-100px" });

  const features = [
    {
      icon: <Trophy className="w-8 h-8" />,
      title: "Verified Luxury",
      description:
        "Every item is authenticated by our team of luxury experts, ensuring you trade only genuine premium goods.",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure Transactions",
      description:
        "Bank-level encryption and escrow services protect your high-value transactions from start to finish.",
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Global Network",
      description:
        "Connect with elite collectors and dealers worldwide in our exclusive, invitation-only marketplace.",
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Instant Matching",
      description:
        "Our AI-powered system instantly connects you with the perfect buyers or sellers for your luxury items.",
    },
    {
      icon: <Gem className="w-8 h-8" />,
      title: "Concierge Service",
      description:
        "Dedicated luxury specialists handle logistics, authentication, and white-glove delivery services.",
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Market Insights",
      description:
        "Access real-time luxury market data, trends, and valuations to make informed trading decisions.",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };
  return (
    <section
      ref={featuresRef}
      className="py-20 px-6 bg-gradient-to-b from-black via-luxora/75 to-black relative overflow-hidden"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.05)_0%,transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.03)_0%,transparent_50%)]"></div>

      <div className="max-w-7xl mx-auto relative">
        {/* Section Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 60 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-luxora to-transparent"></div>
            <span className="text-luxora font-medium tracking-wider uppercase text-sm">
              Excellence
            </span>
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-luxora to-transparent"></div>
          </div>

          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight">
            Why Choose{" "}
            <span className="text-transparent bg-gradient-to-r from-luxora/80 to-luxora/100 bg-clip-text">
              Luxoras
            </span>
          </h2>

          <p className="text-xl md:text-2xl text-white/70 max-w-4xl mx-auto leading-relaxed">
            Experience the pinnacle of luxury trading with features designed
            exclusively for discerning collectors and connoisseurs.
          </p>
        </motion.div>{" "}
        {/* Features Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group relative"
            >
              <SpotlightCard className="h-full">
                {/* Icon */}
                <div className="relative mb-6">
                  <div className="relative text-luxora mb-4 group-hover:scale-110 group-hover:text-white transition-all duration-500 flex items-center justify-center w-16 h-16">
                    {feature.icon}
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-2xl lg:text-3xl font-bold text-white mb-6 group-hover:text-luxora transition-colors duration-500">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-white/70 leading-relaxed text-base lg:text-lg group-hover:text-white/90 transition-colors duration-300">
                  {feature.description}
                </p>
              </SpotlightCard>
            </motion.div>
          ))}
        </motion.div>{" "}
        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-20"
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.8 }}
        >
          <div className="relative inline-flex items-center gap-6 text-luxora text-lg lg:text-xl font-medium">
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-luxora to-transparent"></div>
            <span className="relative">
              Trusted by luxury collectors worldwide
              <div className="absolute -bottom-1 left-0 w-full h-px bg-gradient-to-r from-transparent via-luxora/50 to-transparent"></div>
            </span>
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-luxora to-transparent"></div>
          </div>

          {/* Stats */}
          <motion.div
            className="flex flex-wrap justify-center gap-8 lg:gap-12 mt-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <div className="group">
              <div className="text-3xl lg:text-4xl font-bold text-white mb-2 group-hover:text-black transition-colors duration-300">
                50K+
              </div>
              <div className="text-white/60 text-sm uppercase tracking-wider">
                Verified Items
              </div>
            </div>

            <div className="group">
              <div className="text-3xl lg:text-4xl font-bold text-white mb-2 group-hover:text-black transition-colors duration-300">
                $2.5B+
              </div>
              <div className="text-white/60 text-sm uppercase tracking-wider">
                Total Traded
              </div>
            </div>

            <div className="group">
              <div className="text-3xl lg:text-4xl font-bold text-white mb-2 group-hover:text-black transition-colors duration-300">
                150+
              </div>
              <div className="text-white/60 text-sm uppercase tracking-wider">
                Countries
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
