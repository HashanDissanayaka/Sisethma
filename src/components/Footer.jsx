import { MapPin, Phone, Facebook, Mail } from 'lucide-react';
import { heroContent } from '../data';

const Footer = () => {
    return (
        <footer className="bg-slate-900 text-slate-300 pt-16 pb-8">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">

                    {/* Brand Info */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <img src="/logo.png" alt="Sisethma Logo" className="h-10 w-auto" />
                            <div className="flex flex-col">
                                <span className="text-xl font-bold text-white leading-none">සිසෙත්මා</span>
                                <span className="text-sm text-purple-400 font-medium">නෙළුම්දෙණිය</span>
                            </div>
                        </div>
                        <p className="text-slate-400 leading-relaxed">
                            Empowering students with quality education and modern technology. Join us to shape your future.
                        </p>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-6">Contact Us</h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <MapPin className="w-6 h-6 text-purple-500 shrink-0" />
                                <p>Opposite Government Dispensary,<br />Nelumdeniya</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <Phone className="w-6 h-6 text-purple-500 shrink-0" />
                                <p>{heroContent.contact}</p>
                            </div>
                        </div>
                    </div>

                    {/* Social / Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-6">Connect With Us</h3>
                        <div className="flex gap-4 mb-6">
                            <a href="#" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors">
                                <Mail className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
                    <p>© 2026 Sisethma Institute. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
