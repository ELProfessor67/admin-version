import React from 'react';

const UserList = ({ title, users, onUsersChange, error }) => {

    const handleChange = (event) => {
        onUsersChange(event.target.value.split(';'));
    };
    
    return (
        <div className="form-group">
            <label>{title}</label>
            <textarea
                className="form-control"
                rows="5"
                defaultValue={users.join(';')}
                onChange={handleChange}
            />
            {error && <div className="text-danger">{error}</div>}
        </div>
    );
};

export default UserList; 