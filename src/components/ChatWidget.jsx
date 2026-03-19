import { useState } from 'react';
import { MessageSquare, X, Send, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Hi! I'm the Sisethma AI Assistant. How can I help you today?", isBot: true }
    ]);
    const [inputValue, setInputValue] = useState("");

    const handleSend = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        // Add user message
        const userMsg = { id: Date.now(), text: inputValue, isBot: false };
        setMessages(prev => [...prev, userMsg]);
        setInputValue("");

        // Simulate AI response
        setTimeout(() => {
            const botMsg = {
                id: Date.now() + 1,
                text: "Thanks for asking! Our classes start soon. Please call us at 077 675 3363 for registration.",
                isBot: true
            };
            setMessages(prev => [...prev, botMsg]);
        }, 1000);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="mb-4 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-purple-100 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 flex items-center justify-between text-white">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5" />
                                <span className="font-bold">AI Assistant</span>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="hover:bg-white/20 p-1 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Chat Area */}
                        <div className="h-80 overflow-y-auto p-4 bg-slate-50 flex flex-col gap-3">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.isBot
                                            ? "bg-white text-slate-700 shadow-sm rounded-tl-none border border-slate-100"
                                            : "bg-purple-600 text-white rounded-tr-none self-end"
                                        }`}
                                >
                                    {msg.text}
                                </div>
                            ))}
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100 flex gap-2">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Ask about classes..."
                                className="flex-1 bg-slate-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <button
                                type="submit"
                                className="bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 transition-colors"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full shadow-lg flex items-center justify-center text-white"
            >
                <MessageSquare className="w-7 h-7" />

                {/* Simple Notification Dot Animation */}
                {!isOpen && (
                    <span className="absolute top-0 right-0 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
                    </span>
                )}
            </motion.button>
        </div>
    );
};

export default ChatWidget;
