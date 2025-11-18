import React, { useState } from "react";

const ToggleSection = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div style={{ margin: '20px' }}>
            <h3 onClick={() => setIsOpen(!isOpen)} style={{ cursor: 'pointer' }}>{title}</h3>
            {isOpen && children}
        </div>
    );
};

export default ToggleSection;
