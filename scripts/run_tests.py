#!/usr/bin/env python3
"""
Test runner script for Gate-Compass project
"""
import subprocess
import sys
import os

def run_command(cmd, description):
    """Run a command and print results"""
    print(f"\n{'='*50}")
    print(f"Running: {description}")
    print(f"Command: {cmd}")
    print(f"{'='*50}")
    
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        print(result.stdout)
        if result.stderr:
            print("STDERR:", result.stderr)
        return result.returncode == 0
    except Exception as e:
        print(f"Error running command: {e}")
        return False

def main():
    """Main test runner"""
    print("Gate-Compass Test Runner")
    print("========================")
    
    # Check if we're in the right directory
    if not os.path.exists('tests'):
        print("Error: tests directory not found. Run from project root.")
        sys.exit(1)
    
    # Check if pytest is installed
    try:
        import pytest
        print("✓ pytest is available")
    except ImportError:
        print("✗ pytest not found. Install with: pip install pytest")
        sys.exit(1)
    
    # Run different test categories
    test_commands = [
        ("pytest tests/ -v", "All Tests"),
        ("pytest tests/unit/ -v", "Unit Tests"),
        ("pytest tests/integration/ -v", "Integration Tests"), 
        ("pytest tests/e2e/ -v", "End-to-End Tests")
    ]
    
    results = []
    for cmd, desc in test_commands:
        success = run_command(cmd, desc)
        results.append((desc, success))
    
    # Summary
    print(f"\n{'='*50}")
    print("TEST SUMMARY")
    print(f"{'='*50}")
    for desc, success in results:
        status = "✓ PASSED" if success else "✗ FAILED"
        print(f"{desc}: {status}")

if __name__ == "__main__":
    main()