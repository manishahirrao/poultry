import React from 'react';
export interface SlidePanelProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    titleHi?: string;
    children: React.ReactNode;
    width?: string;
}
declare const SlidePanel: React.FC<SlidePanelProps>;
export default SlidePanel;
//# sourceMappingURL=SlidePanel.d.ts.map