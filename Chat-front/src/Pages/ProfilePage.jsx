import React, { useState, useEffect } from "react";
import "./ProfilePage.css";
import { getAvatarColor } from "../utils/avatar";

const ProfilePage = ({ 
    currentUser, 
    onUpdateProfile,
    onBack
}) => {
    const [name, setName] = useState("");
    const [photoBase64, setPhotoBase64] = useState("");
    const [updateMessage, setUpdateMessage] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        if (currentUser) {
            setName(currentUser.name);
            setPhotoBase64(currentUser.profilePic || "");
        }
    }, [currentUser]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Verify it is an image file
        if (!file.type.startsWith("image/")) {
            setUpdateMessage("Please select an image file.");
            return;
        }

        // Limit size to 2MB to keep Mongo payload reasonable
        if (file.size > 2 * 1024 * 1024) {
            setUpdateMessage("Image size must be less than 2MB.");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setPhotoBase64(reader.result);
            setUpdateMessage("");
        };
        reader.readAsDataURL(file);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        setIsUpdating(true);
        setUpdateMessage("");

        try {
            await onUpdateProfile({
                name: name.trim(),
                profilePic: photoBase64
            });
            setUpdateMessage("Profile updated successfully!");
            setTimeout(() => setUpdateMessage(""), 3000);
        } catch (err) {
            setUpdateMessage("Failed to update profile.");
        } finally {
            setIsUpdating(false);
        }
    };

    if (!currentUser) return <div className="profile-page-loading">Loading Profile...</div>;

    const renderProfileLargeAvatar = () => {
        if (photoBase64) {
            return (
                <img 
                    src={photoBase64} 
                    alt={currentUser.username} 
                    className="profile-large-avatar"
                />
            );
        }
        
        // Fallback initials
        const initialText = name ? name.slice(0, 2).toUpperCase() : currentUser.username.slice(0, 2).toUpperCase();
        const background = getAvatarColor(currentUser.username);
        
        return (
            <div 
                className="user-avatar-initials profile-large" 
                style={{ background }}
            >
                {initialText}
            </div>
        );
    };

    return (
        <div className="profile-page-container">
            <div className="profile-glass-card">
                {/* Mobile Back Button */}
                <button className="mobile-back-btn profile-back-btn" onClick={onBack} style={{ position: 'absolute', top: '1rem', left: '1rem' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                </button>
                {/* Profile Avatar Header */}
                <div className="profile-header">
                    {renderProfileLargeAvatar()}
                    <div className="profile-title-info">
                        <h2>{currentUser.name}</h2>
                        <p>@{currentUser.username}</p>
                    </div>
                </div>

                {/* Edit Profile Form */}
                <form onSubmit={handleUpdate} className="profile-edit-form">
                    <h3>Edit Profile Details</h3>
                    {updateMessage && (
                        <p className={updateMessage.includes("successfully") ? "profile-success" : "profile-error"}>
                            {updateMessage}
                        </p>
                    )}
                    <div className="profile-form-group">
                        <label>Display Name</label>
                        <input 
                            type="text" 
                            className="profile-input" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className="profile-form-group">
                        <label>Profile Photo</label>
                        <div className="profile-photo-upload-row">
                            <input 
                                type="file" 
                                id="profile-file-input" 
                                accept="image/*" 
                                onChange={handleFileChange} 
                                style={{ display: "none" }}
                            />
                            <button 
                                type="button" 
                                className="profile-upload-btn" 
                                onClick={() => document.getElementById("profile-file-input").click()}
                            >
                                Upload Photo
                            </button>
                            {photoBase64 && (
                                <button 
                                    type="button" 
                                    className="profile-remove-btn" 
                                    onClick={() => {
                                        setPhotoBase64("");
                                        // Reset the file input so selection works again if selecting same file
                                        const fileInput = document.getElementById("profile-file-input");
                                        if (fileInput) fileInput.value = "";
                                    }}
                                >
                                    Remove Photo
                                </button>
                            )}
                        </div>
                        <span className="profile-helper">Upload a JPG, PNG or GIF file. Max size 2MB.</span>
                    </div>
                    <button type="submit" className="profile-submit-btn" disabled={isUpdating}>
                        {isUpdating ? "Updating..." : "Save Profile"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;
