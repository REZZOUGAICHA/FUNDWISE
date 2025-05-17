import { ethers } from 'ethers';

// Simplified ABI definitions extracted from your smart contracts
// In a real application, you would import these from actual ABI JSON files

export const CONTRACT_ABIS = {
  CampaignManager: [
    // Events
    "event CampaignCreated(uint256 indexed campaignId, address indexed ngo, string title, uint256 fundingGoal)",
    "event CampaignVerified(uint256 indexed campaignId, address indexed verifier)",
    "event CampaignActivated(uint256 indexed campaignId)",
    "event CampaignDeactivated(uint256 indexed campaignId)",
    "event VerifierAdded(address indexed verifier)",
    "event VerifierRemoved(address indexed verifier)",
    
    // Functions
    "function createCampaign(string memory _title, string memory _description, uint256 _fundingGoal, uint256 _durationInDays) external returns (uint256)",
    "function verifyCampaign(uint256 _campaignId) external",
    "function activateCampaign(uint256 _campaignId) external",
    "function deactivateCampaign(uint256 _campaignId) external",
    "function campaignExists(uint256 _campaignId) public view returns (bool)",
    "function getCampaignNGO(uint256 _campaignId) external view returns (address)",
    "function getCampaignGoal(uint256 _campaignId) external view returns (uint256)",
    "function getCampaign(uint256 _campaignId) external view returns (tuple(uint256 id, address ngo, string title, string description, uint256 fundingGoal, uint256 deadline, bool verified, bool active, uint256 timestamp))",
    "function getNGOCampaigns(address _ngo) external view returns (uint256[] memory)",
    "function isCampaignActive(uint256 _campaignId) external view returns (bool)",
  ],
  
  DonationManager: [
    // Events
    "event DonationReceived(uint256 indexed campaignId, address indexed donor, uint256 amount)",
    "event MinDonationAmountUpdated(uint256 previousAmount, uint256 newAmount)",
    "event FundReleaseManagerApproved(address fundReleaseManager)",
    
    // Functions
    "function donate(uint256 _campaignId, uint256 _amount) external",
    "function getCampaignDonationTotal(uint256 _campaignId) external view returns (uint256)",
    "function getCampaignDonors(uint256 _campaignId) external view returns (address[] memory)",
    "function getDonationAmount(address _donor, uint256 _campaignId) external view returns (uint256)",
    "function setMinDonationAmount(uint256 _minDonationAmount) external",
    "function getContractBalance() external view returns (uint256)",
    "function approveFundReleaseManager(address _fundReleaseManager) external",
  ],
  
  FundReleaseManager: [
    // Events
    "event FundsReleased(uint256 indexed campaignId, bytes32 indexed proofId, address ngo, uint256 amount)",
    "event ProofRejected(uint256 indexed campaignId, bytes32 indexed proofId, string reason)",
    
    // Functions
    "function approveProofAndReleaseFunds(bytes32 _proofId) external",
    "function rejectProof(bytes32 _proofId, string memory _reason) external",
    "function getTotalReleasedFunds(uint256 _campaignId) external view returns (uint256)",
    "function getFundReleaseHistory(uint256 _campaignId) external view returns (tuple(uint256 campaignId, bytes32 proofId, uint256 amount, uint256 timestamp)[] memory)",
    "function getAvailableFunds(uint256 _campaignId) external view returns (uint256)",
    "function hasReachedFirstMilestone(uint256 _campaignId) external view returns (bool)",
    "function hasReachedFullFunding(uint256 _campaignId) external view returns (bool)",
  ],
  
  ProofStorage: [
    // Events
    "event ProofSubmitted(bytes32 indexed proofId, uint256 indexed campaignId, string ipfsHash, uint256 amount)",
    "event ProofStatusChanged(bytes32 indexed proofId, uint8 status)",
    "event ValidatorAdded(address indexed validator)",
    "event ValidatorRemoved(address indexed validator)",
    
    // Functions
    "function submitProof(uint256 _campaignId, string memory _ipfsHash, string memory _description, uint256 _amount) external returns (bytes32)",
    "function setProofStatus(bytes32 _proofId, uint8 _status) external",
    "function proofExists(bytes32 _proofId) public view returns (bool)",
    "function getProof(bytes32 _proofId) external view returns (tuple(bytes32 id, uint256 campaignId, string ipfsHash, string description, uint256 amount, uint8 status, address submitter, uint256 timestamp))",
    "function getProofCampaign(bytes32 _proofId) external view returns (uint256)",
    "function getProofAmount(bytes32 _proofId) external view returns (uint256)",
    "function getProofStatus(bytes32 _proofId) external view returns (uint8)",
    "function getCampaignProofs(uint256 _campaignId) external view returns (bytes32[] memory)",
    "function addValidator(address _validator) external",
    "function removeValidator(address _validator) external",
    
    // Constants
    "function PROOF_STATUS_SUBMITTED() external view returns (uint8)",
    "function PROOF_STATUS_APPROVED() external view returns (uint8)",
    "function PROOF_STATUS_REJECTED() external view returns (uint8)",
    "function PROOF_STATUS_FUNDS_RELEASED() external view returns (uint8)",
  ],
  
  MockERC20: [
    // Events
    "event Transfer(address indexed from, address indexed to, uint256 value)",
    "event Approval(address indexed owner, address indexed spender, uint256 value)",
    
    // Functions
    "function transfer(address to, uint256 amount) external returns (bool)",
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function transferFrom(address from, address to, uint256 amount) external returns (bool)",
    "function balanceOf(address account) external view returns (uint256)",
    "function allowance(address owner, address spender) external view returns (uint256)",
    "function mint(address to, uint256 amount) external",
  ],
};