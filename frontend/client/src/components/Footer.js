import React from "react"
import { FaHeart } from "react-icons/fa"

function Footer() {
    return (
        <div className="footer">
            <h3 className="footer-text">Made with 
                <span style={{margin: "0 5px"}}><FaHeart size="15px" color="white" /></span>
                by CPG-76</h3>
        </div>
    )
}

export default Footer