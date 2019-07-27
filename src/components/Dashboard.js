import React from 'react';

function Dashboard({
    /**
     * Current user name
     */
    currentUser,
    /**
     * List of currently online user
     */
    users,
    /**
     * function to make webRTC connection to another user
     */
    call,
}) {
    return (
        <div>
            <h2>Welcome {currentUser}</h2>
            <br />
            <h3>Users online:</h3>
            <ul>
                {
                    users.map(user => (
                        <li key={user}>
                            <div style={{ display: 'flex' }}>
                                <p>{user}  </p>
                                <button onClick={() => call(currentUser, user, currentUser)}>Call</button>
                            </div>
                        </li>
                    ))
                }
            </ul>
        </div>
    )
}

export default Dashboard;