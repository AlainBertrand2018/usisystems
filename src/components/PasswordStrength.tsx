import { Check, X } from 'lucide-react';
import { validatePassword } from '@/lib/validation';

export default function PasswordStrength({ password }: { password: string }) {
    if (!password) return null;

    const { checks } = validatePassword(password);

    const requirements = [
        { label: '8+ Characters', met: checks.minLength },
        { label: 'Uppercase Letter', met: checks.hasUpperCase },
        { label: 'Lowercase Letter', met: checks.hasLowerCase },
        { label: 'Number', met: checks.hasNumber },
        { label: 'Symbol', met: checks.hasSymbol },
    ];

    return (
        <div className="bg-gray-50 rounded-2xl p-4 space-y-2 mt-2 border border-gray-100">
            <p className="text-[10px] font-black uppercase text-[#6c757d] mb-2 tracking-wider">Security Requirements</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1.5">
                {requirements.map((req) => (
                    <div key={req.label} className="flex items-center gap-2">
                        {req.met ? (
                            <div className="bg-emerald-500 rounded-full p-0.5">
                                <Check size={8} className="text-white" />
                            </div>
                        ) : (
                            <div className="bg-gray-200 rounded-full p-0.5">
                                <X size={8} className="text-white" />
                            </div>
                        )}
                        <span className={`text-[10px] font-bold ${req.met ? 'text-emerald-600' : 'text-gray-400'}`}>
                            {req.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
