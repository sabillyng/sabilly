"use client";
import Link from 'next/link';
import Image from 'next/image';
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { 
  FaFacebook, 
  FaTwitter, 
  FaInstagram, 
  FaLinkedin,
  FaYoutube
} from 'react-icons/fa';
import logo from "../../../public/sabilly-logo.png";

export const SabillyLogo = () => (
  <Image src={logo} alt="Sabilly" className='w-24 h-auto' priority />
);

export function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = {
    professionals: [
      { name: 'Become an Artisan', href: '/join' },
      { name: 'Register Your Business', href: '/business/register' },
      { name: 'Pricing & Plans', href: '/pricing' },
      { name: 'Success Stories', href: '/success-stories' },
      { name: 'Resources & Guides', href: '/resources' },
    ],
    customers: [
      { name: 'How it Works', href: '/how-it-works' },
      { name: 'Find Professionals', href: '/providers' },
      { name: 'Safety Tips', href: '/safety' },
      { name: 'FAQ', href: '/faq' },
      { name: 'Contact Us', href: '/contact' },
    ],
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Blog', href: '/blog' },
      { name: 'Careers', href: '/careers' },
      { name: 'Press', href: '/press' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Privacy Policy', href: '/privacy' },
    ]
  };

  const socialLinks = [
    { icon: FaFacebook, href: 'https://facebook.com/sabilly', label: 'Facebook', color: 'hover:text-blue-500' },
    { icon: FaTwitter, href: 'https://twitter.com/sabilly', label: 'Twitter', color: 'hover:text-blue-400' },
    { icon: FaInstagram, href: 'https://instagram.com/sabilly', label: 'Instagram', color: 'hover:text-pink-500' },
    { icon: FaLinkedin, href: 'https://linkedin.com/company/sabilly', label: 'LinkedIn', color: 'hover:text-blue-600' },
    { icon: FaYoutube, href: 'https://youtube.com/sabilly', label: 'YouTube', color: 'hover:text-red-600' },
  ];

  const contactInfo = [
    { icon: EnvelopeIcon, text: 'support@sabilly.com', href: 'mailto:support@sabilly.com' },
    { icon: PhoneIcon, text: '+234 (0) 123 456 789', href: 'tel:+234123456789' },
    { icon: MapPinIcon, text: 'Osun State, Nigeria', href: 'https://maps.google.com/?q=Osun,Nigeria' },
  ];

  return (
    <footer className="bg-gray-900 text-white mt-auto">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <SabillyLogo />
            </Link>
            <p className="text-sm text-gray-400 mb-4">
              Connecting artisans and businesses with customers across Nigeria. Find trusted professionals for all your needs.
            </p>
            <div className="flex items-center space-x-1 text-sm text-gray-400">
              <HeartIcon className="h-4 w-4 text-emerald-500" />
              <span>Made with pride in Nigeria</span>
            </div>
          </div>

          {/* For Professionals */}
          <div>
            <h4 className="font-bold text-lg mb-4 text-emerald-500">For Professionals</h4>
            <ul className="space-y-3">
              {quickLinks.professionals.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="text-sm text-gray-400 hover:text-emerald-500 transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Customers */}
          <div>
            <h4 className="font-bold text-lg mb-4 text-emerald-500">For Customers</h4>
            <ul className="space-y-3">
              {quickLinks.customers.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="text-sm text-gray-400 hover:text-emerald-500 transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-lg mb-4 text-emerald-500">Company</h4>
            <ul className="space-y-3">
              {quickLinks.company.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="text-sm text-gray-400 hover:text-emerald-500 transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h4 className="font-bold text-lg mb-4 text-emerald-500">Contact Us</h4>
            <ul className="space-y-4">
              {contactInfo.map((item, index) => {
                const Icon = item.icon;
                return (
                  <li key={index}>
                    <a 
                      href={item.href}
                      className="flex items-start space-x-3 text-sm text-gray-400 hover:text-emerald-500 transition-colors duration-200 group"
                      target={item.href.startsWith('http') ? '_blank' : undefined}
                      rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0 text-gray-500 group-hover:text-emerald-500 transition-colors duration-200" />
                      <span>{item.text}</span>
                    </a>
                  </li>
                );
              })}
            </ul>

            {/* Social Media Links */}
            <div className="mt-6">
              <h5 className="text-sm font-medium text-gray-300 mb-3">Follow Us</h5>
              <div className="flex items-center space-x-4">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className={`text-gray-400 transition-all duration-200 transform hover:scale-110 ${social.color}`}
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="max-w-2xl mx-auto text-center">
            <h4 className="text-lg font-semibold mb-2">Stay Updated</h4>
            <p className="text-sm text-gray-400 mb-4">
              Subscribe to our newsletter for tips, updates, and exclusive offers
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white placeholder-gray-500"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200 font-medium"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-400">
              © {currentYear} Sabilly. All rights reserved.
            </p>
            <div className="flex items-center space-x-6">
              <Link href="/terms" className="text-sm text-gray-400 hover:text-emerald-500 transition-colors">
                Terms
              </Link>
              <Link href="/privacy" className="text-sm text-gray-400 hover:text-emerald-500 transition-colors">
                Privacy
              </Link>
              <Link href="/cookies" className="text-sm text-gray-400 hover:text-emerald-500 transition-colors">
                Cookies
              </Link>
              <Link href="/sitemap" className="text-sm text-gray-400 hover:text-emerald-500 transition-colors">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}