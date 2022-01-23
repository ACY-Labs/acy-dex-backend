import requests

r = requests.get('http://localhost:3001/bsc-main/api/launch/allocation/getAll?projectToken=PSG')

datas = r.json()['data']
i = 0

for data in datas:
    amount = data['allocationAmount'] * 5 + 500
    if amount > 5000:
        amount = 5000
    print(i, data['walletId'], data['allocationAmount'], amount)
    r = requests.get('http://localhost:3001/bsc-main/api/launch/allocation/updateOne', params={
        'walletId': data['walletId'],
        'projectToken': data['projectToken'],
        'amount': amount
    })
    i += 1
