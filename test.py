import requests
import json
import time
import datetime
data = {"password":"DuBaraMatPuchna"}
for i in range(10):
    a = json.loads(requests.post("http://localhost:3000/api/login",json=data).text)
    print(a)
    print("json token generated for post request")
    data_n = {"uuid": "Apache","contractuuid": "Apache","username": "Arya","password": "Aryapw","fname": "Arya","lname": "Sahsani","sdate": str(datetime.date.today()), "ldate": str(datetime.date.today() + datetime.timedelta(10))}
    result = requests.post("http://localhost:3000/api/CreateContract",headers={"Authorization":"Bearer "+a['token']},json=data_n)
    print(result.text)
    data_n = {"uuid": "Apache",
    "Contractuuid": 'Apache',
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
    data_m = {"uuid": "Apache","active":True}
    result = requests.post("http://localhost:3000/api/SetActiveContractType",headers={"Authorization":"Bearer "+a['token']},json=data_m)
    print(result.text)
    data_a = {
  "username": "Arya",
  "uuid": "Apache",
  "Contractuuid": "Apache",
  "date": str(datetime.date.today()),
  "description": "Broken",
  "isTheft": False
}
    result = requests.post("http://localhost:3000/api/FileClaim",headers={"Authorization":"Bearer "+a['token']},json=data_a)
    print(result.text)
    data_o = {"uuid": "Apache",
    "Contractuuid": 'Apache',
    "username":"Arya",
    "status":"ClaimStatusRepair",
    "reimbursable":0
    }
    result = requests.post("http://localhost:3000/api/ProcessClaim",headers={"Authorization":"Bearer "+a['token']},json=data_o)
    print(result.text)
    break
for i in range(10):
    a = json.loads(requests.post("http://localhost:3000/api/login",json=data).text)
    print(a)
    print("json token generated for post request")
    data_n = {"uuid": "lambo","contractuuid": "lambo","username": "Arya","password": "Aryapw","fname": "Arya","lname": "Sahsani","sdate": str(datetime.date.today()), "ldate": str(datetime.date.today() + datetime.timedelta(10))}
    result = requests.post("http://localhost:3000/api/CreateContract",headers={"Authorization":"Bearer "+a['token']},json=data_n)
    print(result.text)
    data_n = {"uuid": "lambo",
    "Contractuuid": 'lambo',
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
    data_m = {"uuid": "lambo","active":True}
    result = requests.post("http://localhost:3000/api/SetActiveContractType",headers={"Authorization":"Bearer "+a['token']},json=data_m)
    print(result.text)
    data_a = {
  "username": "Arya",
  "uuid": "lambo",
  "Contractuuid": "lambo",
  "date": str(datetime.date.today()),
  "description": "Stolen",
  "isTheft": True
}
    result = requests.post("http://localhost:3000/api/FileClaim",headers={"Authorization":"Bearer "+a['token']},json=data_a)
    print(result.text)  
    data_b = {"uuid": "lambo",
    "Contractuuid": 'lambo',
    "username":"Arya",
    "file_refrence":"file1",
    "IsTheft":True
    
    }
    result = requests.post("http://localhost:3000/api/ProcessTheftClaim",headers={"Authorization":"Bearer "+a['token']},json=data_b)
    print(result.text)
    data_o = {"uuid": "lambo",
    "Contractuuid": 'lambo',
    "username":"Arya",
    "status":"ClaimStatusReimbursement",
    "reimbursable":500000
    }
    result = requests.post("http://localhost:3000/api/ProcessClaim",headers={"Authorization":"Bearer "+a['token']},json=data_o)
    print(result.text)
    break
