import requests

# r = requests.get('http://localhost:3001/bsc-main/api/launch/allocation/getAll?projectToken=PSG')
r = requests.get('http://api.acy.finance/bsc-main/api/launch/allocation/getAll?projectToken=CBC')

datas = r.json()['data']
i = 0

for data in datas:
    amount = data['allocationAmount']
    if amount < 100:
        amount = data['allocationAmount'] * 2.5
    print(i, data['walletId'], data['allocationAmount'], amount)
    r = requests.get('http://api.acy.finance/bsc-main/api/launch/allocation/updateOne', params={
        'walletId': data['walletId'],
        'projectToken': data['projectToken'],
        'amount': amount
    })
    i += 1
