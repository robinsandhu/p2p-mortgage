import axios from 'axios'
import React, { useState, useEffect } from 'react'
import 'bootstrap/dist/css/bootstrap.css'

const HOST = "http://localhost:4444"
const GAS_AMOUNT = 2000000

function Nft(props) {
  const { account, assetContract, web3 } = props
  const [ minterAccount, setMinterAccount ] = useState(null)
  const [ selectedFile, setSelectedFile ] = useState(null)
  const [ govPropId, setGovPropId ] = useState("")
  const [ propType, setPropType ] = useState("residential")
  const [ totalSupply, setTotalSupply ] = useState(0)
  const [ toAddress, setToAddress ] = useState("")
  const [ assets, setAssets ] = useState([])
  const [ isLoading, setIsLoading ] = useState(false)

  useEffect(() => {
    // load Blockchain Data
    const loadBlockChainData = async () => {
      const minter = await assetContract.methods.minter().call()
      setMinterAccount(minter)
      const supply = await assetContract.methods.totalSupply().call()
      setTotalSupply(supply)

      for(let i = 1; i <= supply; i++){
        const tokenId = i - 1;
        const asset = await assetContract.methods.assets(tokenId).call()
        const ownerOfAsset = await assetContract.methods.ownerOf(tokenId).call()
        const uri = await assetContract.methods.tokenURI(tokenId).call()
        setAssets([...assets, {asset: asset, owner: ownerOfAsset, uri: uri}])
      }
    }
    if(assetContract)
      loadBlockChainData()
  }, [assetContract])

  const checkAddress = () => {
    if(toAddress && typeof(toAddress) === "string" && toAddress.length !==0){
      if(toAddress.length === 42 && toAddress.substr(0, 2) === "0x"){
        return true
      }
    }
    return false
  }

  const handleGovPropIdChange = (e) => {
    setGovPropId(e.target.value)
  }

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0])
  }

  const handlePropTypeChange = (e) => {
    setPropType(e.target.value)
  }

  const handleAddressChange = (e) => {
    setToAddress(e.target.value)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsLoading(true)
    if(checkAddress() === false){
      alert("Invalid Address!")
      return
    }

    const formData = new FormData()

    formData.append("file", selectedFile)
    formData.append("govPropId", govPropId)
    formData.append("propType", propType)

    // gov api for validating the property certificate
    // code goes here

    axios.post(HOST+"/property", formData).then((res) => {
      if(res.data.msg === "Already Registered!"){
        setIsLoading(false)
        alert(res.data.msg)
      }else{
        const ipfsCid = res.data.id
        console.log(typeof(govPropId), typeof(ipfsCid))
        assetContract.methods.mint(toAddress, govPropId, ipfsCid).send({from: account}).then(data => {
          setIsLoading(false)
          setGovPropId("")
          setPropType("residential")
        }).catch(err => {
          setIsLoading(false)
          console.log(err)
        })
      }
    }).catch(err => {
      setIsLoading(false)
      alert(err)
    })
  }

  return (
    <div>
      <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
        <a
          className="navbar-brand col-sm-3 col-md-2 mr-0"
          href=""
        >
          Real eState NFT's
        </a>
        <ul className="navbar-nav px-3">
          <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
            <small className="text-white"><span id="account" style={{color: "#dbdada"}}>{account}</span></small>
          </li>
        </ul>
      </nav>
      <div className="container-fluid mt-5">
        {
          (minterAccount !== null && account !== null && account === minterAccount) ?
          <React.Fragment>
            <div className="row">
              <main role="main" className="col-lg-12 d-flex text-center">
                <div className="content mr-auto ml-auto">
                  <h1>Property Registration form</h1>
                  <p>
                    Register Real Estate
                  </p>
                  <form onSubmit={handleSubmit}>
                    <input className='form-control mb-1' value={govPropId} type="text" onChange={handleGovPropIdChange} placeholder="Gov Prop ID" required/>
                    <select className='form-control mb-1' value={propType} onChange={handlePropTypeChange} required>
                      <option value="residential">Residential</option>
                      <option value="vacant_land">Vacant Land</option>
                      <option value="commercial">Commercial</option>
                    </select>
                    <input className='form-control mb-1' value={toAddress} type="text" placeholder="i.e. 0x5EdBC325Ff18fcFA752D7863EC8DcE409c65df9e" onChange={handleAddressChange} required/>
                    <input className='form-control mb-1' type="file" onChange={handleFileChange} required/>
                    <button className='btn btn-block btn-primary' disabled={isLoading}>Submit</button>
                  </form>
                </div>
              </main>
            </div>
            <hr className="divider"/>
          </React.Fragment>
          :
          <React.Fragment></React.Fragment>
        }
        {/* <h3>Registered NFT's</h3> */}
        <div className="row text-center">
          <div className="col-md-3 mb-3">
            <div>
              {
                assets.map((asset, index) => {
                  return (
                    <div key={index} className="col-md-3 mb-3">
                      <div className="token">
                        <a target="_blank" href={"http://gateway.pinata.cloud/ipfs/"+asset.uri}>
                          <img style={{ height: "200px", width: "200px" }} src="./token.png" />
                        </a>
                      </div>
                      <div style={{textAlign: "center"}}>
                          <p>ID: {asset.asset}</p>
                          <p>Owner: {asset.owner}</p>
                      </div>
                    </div>
                  )
                })
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Nft
