import subprocess
import sys
import os
import time

def main():
    root_dir = os.path.abspath(os.path.dirname(__file__))
    backend_dir = os.path.join(root_dir, 'backend')
    frontend_dir = os.path.join(root_dir, 'frontend')

    print("==================================================")
    print("           SHAADI QR SERVER MANAGER              ")
    print("==================================================")

    # 1. Start Backend Django Server
    print("\n[Backend] Starting Django development server...")
    backend_process = subprocess.Popen(
        [sys.executable, 'manage.py', 'runserver', '127.0.0.1:8000'],
        cwd=backend_dir
    )

    # 2. Start Frontend Vite Server
    print("[Frontend] Starting Vite React development server...")
    frontend_process = subprocess.Popen(
        ['npm', 'run', 'dev'],
        cwd=frontend_dir,
        shell=True
    )

    print("\nBoth servers are running!")
    print("- Django Backend API: http://127.0.0.1:8000/")
    print("- Vite React Frontend: http://localhost:5173/")
    print("Press Ctrl+C inside terminal to terminate both servers.\n")

    try:
        while True:
            # Check if any process has died
            if backend_process.poll() is not None:
                print("[Backend] Django server stopped unexpectedly.")
                break
            if frontend_process.poll() is not None:
                print("[Frontend] Vite server stopped unexpectedly.")
                break
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n[System] Intercepted shutdown signal. Stopping servers...")
    finally:
        try:
            backend_process.terminate()
            print("[Backend] Django server terminated.")
        except Exception:
            pass
        try:
            frontend_process.terminate()
            print("[Frontend] Vite server terminated.")
        except Exception:
            pass
        print("[System] Done. Goodbye!")

if __name__ == '__main__':
    main()
