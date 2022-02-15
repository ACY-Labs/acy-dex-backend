import pandas as pd
import csv
import requests
import time

API_KEYS = {
    56: [
        "7JT3KBNFM9CZVEWQZDIWCE587B9TEGPG9M",
        "PFPASNAXQ216ZYKUKXBVJXAFEFSCVQ146K",
        "292J64K9UDR66S9DTEW9U4ZK6RC8C4DMZJ",
        "AY8N5RFHFFIHDTER4QYUK6CE6NDKFZW5RP",
        "GSBY3YRH3P9ISM53PUTARQTR3T9JQ46NIP",
        "GQEEDKJCDM6RMZG4XVD5Z86ZZ76PMNM2YZ",
        "5AKCH58TS87EBB3F2TAVH8SEVZS2KZBCER",
        "Z1FXFTG1PGPYM1KTXPIDF3HPRMI7FGRQMA",
        "UVE45SM88CJS3DQY2257GVHR7TA9K7QYCB",
    ],
    137: [
        "UJK8BIQ2JHKHQVHUAH7URBS29A69Q7QP4I",
        "W7BQNY63IRBCSH1YGGIYHXWB1XMG7UXRRI",
        "G71U5316AJRS817YKXRIR2JQHK1HHIQJGH"
    ]
}

TOKEN_LISTS = {
    56: {
        "WBNB": {
            "name": "WBNB",
            "symbol": "WBNB",
            "address": "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
            "decimals": 18
        },
        "BUSD": {
            "name": "Binance USD",
            "symbol": "BUSD",
            "address": "0xe9e7cea3dedca5984780bafc599bd69add087d56",
            "decimals": 18
        },
        "USDT": {
            "name": 'USD Tether',
            "symbol": 'USDT',
            "address": '0x55d398326f99059ff775485246999027b3197955',
            "decimals": 18
        },
        "USDC": {
            "name": "USD Coin",
            "symbol": "USDC",
            "address": "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
            "decimals": 18
        }
    },
    137: {
        "MATIC": {
            "name": "Polygon MATIC",
            "symbol": "MATIC",
            "address": "0x0000000000000000000000000000000000001010",
            "decimals": 18
        },
        "USDT": {
            "name": "USDT",
            "symbol": "USDT",
            "address": "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
            "decimals": 6
        },
        "USDC": {
            "name": "USDC",
            "symbol": "USDC",
            "address": "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
            "decimals": 6
        }
    }
}


def get_balance(chain_id, api_key, symbol, wallet_id):
    start = time.time()

    decimals = TOKEN_LISTS[chain_id][symbol]['decimals']
    token_address = TOKEN_LISTS[chain_id][symbol]['address']

    if chain_id == 56:
        r = requests.get(
            "https://api.bscscan.com/api",
            params={
                "module": "account",
                "action": "tokenbalance",
                "contractaddress": token_address,
                "address": wallet_id,
                "tag": "latest",
                "apikey": api_key,
            }
        )
        amount = round(int(r.json()['result']) / 10 ** decimals, 8)
    elif chain_id == 137:
        r = requests.get(
            "https://api.polygonscan.com/api",
            params={
                "module": "account",
                "action": "tokenbalance",
                "contractaddress": token_address,
                "address": wallet_id,
                "tag": "latest",
                "apikey": api_key,
            }
        )
        amount = round(int(r.json()['result']) / 10 ** decimals, 8)
    
    write_to_csv({
        'walletId': wallet_id,
        'chainId': chain_id,
        'symbol': symbol,
        'decimals': decimals,
        'amount': amount
    })
    return time.time() - start

def write_to_csv(record):
    HEADER = ["walletId", "chainId", "symbol", "decimals", "amount"]
    with open("balance_result.csv", "a+", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=HEADER)
        writer.writerow(record)


wallet_id = '0x0f355a70d27eF1376e77C6Df9d9D8d661bCDf339'

if __name__ == "__main__":
    df: pd.DataFrame = pd.read_csv("wallets.csv")
    wallet_ids = df['Wallet'].tolist()

    result_df: pd.DataFrame = pd.read_csv("balance_result.csv")
    already_queried = { f"{x['walletId']}_{x['chainId']}_{x['symbol']}": x["amount"] for _, x in result_df.iterrows() }
    print(len(already_queried))

    chain_id = 56
    symbol = 'WBNB'
    key_index = 0

    # chain_id = 56
    # symbol = 'BUSD'
    # key_index = 1

    # chain_id = 56
    # symbol = 'USDT'
    # key_index = 5

    # chain_id = 56
    # symbol = 'USDC'
    # key_index = 3

    # chain_id = 137
    # symbol = 'USDC'
    # key_index = 0

    # chain_id = 137
    # symbol = 'USDT'
    # key_index = 1

    # chain_id = 137
    # symbol = 'MATIC'
    # # key_index = 2

    for chain_id in TOKEN_LISTS:
        for symbol in TOKEN_LISTS[chain_id]:
            print(f'ChainId: {chain_id} Symbol: {symbol}')

            for i, wallet_id in enumerate(wallet_ids[75000:]):
                api_key = API_KEYS[chain_id][key_index]
                key = f"{wallet_id}_{chain_id}_{symbol}"
                if key in already_queried:
                    continue
                
                try:
                    time_cost = get_balance(chain_id, api_key=api_key, symbol=symbol, wallet_id=wallet_id)
                    print(f'Time cost: {time_cost}s')
                    if time_cost < 0.2:
                        time.sleep(0.22 - time_cost)
                except Exception as e:
                    # with open('error.log', 'a+') as f:
                    #     f.write(e)
                    #     f.write('\n')
                    continue


    # get_balance(56, API_KEYS[56][0], "BUSD", wallet_id)
