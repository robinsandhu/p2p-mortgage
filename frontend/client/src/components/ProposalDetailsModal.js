import React, { useState, useEffect } from 'react'
import Modal from "react-modal"

Modal.setAppElement("#root")

const wtoE = 1000000000000000000
let getProposalClass = {
    0 : "info",
    1 : "success",
    2 : "danger"
}

function ProposalDetailsModal(props) {
    const { loanId, bankContract, account, acceptProposal, web3 } = props
    const [show, setShow] = useState(false)
    const [ proposalList, setProposalList ] = useState([])
    const [ proposalCount, setProposalCount ] = useState(0)
    const [ repayAmount, setRepayAmount ] = useState("")

    const toggleShow = () => {
        setShow(prevState => !prevState)
    }

    const getProposalAction = (proposalState, proposalId) => {
        if(proposalState == 0)
            // return '<b><a onclick="acceptProposal('+proposalId+')">ACCEPT</a></b>';
            return <b><button style={{width: "100%"}} className="btn btn-primary" onClick={() => {acceptProposal(proposalId)}}>ACCEPT</button></b>
        else if(proposalState == 1)
            return <b>Accepted</b>
        else
            return <b>Repaid</b>
    }

    const getLoanDetail = async () => {
        if(bankContract && account && loanId){
            let propList = []
            const res = await bankContract.methods.loanList(loanId).call()
            if(res[1].valueOf() === "1"){
                const repayVal = await bankContract.methods.getRepayValue(loanId).call()
                setRepayAmount(repayVal)
            }else{
                setRepayAmount("-")
            }
            let propCount = res[4].valueOf()
            setProposalCount(propCount)
            for(let i=0;i<propCount;i++){
                const propDetail = await bankContract.methods.getProposalDetailsByLoanIdPosition(loanId, i).call()
                let newRowContent = (
                    <tr className={getProposalClass[propDetail[0].valueOf()]}>
                        <td>{propDetail[2].valueOf()/wtoE} eth</td>
                        <td>{propDetail[1].valueOf()}</td>
                        <td>{getProposalAction(propDetail[0].valueOf(), propDetail[3].valueOf())}</td>
                    </tr>
                )
                propList.push(newRowContent)
            }
            setProposalList(propList)
        }
    }

    useEffect(() => {
        getLoanDetail()
    }, [bankContract, account])

    return (
        <React.Fragment>
            <button onClick={toggleShow} style={{color: "black"}}>
                Details
            </button>
            <Modal 
                isOpen={show} 
                onRequestClose={toggleShow}
                className="my-modal"
                overlayClassName="my-overlay"
            >
                <div className="my-modal-head">
                    <h3>Proposal Details</h3>
                </div>
                <hr className="divider"/>
                <div className="my-modal-body">
                    <h4>Proposal Count: {proposalCount}</h4>
                    <table className="my-modal--table">
                        <thead>
                            <tr>
                                <th>Amount</th>
                                <th>Rate of Interest</th>
                                <th>Take Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {proposalList}
                        </tbody>
                    </table>
                    <h4>Repay Amount: {repayAmount}</h4>
                </div>
                <hr className="divider"/>
                <div className="my-modal-footer">
                    <button onClick={toggleShow}>
                        Close
                    </button>
                </div>
            </Modal>
        </React.Fragment>
    );
}

export default ProposalDetailsModal
