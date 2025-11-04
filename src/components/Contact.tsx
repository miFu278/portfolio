import React, { useRef, useState } from 'react';
import { Mail, Phone, MapPin, Github, Send } from 'lucide-react';
import emailjs from '@emailjs/browser';
import useFadeIn from '../hooks/useFadeIn';

const Contact: React.FC = () => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const formRef = useRef<HTMLFormElement>(null);
    useFadeIn(sectionRef);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
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
            [e.target.name]: e.target.value
        });
    };

    return (
        <section
            id="contact"
            ref={sectionRef}
            className="opacity-0 transform translate-y-8 transition-all duration-1000 ease-out py-16 md:py-24 scroll-mt-24"
        >
            <div className="max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12 md:mb-16">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">Get In Touch</h2>
                    <p className="text-sm sm:text-base text-gray-400 mt-2">Let's work together on your next project</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
                    {/* Left side - Contact Info */}
                    <div className="space-y-6 md:space-y-8">
                        <div>
                            <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 md:mb-6">Contact Information</h3>
                            <p className="text-sm sm:text-base text-gray-400 mb-6 md:mb-8">
                                Feel free to reach out for collaborations, opportunities, or just a friendly chat about technology.
                            </p>
                        </div>

                        <div className="space-y-4 md:space-y-6">
                            {/* Email */}
                            <a
                                href="mailto:phucttm.dev@gmail.com"
                                className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-gray-900/50 rounded-lg border border-gray-800/50 hover:border-white/20 transition-colors group"
                            >
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-white/5 rounded-lg flex items-center justify-center group-hover:bg-white/10 transition-colors shrink-0">
                                    <Mail className="w-5 h-5 md:w-6 md:h-6 text-white" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-gray-400 text-xs md:text-sm">Email</p>
                                    <p className="text-white font-medium text-sm md:text-base truncate">phucttm.dev@gmail.com</p>
                                </div>
                            </a>

                            {/* Phone */}
                            <a
                                href="tel:+84375331022"
                                className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-gray-900/50 rounded-lg border border-gray-800/50 hover:border-white/20 transition-colors group"
                            >
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-white/5 rounded-lg flex items-center justify-center group-hover:bg-white/10 transition-colors shrink-0">
                                    <Phone className="w-5 h-5 md:w-6 md:h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-gray-400 text-xs md:text-sm">Phone</p>
                                    <p className="text-white font-medium text-sm md:text-base">+84 375 331 022</p>
                                </div>
                            </a>

                            {/* Location */}
                            <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-gray-900/50 rounded-lg border border-gray-800/50">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-white/5 rounded-lg flex items-center justify-center shrink-0">
                                    <MapPin className="w-5 h-5 md:w-6 md:h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-gray-400 text-xs md:text-sm">Location</p>
                                    <p className="text-white font-medium text-sm md:text-base">Ho Chi Minh City, Vietnam</p>
                                </div>
                            </div>

                            {/* GitHub */}
                            <a
                                href="https://github.com/miFu278"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-gray-900/50 rounded-lg border border-gray-800/50 hover:border-white/20 transition-colors group"
                            >
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-white/5 rounded-lg flex items-center justify-center group-hover:bg-white/10 transition-colors shrink-0">
                                    <Github className="w-5 h-5 md:w-6 md:h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-gray-400 text-xs md:text-sm">GitHub</p>
                                    <p className="text-white font-medium text-sm md:text-base">@miFu278</p>
                                </div>
                            </a>
                        </div>
                    </div>

                    {/* Right side - Contact Form */}
                    <div className="bg-gray-900/50 rounded-xl p-6 md:p-8 border border-gray-800/50">
                        <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 md:mb-6">Send a Message</h3>

                        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                            {/* Name */}
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
                                    className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white transition-colors"
                                    placeholder="Your name"
                                />
                            </div>

                            {/* Email */}
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
                                    className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white transition-colors"
                                    placeholder="your.email@example.com"
                                />
                            </div>

                            {/* Message */}
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
                                    className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white transition-colors resize-none md:rows-6"
                                    placeholder="Your message..."
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={status === 'sending'}
                                className="w-full px-4 md:px-6 py-2.5 md:py-3 text-sm md:text-base bg-white hover:bg-gray-200 disabled:bg-gray-700 disabled:text-gray-400 text-black font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                {status === 'sending' ? (
                                    <>
                                        <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                        Sending...
                                    </>
                                ) : status === 'success' ? (
                                    <>
                                        ✓ Message Sent!
                                    </>
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
                </div>
            </div>
        </section>
    );
};

export default Contact;
