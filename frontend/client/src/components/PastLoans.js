import React, { useState, useEffect } from 'react'
import ProposalDetailsModal from './ProposalDetailsModal'

const wtoE = 1000000000000000000
const GAS_AMOUNT = 9000000
let LOANSTATE = {
    0 : "ACCEPTING",
    1 : "LOCKED",
    2 : "COMPLETED SUCCESSFULLY",
    3 : "COMPLETION FAILED"
}

let LOANSTATECLASS = {
    0 : "primary",
    1 : "info",
    2 : "success",
    3 : "danger"
}

function PastLoans(props) {
    const { pastLoansList, lockLoan, repayLoan, bankContract, account, acceptProposal } = props

    function loanStateAction(state,loanId){
        if(state == 0){
            // return '<button class="btn btn-danger" onclick="lockLoan('+loanId+')">LOCK</button>';
            return <button className="btn btn-danger" onClick={() => {lockLoan(loanId)}}>LOCK</button>
        }else if(state == 1){
            // return '<button class="btn btn-success" onclick="repayLoan('+loanId+')">REPAY</button>';
            return <button className="btn btn-success" onClick={() => {repayLoan(loanId)}}>REPAY</button>
        }
        else
            return '-';
    }

    const pastLoans = pastLoansList.map((loan, index) => {
        return (
            <tr key={index}>
                <td>{loan[4].valueOf()}</td>
                <td>{LOANSTATE[loan[0].valueOf()]}</td>
                <td>{new Date(loan[1].valueOf()*1000).toDateString()}</td>
                <td>{loan[2].valueOf()/wtoE} eth</td>
                <td><a target="_blank" href={"https://gateway.pinata.cloud/ipfs/"+loan[5].valueOf()}>Link</a></td>
                <td>{loan[3].valueOf()/wtoE} eth</td>
                <td><ProposalDetailsModal loanId={loan[4].valueOf()} bankContract={bankContract} account={account} acceptProposal={acceptProposal} /></td>
                <td>{loanStateAction(loan[0].valueOf(), loan[4].valueOf())}</td>
            </tr>
        )
    })

    return (
        <div>
            <h3>Your Past Loan Details</h3>
            <table className="content-table">
                <thead>
                    <tr>
                        <th>LoanId</th>
                        <th>Loan State</th>
                        <th>Due Date</th>
                        <th>Amount Asked</th>
                        <th>Mortgage Given</th>
                        <th>Amount Collected</th>
                        <th>Details</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {pastLoans}
                </tbody>
            </table>
        </div>
    )
}

export default PastLoans
