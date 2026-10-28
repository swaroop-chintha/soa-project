import urllib.request
import json
import urllib.error

base = "http://localhost:8080"

def get(url, headers=None):
    req = urllib.request.Request(url, headers=headers or {})
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.getcode(), resp.read().decode()
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()

def post(url, data=None, headers=None):
    body = json.dumps(data or {}).encode()
    h = {"Content-Type": "application/json"}
    if headers:
        h.update(headers)
    req = urllib.request.Request(url, data=body, headers=h)
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.getcode(), resp.read().decode()
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()

print("==================================================================")
print(" LIVE GATEWAY & MICROSERVICES INTEGRATION AUDIT")
print("==================================================================")

# 1. Gateway Health
code, res = get(f"{base}/actuator/health")
print(f"1. Gateway Health: HTTP {code} -> {res.strip()}")

# 2. Successful Login
code, res = post(f"{base}/auth/login", {"username": "admin", "password": "admin123"})
admin_data = json.loads(res) if code == 200 else {}
admin_token = admin_data.get("token")
print(f"2. Successful Login (admin): HTTP {code} | User: {admin_data.get('username')} | Role: {admin_data.get('role')} | Token Issued: {bool(admin_token)}")

# 3. Failed Login
code, res = post(f"{base}/auth/login", {"username": "admin", "password": "wrongpassword"})
print(f"3. Failed Login (invalid credentials): HTTP {code} -> {res.strip()}")

# 4. Access Authenticated Endpoint (GET /policies with admin token)
code, res = get(f"{base}/policies", {"Authorization": f"Bearer {admin_token}"})
policies = json.loads(res) if code == 200 else []
print(f"4. Authenticated Request (GET /policies): HTTP {code} | Retrieved {len(policies)} policies")

# 5. Behavior Without JWT (GET /policies)
code, res = get(f"{base}/policies")
print(f"5. Request Without JWT (GET /policies): HTTP {code} -> {res.strip()}")

# 6. Policy Detail Access (GET /policies/1)
code, res = get(f"{base}/policies/1", {"Authorization": f"Bearer {admin_token}"})
pol1 = json.loads(res) if code == 200 else {}
print(f"6. Policy Details (GET /policies/1): HTTP {code} | Policy: {pol1.get('policyNumber')} | Customer: {pol1.get('customerName')} | Limit: ${pol1.get('coverageAmount')}")

# 7. Claim Endpoint Access (GET /claims)
code, res = get(f"{base}/claims", {"Authorization": f"Bearer {admin_token}"})
claims = json.loads(res) if code == 200 else []
print(f"7. Claim Listing (GET /claims): HTTP {code} | Retrieved {len(claims)} claims")

# 8. Approval Endpoint Access (GET /approvals)
code, res = get(f"{base}/approvals", {"Authorization": f"Bearer {admin_token}"})
approvals = json.loads(res) if code == 200 else []
print(f"8. Approval Listing (GET /approvals): HTTP {code} | Retrieved {len(approvals)} approval records")

print("==================================================================")
