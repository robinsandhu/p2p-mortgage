import React from "react"
import { Link } from "react-router-dom"
import { FaYCombinator, FaMoneyBillAlt } from "react-icons/fa"

function Home() {
    return (
        <div className="intro-message">
            <h1>Smart Mortgage Bank</h1>
            <h4>A peer-to-peer loan market with Mortgage based guarantee.</h4>
            <hr className="divider" />
            <ul className="list">
                <Link to="/lend" style={{textDecoration: "none"}} >
                    <li className="list--item btn-success btn">
                        <FaYCombinator size="15" />
                        <span style={{padding: "0 5px", fontSize: "20px"}}>Invest</span>
                    </li>
                </Link>
                <Link to="/borrow" style={{textDecoration: "none"}} >
                    <li className="list--item btn-danger btn">
                        <FaMoneyBillAlt size="15" />
                        <span style={{padding: "0 5px", fontSize: "20px"}}>Borrow</span>
                    </li>
                </Link>
            </ul>
        </div>
    )
}

export default Home