import { motion } from 'framer-motion';
import { timeTable } from '../data';
import { Calendar, Clock, GraduationCap } from 'lucide-react';

const Classes = () => {
    return (
        <section className="py-24 bg-white relative">
            <div className="container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Class Schedule</h2>
                    <div className="w-24 h-1.5 bg-purple-600 mx-auto rounded-full" />
                    <p className="mt-4 text-slate-600">Plan your week with our structured timetable</p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {timeTable.map((subjectData, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="bg-slate-50 rounded-2xl shadow-lg border border-slate-100 overflow-hidden"
                        >
                            <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
                                <div>
                                    <h3 className="text-2xl font-bold flex items-center gap-2">
                                        <GraduationCap className="text-purple-400" />
                                        {subjectData.subject}
                                    </h3>
                                    <p className="text-slate-400 text-sm mt-1">by {subjectData.teacher}</p>
                                </div>
                                <Calendar className="w-8 h-8 text-white/20" />
                            </div>

                            <div className="p-6">
                                <motion.div
                                    className="space-y-4"
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true }}
                                    variants={{
                                        visible: {
                                            transition: {
                                                staggerChildren: 0.1
                                            }
                                        }
                                    }}
                                >
                                    {subjectData.schedule.map((slot, idx) => (
                                        <motion.div
                                            key={idx}
                                            variants={{
                                                hidden: { opacity: 0, x: -20 },
                                                visible: { opacity: 1, x: 0 }
                                            }}
                                            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white rounded-xl border border-slate-100 hover:border-purple-200 hover:shadow-md transition-all group"
                                        >
                                            <span className="font-bold text-slate-800 bg-slate-100 px-3 py-1 rounded-lg group-hover:bg-purple-100 group-hover:text-purple-700 transition-colors">
                                                {slot.grade}
                                            </span>
                                            <div className="flex items-center gap-2 text-slate-600 mt-2 sm:mt-0">
                                                <Clock className="w-4 h-4 text-purple-500" />
                                                <span className="text-sm font-medium">{slot.time}</span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section >
    );
};

export default Classes;
