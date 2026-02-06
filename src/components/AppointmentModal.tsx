'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Calendar, MapPin, Search, Loader2, User } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';

interface AppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AppointmentModal({ isOpen, onClose }: AppointmentModalProps) {
    const [loading, setLoading] = useState(false);
    const [clients, setClients] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        clientId: '',
        clientName: '',
        date: '',
        time: '',
        location: '',
        description: ''
    });

    useEffect(() => {
        if (isOpen) {
            const fetchClients = async () => {
                const q = query(collection(db, 'clients'), orderBy('name', 'asc'));
                const snap = await getDocs(q);
                setClients(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            };
            fetchClients();
        }
    }, [isOpen]);

    const [showDropdown, setShowDropdown] = useState(false);

    if (!isOpen) return null;

    const filteredClients = clients.filter(c =>
        (c.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.company?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.clientId) {
            alert('Please select a client.');
            return;
        }
        setLoading(true);

        try {
            const schedDate = new Date(`${formData.date}T${formData.time}`);
            await addDoc(collection(db, 'appointments'), {
                title: formData.title,
                clientId: formData.clientId,
                clientName: formData.clientName,
                date: schedDate,
                location: formData.location,
                description: formData.description,
            });
            alert('Appointment scheduled!');
            onClose();
            setFormData({ title: '', clientId: '', clientName: '', date: '', time: '', location: '', description: '' });
            setSearchTerm('');
        } catch (error) {
            console.error("Error adding appointment:", error);
            alert('Failed to schedule.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-[#1a1a1a]/40 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <div>
                            <h2 className="text-2xl font-black text-[#1a1a1a]">Schedule Appointment</h2>
                            <p className="text-[#6c757d] text-sm font-bold mt-1">Book a new client meeting</p>
                        </div>
                        <button onClick={onClose} className="p-3 hover:bg-white rounded-2xl transition-colors text-gray-400 hover:text-gray-900 border border-transparent hover:border-gray-100">
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto no-scrollbar">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-[#6c757d] uppercase px-1">Meeting Title</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-gray-50 border-2 border-transparent focus:border-[#107d92] focus:bg-white rounded-2xl px-5 py-4 outline-none font-bold text-sm transition-all shadow-sm"
                                    placeholder="e.g. Project Kickoff, Consultation"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-[#6c757d] uppercase px-1">Client Selection</label>
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onFocus={() => setShowDropdown(true)}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setShowDropdown(true);
                                        }}
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-[#107d92] focus:bg-white rounded-2xl pl-12 pr-5 py-4 outline-none font-bold text-sm transition-all shadow-sm"
                                        placeholder="Search for a client..."
                                    />
                                    {showDropdown && searchTerm && filteredClients.length > 0 && (
                                        <div className="absolute z-10 w-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 max-h-[200px] overflow-y-auto">
                                            {filteredClients.map(c => (
                                                <button
                                                    key={c.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setFormData({ ...formData, clientId: c.id, clientName: c.name });
                                                        setSearchTerm(c.name);
                                                        setShowDropdown(false);
                                                    }}
                                                    className="w-full text-left p-4 hover:bg-gray-50 text-sm font-bold border-b border-gray-50 last:border-0"
                                                >
                                                    {c.name} <span className="text-gray-400 font-medium">({c.company})</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {formData.clientId && (
                                    <div className="flex items-center gap-2 mt-2 px-1 text-[#107d92] font-black text-xs uppercase tracking-tight">
                                        <User size={14} /> Selected: {formData.clientName}
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-[#6c757d] uppercase px-1">Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-[#107d92] focus:bg-white rounded-2xl px-5 py-4 outline-none font-bold text-sm transition-all shadow-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-[#6c757d] uppercase px-1">Time</label>
                                    <input
                                        type="time"
                                        required
                                        value={formData.time}
                                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-[#107d92] focus:bg-white rounded-2xl px-5 py-4 outline-none font-bold text-sm transition-all shadow-sm"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-[#6c757d] uppercase px-1">Location / Link</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        required
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-[#107d92] focus:bg-white rounded-2xl pl-12 pr-5 py-4 outline-none font-bold text-sm transition-all shadow-sm"
                                        placeholder="Office Address or Google Meet Link"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-[#6c757d] uppercase px-1">Description / Notes</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-gray-50 border-2 border-transparent focus:border-[#107d92] focus:bg-white rounded-2xl px-5 py-4 outline-none font-bold text-sm transition-all shadow-sm min-h-[80px]"
                                    placeholder="What is this meeting about?"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#107d92] text-white rounded-3xl py-5 font-black text-lg shadow-xl shadow-[#107d92]/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <Calendar size={22} />}
                            <span>Confirm Appointment</span>
                        </button>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
