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
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol"; //total supply
// import "@openzeppelin/contracts/access/Ownable.sol"; //for onlyOwner and owner()
// import "@openzeppelin/contracts/utils/Counters.sol"; //unnecessary use totalSupply()+1
import "@openzeppelin/contracts/utils/Base64.sol"; //Used for NFT creation.
import "hardhat/console.sol";
/// @custom:security-contact spazefalcon4@protonmail.com
/// @title PIRATE_or_NINJA, phase I of DIDz (Digital ID System)
/// @author spazefalcon
contract Pirate_or_Ninja is ERC721Enumerable { //Enumerable for totalSupply
  // using Counters for Counters.Counter; //dont need because of supply()+1
  using Strings for uint256; //for tokenId.toString()
  using Strings for uint8;   //for identityData.toString() removable //TODO struct
  address payable private owner; 
  modifier onlyOwner() { ///@dev see https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol
      require(owner == msg.sender, "Ownable: caller is not the owner");
      _;
  }
  uint256 public maxMintSupply = 22; //Max number of mints from this contract.

  mapping (address => uint8 ) public DIDzToDataMap; //address to identity data
  address[] public DIDzAddressArray = [address(0)]; //PROBLEMS with MAPPING (cant loop): at tokenId, put the wallet address. Use

  bool electionRunning = true; /// @dev default: run election on deploy.
  /// @dev See: Storage
  mapping(uint256 => string) private _tokenURIs; // mapping for token URIs: holds ipfs AND json.
  /// @dev See: Enumerable
  string public baseURI;
  bool public paused = false; 

  constructor(string memory _name, string memory _symbol) ERC721(_name, _symbol) {
    console.log('DIDz Constructor');
    owner = payable(msg.sender);
    baseURI = "https://nftstorage.link/ipfs/bafybeihrpumapkmb4zxaqs6kc5kjc3l5i5x5ln7o3jcxbakubecluep3nu/"; //PIRATEorNINJA
    // autoBatchMint();
    //TEST-MINT to owner, for confirm of IPFS on rarible, opensea testnets.
    safeMintPirateNinjaID(owner, 1);
    safeMintPirateNinjaID(owner, 2);
  }

  // function autoBatchMint() private onlyOwner { // TEST MINTS. - run by constructor.
  //   uint256 supply = totalSupply(); //See {IERC721Enumerable-totalSupply}.
  //   require(!paused);
  //   uint256 _mintAmount = 3;
  //   require(_mintAmount > 0);
  //   require( totalSupply() <= maxMintSupply); //MINT MAX
  //   require(supply + _mintAmount <= maxMintSupply); //less than maximum allowed.
  //   //AUTOMATIC BATCH MINT
  //   for (uint8 i = 1; i <= _mintAmount; i++) {
  //       // console.log(supply+ i);
  //       // _safeMint(msg.sender, supply + i);
  //       // setTokenURI(supply + i, i); //STUB TEST 1 or i = 1|2|3
  //       safeMintPirateNinjaID(owner,2);
  //   }
  // }

  function safeMintPirateNinjaID(address to, uint8 identityData) public returns (string memory) {
    require(!paused, "contract is paused");
    require(to != address(0), "bad address");
    // require(identityData != 0, "bad data");
    require((identityData == 1 || identityData == 2), "bad data");
    require( totalSupply() <= maxMintSupply, "MAX-MINT reached" ); 
    // console.log("TEST1", owner);
    // console.log("TEST2", to);
    if(to != owner){ //owner may mint more than once for test purposes.
      // console.log("OWNER MINT");
    // } else { //Non-Owner may only mint once. TODO dyanmic
      // console.log("NON-OWNER MINT", DIDzToDataMap[to]);
      bool found = validateIDz(to);
      // console.log("FOUND",found);
      require(!found, "one mint per wallet");
    }
    string memory voteURL = "";
    string memory imageURLIPFS = "3";
    if(identityData==1){ //selection 1 img
      imageURLIPFS = "ipfs://bafybeiabjffxg6grlmirw6mum6utcl4zbrukiytmqrbbt2jy2c2wkfekye/1.jpg"; //PIRATE
    } else if (identityData==2){ //or selection2 img
      imageURLIPFS = "ipfs://bafybeiabjffxg6grlmirw6mum6utcl4zbrukiytmqrbbt2jy2c2wkfekye/2.jpg"; //NINJA
    }
    DIDzToDataMap[to] = identityData; //STUB (below also)
    // console.log("AFTER1",DIDzToDataMap[to]);
    DIDzAddressArray.push(to); //TRACK INDEX fix for mapping no loop.
    // console.log("AFTER2",DIDzAddressArray[totalSupply()+1]);
    voteURL = string(abi.encodePacked(baseURI, identityData.toString(), ".json")); 
    string memory json = Base64.encode(
        bytes(
            string(
                abi.encodePacked(
                  '{"name": "',
                  string( abi.encodePacked( "Identity", Strings.toString(totalSupply()+1) ) ),
                  '", "description": "descripto...", "image": "',
                  imageURLIPFS,
                  '"}'
                )
            )
        )
    );
    string memory finalJSONTokenUri = string( // Prefix: data:application/json;base64
        abi.encodePacked("data:application/json;base64,", json)
    );
    // MINT--------------------------------
    _safeMint(to, totalSupply()+1); //equivalent to using Counters.Counter tokenID.
    _setTokenURI(totalSupply(),finalJSONTokenUri); //This is URL, or json obj. Saved in _tokenURIs[];
    //LATER this JSON is retrieved with _tokenURIs[tokenId]; No actual IPFS url, but Base64 encoded JSON string!
    //END MINT -----------------------------
    return "DIDz Minted!";
  }

  /// @dev See {IERC721Metadata-tokenURI}.
  /// @dev See {IERC721Storage-settokenURI}. Called for each mint.
  function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal virtual {
    // console.log('CODE2:_setTokenURI');
    require(_exists(tokenId), "ERC721URIStorage: URI set of nonexistent token");
    _tokenURIs[tokenId] = _tokenURI;
  }

  function _beforeTokenTransfer(address from, address to, uint256 firstTokenId, uint256 batchSize) internal virtual override {
    // console.log("Transfer",from,to); //Mint and Burn are 0x000...
    super._beforeTokenTransfer(from, to, firstTokenId, batchSize);
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
  }

  function validateIDz(address to) public view returns (bool){
    // console.log("VALIDATING",to);
    if( DIDzToDataMap[to] == 0 ) { return false; }
    return true;
  }

}
