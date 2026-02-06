'use client';

import { useState, useEffect } from 'react';
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    isSameMonth,
    isSameDay,
    addDays,
    subDays,
    eachDayOfInterval,
    startOfDay,
    endOfDay,
    addWeeks,
    subWeeks
} from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, MapPin, User, ChevronDown, List } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import AppointmentModal from '@/components/AppointmentModal';

type ViewMode = 'month' | 'week' | 'day';

export default function AppointmentsPage() {
    const { user } = useAuth();
    const [viewMode, setViewMode] = useState<ViewMode>('month');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

    useEffect(() => {
        if (!user) return;

        const collRef = collection(db, 'appointments');
        const q = user.role === 'super_admin'
            ? query(collRef, orderBy('date', 'desc'), limit(200))
            : query(collRef, where('businessId', '==', user.businessId), orderBy('date', 'desc'), limit(200));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                // Convert Firestore timestamp to Date
                date: doc.data().date?.seconds ? new Date(doc.data().date.seconds * 1000) : null
            }));
            setAppointments(items.filter(item => item.date));
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const handleNewAppointment = (date?: Date) => {
        setSelectedAppointment(null);
        setSelectedDate(date || new Date());
        setIsModalOpen(true);
    };

    const handleEditAppointment = (appt: any) => {
        setSelectedAppointment(appt);
        setSelectedDate(appt.date);
        setIsModalOpen(true);
    };

    const nextDate = () => {
        if (viewMode === 'month') setCurrentDate(addMonths(currentDate, 1));
        else if (viewMode === 'week') setCurrentDate(addWeeks(currentDate, 1));
        else setCurrentDate(addDays(currentDate, 1));
    };

    const prevDate = () => {
        if (viewMode === 'month') setCurrentDate(subMonths(currentDate, 1));
        else if (viewMode === 'week') setCurrentDate(subWeeks(currentDate, 1));
        else setCurrentDate(subDays(currentDate, 1));
    };

    const goToToday = () => setCurrentDate(new Date());

    const renderHeader = () => (
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8 px-2">
            <div>
                <h1 className="text-3xl font-black text-[#1a1a1a] flex items-center gap-3">
                    {format(currentDate, 'MMMM yyyy')}
                    <span className="text-sm font-bold text-[#107d92] bg-[#107d92]/10 px-3 py-1 rounded-full uppercase tracking-widest">
                        {viewMode}
                    </span>
                </h1>
                <p className="text-[#6c757d] text-sm font-medium mt-1">Smart scheduling & event monitoring</p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                {/* View Toggles */}
                <div className="flex bg-gray-100/50 p-1.5 rounded-[20px] border border-gray-100">
                    {(['month', 'week', 'day'] as ViewMode[]).map((mode) => (
                        <button
                            key={mode}
                            onClick={() => setViewMode(mode)}
                            className={`px-5 py-2 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${viewMode === mode
                                ? 'bg-white text-[#107d92] shadow-sm'
                                : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            {mode}
                        </button>
                    ))}
                </div>

                {/* Navigation */}
                <div className="flex items-center gap-2">
                    <button onClick={goToToday} className="px-5 py-2.5 bg-white border border-gray-200 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-all">
                        Today
                    </button>
                    <div className="flex bg-white border border-gray-200 rounded-2xl overflow-hidden">
                        <button onClick={prevDate} className="p-2.5 hover:bg-gray-50 text-gray-400">
                            <ChevronLeft size={20} />
                        </button>
                        <div className="w-[1px] bg-gray-100"></div>
                        <button onClick={nextDate} className="p-2.5 hover:bg-gray-50 text-gray-400">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                <button
                    onClick={() => handleNewAppointment()}
                    className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-[#107d92] text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-[#107d92]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    <Plus size={18} />
                    <span>Schedule</span>
                </button>
            </div>
        </div>
    );

    const renderMonthView = () => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);
        const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

        const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden"
            >
                <div className="grid grid-cols-7 border-b border-gray-50">
                    {weekDays.map(day => (
                        <div key={day} className="py-6 text-center text-[10px] font-black uppercase tracking-[0.2em] text-[#6c757d] border-r border-gray-50 last:border-0">
                            {day}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7">
                    {calendarDays.map((day, i) => {
                        const dayAppointments = appointments.filter(appt => isSameDay(appt.date, day));
                        const isCurrentMonth = isSameMonth(day, monthStart);
                        const isToday = isSameDay(day, new Date());

                        return (
                            <div
                                key={i}
                                className={`min-h-[140px] p-4 border-r border-b border-gray-50 transition-colors group relative ${!isCurrentMonth ? 'bg-gray-50/30' : 'hover:bg-gray-50/50'
                                    }`}
                                onClick={() => handleNewAppointment(day)}
                            >
                                <span className={`text-sm font-black transition-colors ${isToday
                                    ? 'bg-[#107d92] text-white w-8 h-8 flex items-center justify-center rounded-xl shadow-lg shadow-[#107d92]/20'
                                    : isCurrentMonth ? 'text-[#1a1a1a]' : 'text-gray-300'
                                    }`}>
                                    {format(day, 'd')}
                                </span>

                                <div className="mt-4 space-y-1.5">
                                    {dayAppointments.slice(0, 3).map((appt, idx) => (
                                        <div
                                            key={idx}
                                            onClick={(e) => { e.stopPropagation(); handleEditAppointment(appt); }}
                                            className="bg-[#107d92]/5 border border-[#107d92]/10 rounded-lg px-2.5 py-1.5 flex items-center gap-2 group/item hover:bg-[#107d92]/10 transition-colors cursor-pointer"
                                        >
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#107d92]"></div>
                                            <p className="text-[10px] font-bold text-[#107d92] truncate flex-1">
                                                {format(appt.date, 'HH:mm')} - {appt.title}
                                            </p>
                                        </div>
                                    ))}
                                    {dayAppointments.length > 3 && (
                                        <p className="text-[10px] font-black text-[#6c757d] pl-1 uppercase tracking-wider opacity-60">
                                            + {dayAppointments.length - 3} more
                                        </p>
                                    )}
                                </div>

                                <button className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 rounded-full bg-[#107d92] text-white flex items-center justify-center shadow-lg shadow-[#107d92]/20">
                                    <Plus size={16} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            </motion.div>
        );
    };

    const renderWeekView = () => {
        const startDate = startOfWeek(currentDate);
        const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));
        const hours = Array.from({ length: 14 }, (_, i) => i + 7); // 7 AM to 8 PM

        return (
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden"
            >
                <div className="grid grid-cols-8 border-b border-gray-50">
                    <div className="border-r border-gray-50"></div>
                    {weekDays.map(day => (
                        <div key={day.toString()} className="py-6 px-4 text-center border-r border-gray-50 last:border-0">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6c757d] mb-1">{format(day, 'EEE')}</p>
                            <p className={`text-lg font-black ${isSameDay(day, new Date()) ? 'text-[#107d92]' : 'text-[#1a1a1a]'}`}>
                                {format(day, 'd')}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="overflow-y-auto max-h-[700px] no-scrollbar">
                    {hours.map(hour => (
                        <div key={hour} className="grid grid-cols-8 border-b border-gray-50 group">
                            <div className="py-8 px-4 text-[10px] font-black text-gray-400 text-right border-r border-gray-50 group-hover:text-[#107d92] transition-colors">
                                {format(new Date().setHours(hour, 0), 'HH:mm')}
                            </div>
                            {weekDays.map(day => {
                                const hourAppts = appointments.filter(appt =>
                                    isSameDay(appt.date, day) && appt.date.getHours() === hour
                                );
                                return (
                                    <div
                                        key={day.toString() + hour}
                                        className="border-r border-gray-50 last:border-0 p-2 hover:bg-gray-50/50 transition-colors relative"
                                        onClick={() => {
                                            const d = new Date(day);
                                            d.setHours(hour, 0);
                                            handleNewAppointment(d);
                                        }}
                                    >
                                        {hourAppts.map((appt, idx) => (
                                            <div
                                                key={idx}
                                                onClick={(e) => { e.stopPropagation(); handleEditAppointment(appt); }}
                                                className="bg-white border-2 border-[#107d92]/20 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer"
                                            >
                                                <p className="text-xs font-black text-[#1a1a1a] mb-2">{appt.title}</p>
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-[#6c757d]">
                                                    <Clock size={12} className="text-[#107d92]" />
                                                    {format(appt.date, 'HH:mm')}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </motion.div>
        );
    };

    const renderDayView = () => {
        const hours = Array.from({ length: 14 }, (_, i) => i + 7);
        const dayAppts = appointments.filter(appt => isSameDay(appt.date, currentDate));

        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
                <div className="lg:col-span-2 bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-8 border-b border-gray-50 bg-gray-50/30">
                        <h3 className="font-black text-xl text-[#1a1a1a]">{format(currentDate, 'EEEE, do MMMM')}</h3>
                    </div>
                    <div className="overflow-y-auto max-h-[700px] no-scrollbar">
                        {hours.map(hour => {
                            const hourAppts = dayAppts.filter(a => a.date.getHours() === hour);
                            return (
                                <div key={hour} className="flex border-b border-gray-50 group hover:bg-gray-50/20 transition-all">
                                    <div className="w-24 py-10 px-6 text-[10px] font-black text-gray-400 text-right border-r border-gray-50 group-hover:text-[#107d92] transition-colors">
                                        {format(new Date().setHours(hour, 0), 'HH:mm')}
                                    </div>
                                    <div
                                        className="flex-1 p-4 flex gap-4 overflow-x-auto no-scrollbar"
                                        onClick={() => {
                                            const d = new Date(currentDate);
                                            d.setHours(hour, 0);
                                            handleNewAppointment(d);
                                        }}
                                    >
                                        {hourAppts.map((appt, idx) => (
                                            <div
                                                key={idx}
                                                onClick={(e) => { e.stopPropagation(); handleEditAppointment(appt); }}
                                                className="min-w-[280px] bg-white border-2 border-[#107d92]/10 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group/card cursor-pointer"
                                            >
                                                <div className="flex justify-between items-start mb-4">
                                                    <span className="px-3 py-1 bg-[#107d92]/10 text-[#107d92] rounded-full text-[10px] font-black uppercase tracking-widest">
                                                        {appt.location || 'Internal'}
                                                    </span>
                                                    <Clock size={16} className="text-gray-300 group-hover/card:text-[#107d92] transition-colors" />
                                                </div>
                                                <h4 className="font-black text-[#1a1a1a] mb-2">{appt.title}</h4>
                                                <p className="text-xs text-[#6c757d] font-medium opacity-70 line-clamp-2">{appt.description}</p>
                                                <div className="mt-6 flex items-center gap-3 pt-4 border-t border-gray-50">
                                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[#107d92]">
                                                        <User size={14} />
                                                    </div>
                                                    <span className="text-xs font-bold text-[#1a1a1a]">{appt.clientName}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-[#107d92] rounded-[40px] p-8 text-white shadow-2xl shadow-[#107d92]/30">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">Today's Focus</p>
                        <h4 className="text-2xl font-black mb-6">{dayAppts.length} Meetings</h4>
                        <div className="space-y-4">
                            {dayAppts.slice(0, 4).map((a, i) => (
                                <div
                                    key={i}
                                    onClick={() => handleEditAppointment(a)}
                                    className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 cursor-pointer hover:bg-white/20 transition-all"
                                >
                                    <p className="text-xs font-black truncate">{a.title}</p>
                                    <p className="text-[10px] font-bold opacity-60 mt-1">{format(a.date, 'HH:mm')}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm">
                        <h4 className="font-black text-[#1a1a1a] mb-6 flex items-center gap-2">
                            <List size={18} className="text-[#107d92]" />
                            Upcoming Next
                        </h4>
                        <div className="space-y-6">
                            {appointments
                                .filter(a => a.date > new Date())
                                .sort((a, b) => a.date.getTime() - b.date.getTime())
                                .slice(0, 3)
                                .map((a, i) => (
                                    <div
                                        key={i}
                                        onClick={() => handleEditAppointment(a)}
                                        className="flex items-start gap-4 cursor-pointer group/next"
                                    >
                                        <div className="w-12 h-12 rounded-2xl bg-gray-50 flex flex-col items-center justify-center text-[#107d92]">
                                            <span className="text-[10px] font-black uppercase">{format(a.date, 'MMM')}</span>
                                            <span className="text-lg font-black leading-none">{format(a.date, 'dd')}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm text-[#1a1a1a] truncate">{a.title}</p>
                                            <p className="text-xs text-[#6c757d] font-bold opacity-60 mt-0.5">{format(a.date, 'HH:mm')}</p>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    };

    if (loading) {
        return (
            <div className="h-[70vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#107d92]/20 border-t-[#107d92] rounded-full animate-spin"></div>
                    <p className="text-xs font-black uppercase tracking-widest text-gray-400">Loading Calendar Engine...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="pb-10 max-w-[1600px] mx-auto">
            {renderHeader()}

            <div className="px-2">
                {viewMode === 'month' && renderMonthView()}
                {viewMode === 'week' && renderWeekView()}
                {viewMode === 'day' && renderDayView()}
            </div>

            <AppointmentModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedDate(null);
                    setSelectedAppointment(null);
                }}
                initialDate={selectedDate}
                initialData={selectedAppointment}
            />
        </div>
    );
}

// subDays helper removed
