import React from "react";

export const getAvatarColor = (username) => {
    const colors = [
        "linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)",
        "linear-gradient(135deg, #4E54C8 0%, #8F94FB 100%)",
        "linear-gradient(135deg, #11998E 0%, #38EF7D 100%)",
        "linear-gradient(135deg, #FC466B 0%, #3F5EFB 100%)",
        "linear-gradient(135deg, #7F00FF 0%, #E100FF 100%)",
        "linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%)",
        "linear-gradient(135deg, #00B4DB 0%, #0083B0 100%)"
    ];
    let hash = 0;
    const str = username || "";
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colorIndex = Math.abs(hash) % colors.length;
    return colors[colorIndex];
};

export const renderAvatar = (user, sizeClass = "") => {
    if (!user) return null;
    
    if (user.profilePic) {
        return (
            <img 
                src={user.profilePic} 
                alt={user.username} 
                className={`user-avatar ${sizeClass}`} 
            />
        );
    }
    
    // Fallback: Initials placeholder
    const name = user.name || user.username || "?";
    const initials = name.slice(0, 2).toUpperCase();
    const background = getAvatarColor(user.username);

    return (
        <div 
            className={`user-avatar-initials ${sizeClass}`} 
            style={{ background }}
        >
            {initials}
        </div>
    );
};
