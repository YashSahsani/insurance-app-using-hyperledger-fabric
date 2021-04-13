import requests
import json
import time
import datetime
data = {"password":"DuBaraMatPuchna"}
for i in range(10):
    a = json.loads(requests.post("http://localhost:3000/api/login",json=data).text)
    print(a)
    print("json token generated for post request")
    data_n = {"uuid": "item7","contractuuid": "item7","username": "yash","password": "yashpw","fname": "yash","lname": "Sahsani","sdate": str(datetime.date.today()), "ldate": str(datetime.date.today() + datetime.timedelta(10))}
    result = requests.post("http://localhost:3000/api/CreateContract",headers={"Authorization":"Bearer "+a['token']},json=data_n)
    print(result.text)
    data_n = {"uuid": "item7",
    "Contractuuid": 'item7',
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
    data_m = {"uuid": "item7","active":True}
    result = requests.post("http://localhost:3000/api/SetActiveContractType",headers={"Authorization":"Bearer "+a['token']},json=data_m)
    print(result.text)
    data_a = {
  "username": "yash",
  "uuid": "item7",
  "Contractuuid": "item7",
  "date": str(datetime.date.today()),
  "description": "Stolen",
  "isTheft": True
}
    result = requests.post("http://localhost:3000/api/FileClaim",headers={"Authorization":"Bearer "+a['token']},json=data_a)
    print(result.text)  
    data_b = {"uuid": "item7",
    "Contractuuid": 'item7',
    "username":"yash",
    "IsTheft":True,
    "file_refrence":"file1",
    }
    result = requests.post("http://localhost:3000/api/ProcessTheftClaim",headers={"Authorization":"Bearer "+a['token']},json=data_b)
    print(result.text)
    data_o = {"uuid": "item7",
    "Contractuuid": 'item7',
    "username":"yash",
    "status":"ClaimStatusReimbursement",
    "reimbursable":"file1"
    }
    result = requests.post("http://localhost:3000/api/ProcessClaim",headers={"Authorization":"Bearer "+a['token']},json=data_o)
    print(result.text)
    break

