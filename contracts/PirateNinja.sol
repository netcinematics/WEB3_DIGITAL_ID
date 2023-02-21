// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol"; //total supply
import "@openzeppelin/contracts/utils/Base64.sol"; //Used for NFT creation.
// import "hardhat/console.sol"; //remove before deploy
/// @custom:security-contact spazefalcon4@protonmail.com
/// @title PIRATE_or_NINJA, phase I of DIDz (Digital ID System)
/// @author spazefalcon
contract PIRATEorNINJA_1 is ERC721Enumerable { //Enumerable for totalSupply
  // using Counters for Counters.Counter; //dont need because of supply()+1
  using Strings for uint8;   //for identityData.toString() removable //TODO struct
  using Strings for uint256; //for tokenId.toString()
  string public baseURI;
  bool public paused = false; 
  address payable private owner; 
  modifier onlyOwner() { ///@dev see https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol
    require(owner == msg.sender, "Ownable: caller is not the owner");
    _;
  }
  uint256 public maxMintSupply = 52; //Max number of mints from this contract.
  mapping (address => uint8 ) public DIDzToDataMap; //address to identity data
  address[] public DIDzAddressArray = [address(0)]; //PROBLEMS with MAPPING (cant loop): at tokenId, put the wallet address. Use
  mapping(uint256 => string) private _tokenURIs; // mapping for token URIs: holds ipfs AND json for opensea render.
  /// @dev See: Enumerable   /// @dev See: Storage
  event Minted(address _to);
  event Burned(address _to);

  constructor(string memory _name, string memory _symbol) ERC721(_name, _symbol) {
    owner = payable(msg.sender);
    baseURI = "https://nftstorage.link/ipfs/bafybeihrpumapkmb4zxaqs6kc5kjc3l5i5x5ln7o3jcxbakubecluep3nu/"; //PIRATEorNINJA
    safeMintPirateNinjaID(owner, 1); //TEST-MINT to owner, for confirm of IPFS on rarible, opensea testnets.
    safeMintPirateNinjaID(owner, 2);
  }

function safeMintPirateNinjaID(address to, uint8 identityData) public returns (string memory) {
    require(!paused, "contract is paused");
    require(to != address(0), "bad address");
    require((identityData == 1 || identityData == 2), "bad data");
    require( totalSupply() <= maxMintSupply, "MAX-MINT reached" ); 
    if(to != owner){ //owner may mint more than once for test purposes.
      require(!validateIDz(to), "one mint per wallet");
    }
    string memory idSTR = "";
    string memory descSTR = "";
    string memory didzURL = "";
    string memory imageURLIPFS = "0";
    // string memory timestamp =  string(abi.encodePacked(block.timestamp));
    // string memory timestamp =  string(abi.encodePacked(now));
    if(identityData==1){ //selection 1 img
      idSTR="PIRATE";
      imageURLIPFS = "ipfs://bafybeiabjffxg6grlmirw6mum6utcl4zbrukiytmqrbbt2jy2c2wkfekye/1.jpg"; //PIRATE
    } else if (identityData==2){ //or selection2 img
      idSTR="NINJA";
      imageURLIPFS = "ipfs://bafybeiabjffxg6grlmirw6mum6utcl4zbrukiytmqrbbt2jy2c2wkfekye/2.jpg"; //NINJA
    }
    // descSTR = "ID for 0x123 on 1234 as name";
    // descSTR = string( abi.encodePacked( "ID for a ", idSTR, ", at 0x123...456, as alias." ) );
    // descSTR = string( abi.encodePacked( "ID for ", idSTR, ", \n As alias, \n At: ",to," \n On DATE: ", block.timestamp   ) );
    // descSTR = string( abi.encodePacked( "ID for ", idSTR, ", As alias, At: addr, On DATE: ", block.timestamp   ) );
    descSTR = string( abi.encodePacked( "ID for ", idSTR, ", As alias, At: addr, On DATE: 123456" ) );
    DIDzToDataMap[to] = identityData; //STUB (below also)
    DIDzAddressArray.push(to); //TRACK INDEX fix for mapping no loop.
    emit Minted(to);
    didzURL = string(abi.encodePacked(baseURI, identityData.toString(), ".json")); 
    string memory json = Base64.encode(
        bytes(
            string(
                abi.encodePacked(
                  '{"name": "',
                  string( abi.encodePacked( "I am a ", idSTR ) ),
                  '", ',
                  '"description": "',
                  string( abi.encodePacked( "DIDz: ", descSTR ) ),
                  '", "image": "',
                  imageURLIPFS,
                  '"}'
                )
            ) 
        )
    );
                  // '", "description": "I am a ", "image": "',
                  // string( abi.encodePacked( "ID: ", Strings.toString(totalSupply()+1) ) ),
                  // '", "description": "I am a "',idSTR," ",descSTR,' "image": "',
    string memory finalJSONTokenUri = string( // Prefix: data:application/json;base64
        abi.encodePacked("data:application/json;base64,", json)
    );
    _safeMint(to, totalSupply()+1); //equivalent to using Counters.Counter tokenID.
    _setTokenURI(totalSupply(),finalJSONTokenUri); //This is URL, or json obj. Saved in _tokenURIs[];
    //LATER this JSON is retrieved with _tokenURIs[tokenId]; No actual IPFS url, but Base64 encoded JSON string!
    return "DIDz Minted!";
  }

  /// @dev See {IERC721Storage-settokenURI}. Called for each mint.
  function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal virtual {
    require(_exists(tokenId), "ERC721URIStorage: URI set of nonexistent token");
    _tokenURIs[tokenId] = _tokenURI; /// @dev See {IERC721Metadata-tokenURI}.
  }   

  /// @dev See {IERC721Metadata-tokenURI}. RETURN CONCAT URL in JSON. Called by opensea to render.
  function tokenURI(uint256 tokenId) public view override returns (string memory){
    require(_exists(tokenId),"ERC721Metadata: URI query for nonexistent token");
    _requireMinted(tokenId);
    string memory _tokenURI = _tokenURIs[tokenId]; //Important: rely on _tokenURIs mapping.
    return _tokenURI;
  }

  // function _beforeTokenTransfer(address from, address to, uint256 firstTokenId, uint256 batchSize) internal virtual override {
  function _beforeTokenTransfer(address from, address to, uint256 firstTokenId, uint256 batchSize) internal virtual override {
    super._beforeTokenTransfer(from, to, firstTokenId, batchSize); //Mint and Burn are 0x000...
    require(from == address(0) || to == address(0), "SBT can only be burned");
  }

  function pause(bool _state) public onlyOwner { 
    paused = _state;
  }

  function burn(uint256 tokenId) public virtual { 
    require(msg.sender != owner, "cannot burn owner");
    require(_exists(tokenId), "nonexistent token");
    address isOwner = ERC721.ownerOf(tokenId);
    require(msg.sender == isOwner, "non owner");
    DIDzToDataMap[isOwner] = 0;
    super._burn(tokenId);
    emit Burned(isOwner);
  }

  function validateIDz(address to) public view returns (bool){
    if( DIDzToDataMap[to] == 0 ) { return false; }
    return true;
  }

}

  //USE-CASES:
// PIRATEorNINJA - MINT YOUR IDENTITY
// 1) wallet address connects to Web3, 
// 2) user selects PIRATE or NINJA 
// 3) user clicks MINT button. Pirate or Ninja is MINTED to Wallet.
// 4) lookup of wallet finds Pirate or Ninja ID token

//IMAGE-CREDITS | Pirate or Ninja | All CC0 SVG :
// https://www.svgrepo.com/svg/245909/pirate
// https://www.svgrepo.com/svg/406722/ninja-medium-light-skin-tone
//IMAGES: pirate or ninja
// ipfs://bafybeiabjffxg6grlmirw6mum6utcl4zbrukiytmqrbbt2jy2c2wkfekye
// https://nftstorage.link/ipfs/bafybeiabjffxg6grlmirw6mum6utcl4zbrukiytmqrbbt2jy2c2wkfekye
//DATA: pirate or ninja
// ipfs://bafybeihrpumapkmb4zxaqs6kc5kjc3l5i5x5ln7o3jcxbakubecluep3nu
// https://nftstorage.link/ipfs/bafybeihrpumapkmb4zxaqs6kc5kjc3l5i5x5ln7o3jcxbakubecluep3nu
//OZ links...
// OpenZeppelin721: https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/ERC721.sol
// OpenZeppelinEnumerable: https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/extensions/ERC721Enumerable.sol
// OpenZeppelinStorage: https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/extensions/ERC721URIStorage.sol
// From Random_Electionz2
// HARDHAT EXAMPLE:
//https://hardhat.org/tutorial/writing-and-compiling-contracts