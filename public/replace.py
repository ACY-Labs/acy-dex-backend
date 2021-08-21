import pandas as pd

df = pd.read_excel("Token500.xlsx", sheet_name=None)["data"]

df.dropna(inplace=True)

tokens = list(df["token"])
ips = list(df["ip"])

with open("source.js") as f:
    data = f.read()
    for index, token in enumerate(tokens):
        data = data.replace(ips[index], token)

f = open("sampleData.js", "w")
f.write(data)
f.close()