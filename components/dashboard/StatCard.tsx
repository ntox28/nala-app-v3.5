
import React from 'react';

interface StatCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => {
    return (
        <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 flex items-center space-x-4 transition-all duration-300 hover:border-sky-500/50 hover:shadow-lg hover:shadow-sky-500/5">
            <div className="bg-slate-700/50 p-3 rounded-full">
                <div className="text-sky-400 w-6 h-6">
                   {icon}
                </div>
            </div>
            <div>
                <p className="text-sm text-slate-400">{title}</p>
                <p className="text-2xl font-bold text-white">{value}</p>
            </div>
        </div>
    );
};

export default StatCard;
