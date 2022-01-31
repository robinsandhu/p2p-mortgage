import React, { useState, useEffect } from "react"
import LoanRequestForm from "../components/LoanRequestForm"
import PastLoans from "../components/PastLoans"

const wtoE = 1000000000000000000
const GAS_AMOUNT = 9000000
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

let getProposalClass = {
    0 : "info",
    1 : "success",
    2 : "danger"
  }

function Borrow(props) {
    const { web3, bankContract, assetContract, bankContractAddress, assetContractAddress, account } = props
    const [ balance, setBalance ] = useState(0)
    const [ activeLoan, setActiveLoan ] = useState(true)
    const [ pastLoans, setPastLoans ] = useState([])

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

    const getPastLoans = async () => {
        if(account && bankContract && assetContract){
            const loanCount = await bankContract.methods.totalLoansBy(account).call()
            let llist = []
            for(let i=0;i<loanCount;i++){
                let ld = await bankContract.methods.getLoanDetailsByAddressPosition(account, i).call();
                const tokenVal = ld[5].valueOf()
                const tokenId = await findTokenId(tokenVal)
                const cid = await assetContract.methods.tokenURI(tokenId).call()
                ld[5] = cid
                llist.push(ld)   
            }
            console.log(llist)
            setPastLoans(llist)
        }
    }

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

    const getActiveLoanState = () => {
        if(bankContract === null || account === null)
        return
        bankContract.methods.getLastLoanState(account).call().then((loanState) => {
            if(loanState.valueOf() == 2 || loanState.valueOf() == 3)
                setActiveLoan(false)
            else
                setActiveLoan(true)
        });
    }

    const newLoan = async (amount, date, mortgage) => {
        if(bankContract === null || account === null || web3 === null || bankContractAddress === null)
            return
        
        let dateInTime = new Date(date).getTime()/1000;
        let tokenId = await findTokenId(mortgage)
        const isApproved = await assetContract.methods.getApproved(tokenId).call()
        // console.log(isApproved)
        if(isApproved !== bankContractAddress)
            await assetContract.methods.approve(bankContractAddress, tokenId).send({from: account});
        bankContract.methods.newLoan(web3.utils.toWei(amount, 'ether'), dateInTime, mortgage, tokenId).send({from: account}).then(console.log).catch(console.log)
    }

    const acceptProposal = (proposalId) => {
        if(bankContract === null || account === null)
            return
        bankContract.methods.acceptProposal(proposalId).send({from: account}).then(console.log).catch(console.log)
    }

    const lockLoan = (loanId) => {
        if(bankContract === null || account === null)
            return
        bankContract.methods.lockLoan(loanId).send({from: account}).then(console.log).catch(console.log)
    }

    const repayLoan = (loanId) => {
        if(bankContract === null || account === null || web3 === null)
            return
        bankContract.methods.getRepayValue(loanId).call().then((result) => {
            var amount = parseInt(result.valueOf()) + parseInt(web3.utils.toWei("1", 'ether').valueOf())
            bankContract.methods.repayLoan(loanId).send({value: amount, from: account}).then(console.log).catch(console.log)
        })
    }

    useEffect(() => {
        getPastLoans()
    }, [bankContract, account, assetContract])
    
    useEffect(() => {
        getBalance()
    }, [account, web3])

    useEffect(() => {
        let mounted = true
        if(mounted)
            getActiveLoanState()
        return () => {mounted = false};
    }, [bankContract])

    return (
        <React.Fragment>
            <h1>Hi! Borrower</h1>
            <h4>Welcome to Crowd Bank</h4>
            <hr className="divider"/>
            <h4>Your Account: {account && account.toLowerCase()}</h4>
            <h4>Your Balance: {balance} ETH</h4>
            <hr className="divider"/>
            {!activeLoan ?
                <React.Fragment>
                    <LoanRequestForm newLoan={newLoan} web3={web3} bankContract={bankContract} assetContract={assetContract} account={account} />
                    <hr className="divider"/>
                </React.Fragment>
                :
                <React.Fragment />
            }
            <PastLoans pastLoansList={pastLoans} lockLoan={lockLoan} repayLoan={repayLoan} bankContract={bankContract} account={account} acceptProposal={acceptProposal} />
        </React.Fragment>
    )
}

export default Borrow