pragma solidity ^0.5.0;

import "./ERC721Full.sol";

contract Asset is ERC721Full {
    address public minter;

    string[] public assets;
    mapping(string => bool) _assetExists;

    constructor() ERC721Full("Asset", "ASSET") public {
        minter = msg.sender;
    }

    function mint(address _to, string memory _asset, string memory _uri) public {
        require(msg.sender == minter);
        require(!_assetExists[_asset]);
        uint256 tokenId = assets.length;
        assets.push(_asset);
        _mint(_to, tokenId);
        _setTokenURI(tokenId, _uri);
        _assetExists[_asset] = true;
    }

    // function getTokenURI(uint256 _tokenID) public view returns(string memory){
    //     return tokenURI(_tokenID);
    // }

    function getAssetCount(address person) public view returns (uint){
        require(person != address(0));
        uint len = assets.length;
        uint count = 0;
        for(uint i=0;i<len;i++){
            if(ownerOf(i) == person){
                count = count + 1;
            }
        }
        return count;
    }
}