import React, { useState } from "react"
import { FaCheck } from "react-icons/fa"
const wtoE = 1000000000000000000;

function LoanRequests(props) {
    const [ proposedAmount, setProposedAmount ] = useState([1/wtoE, 1/wtoE, 1/wtoE, 1/wtoE, 1/wtoE, 1/wtoE, 1/wtoE, 1/wtoE, 1/wtoE, 1/wtoE])
    const [ proposedRate, setProposedRate ] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0, 0])

    const handleAmountChange = (event) => {
        event.persist()
        setProposedAmount((prevPA) => {
            let temp = [...prevPA]
            temp[parseInt(event.target.name.split("_")[1])] = event.target.value
            return temp
        })
    }

    const handleRateChange = (event) => {
        event.persist()
        setProposedRate((prevPR) => {
            let temp = [...prevPR]
            temp[parseInt(event.target.name.split("_")[1])] = event.target.value
            return temp
        })
    }

    const handleSubmit = (event, loanId, index) => {
        event.preventDefault()
        props.proposeLend(loanId, proposedAmount[index], proposedRate[index])
        setProposedAmount((prevPA) => {
            let temp = [...prevPA]
            temp[index] = 1/wtoE
            return temp
        })
        setProposedRate((prevPR) => {
            let temp = [...prevPR]
            temp[index] = 0
            return temp
        })
    }

    const requestsList = props.loanList.map((req, index) => {
        return (
            <tr key={index}>
                <td>{req.loanId}</td>
                <td>{req.borrower}</td>
                <td>{req.loanState}</td>
                <td>{req.dueDate}</td>
                <td>{req.amount}</td>
                <td><a target="_blank" href={req.mortgageLink}>Link</a></td>
                    <td><input type="number" name={"proposedAmount_"+index} value={proposedAmount[index]} onChange={handleAmountChange} min={1/wtoE} step={1/wtoE} style={{width: "100%"}} required/></td>
                    <td><input type="number" name={"proposedRate_"+index} value={proposedRate[index]} onChange={handleRateChange} max="100" min="0" step="0.1"style={{width: "100%"}} required/></td>
                    <td><button className="btn btn-success" style={{width: "100%"}} type="submit" onClick={(e)=>{handleSubmit(e, req.loanId, index)}} style={{width: "100%", color: "black"}}><FaCheck /></button></td>
            </tr>
        )
    })

    return (
        <div>
            <h3>Recent Loan Requests</h3>
            <table className="content-table">
                <thead>
                    <tr>
                        <th>LoanId</th>
                        <th>Borrower</th>
                        <th>Loan State</th>
                        <th>Due Date</th>
                        <th>Amount</th>
                        <th>Mortgage</th>
                        <th>Proposed ETH</th>
                        <th>Proposed Rate(%p.a)</th>
                        <th>Propose</th>
                    </tr>
                </thead>
                <tbody>
                    {requestsList}
                </tbody>
            </table>
        </div>
    )
}

export default LoanRequests
