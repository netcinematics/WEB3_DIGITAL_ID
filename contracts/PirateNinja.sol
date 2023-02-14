//USE-CASES:
// PIRATEorNINJA - MINT YOUR IDENTITY
// 1) wallet address connects to Web3, 
// 2) user selects PIRATE or NINJA 
// 3) user clicks MINT button. Pirate or Ninja is MINTED to VOTER Wallet.
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
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol"; //total supply
// import "@openzeppelin/contracts/access/Ownable.sol"; //for onlyOwner and owner()
// import "@openzeppelin/contracts/utils/Counters.sol"; //unnecessary use totalSupply()+1
import "@openzeppelin/contracts/utils/Base64.sol"; //Used for CASTVOTE NFT creation.
import "hardhat/console.sol";
/// @custom:security-contact spazefalcon4@protonmail.com
// contract Random_Vote is ERC721Enumerable, Ownable { //Enumerable for totalSupply
contract Pirate_or_Ninja is ERC721Enumerable { //Enumerable for totalSupply
// contract Random_Vote is ERC721, Ownable {

    address payable public owner;
    using Strings for uint256; //for tokenId.toString()
    using Strings for uint8;   //for vote.toString()

    // using Counters for Counters.Counter; //dont neet because of supply()+1
    // Counters.Counter tokenIdCounter;

    mapping (address => uint8 ) public walletVotes; 
    address[] public walletIndex = [address(0)]; //PROBLEMS with MAPPING (cant loop): at tokenId, put the wallet address. Use

    bool electionRunning = true; /// @dev default: run election on deploy.
    /// @dev See: Storage
    mapping(uint256 => string) private _tokenURIs; // mapping for token URIs: holds ipfs AND json.
    /// @dev See: Enumerable
    uint256 public maxMintSupply = 100; //Max number of mints from this contract.
    string public baseURI;
    bool public paused = false; 

  constructor(string memory _name, string memory _symbol
  ) ERC721(_name, _symbol) {
    console.log('DIDz Constructor');
    owner = payable(msg.sender);
    //SET FROM NFT.STORAGE:
    // baseURI = "https://nftstorage.link/ipfs/bafybeiffqgslzarimnslbctkbnxdaffy7djrorvqic7bbdvrpspnqnxu4q/"; //PIZZAorBEER
    baseURI = "https://nftstorage.link/ipfs/bafybeihrpumapkmb4zxaqs6kc5kjc3l5i5x5ln7o3jcxbakubecluep3nu/"; //PIRATEorNINJA
    autoBatchMint();
  }

  function autoBatchMint() private { // TEST MINTS. - run by constructor.
    uint256 supply = totalSupply(); //See {IERC721Enumerable-totalSupply}.
    require(!paused);
    uint256 _mintAmount = 3;
    require(_mintAmount > 0);
    require( totalSupply() <= maxMintSupply); //MINT MAX
    require(supply + _mintAmount <= maxMintSupply); //less than maximum votes allowed.
    //AUTOMATIC BATCH MINT
    for (uint8 i = 1; i <= _mintAmount; i++) {
        // console.log(supply+ i);
        _safeMint(msg.sender, supply + i);
        setVoteTokenURI(supply + i, i); //STUB TEST 1 or i = 1|2|3
    }
  }

  /// @dev this is to test batch mint - remove in prod
  function setVoteTokenURI(uint256 tokenId, uint8 vote) public returns (string memory){
    require(_exists(tokenId),"ERC721Metadata: URI query for nonexistent token");
    // require(baseURI,"no base.");
    string memory voteURL = "";
    walletVotes[msg.sender] = vote;  //overwritten, 1,2,3!
    walletIndex.push(msg.sender); //TRACK INDEX fix for mapping no loop.
    voteURL = string(abi.encodePacked(baseURI, tokenId.toString(), ".json"));  
    _setTokenURI(tokenId,voteURL);
    return voteURL;
  }

  function castNFTVote(address to, uint8 vote) public returns (string memory) {
      require(!paused);
      require(to != address(0), "bad address");
      require((vote ==1 || vote ==2), "bad vote");
      require( totalSupply() <= maxMintSupply); //MINT MAX
      //---------------------------
      //PREPARE THE VOTE...MINT.
      string memory voteURL = "";
      string memory imageURLIPFS = "3";
      if(vote==1){ //selection 1 img
        imageURLIPFS = "ipfs://bafybeiabjffxg6grlmirw6mum6utcl4zbrukiytmqrbbt2jy2c2wkfekye/1.jpg";
      } else if (vote==2){ //or selection2 img
        imageURLIPFS = "ipfs://bafybeiabjffxg6grlmirw6mum6utcl4zbrukiytmqrbbt2jy2c2wkfekye/2.jpg";
      }
      // imageURLIPFS = "ipfs://bafybeicymzff6xcetv7egchzx4j5l5h5yuoso33ydruflixq6kdodqj2b4/1.jpg";//PIZZA!
      // imageURLIPFS = "ipfs://bafybeicymzff6xcetv7egchzx4j5l5h5yuoso33ydruflixq6kdodqj2b4/2.jpg";//BEER!
      walletVotes[to] = vote; //STUB (below also)
      walletIndex.push(to); //TRACK INDEX fix for mapping no loop.
      voteURL = string(abi.encodePacked(baseURI, vote.toString(), ".json")); 
      //------------------------------------
      // JSON - Encode Base64 - metadata-----------
      string memory json = Base64.encode(
          bytes(
              string(
                  abi.encodePacked(
                    '{"name": "',
                    string( abi.encodePacked( "Vote", Strings.toString(totalSupply()+1) ) ),
                    '", "description": "descripto...", "image": "',
                    imageURLIPFS,
                    '"}'
                  )
              )
          )
      );
      // JSON - end encode-------------------------
      string memory finalJSONTokenUri = string( // Prefix: data:application/json;base64
          abi.encodePacked("data:application/json;base64,", json)
      );
      // MINT vote--------------------------------
      _safeMint(to, totalSupply()+1);
      _setTokenURI(totalSupply(),finalJSONTokenUri); //This is not URL, but json obj. Saved in _tokenURIs[];
      //LATER this JSON is retrieved with _tokenURIs[tokenId]; No actual IPFS url, but Base64 encoded JSON string!
      //END MINT vote-----------------------------
      return "Vote Minted!";
  }

  /// BELOVED - TOKENURI ----------------------------------------

  /// @dev See {IERC721Storage-settokenURI}.
  function _setTokenURI(uint256 tokenId, string memory _tokenURI) public {
      require(_exists(tokenId), "ERC721URIStorage: URI set of nonexistent token");
      _tokenURIs[tokenId] = _tokenURI;
  }
  /// @dev See {IERC721Metadata-tokenURI}.
  //RETURN CONCANTENATED URL to JSON. Where is tokenURI called?
  function tokenURI(uint256 tokenId) public view override returns (string memory){
    require(_exists(tokenId),"ERC721Metadata: URI query for nonexistent token");
    _requireMinted(tokenId);
    //Important: rely on _tokenURIs mapping.
    string memory _tokenURI = _tokenURIs[tokenId];
    return _tokenURI;
  }
 /// END BELOVED - TOKENURI---------------------------------------

 /// ADMIN -------------------------------------
  //START ELECTION: record votes.
  function startElection() public { //todo onlyadmin
      require(electionRunning, "Already running");
      electionRunning = true;
      //RESET all ELECTION memory. TODO.
  }

  function pause(bool _state) public { //TODO OnlyAdmin or onlyOwner
    paused = _state;
  }

  function endElection() public { //todo onlyadmin
      require(!electionRunning, "No election");
      electionRunning = false;
      //TABULATE ELECTION RESULTS
      //MINT NFT to all VOTERS.
      tabulateVOTEmintSVG(msg.sender); //TODO loop over walletVoters???
  }

  function tabulateVOTEmintSVG(address to) public view returns (string memory) { 
      //GET VOTE from tokenID
      require(!paused);
      require(to != address(0), "bad address");
    //   require((vote ==1 || vote ==2), "bad vote");
      //---------------------------
    //   //PREPARE THE VOTE...MINT.
    //   string memory voteURL = "";
    //   string memory imageURLIPFS = "3";
    //   if(vote==1){
    //     imageURLIPFS = "ipfs://bafybeicymzff6xcetv7egchzx4j5l5h5yuoso33ydruflixq6kdodqj2b4/1.jpg";
    //   } else if (vote==2){
    //     imageURLIPFS = "ipfs://bafybeicymzff6xcetv7egchzx4j5l5h5yuoso33ydruflixq6kdodqj2b4/2.jpg";
    //   }
    //   // walletVotes[msg.sender] = 2;  //vote; //STUB (below also)
    //   walletVotes[to] = vote; //STUB (below also)
    //   // string memory voteStr = "1"; //STUB
    //   // voteURL = string(abi.encodePacked(baseURI, voteStr, ".json")); 
    //   voteURL = string(abi.encodePacked(baseURI, vote.toString(), ".json")); 
    //   console.log(voteURL);
    //   //------------------------------------
    //   // JSON - Encode Base64 - metadata-----------
    //   string memory json = Base64.encode(
    //       bytes(
    //           string(
    //               abi.encodePacked(

    //                     // '{"name": "',
    //                     // string(
    //                     //     abi.encodePacked(
    //                     //         "Placeholder NFT (ERC721A) #",
    //                     //         Strings.toString(tokenId)
    //                     //     )
    //                     // ),
    //                     // '", "description": "ion.", "image": "data:image/svg+xml;base64,PHNOTYg=="}'
  

    //                 '{"name": "',
    //                 string( abi.encodePacked( "Vote", Strings.toString(totalSupply()+1) ) ),
    //                 '", "description": "descripto...", "image": "',
    //                 imageURLIPFS,
    //                 '"}'
    //               )
    //           )
    //       )
    //   );
    //                 // string( abi.encodePacked( "vote", Strings.toString(tokenId) ) ),
    //                   // '", "description": "descripto...", "image": "ipfs://bafybeicymzff6xcetv7egchzx4j5l5h5yuoso33ydruflixq6kdodqj2b4/2.jpg"}'                      
    //   // JSON - end encode-------------------------

    //   string memory finalJSONTokenUri = string( // Prefix: data:application/json;base64
    //       abi.encodePacked("data:application/json;base64,", json)
    //   );

    //   // MINT vote--------------------------------
    //   _safeMint(to, totalSupply()+1);
    //   // _safeMint(msg.sender, totalSupply()+1);      
    //   _setTokenURI(totalSupply(),finalJSONTokenUri); //This is not URL, but json obj. Saved in _tokenURIs[];
      //LATER this JSON is retrieved with _tokenURIs[tokenId]; No actual IPFS url!
      //END MINT vote-----------------------------
      return "ELECTION-FINAL!";
  }


}


//FROM HARDHAT EXAMPLE:
//https://hardhat.org/tutorial/writing-and-compiling-contracts
// pragma solidity ^0.8.9;


// // This is the main building block for smart contracts.
// contract Token {
//     // Some string type variables to identify the token.
//     string public name = "My Hardhat Token";
//     string public symbol = "MHT";

//     // The fixed amount of tokens, stored in an unsigned integer type variable.
//     uint256 public totalSupply = 1000000;

//     // An address type variable is used to store ethereum accounts.
//     address public owner;

//     // A mapping is a key/value map. Here we store each account's balance.
//     mapping(address => uint256) balances;

//     // The Transfer event helps off-chain applications understand
//     // what happens within your contract.
//     event Transfer(address indexed _from, address indexed _to, uint256 _value);

//     /**
//      * Contract initialization.
//      */
//     constructor() {
//         // The totalSupply is assigned to the transaction sender, which is the
//         // account that is deploying the contract.
//         balances[msg.sender] = totalSupply;
//         owner = msg.sender;
//     }

//     /**
//      * A function to transfer tokens.
//      *
//      * The `external` modifier makes a function *only* callable from *outside*
//      * the contract.
//      */
//     function transfer(address to, uint256 amount) external {
//         // Check if the transaction sender has enough tokens.
//         // If `require`'s first argument evaluates to `false` then the
//         // transaction will revert.
//         require(balances[msg.sender] >= amount, "Not enough tokens");

//         // Transfer the amount.
//         balances[msg.sender] -= amount;
//         balances[to] += amount;

//         // Notify off-chain applications of the transfer.
//         emit Transfer(msg.sender, to, amount);
//     }

//     /**
//      * Read only function to retrieve the token balance of a given account.
//      *
//      * The `view` modifier indicates that it doesn't modify the contract's
//      * state, which allows us to call it without executing a transaction.
//      */
//     function balanceOf(address account) external view returns (uint256) {
//         return balances[account];
//     }
// }