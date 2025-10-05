#!/usr/bin/env python3
"""
Weather Forecast Website - Main Entry Point
This script validates the setup and starts both backend and frontend servers.
"""

import os
import sys
import subprocess
import time
import platform
from pathlib import Path

# Color codes for terminal output
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def print_header(text):
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{text.center(60)}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.ENDC}\n")

def print_success(text):
    print(f"{Colors.OKGREEN}✓ {text}{Colors.ENDC}")

def print_error(text):
    print(f"{Colors.FAIL}✗ {text}{Colors.ENDC}")

def print_warning(text):
    print(f"{Colors.WARNING}⚠ {text}{Colors.ENDC}")

def print_info(text):
    print(f"{Colors.OKCYAN}ℹ {text}{Colors.ENDC}")

def check_python_version():
    """Check if Python version is 3.8 or higher"""
    print_info("Checking Python version...")
    version = sys.version_info
    if version.major >= 3 and version.minor >= 8:
        print_success(f"Python {version.major}.{version.minor}.{version.micro} detected")
        return True
    else:
        print_error(f"Python 3.8+ required, but {version.major}.{version.minor}.{version.micro} found")
        return False

def check_node_installed():
    """Check if Node.js is installed"""
    print_info("Checking Node.js installation...")
    try:
        result = subprocess.run(['node', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            print_success(f"Node.js {result.stdout.strip()} detected")
            return True
    except FileNotFoundError:
        print_error("Node.js not found. Please install Node.js from https://nodejs.org/")
        return False
    return False

def check_npm_installed():
    """Check if npm is installed"""
    print_info("Checking npm installation...")
    try:
        if platform.system() == 'Windows':
            result = subprocess.run(['npm.cmd', '--version'], capture_output=True, text=True)
        else:
            result = subprocess.run(['npm', '--version'], capture_output=True, text=True)
        
        if result.returncode == 0:
            print_success(f"npm {result.stdout.strip()} detected")
            return True
    except FileNotFoundError:
        print_error("npm not found")
        return False
    return False

def check_venv_exists():
    """Check if virtual environment exists"""
    print_info("Checking Python virtual environment...")
    venv_path = Path('.venv')
    if venv_path.exists() and venv_path.is_dir():
        print_success("Virtual environment found at .venv/")
        return True
    else:
        print_warning("Virtual environment not found")
        return False

def create_venv():
    """Create Python virtual environment"""
    print_info("Creating Python virtual environment...")
    try:
        subprocess.run([sys.executable, '-m', 'venv', '.venv'], check=True)
        print_success("Virtual environment created successfully")
        return True
    except subprocess.CalledProcessError as e:
        print_error(f"Failed to create virtual environment: {e}")
        return False

def get_pip_command():
    """Get the correct pip command for the platform"""
    if platform.system() == 'Windows':
        return os.path.join('.venv', 'Scripts', 'pip.exe')
    else:
        return os.path.join('.venv', 'bin', 'pip')

def get_python_command():
    """Get the correct python command for the platform"""
    if platform.system() == 'Windows':
        return os.path.join('.venv', 'Scripts', 'python.exe')
    else:
        return os.path.join('.venv', 'bin', 'python')

def install_backend_dependencies():
    """Install Python backend dependencies"""
    print_info("Installing backend dependencies...")
    pip_cmd = get_pip_command()
    
    try:
        # Upgrade pip first
        subprocess.run([pip_cmd, 'install', '--upgrade', 'pip'], check=True, capture_output=True)
        
        # Install requirements
        result = subprocess.run([pip_cmd, 'install', '-r', 'requirements.txt'], 
                              check=True, capture_output=True, text=True)
        print_success("Backend dependencies installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print_error(f"Failed to install backend dependencies: {e}")
        print_error(e.stderr if e.stderr else "")
        return False

def check_backend_dependencies():
    """Check if backend dependencies are installed"""
    print_info("Checking backend dependencies...")
    pip_cmd = get_pip_command()
    
    required_packages = ['Flask', 'flask-cors', 'requests', 'pytest']
    
    try:
        result = subprocess.run([pip_cmd, 'list'], capture_output=True, text=True, check=True)
        installed_packages = result.stdout.lower()
        
        missing = []
        for package in required_packages:
            if package.lower() not in installed_packages:
                missing.append(package)
        
        if missing:
            print_warning(f"Missing packages: {', '.join(missing)}")
            return False
        else:
            print_success("All backend dependencies are installed")
            return True
    except subprocess.CalledProcessError:
        print_warning("Could not check installed packages")
        return False

def check_frontend_dependencies():
    """Check if frontend dependencies are installed"""
    print_info("Checking frontend dependencies...")
    node_modules = Path('frontend/node_modules')
    
    if node_modules.exists() and node_modules.is_dir():
        print_success("Frontend dependencies are installed")
        return True
    else:
        print_warning("Frontend dependencies not found")
        return False

def install_frontend_dependencies():
    """Install frontend dependencies"""
    print_info("Installing frontend dependencies...")
    
    try:
        npm_cmd = 'npm.cmd' if platform.system() == 'Windows' else 'npm'
        result = subprocess.run([npm_cmd, 'install'], 
                              cwd='frontend', 
                              check=True, 
                              capture_output=True, 
                              text=True)
        print_success("Frontend dependencies installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print_error(f"Failed to install frontend dependencies: {e}")
        print_error(e.stderr if e.stderr else "")
        return False

def check_weatherapi_key():
    """Check if WeatherAPI key is configured"""
    print_info("Checking WeatherAPI key configuration...")
    
    # Try to load from .env file
    from dotenv import load_dotenv
    load_dotenv()
    
    api_key = os.getenv('WEATHERAPI_KEY')
    
    if api_key and api_key != 'YOUR_WEATHERAPI_KEY':
        print_success(f"WeatherAPI key is configured (ends with: ...{api_key[-4:]})")
        return True
    else:
        print_warning("WeatherAPI key not configured")
        print_info("Get your free API key from: https://www.weatherapi.com/signup.aspx")
        print_info("Then add it to .env file: WEATHERAPI_KEY=your_api_key_here")
        return False

def check_env_files():
    """Check if environment files exist"""
    print_info("Checking environment configuration files...")
    
    backend_env = Path('backend/.env')
    frontend_env = Path('frontend/.env')
    
    status = True
    
    if not frontend_env.exists():
        print_warning("Frontend .env file not found, creating default...")
        try:
            frontend_env.write_text('VITE_API_URL=http://localhost:5000\n')
            print_success("Created frontend/.env")
        except Exception as e:
            print_error(f"Failed to create frontend/.env: {e}")
            status = False
    else:
        print_success("Frontend .env file exists")
    
    if not backend_env.exists():
        print_info("Backend .env file not found (optional, using environment variables)")
    else:
        print_success("Backend .env file exists")
    
    return status

def validate_project_structure():
    """Validate that all required files and directories exist"""
    print_info("Validating project structure...")
    
    required_paths = [
        'backend/app.py',
        'requirements.txt',  # In root, not backend/
        'frontend/package.json',
        'frontend/src/App.tsx',
    ]
    
    all_exist = True
    for path in required_paths:
        if not Path(path).exists():
            print_error(f"Required file missing: {path}")
            all_exist = False
    
    if all_exist:
        print_success("Project structure is valid")
    
    return all_exist

def test_backend_import():
    """Test if backend can be imported without errors"""
    print_info("Testing backend import...")
    
    python_cmd = get_python_command()
    
    try:
        result = subprocess.run(
            [python_cmd, '-c', 'import sys; sys.path.insert(0, "backend"); import app; print("OK")'],
            capture_output=True,
            text=True,
            timeout=5
        )
        
        if result.returncode == 0 and 'OK' in result.stdout:
            print_success("Backend import successful")
            return True
        else:
            print_error("Backend import failed")
            if result.stderr:
                print_error(result.stderr)
            return False
    except subprocess.TimeoutExpired:
        print_error("Backend import timed out")
        return False
    except Exception as e:
        print_error(f"Backend import error: {e}")
        return False

def start_backend():
    """Start the Flask backend server"""
    print_header("STARTING BACKEND SERVER")
    
    python_cmd = get_python_command()
    
    print_info("Starting Flask backend on http://localhost:5000...")
    print_info("Press Ctrl+C to stop both servers")
    
    try:
        # Start backend in a new process
        if platform.system() == 'Windows':
            backend_process = subprocess.Popen(
                [python_cmd, 'backend/app.py'],
                creationflags=subprocess.CREATE_NEW_CONSOLE
            )
        else:
            backend_process = subprocess.Popen(
                [python_cmd, 'backend/app.py'],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
        
        print_success("Backend server started")
        time.sleep(3)  # Wait for backend to start
        
        return backend_process
    except Exception as e:
        print_error(f"Failed to start backend: {e}")
        return None

def start_frontend():
    """Start the React frontend server"""
    print_header("STARTING FRONTEND SERVER")
    
    print_info("Starting React frontend on http://localhost:3000...")
    
    try:
        npm_cmd = 'npm.cmd' if platform.system() == 'Windows' else 'npm'
        # Start frontend in a new process
        if platform.system() == 'Windows':
            frontend_process = subprocess.Popen(
                [npm_cmd, 'run', 'dev'],
                cwd='frontend',
                creationflags=subprocess.CREATE_NEW_CONSOLE
            )
        else:
            frontend_process = subprocess.Popen(
                [npm_cmd, 'run', 'dev'],
                cwd='frontend',
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
        
        print_success("Frontend server started")
        print_success("\n🌤️  Weather Forecast Website is running!")
        print_info("Backend:  http://localhost:5000")
        print_info("Frontend: http://localhost:3000")
        print_info("\nPress Ctrl+C to stop both servers\n")
        
        return frontend_process
    except Exception as e:
        print_error(f"Failed to start frontend: {e}")
        return None

def main():
    """Main entry point"""
    print_header("WEATHER FORECAST WEBSITE - SETUP & START")
    
    # Step 1: Check system prerequisites
    print_header("STEP 1: CHECKING SYSTEM PREREQUISITES")
    
    if not check_python_version():
        sys.exit(1)
    
    if not check_node_installed():
        sys.exit(1)
    
    if not check_npm_installed():
        sys.exit(1)
    
    # Step 2: Validate project structure
    print_header("STEP 2: VALIDATING PROJECT STRUCTURE")
    
    if not validate_project_structure():
        print_error("Project structure validation failed")
        sys.exit(1)
    
    # Step 3: Check/create virtual environment
    print_header("STEP 3: PYTHON VIRTUAL ENVIRONMENT")
    
    if not check_venv_exists():
        if not create_venv():
            sys.exit(1)
    
    # Step 4: Install/check backend dependencies
    print_header("STEP 4: BACKEND DEPENDENCIES")
    
    if not check_backend_dependencies():
        if not install_backend_dependencies():
            sys.exit(1)
    
    # Step 5: Install/check frontend dependencies
    print_header("STEP 5: FRONTEND DEPENDENCIES")
    
    if not check_frontend_dependencies():
        if not install_frontend_dependencies():
            sys.exit(1)
    
    # Step 6: Check environment configuration
    print_header("STEP 6: ENVIRONMENT CONFIGURATION")
    
    check_env_files()
    api_key_configured = check_weatherapi_key()
    
    if not api_key_configured:
        print_warning("\n⚠️  WARNING: WeatherAPI key is not configured!")
        print_info("The application will start but API calls will fail.")
        print_info("To configure, set the WEATHERAPI_KEY environment variable.")
        response = input("\nContinue anyway? (y/N): ")
        if response.lower() != 'y':
            print_info("Exiting. Please configure the API key and try again.")
            sys.exit(0)
    
    # Step 7: Test backend
    print_header("STEP 7: TESTING BACKEND")
    
    if not test_backend_import():
        print_warning("Backend test failed, but continuing...")
    
    # Step 8: Start servers
    print_header("STEP 8: STARTING SERVERS")
    
    backend_process = start_backend()
    if not backend_process:
        print_error("Failed to start backend server")
        sys.exit(1)
    
    frontend_process = start_frontend()
    if not frontend_process:
        print_error("Failed to start frontend server")
        if backend_process:
            backend_process.terminate()
        sys.exit(1)
    
    # Keep the script running and handle Ctrl+C
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print_info("\n\nShutting down servers...")
        if backend_process:
            backend_process.terminate()
        if frontend_process:
            frontend_process.terminate()
        print_success("Servers stopped successfully")
        print_info("Goodbye! 👋")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print_error(f"Unexpected error: {e}")
        sys.exit(1)
