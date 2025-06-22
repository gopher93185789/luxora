import type { MetaFunction } from "@remix-run/cloudflare";
import { Link } from "@remix-run/react";
import { motion } from "framer-motion";
import { Navbar } from "~/components/navigation/navbar";
import { Github } from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "About Us - Luxora" },
    {
      name: "description",
      content: "Learn about Luxora - The premier marketplace for luxury goods, where distinction meets exclusivity.",
    },
  ];
};

export default function AboutPage() {
  return (
    <div className="bg-gradient-to-b from-black via-gray-900 to-black min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center px-4 sm:px-6">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-20 right-20 w-64 h-64 bg-luxora/5 rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-20 left-20 w-48 h-48 bg-white/5 rounded-full blur-2xl"
            animate={{ 
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ duration: 6, repeat: Infinity, delay: 2 }}
          />
        </div>

        <div className="relative z-10 text-center max-w-6xl mx-auto">
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-3 mb-8">
              <div className="w-16 h-px bg-gradient-to-r from-transparent via-luxora to-transparent"></div>
              <span className="text-luxora font-medium tracking-wider uppercase text-sm">About Us</span>
              <div className="w-16 h-px bg-gradient-to-r from-transparent via-luxora to-transparent"></div>
            </div>
          </motion.div>

          <motion.h1
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-8 leading-tight"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            About{" "}
            <span className="text-transparent bg-gradient-to-r from-luxora/80 to-luxora/100 bg-clip-text">
              Luxoras
            </span>
          </motion.h1>
          
          <motion.p
            className="text-xl sm:text-2xl md:text-3xl text-white/80 font-light max-w-4xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            The world's most exclusive marketplace where luxury meets accessibility
          </motion.p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Mission Section */}
          <motion.div
            className="mb-20"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >
            <div className="bg-black/50 backdrop-blur-md rounded-2xl border border-white/10 p-8 sm:p-12">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-8 text-center">
                Our <span className="text-luxora">Mission</span>
              </h2>
              <p className="text-lg sm:text-xl text-white/80 leading-relaxed text-center max-w-4xl mx-auto mb-8">
                Luxoras is the premier destination for acquiring everything luxurious. From rare collectibles and high-end fashion to exclusive art pieces and luxury vehicles, we curate a marketplace where discerning collectors and connoisseurs can discover, trade, and acquire the world's most coveted items.
              </p>
              <p className="text-lg sm:text-xl text-white/80 leading-relaxed text-center max-w-4xl mx-auto">
                Every item on our platform represents the pinnacle of craftsmanship, exclusivity, and prestige. We don't just sell luxury - we create experiences that define a lifestyle of distinction.
              </p>
            </div>
          </motion.div>

          {/* What We Offer Section */}
          <motion.div
            className="mb-20"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-12 text-center">
              What We <span className="text-luxora">Offer</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { title: "Luxury Fashion", description: "Designer clothing, accessories, and haute couture from the world's most prestigious brands." },
                { title: "Fine Art & Collectibles", description: "Rare paintings, sculptures, and exclusive collectibles from renowned artists and creators." },
                { title: "Luxury Vehicles", description: "Supercars, vintage classics, and limited-edition vehicles for the ultimate driving experience." },
                { title: "High-End Jewelry", description: "Exquisite diamonds, precious metals, and bespoke jewelry pieces crafted by master artisans." },
                { title: "Exclusive Real Estate", description: "Premium properties, penthouses, and estates in the world's most desirable locations." },
                { title: "Luxury Experiences", description: "Private jets, yacht charters, and exclusive access to events money can't typically buy." }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="bg-black/50 backdrop-blur-md rounded-xl border border-white/10 p-6 hover:border-luxora/30 transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <h3 className="text-xl sm:text-2xl font-bold text-luxora mb-4">{item.title}</h3>
                  <p className="text-white/70 leading-relaxed">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Team Section */}
          <motion.div
            className="mb-20"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="bg-black/50 backdrop-blur-md rounded-2xl border border-white/10 p-8 sm:p-12">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-8 text-center">
                Our <span className="text-luxora">Team</span>
              </h2>
              <p className="text-lg sm:text-xl text-white/80 leading-relaxed text-center max-w-4xl mx-auto mb-12">
                Luxoras was created by three passionate students from GLR Rotterdam who share a vision of making luxury accessible through innovative technology and exceptional design.
              </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
                {[
                  { 
                    name: "Anish Chittu", 
                    role: "Backend Engineer",
                    github: "https://github.com/scott-mescudi", // Replace with actual GitHub URL
                    avatar: "/team/anish.jpg" // Add profile picture to public/team/ folder
                  },
                  { 
                    name: "Mohhamed Haftharou", 
                    role: "Frontend development UI/UIX",
                    github: "https://github.com/Mohammed-glr", // Replace with actual GitHub URL
                    avatar: "/team/mohhamed.jpg" // Add profile picture to public/team/ folder
                  },
                  { 
                    name: "Leon van Wijngaarden", 
                    role: "Frontend development UI/UIX",
                    github: "https://github.com/leonwijng", // Replace with actual GitHub URL
                    avatar: "/team/leon.jpg" // Add profile picture to public/team/ folder
                  }
                ].map((member, index) => (
                  <motion.div
                    key={index}
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                    viewport={{ once: true }}
                  >                    <div className="relative mb-4 mx-auto w-24 h-24">
                      <img 
                        src={member.avatar}
                        alt={`${member.name} profile`}
                        className="w-24 h-24 rounded-full object-cover border-2 border-luxora/20 hover:border-luxora/50 transition-all duration-300"
                        onError={(e) => {
                          // Fallback to initials if image fails to load
                          const target = e.currentTarget;
                          const fallback = target.nextElementSibling as HTMLElement;
                          target.style.display = 'none';
                          if (fallback) {
                            fallback.style.display = 'flex';
                          }
                        }}
                      />
                      <div 
                        className="absolute inset-0 bg-luxora/10 rounded-full items-center justify-center hidden"
                        style={{ display: 'none' }}
                      >
                        <span className="text-luxora text-2xl font-bold">{member.name.charAt(0)}</span>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{member.name}</h3>
                    <p className="text-white/60 mb-4">{member.role}</p>
                    <a
                      href={member.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-luxora hover:text-white transition-colors duration-200 hover:scale-105 transform"
                    >
                      <Github className="w-5 h-5" />
                      <span>GitHub</span>
                    </a>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="bg-gradient-to-r from-luxora/10 via-luxora/5 to-luxora/10 rounded-2xl border border-luxora/20 p-8 sm:p-12">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to Experience <span className="text-luxora">Luxury</span>?
              </h2>
              <p className="text-lg sm:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                Join our exclusive community and discover a world where luxury knows no bounds.
              </p>
              <Link to="/auth">
                <motion.button
                  className="bg-luxora text-black font-bold text-lg px-8 py-4 rounded-lg hover:bg-luxora/90 transition-all duration-300 shadow-lg hover:shadow-luxora/25"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Get Started
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
