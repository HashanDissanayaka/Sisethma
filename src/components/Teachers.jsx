import { motion } from 'framer-motion';
import { teachers } from '../data';
import { User } from 'lucide-react';

const Teachers = () => {
    return (
        <section className="py-24 bg-slate-50 overflow-hidden">
            <div className="container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Our Teachers</h2>
                    <div className="w-24 h-1.5 bg-purple-600 mx-auto rounded-full" />
                    <p className="mt-4 text-slate-600">Expert guidance for your bright future</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {teachers.map((teacher, index) => (
                        <motion.div
                            key={teacher.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            viewport={{ once: true }}
                            whileHover={{
                                y: -10,
                                rotateX: 5,
                                rotateY: 5,
                                scale: 1.02,
                                boxShadow: "0px 20px 40px rgba(107, 33, 168, 0.2)"
                            }}
                            className="group relative bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 transform-gpu perspective-1000"
                        >
                            <div className={`h-24 ${teacher.color} relative overflow-hidden`}>
                                <div className="absolute inset-0 bg-black/10" />
                                <teacher.icon className="absolute right-4 top-4 text-white/20 w-16 h-16 transform rotate-12" />
                            </div>

                            <div className="px-6 pb-8 relative">
                                <div className="w-24 h-24 -mt-12 mx-auto bg-white rounded-full p-1 shadow-lg mb-4">
                                    <div className={`w-full h-full rounded-full ${teacher.color} flex items-center justify-center text-white text-2xl font-bold overflow-hidden`}>
                                        {teacher.image ? (
                                            <img src={teacher.image} alt={teacher.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <teacher.icon className="w-10 h-10" />
                                        )}
                                    </div>
                                </div>

                                <div className="text-center">
                                    <h3 className="text-xl font-bold text-slate-900 mb-1">{teacher.name}</h3>
                                    <p className={`text-sm font-medium ${teacher.color.replace('bg-', 'text-')} mb-3 uppercase tracking-wide`}>
                                        {teacher.subject}
                                    </p>

                                    <div className="space-y-2 text-slate-600 text-sm">
                                        <p className="flex items-center justify-center gap-2">
                                            <span className="font-semibold text-slate-900">Education:</span>
                                            {teacher.qualifications}
                                        </p>
                                        <p className="inline-block px-3 py-1 bg-slate-100 rounded-full text-slate-700">
                                            {teacher.grades}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Teachers;
