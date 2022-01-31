import React, { useEffect, useState } from "react"
import LoanProposals from "../components/LoanProposals";
import LoanRequests from "../components/LoanRequests";

const wtoE = 1000000000000000000
const GAS_AMOUNT = 2000000
let PROPOSALSTATE = {
    0 : "WAITING",
    1 : "ACCEPTED",
    2 : "REPAID"
}

let LOANSTATE = {
    0 : "ACCEPTING",
    1 : "LOCKED",
    2 : "COMPLETED SUCCESSFUL",
    3 : "COMPLETION FAILED"
}

let LOANSTATECLASS = {
    0 : "primary",
    1 : "info",
    2 : "success",
    3 : "danger"
}

function Lend(props) {
    const { account, web3, bankContract, assetContract } = props
    const [ balance, setBalance ] = useState(0)
    const [ proposals, setProposals ] = useState([])
    const [ loanList, setLoanList ] = useState([])
    
    const getBalance = async () => {
        if(account === null || web3 === null){
            return
        }
        try{
            let val = await web3.eth.getBalance(account)
            setBalance(val/wtoE)
        }catch(error){
            console.log(error)
        }
    }

    const revokeProposal = (id) => {
        if(bankContract === null || account === null)
            return
        bankContract.methods.revokeMyProposal(id).send({from: account, gas: GAS_AMOUNT}).then(console.log).catch(console.log)
    }

    const populateProposals = async () => {
        if(bankContract === null || account === null || assetContract === null)
        return

        const proposalLength = await bankContract.methods.totalProposalsBy(account).call()
        let proposalsList = []
        let curpos = 0 // sus
        for(let i = 0; i < proposalLength; i++){
            let temp_prop = {
                loanId: null,
                amount: null,
                dueDate: null,
                mortgageLink: null,
                proposalState: null,
                proposedRate: null,
                proposedAmount: null,
                canRevoke: null,
                proposalRevokeId: null
            }
            const proposal = await bankContract.methods.getProposalAtPosFor(account, i).call()
            console.log("hehe", proposal)
            temp_prop.proposalRevokeId = i;
            const currentDate = new Date()
            const dd = new Date(proposal[6].valueOf()*1000)
            if(proposal[2].valueOf() === "0" || dd < currentDate){
                temp_prop.canRevoke = true
            }else{
                temp_prop.canRevoke = false
            }
            temp_prop.loanId = proposal[1].valueOf()
            temp_prop.amount = proposal[5].valueOf()/wtoE
            temp_prop.dueDate = dd.toDateString()
            const tokenId = await findTokenId(proposal[7].valueOf())
            const cid = await assetContract.methods.tokenURI(tokenId).call()
            temp_prop.mortgageLink = "https://gateway.pinata.cloud/ipfs/" + cid
            temp_prop.proposalState = PROPOSALSTATE[proposal[2].valueOf()]
            temp_prop.proposedRate = proposal[3].valueOf()
            temp_prop.proposedAmount = proposal[4].valueOf()/wtoE
            proposalsList.push(temp_prop)

        }
        setProposals(proposalsList)
    }

    const proposeLend = (id, amount, rate) => {
        if(web3 === null || account === null || bankContract === null)
            return
        console.log("Lending " + amount + " Ether to LoanId " + id)
        bankContract.methods.newProposal(id, rate).send({value: web3.utils.toWei(amount.toString(), 'ether'), from: account, gas: GAS_AMOUNT}).then(console.log).catch(console.log)
    }

    const findTokenId = async (tokenVal) => {
        const supply = await assetContract.methods.totalSupply().call()
        for(let i=0;i<supply;i++){
            const val = await assetContract.methods.assets(i).call()
            val.valueOf()
            if(val === tokenVal){
                return i
            }
        }
        return -1
    }

    const populateRecentLoans = async () => {
        if(bankContract === null || account === null || assetContract === null)
        return
        const numLoans = await bankContract.methods.numTotalLoans().call()
        let loanListTemp = []
        let ccount = 0
        for(let i=0; loanListTemp.length < 10 && numLoans-1-i >=0; i++){
            let loanRequest = {
                loanId: null,
                borrower: null,
                loanState: null,
                dueDate: null,
                amount: null,
                mortgageLink: null
            }
            const loan = await bankContract.methods.loanList(numLoans-1-i).call()
            // console.log(loan)
            if(loan[0].valueOf() !== account && loan[1].valueOf() === "0"){
                loanRequest.loanId = (numLoans - 1 - i)
                loanRequest.borrower = loan[0].valueOf()
                loanRequest.loanState = LOANSTATE[loan[1].valueOf()]
                loanRequest.dueDate = new Date(loan[2].valueOf()*1000).toDateString()
                // let dd = loanRequest.dueDate
                // loanRequest.dueDate = dd.getDate() + "/" + (dd.getMonth()+1) + "/" + dd.getFullYear()
                loanRequest.amount = loan[3].valueOf()/wtoE
                const tokenId = await findTokenId(loan[7].valueOf())
                const cid = await assetContract.methods.tokenURI(tokenId).call()
                loanRequest.mortgageLink = "https://gateway.pinata.cloud/ipfs/" + cid
            }
            if(loanRequest.loanId !== null)
                loanListTemp.push(loanRequest)
        }
        setLoanList(loanListTemp)
    }

    useEffect(() => {
        getBalance()
    }, [web3, account])

    useEffect(() => {
        populateProposals()
        populateRecentLoans()
    }, [bankContract, account, assetContract])

    return (
        <div>
            <h1 >Hi! Lender</h1>
            <h4>Welcome to Crowd Bank</h4>
            <hr className="divider"/>
            <h4>Your Account: {account && account.toLowerCase()}</h4>
            <h4>Your Balance: {balance} ETH</h4>
            <hr className="divider"/>
            <LoanProposals proposals={proposals} revokeProposal={revokeProposal}/>
            <hr className="divider"/>
            <LoanRequests loanList={loanList} proposeLend={proposeLend}/>
        </div>
    )
}

export default Lend