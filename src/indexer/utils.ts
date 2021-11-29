export const methodList = {
    ethToToken :    {
                    name: 'swapExactETHForTokens',
                    id: '0x7ff36ab5'
                },

    tokenToEth :    {
                    name: 'swapExactTokensForETH',
                    id: '0x18cbafe5'
                },

    tokenToToken :  {
                    name: 'swapExactTokensForTokens',
                    id: '0x38ed1739'
                },
    
    addLiquidity : {
                    name: 'addLiquidity',
                    id: '0xe8e33700'
                },

    addLiquidityEth : {
                    name: 'addLiquidityETH',
                    id: '0xf305d719'
                },
    
    removeLiquidity : {
                    name: 'removeLiquidityWithPermit',
                    id: '0x2195995c'
                },
    removeLiquidityETH : {
                    name : 'removeLiquidityETHWithPermit',
                    id : '0xded9382a'
                }

}

export const actionList = {

    transfer :    {
                    name: 'Transfer',
                    hash: '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
                },
    sync :     {
                    name: 'Sync',
                    hash: '0x1c411e9a96e071241c2f21f7726b17ae89e3cab4c78be50e062b03a9fffbbad1'
                },

}

/////

export const methodHashList = {
    '0x7ff36ab5' : 'swapExactETHForTokens',
    '0x18cbafe5' : 'swapExactTokensForETH',
    '0x38ed1739' : 'swapExactTokensForTokens',
    '0xe8e33700' : 'addLiquidity',
    '0xf305d719' : 'addLiquidityETH',
    '0x2195995c' : 'removeLiquidityWithPermit',
    '0xded9382a' : 'removeLiquidityETHWithPermit',
}

export const eventHashList = {
    '0x4c209b5fc8ad50758f13e2e1088ba56a560dff690a1c6fef26394f4c03821c4f': 'Mint',
    '0xdccd412f0b1252819cb1fd330b93224ca42612892bb3f4f789976e6d81936496': 'Burn',
    '0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822': 'Swap',
    '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef': 'Transfer',
    '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925': 'Approval',
    '0x1c411e9a96e071241c2f21f7726b17ae89e3cab4c78be50e062b03a9fffbbad1': 'Sync',
    '0x56c8d14f19aa408d40fe981933ba882c8b0dbeae0d393a4fb2116ed95263ef67': 'flashArbitrageSwapPath'
}

export const eventList = {
    flashArbitrageSwapPath: [
      { type: 'address', name: 'inToken' },
      { type: 'uint256', name: 'amountIn' },
      { type: 'address', name: 'outToken' },
      { type: 'address[]', name: 'allPath' },
      { type: 'uint[]', name: 'XiArr' }
    ],
    Approval: [
      { type: 'address', name: 'owner', indexed: true },
      { type: 'address', name: 'spender', indexed: true },
      { type: 'uint256', name: 'value' }
    ],
    Transfer: [
      { type: 'address', name: 'from', indexed: true },
      { type: 'address', name: 'to', indexed: true },
      { type: 'uint256', name: 'value' }
    ],
    Mint: [
      { type: 'address', name: 'sender', indexed: true },
      { type: 'uint256', name: 'amount0' },
      { type: 'uint256', name: 'amount1' }
    ],
    Burn: [
      { type: 'address', name: 'sender', indexed: true },
      { type: 'uint256', name: 'amount0' },
      { type: 'uint256', name: 'amount1' },
      { type: 'address', name: 'to', indexed: true }
    ],
    Swap: [
      { type: 'address', name: 'sender', indexed: true },
      { type: 'uint256', name: 'amount0In' },
      { type: 'uint256', name: 'amount1In' },
      { type: 'uint256', name: 'amount0Out' },
      { type: 'uint256', name: 'amount1Out' },
      { type: 'address', name: 'to', indexed: true }
    ],
    Sync: [
      { type: 'uint112', name: 'reserve0' },
      { type: 'uint112', name: 'reserve1' }
    ]
  }