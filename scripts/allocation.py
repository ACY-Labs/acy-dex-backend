import requests
import pandas as pd

def enlarge_project_allocation(projectToken):
    r = requests.get(f'http://api.acy.finance/bsc-main/api/launch/allocation/getAll?projectToken={projectToken}')

    datas = r.json()['data']
    i = 0
    for data in datas:
        amount = data['allocationAmount'] * 2
        if amount > 5000:
            amount = 5000
        print(i, data['walletId'], data['allocationAmount'], amount)
        r = requests.get('http://api.acy.finance/bsc-main/api/launch/allocation/updateOne', params={
            'walletId': data['walletId'],
            'projectToken': data['projectToken'],
            'amount': amount
        })
        i += 1

def read_wallets_from_csv(filename):
    df = pd.read_csv(filename)
    return list(df['walletId'])


def allocate_wallets(projectToken, wallets, amount=None):
    for walletId in wallets:
        r = requests.get('http://api.acy.finance/bsc-main/api/launch/allocation/require', params={
            'walletId': walletId,
            'projectToken': projectToken
        })
        print(f"{walletId} - allocationLeft: {r.json()['allocationLeft']}")

        if amount:
            r = requests.get('http://api.acy.finance/bsc-main/api/launch/allocation/updateOne', params={
                'walletId': walletId,
                'projectToken': projectToken,
                'amount': amount
            })
            print(f"{walletId} - allocationLeft: {r.json()['allocationLeft']}")


if __name__ == '__main__':
    # wallets = read_wallets_from_csv('Allocation.csv')
    # allocate_wallets('RUBY', wallets, 10000)
    enlarge_project_allocation("RUBY")