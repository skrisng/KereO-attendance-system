#!/usr/bin/env python
"""
Quick API test script to verify backend is working
Run: python test_api.py
"""

import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_connection():
    """Test if backend is running"""
    try:
        response = requests.get(f"{BASE_URL}/users/")
        print("✓ Backend is running!")
        print(f"  Status: {response.status_code}")
        return True
    except requests.exceptions.ConnectionError:
        print("✗ Backend is not running!")
        print("  Start it with: python manage.py runserver")
        return False

def test_users_endpoint():
    """Test users endpoint"""
    print("\nTesting Users Endpoint...")
    response = requests.get(f"{BASE_URL}/users/")
    if response.status_code == 200:
        users = response.json()
        print(f"✓ Users endpoint working! Found {len(users)} users")
        return True
    else:
        print(f"✗ Users endpoint failed: {response.status_code}")
        return False

def test_attendance_endpoint():
    """Test attendance endpoint"""
    print("\nTesting Attendance Endpoint...")
    response = requests.get(f"{BASE_URL}/attendance/")
    if response.status_code == 200:
        records = response.json()
        print(f"✓ Attendance endpoint working! Found {len(records)} records")
        return True
    else:
        print(f"✗ Attendance endpoint failed: {response.status_code}")
        return False

def test_stats_endpoint():
    """Test stats endpoint"""
    print("\nTesting Stats Endpoint...")
    response = requests.get(f"{BASE_URL}/attendance/stats/")
    if response.status_code == 200:
        stats = response.json()
        print(f"✓ Stats endpoint working!")
        print(f"  Total records: {stats.get('total', 0)}")
        print(f"  Today's records: {stats.get('today', 0)}")
        return True
    else:
        print(f"✗ Stats endpoint failed: {response.status_code}")
        return False

def main():
    print("=" * 50)
    print("Backend API Test Suite")
    print("=" * 50)
    
    if not test_connection():
        return
    
    test_users_endpoint()
    test_attendance_endpoint()
    test_stats_endpoint()
    
    print("\n" + "=" * 50)
    print("Test Complete!")
    print("=" * 50)

if __name__ == "__main__":
    main()
