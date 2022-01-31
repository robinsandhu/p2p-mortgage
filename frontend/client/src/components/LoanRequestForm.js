import React, { useState, useEffect } from 'react'

const wtoE = 1000000000000000000

function LoanRequestForm(props) {
    const { web3, assetContract, account, newLoan } = props
    // const optionsList = "" //add logic here
    const [ optionsList, setOptionsList ] = useState([])
    const [ requestAmount, setRequestAmount ] = useState("")
    const [ dueDate, setDueDate ] = useState("")
    const [ mortgage, setMortgage ] = useState("")

    const getAssetDetails = async () => {
        if(assetContract === null || account === null){
            // console.log("Here", assetContract, account)
            return
        }

        try{
            const supply = await assetContract.methods.totalSupply().call()
            for(let i=0;i<supply;i++){
                const own = await assetContract.methods.ownerOf(i).call()
                if(own === account){
                    const val = await assetContract.methods.assets(i).call()
                    setOptionsList([...optionsList, <option key={i} value={val}>{val}</option>])
                }
            }
        }catch(err){
            console.error(err)
        }
    }

    useEffect(() => {
        getAssetDetails()
    }, [assetContract])

    const handleAmountChange = (event) => {
        setRequestAmount(event.target.value)
    }

    const handleDateChange = (event) => {
        setDueDate(event.target.value)
    }

    const handleMortgageChange = (event) => {
        setMortgage(event.target.value)
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        newLoan(requestAmount.toString(), dueDate, mortgage);
        setRequestAmount("")
        setDueDate("")
        setMortgage("")
    }

    const getValidReturnDate = () => {
        var today = new Date();
        var tomorrow = new Date(today.getTime() + (24 * 60 * 60 * 1000));
        var dd = String(tomorrow.getDate()).padStart(2, '0');
        var mm = String(tomorrow.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = tomorrow.getFullYear();

        tomorrow = yyyy + '-' +  mm + '-' + dd;
        return tomorrow
    }

    return (
        <div className="form-container">
            <h4 className="form-header">No active loan! Ask for one.</h4>
            <form onSubmit={handleSubmit} className="loan-request-form">
                <label htmlFor="requestAmount">
                    Amount: 
                </label>
                <input 
                    id="requestAmount" 
                    type="number"
                    placeholder="Loan Amount (ETH)"
                    name="requestAmount" 
                    value={requestAmount}
                    onChange={handleAmountChange}
                    min={1/wtoE} 
                    step={1/wtoE}
                    required
                />
                <label htmlFor="dueDate">
                    Due Date:
                </label> 
                <input 
                    id="dueDate" 
                    type="date" 
                    name="dueDate" 
                    value={dueDate}
                    onChange={handleDateChange}
                    min={getValidReturnDate()}
                    required
                />
                <label htmlFor="mortgage">
                    Choose Mortgage: 
                </label>
                <select 
                    id="mortgage"
                    name="motgage" 
                    value={mortgage}
                    onChange={handleMortgageChange} 
                    required
                >
                    <option value="">--Select--</option>
                    {optionsList}
                </select>
                <button id="sendbtn" type="submit">Request Money</button>
            </form>
        </div>
    )
}

export default LoanRequestForm
