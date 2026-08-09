import React from 'react';

interface LegoBrickProps {
    title: string;
    category?: string;
    description?: string;
    color?: 'red' | 'yellow' | 'blue' | 'green';
    icon?: string;
}

export default function LegoBrick({
    title,
    category,
    description,
    color = 'red',
    icon
}: LegoBrickProps) {
    const colorStyles = {
        red: 'bg-lego-red border-red-800 text-white',
        yellow: 'bg-lego-yellow border-yellow-600 text-lego-dark',
        blue: 'bg-lego-blue border-blue-900 text-white',
        green: 'bg-lego-green border-green-800 text-white',
    };

    const studStyles = {
        red: 'bg-red-500 border-red-400',
        yellow: 'bg-yellow-300 border-yellow-200',
        blue: 'bg-blue-500 border-blue-400',
        green: 'bg-green-500 border-green-400',
    };

    return (
        <div className={`relative p-6 rounded-xl border-b-8 shadow-2xl transition-all duration-200 hover:-translate-y-2 cursor-pointer ${colorStyles[color]}`}>
            <div className="absolute -top-3 left-6 flex space-x-3">
                <span className={`w-5 h-3 rounded-t border-t ${studStyles[color]}`}></span>
                <span className={`w-5 h-3 rounded-t border-t ${studStyles[color]}`}></span>
                <span className={`w-5 h-3 rounded-t border-t ${studStyles[color]}`}></span>
            </div>

            <div className="flex items-center space-x-3 mt-1">
                {icon && <span className="text-2xl">{icon}</span>}
                <div>
                    {category && (
                        <span className="text-xs uppercase font-bold tracking-wider opacity-80 block">
                            {category}
                        </span>
                    )}
                    <h3 className="font-extrabold text-xl leading-tight">{title}</h3>
                </div>
            </div>

            {description && (
                <p className="text-sm mt-3 font-medium opacity-90">{description}</p>
            )}
        </div>
    );
}