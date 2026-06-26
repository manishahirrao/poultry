import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// FlockIQ ERP — SlidePanel/Drawer Component Pattern
// File: packages/ui/src/components/SlidePanel.tsx
// Platform: Web (React)
// Design Reference: specs/account.md SECTION 13 - Right Panel / Drawer Pattern
// Design Skills Applied: layout, typeset, polish, impeccable
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
const SlidePanel = ({ isOpen, onClose, title, titleHi = title, children, width = '480px', }) => {
    // Prevent body scroll when panel is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        }
        else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);
    // Handle escape key to close (web only)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const handleEscape = (e) => {
                if (e.key === 'Escape' && isOpen) {
                    onClose();
                }
            };
            window.addEventListener('keydown', handleEscape);
            return () => window.removeEventListener('keydown', handleEscape);
        }
    }, [isOpen, onClose]);
    return (_jsx(AnimatePresence, { mode: "wait", children: isOpen && (_jsxs(_Fragment, { children: [_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.2, ease: [0.25, 1, 0.5, 1] }, onClick: onClose, className: "fixed inset-0 bg-black/50 z-40", "aria-hidden": "true" }), _jsxs(motion.div, { initial: { x: '100%' }, animate: { x: 0 }, exit: { x: '100%' }, transition: { type: 'spring', damping: 25, stiffness: 200 }, className: "fixed right-0 top-0 h-full bg-white shadow-2xl z-50 flex flex-col", style: { width }, role: "dialog", "aria-modal": "true", "aria-labelledby": "panel-title", children: [_jsxs("div", { className: "flex items-center justify-between p-6 border-b border-[#E3EDE7]", children: [_jsx("h2", { id: "panel-title", className: "text-xl font-semibold text-[#111827] font-['Space_Grotesk','Noto_Sans_Devanagari',sans-serif]", children: titleHi ? `${titleHi} / ${title}` : title }), _jsx("button", { onClick: onClose, className: "p-2 hover:bg-[#EDF7F1] rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-inset", "aria-label": "Close panel", children: _jsx("svg", { className: "w-5 h-5 text-[#6B7280]", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", "aria-hidden": "true", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) })] }), _jsx("div", { className: "flex-1 overflow-y-auto p-6", children: children })] })] })) }));
};
export default SlidePanel;
