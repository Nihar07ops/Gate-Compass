#!/usr/bin/env python3
"""
Script to organize test files into categorized subdirectories
"""
import os
import shutil

# Test files in tests/ directory to organize
test_files_in_tests = [
    'test_complete_system.py',
    'test_entire_application.py', 
    'test_historical_api.py',
    'test_mvp_production.py',
    'test_topic_wise.py',
    'test_working_implementation.py',
    'test_enhanced_topic_analysis.py',
    'test_accurate_system.py',
    'test_accurate_data.py',
    'test_full_application.py'
]

# Organization mapping (source in tests/ -> destination subdirectory)
organization_map = {
    'test_complete_system.py': 'e2e/',
    'test_entire_application.py': 'e2e/',
    'test_full_application.py': 'e2e/',
    'test_mvp_production.py': 'e2e/',
    'test_working_implementation.py': 'e2e/',
    'test_historical_api.py': 'integration/',
    'test_topic_wise.py': 'integration/',
    'test_enhanced_topic_analysis.py': 'unit/',
    'test_accurate_system.py': 'integration/',
    'test_accurate_data.py': 'unit/'
}

def organize_tests():
    """Organize test files into categorized subdirectories"""
    print("Organizing test files into categories...")
    
    os.chdir('tests')  # Change to tests directory
    
    for test_file in test_files_in_tests:
        if os.path.exists(test_file):
            destination = organization_map.get(test_file, 'unit/')
            dest_path = os.path.join(destination, test_file)
            
            print(f"Moving {test_file} -> {dest_path}")
            shutil.move(test_file, dest_path)
        else:
            print(f"File not found: {test_file}")
    
    print("Organization complete!")

if __name__ == "__main__":
    organize_tests()