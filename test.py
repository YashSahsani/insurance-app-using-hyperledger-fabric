import requests
import json
import time
data = {"password":"DuBaraMatPuchna"}
for i in range(10):
    a = json.loads(requests.post("http://localhost:3000/api/login",json=data).text)
    print(a)
    #for j in range(4):
    #    data_n = {"uuid":"dhrumil"+str(i)+str(j),"contractUUId":"dhrumilct","username":"yash","password":"yashpw","fname":"yash","lname":"Sahsani","sdate":"12-03-2021","ldate":"20-03-2014"}
    #    result = requests.post("https:///localhost:3000/api/CreateAsset",headers={"Authorization":"Bearer "+a['token']},json=data_n)
    #    print(result.text)
    data_n = {
  "uuid": "item2",
  "contractuuid": "item1ct",
  "username": "yash",
  "password": "yashpw",
  "fname": "yash",
  "lname": "Sahsani",
  "sdate": "3",
  "ldate": "4"
}
    result = requests.post("http://localhost:3000/api/CreateContract",headers={"Authorization":"Bearer "+a['token']},json=data_n)
    print(result.text)
    break
