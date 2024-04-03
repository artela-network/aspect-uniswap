import { ChainId } from 'aspectswap'
import MULTICALL_ABI from './abi.json'
import { multicall } from '../../moonbase_address.json'

const MULTICALL_NETWORKS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0xeefBa1e63905eF1D7ACbA5a8513c70307C1cE441',
  [ChainId.ARTELALOCAL]: '0x2bCAdea8b83830d211eB1826Cf64A762A051fC15',
  [ChainId.ARTELATESTNET]: multicall,
  [ChainId.ARTELADEVNET]: multicall,
}

export { MULTICALL_ABI, MULTICALL_NETWORKS }
