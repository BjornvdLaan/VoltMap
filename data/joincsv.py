import csv
import pandas as pd


def read_file(fobj):
    data = {}
    for line in csv.reader(fobj):
        data[line[0]] = line[1:]
    return data


df1 = pd.read_csv('epdata.csv')
df2 = pd.read_csv('leeftijd.csv')

df3 = pd.merge(df1,df2, how= 'outer', left_on="name", right_on="name")
df3 = df3[df3['Kiesgerechtigden'].notnull()]
df3 = df3[df3['20 tot 25 jaar'].notnull()]


df3.to_csv('resultdata.csv', index=False)

#print(list(set(df2["name"]) - set(df1["name"])))
