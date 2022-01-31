import React from "react"
import { ImCross } from "react-icons/im"

function LoanProposals(props) {
    const proposalsList = props.proposals.map((proposal, index) => {
        let buttonHTML = "--"

        if(proposal.canRevoke){
            buttonHTML = <button style={{width: "100%"}} className="btn btn-danger" onClick={() => {props.revokeProposal(proposal.proposalRevokeId)}}><ImCross></ImCross></button>
        }
        console.log(proposal)

        return (
            <tr key={index} className={"proposal"+index}>
                <td>{proposal.loanId}</td>
                <td>{proposal.amount}</td>
                <td>{proposal.dueDate}</td>
                <td><a target="_blank" href={proposal.mortgageLink}>Link</a></td>
                <td>{proposal.proposalState}</td>
                <td>{proposal.proposedRate}</td>
                <td>{proposal.proposedAmount}</td>
                <td>{buttonHTML}</td>
            </tr>
        )
    })

    return (
        <div>
            <h3>Your List of Proposals</h3>
            <table className="content-table">
                <thead>
                    <tr>
                        <th>LoanId</th>
                        <th>Amount Asked</th>
                        <th>Due Date</th>
                        <th>Mortgage</th>
                        <th>Proposal State</th>
                        <th>Proposed Rate</th>
                        <th>Proposed Amount</th>
                        <th>Revoke</th>
                    </tr>
                </thead>
                <tbody>
                    {proposalsList}
                </tbody>
            </table>
        </div>
    )
}

export default LoanProposals