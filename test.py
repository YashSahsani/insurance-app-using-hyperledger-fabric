import requests
import json
import time
import datetime
data = {"password":"DuBaraMatPuchna"}
for i in range(10):
    a = json.loads(requests.post("http://localhost:3000/api/login",json=data).text)
    print(a)
    print("json token generated for post request")
    time.sleep(2)
    data_n = {"uuid": "item6","contractuuid": "item6","username": "dhrumil","password": "dhrumilpw","fname": "dhrumil","lname": "Sahsani","sdate": str(datetime.date.today()), "ldate": str(datetime.date.today() + datetime.timedelta(10))}
    result = requests.post("http://localhost:3000/api/CreateContract",headers={"Authorization":"Bearer "+a['token']},json=data_n)
    print(result.text)
    print("Contract Created")
    time.sleep(2)
    data_n = {"uuid": "item6",
    "Contractuuid": 'item6',
    "shopType": 'B',
    "formulaPerDay": 'price * 0.02',
    "maxSumInsured": 3500.00,
    "theftInsured": True,
    "description": 'Insure Your Bike',
    "conditions": 'Simple contract terms.',
    "minDurationDays": 3,
    "maxDurationDays": 10,
  }
    result = requests.post("http://localhost:3000/api/CreateContractType",headers={"Authorization":"Bearer "+a['token']},json=data_n)
    print(result.text)
    print("Contract type Created")
    time.sleep(2)
    data_m = {"uuid": "item6","active":True}
    result = requests.post("http://localhost:3000/api/SetActiveContractType",headers={"Authorization":"Bearer "+a['token']},json=data_m)
    print(result.text)
    print("SetActiveContractType Complete")
    time.sleep(2)
    data_a = {
  "username": "dhrumil",
  "uuid": "item6",
  "Contractuuid": "item6",
  "date": str(datetime.date.today()),
  "description": "Stolen",
  "isTheft": True
}
    result = requests.post("http://localhost:3000/api/FileClaim",headers={"Authorization":"Bearer "+a['token']},json=data_a)
    print(result.text)  
    data_o = {"uuid": "item6",
    "Contractuuid": 'item6',
    "username":"dhrumil",
    "status":"ClaimStatusReimbursement",
    "reimbursable":True,
    }
    result = requests.post("http://localhost:3000/api/ProcessClaim",headers={"Authorization":"Bearer "+a['token']},json=data_o)
    print(result.text)
    break

