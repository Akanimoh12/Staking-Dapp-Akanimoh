import { BigInt } from "@graphprotocol/graph-ts"
import { Transfer } from "../generated/StakeToken/StakeToken"
import { User } from "../generated/schema"

export function handleTransfer(event: Transfer): void {
  // Handle minting (from zero address)
  if (event.params.from.toHexString() == "0x0000000000000000000000000000000000000000") {
    let user = User.load(event.params.to.toHexString())
    if (!user) {
      user = new User(event.params.to.toHexString())
      user.address = event.params.to
      user.totalStaked = BigInt.fromI32(0)
      user.totalRewardsClaimed = BigInt.fromI32(0)
      user.createdAt = event.block.timestamp
      user.isActive = false
      user.updatedAt = event.block.timestamp
      user.save()
    }
  }
}