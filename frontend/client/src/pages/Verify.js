import React from 'react'

function Verify() {
    return (
        <div style={{textAlign: "center"}} >
            <h3>Central Mortgage Verification System</h3>
            <hr className="divider" />
            <form className="verify-form">
                <input type="text" value="" placeholder="Add hash value" />
                <button>Verify</button>
            </form>
            <hr className="divider" />
        </div>
    )
}

export default Verify
