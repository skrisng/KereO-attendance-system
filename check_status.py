"""
Quick Status Check - Shows what's running and what's not
"""

import urllib.request
import urllib.error

def check_url(url, name):
    """Check if a URL is accessible"""
    try:
        with urllib.request.urlopen(url, timeout=3) as response:
            status = response.status
            print(f"✅ {name} is WORKING")
            print(f"   URL: {url}")
            print(f"   Status: {status}")
            return True
    except urllib.error.URLError as e:
        print(f"❌ {name} is NOT WORKING")
        print(f"   URL: {url}")
        print(f"   Error: {e.reason}")
        return False
    except Exception as e:
        print(f"❌ {name} is NOT WORKING")
        print(f"   URL: {url}")
        print(f"   Error: {str(e)}")
        return False

print("=" * 60)
print("CHECKING YOUR SERVERS")
print("=" * 60)
print()

# Check Backend
print("1. BACKEND (Django)")
print("-" * 60)
backend_ok = check_url("http://localhost:8000/api/users/", "Backend API")
print()

# Check Frontend
print("2. FRONTEND (React)")
print("-" * 60)
frontend_ok = check_url("http://localhost:3000", "Frontend")
print()

# Summary
print("=" * 60)
print("SUMMARY")
print("=" * 60)
print()

if backend_ok and frontend_ok:
    print("✅ EVERYTHING IS WORKING!")
    print()
    print("Open your browser to: http://localhost:3000")
    print()
elif backend_ok and not frontend_ok:
    print("⚠️  FRONTEND IS NOT RUNNING")
    print()
    print("The backend is working, but you need to start the frontend.")
    print()
    print("To start frontend:")
    print("1. Open a NEW terminal")
    print("2. Run: npm run dev")
    print("3. Wait for: 'Local: http://localhost:3000/'")
    print("4. Then open: http://localhost:3000")
    print()
elif not backend_ok and frontend_ok:
    print("⚠️  BACKEND IS NOT RUNNING")
    print()
    print("The frontend is working, but you need to start the backend.")
    print()
    print("To start backend:")
    print("1. Open a NEW terminal")
    print("2. Run: cd backend")
    print("3. Run: venv\\Scripts\\activate")
    print("4. Run: python manage.py runserver")
    print()
else:
    print("❌ NEITHER SERVER IS RUNNING")
    print()
    print("You need to start BOTH servers:")
    print()
    print("TERMINAL 1 - Backend:")
    print("  cd backend")
    print("  venv\\Scripts\\activate")
    print("  python manage.py runserver")
    print()
    print("TERMINAL 2 - Frontend:")
    print("  npm run dev")
    print()

print("=" * 60)
