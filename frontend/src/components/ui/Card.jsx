// ===== Archivo: components/ui/Card.jsx =====

// src/components/ui/Card.jsx
export const Card = ({ children }) => (
    <div className="bg-white rounded-xl shadow-md p-4">{children}</div>
);

export const CardContent = ({ children }) => (
    <div className="text-gray-800">{children}</div>
);
