"""
Integration Test Script for Attendance System
Tests frontend-backend connectivity and API endpoints
"""

import urllib.request
import urllib.error
import json

API_BASE = "http://localhost:8000/api"
FRONTEND_URL = "http://localhost:3000"

def test_endpoint(url, method="GET", data=None):
    """Test an API endpoint"""
    try:
        if data:
            data = json.dumps(data).encode('utf-8')
            req = urllib.request.Request(url, data=data, method=method)
            req.add_header('Content-Type', 'application/json')
        else:
            req = urllib.request.Request(url, method=method)
        
        with urllib.request.urlopen(req, timeout=5) as response:
            return {
                'success': True,
                'status': response.status,
                'data': json.loads(response.read().decode('utf-8'))
            }
    except urllib.error.HTTPError as e:
        return {
            'success': False,
            'status': e.code,
            'error': e.reason
        }
    except urllib.error.URLError as e:
        return {
            'success': False,
            'error': str(e.reason)
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

def print_result(test_name, result):
    """Print test result"""
    if result['success']:
        print(f"✓ {test_name}")
        if 'data' in result:
            print(f"  Status: {result['status']}")
            if isinstance(result['data'], list):
                print(f"  Records: {len(result['data'])}")
            elif isinstance(result['data'], dict):
                data_str = json.dumps(result['data'], indent=2)[:100]
                print(f"  Response: {data_str}...")
    else:
        print(f"✗ {test_name}")
        print(f"  Error: {result.get('error', 'Unknown error')}")
    print()

def main():
    print("=" * 60)
    print("ATTENDANCE SYSTEM - INTEGRATION TEST")
    print("=" * 60)
    print()
    
    # Test 1: Backend Health
    print("1. Testing Backend Server...")
    result = test_endpoint(f"{API_BASE}/users/")
    print_result("Backend is running", result)
    
    if not result['success']:
        print("⚠ Backend is not running!")
        print("  Start it with: cd backend && python manage.py runserver")
        print()
    
    # Test 2: Users Endpoint
    print("2. Testing Users API...")
    result = test_endpoint(f"{API_BASE}/users/")
    print_result("GET /api/users/", result)
    
    # Test 3: Attendance Endpoint
    print("3. Testing Attendance API...")
    result = test_endpoint(f"{API_BASE}/attendance/")
    print_result("GET /api/attendance/", result)
    
    # Test 4: Stats Endpoint
    print("4. Testing Stats API...")
    result = test_endpoint(f"{API_BASE}/attendance/stats/")
    print_result("GET /api/attendance/stats/", result)
    
    # Test 5: Frontend Server
    print("5. Testing Frontend Server...")
    result = test_endpoint(FRONTEND_URL)
    print_result("Frontend is running", result)
    
    if not result['success']:
        print("⚠ Frontend is not running!")
        print("  Start it with: npm run dev")
        print()
    
    # Test 6: CORS Configuration
    print("6. Testing CORS Configuration...")
    try:
        req = urllib.request.Request(f"{API_BASE}/users/")
        req.add_header('Origin', FRONTEND_URL)
        with urllib.request.urlopen(req, timeout=5) as response:
            cors_header = response.headers.get('Access-Control-Allow-Origin')
            if cors_header:
                print(f"✓ CORS is configured")
                print(f"  Allowed Origin: {cors_header}")
            else:
                print(f"⚠ CORS headers not found")
    except Exception as e:
        print(f"✗ CORS test failed: {e}")
    print()
    
    # Summary
    print("=" * 60)
    print("INTEGRATION TEST SUMMARY")
    print("=" * 60)
    print()
    print("Next Steps:")
    print("1. Ensure both servers are running:")
    print("   - Backend: cd backend && python manage.py runserver")
    print("   - Frontend: npm run dev")
    print()
    print("2. Open browser at: http://localhost:3000")
    print("3. Test the following features:")
    print("   - Register a new user")
    print("   - Scan face with live scanner")
    print("   - View attendance history")
    print("   - Check dashboard stats")
    print()

if __name__ == "__main__":
    main()
