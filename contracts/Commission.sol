pragma solidity ^0.4.17;

contract Commission {

    function payArtist(address to_address) public payable {
        require(msg.value > 0);
        to_address.transfer(msg.value);
    }

    function () public payable {
        revert();
    }
}
