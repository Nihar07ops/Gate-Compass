# Testing Instructions - Numerical Questions

## Quick Test Guide

### 1. Open the Application
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

### 2. Navigate to Mock Test
- Click on "Mock Tests" in the navigation

### 3. Test Each Difficulty Level

#### Test 1: Beginner (Easy)
1. Select **Easy** difficulty
2. Choose **Custom** format
3. Select **Freestyle** mode
4. Click "Start Test"
5. **Expected**: Simple concept questions, no numerical questions

#### Test 2: Intermediate (Medium)
1. Select **Medium** difficulty
2. Choose **Custom** format
3. Select **Freestyle** mode
4. Click "Start Test"
5. **Expected**: Moderate difficulty questions, no numerical questions

#### Test 3: Advanced (Hard) - MAIN TEST
1. Select **Hard** difficulty
2. Choose **Custom** format (20 questions)
3. Select **Freestyle** mode
4. Click "Start Test"
5. **Expected**: 
   - ~15-16 numerical questions out of 20 (78%)
   - Questions require calculations
   - Multi-step problem solving
   - 2-3 mark questions

### 4. What to Look For

#### Numerical Questions Should Have:
- Complex calculations (memory access time, pipeline frequency, etc.)
- Multiple steps to solve
- Options with numerical values
- 2-3 marks each

#### Example Numerical Questions:
1. "A system uses demand paging with a page size of 4KB. The page table has 1024 entries. If the TLB hit ratio is 80%..."
2. "A 5-stage pipeline has stage delays of 150ps, 120ps, 180ps, 160ps, and 140ps. With a register delay of 10ps..."
3. "A network uses Go-Back-N protocol with a window size of 7. The bandwidth is 1 Mbps and RTT is 20ms..."

### 5. Verify Server Logs

Check the server console for:
```
🎯 Filtering by difficulty: advanced -> hard, advanced
📊 Found XX questions matching difficulty
```

### 6. Common Issues

#### If no numerical questions appear:
1. Check you selected "Hard" difficulty (not "Medium")
2. Verify server is running (check http://localhost:5000)
3. Check server logs for filtering messages
4. Restart server if needed

#### If questions are too easy:
1. Make sure you selected "Hard" not "Easy"
2. Check the difficulty selector before starting test
3. Verify the button is highlighted in pink/red color

#### If server not responding:
```bash
# Stop server
# (Use Ctrl+C in server terminal)

# Restart server
node server/server-inmemory.js
```

### 7. Expected Results Summary

| Difficulty | Total Questions | Numerical | Percentage |
|------------|----------------|-----------|------------|
| Easy       | 143            | 0         | 0%         |
| Medium     | 215            | 0         | 0%         |
| Hard       | 50             | 39        | 78%        |

### 8. Sample Test Flow

1. **Start**: Select Hard → Custom → Freestyle → Start Test
2. **Question 1**: Should see a numerical question (e.g., memory calculation)
3. **Question 2**: Likely another numerical question
4. **Question 3**: Likely another numerical question
5. **Continue**: ~15-16 out of 20 should be numerical
6. **Submit**: Check results

### 9. Verification Commands

Run these in terminal to verify question bank:

```bash
# Show difficulty distribution
python ml_service/data/test_difficulty_filter.py

# Show sample advanced questions
python ml_service/data/show_advanced_samples.py

# Check hard question quality
python ml_service/data/check_hard_questions.py
```

### 10. Success Criteria

✅ Hard difficulty shows numerical questions  
✅ Questions require calculations  
✅ Difficulty matches selection  
✅ Questions are challenging but solvable  
✅ No duplicate questions in same test  
✅ Questions are properly shuffled  

## Troubleshooting

### Server Issues
```bash
# Check if server is running
curl http://localhost:5000

# Restart server
node server/server-inmemory.js
```

### Frontend Issues
```bash
# Check if frontend is running
curl http://localhost:3000

# Restart frontend (if needed)
cd client
npm run dev
```

### Question Bank Issues
```bash
# Verify question count
python -c "import json; print(len(json.load(open('ml_service/data/comprehensive_300_questions.json', encoding='utf-8'))))"

# Should output: 408
```

## Need More Questions?

If you need more numerical questions in specific topics:

1. Edit `ml_service/data/add_more_hard_numerical.py`
2. Add questions in the same format
3. Run: `python ml_service/data/add_more_hard_numerical.py`
4. Restart server

## Report Issues

If you find:
- Questions too easy/hard
- Wrong answers
- Unclear questions
- Missing topics

Let me know and I'll fix them!
