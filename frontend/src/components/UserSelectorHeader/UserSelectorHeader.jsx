// src/components/UserSelectorHeader/UserSelectorHeader.jsx
import React from "react";
import "./UserSelectorHeader.css";

export default function UserSelectorHeader({
    allUsers,
    selectedUser,
    setSelectedUser,
}) {
    return (
        <div className="user-selector-header">
            <label htmlFor="userSelect" className="user-selector-label">
                Usuario:
            </label>
            <select
                id="userSelect"
                value={selectedUser?._id || ""}
                onChange={(e) => {
                    const userObj = allUsers.find(
                        (u) => u._id === e.target.value
                    );
                    setSelectedUser(userObj || null);
                }}
                className="user-selector-select"
            >
                <option value="" disabled>
                    -- Seleccione usuario --
                </option>
                {allUsers.map((u) => (
                    <option key={u._id} value={u._id}>
                        {u.name} {u.surnames}
                    </option>
                ))}
            </select>
        </div>
    );
}
