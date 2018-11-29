pragma solidity ^0.5;
import "./Owned.sol";

contract Retraction is Owned {
    struct Agreement {
        bool sellerRetract;
        bool buyerRetract;
        bool intermediatorRetract;
    }
    bool retracted = false;
    Agreement public agreement;
    constructor () public {
        agreement.sellerRetract = false;
        agreement.buyerRetract = false; 
        agreement.intermediatorRetract = false;  
    }

    function retractContract() public onlyMemberOfContract() {
        if(msg.sender == seller) {
            agreement.sellerRetract = true;
        } else if (msg.sender == buyer) {
            agreement.buyerRetract = true;
        } else if(msg.sender == intermediator) {
            agreement.intermediatorRetract = true;
        } 
        if((agreement.sellerRetract && agreement.buyerRetract) || 
            (agreement.sellerRetract && agreement.intermediatorRetract) ||
            (agreement.buyerRetract && agreement.intermediatorRetract)) {
            retracted = true;
            contractClosed = true;
            if(address(this).balance > 0) {
                buyer.transfer(address(this).balance);
            }
        }
    }
}