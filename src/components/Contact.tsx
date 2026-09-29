import React, { useRef, useState } from 'react';
import { Mail, Phone, MapPin, Github, Send } from 'lucide-react';
import emailjs from '@emailjs/browser';
import ScrollReveal from './ScrollReveal';
import TextReveal from './TextReveal';

const CONTACT_ITEMS = [
  {
    icon: Mail,
    label: 'Email',
    value: 'phucttm.dev@gmail.com',
    href: 'mailto:phucttm.dev@gmail.com',
  },
  {
    icon: Phone,
    label: 'Phone',
    value: '+84 375 331 022',
    href: 'tel:+84375331022',
  },
  {
    icon: MapPin,
    label: 'Location',
    value: 'Ho Chi Minh City, Vietnam',
    href: null,
  },
  {
    icon: Github,
    label: 'GitHub',
    value: '@miFu278',
    href: 'https://github.com/miFu278',
  },
];

const Contact: React.FC = () => {
  const formRef = useRef<HTMLFormElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formRef.current) return;

    setStatus('sending');

    try {
      await emailjs.sendForm(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        formRef.current,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );

      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setStatus('idle'), 5000);
    } catch (error) {
      console.error('Failed to send email:', error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <section
      id="contact"
      className="py-20 md:py-28 scroll-mt-24 relative"
    >
      <div className="max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <div className="flex justify-center">
            <TextReveal
              text="Get In Touch"
              animation="slide-right"
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-white justify-center"
              delay={100}
            />
          </div>
          <ScrollReveal animation="slide-left" delay={200}>
            <p className="text-sm sm:text-base text-gray-400 mt-2 max-w-xl mx-auto">
              Open to backend engineering opportunities and thoughtful technical collaborations.
            </p>
          </ScrollReveal>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          {/* Left side - Contact Info */}
          <div className="space-y-6 md:space-y-8">
            <ScrollReveal animation="fade-right" delay={150}>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">
                  Contact Information
                </h3>
                <p className="text-sm sm:text-base text-gray-400 mb-6">
                  Feel free to reach out about backend engineering opportunities, distributed systems, or applied AI research.
                </p>
              </div>
            </ScrollReveal>

            <div className="space-y-4 md:space-y-5">
              {CONTACT_ITEMS.map((item, idx) => {
                const Icon = item.icon;
                const content = (
                  <div className="flex items-center gap-3 md:gap-4 p-3.5 md:p-4 rounded-xl border border-gray-700/80 hover:border-white/50 transition-colors duration-300 card-hover-glow bg-white/[0.02] group">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-white/5 rounded-lg flex items-center justify-center group-hover:bg-white/10 transition-colors shrink-0">
                      <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-gray-400 text-xs md:text-sm">{item.label}</p>
                      <p className="text-white font-medium text-sm md:text-base truncate">
                        {item.value}
                      </p>
                    </div>
                  </div>
                );

                return (
                  <ScrollReveal
                    key={item.label}
                    animation="fade-right"
                    delay={200 + idx * 80}
                  >
                    {item.href ? (
                      <a
                        href={item.href}
                        target={item.href.startsWith('http') ? '_blank' : undefined}
                        rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="block"
                      >
                        {content}
                      </a>
                    ) : (
                      content
                    )}
                  </ScrollReveal>
                );
              })}
            </div>
          </div>

          {/* Right side - Contact Form */}
          <ScrollReveal animation="fade-left" delay={250}>
            <div className="rounded-xl p-6 md:p-8 border border-gray-700/80 hover:border-white/50 transition-colors duration-300 bg-white/[0.02] card-hover-glow">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 md:mb-6">
                Send a Message
              </h3>

              <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                <div>
                  <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-gray-400 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base bg-transparent border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-white/50 transition-colors duration-300"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-400 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base bg-transparent border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-white/50 transition-colors duration-300"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-xs sm:text-sm font-medium text-gray-400 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base bg-transparent border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-white/50 transition-colors duration-300 resize-none"
                    placeholder="Your message..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="w-full px-4 md:px-6 py-2.5 md:py-3 text-sm md:text-base bg-white hover:bg-gray-200 disabled:bg-gray-700 disabled:text-gray-400 text-black font-medium rounded-lg transition-all duration-300 transform hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer"
                >
                  {status === 'sending' ? (
                    <>
                      <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : status === 'success' ? (
                    <>✓ Message Sent!</>
                  ) : (
                    <>
                      <Send className="w-4 h-4 md:w-5 md:h-5" />
                      Send Message
                    </>
                  )}
                </button>

                {status === 'success' && (
                  <p className="text-white text-sm text-center">
                    ✓ Thank you! I'll get back to you soon.
                  </p>
                )}

                {status === 'error' && (
                  <p className="text-gray-400 text-sm text-center">
                    ✗ Failed to send message. Please try again or contact me directly.
                  </p>
                )}
              </form>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default Contact;
