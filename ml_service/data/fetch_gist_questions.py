import json
import requests
from datetime import datetime

def fetch_gist_questions():
    """
    Fetch GATE CSE questions from GitHub Gist
    URL: https://gist.github.com/madhurimarawat/376ed280655bbd1a8d712741f282a08c
    """
    
    print("🔍 Fetching questions from GitHub Gist...")
    
    # GitHub Gist raw URL
    gist_url = "https://gist.githubusercontent.com/madhurimarawat/376ed280655bbd1a8d712741f282a08c/raw/"
    
    try:
        response = requests.get(gist_url)
        response.raise_for_status()
        
        # Parse the JSON data
        data = response.json()
        
        print(f"✅ Successfully fetched data from Gist")
        
        # Process questions
        all_questions = []
        question_id = 1
        
        # The gist contains questions organized by topics
        for topic, topic_data in data.items():
            if isinstance(topic_data, dict) and 'questions' in topic_data:
                questions = topic_data['questions']
                
                for q in questions:
                    question = {
                        "id": f"gist_{question_id}",
                        "text": q.get('question', ''),
                        "options": q.get('options', []),
                        "correctAnswer": q.get('answer', ''),
                        "explanation": q.get('explanation', ''),
                        "topic": topic,
                        "subject": q.get('subject', 'Computer Science'),
                        "section": "Core Computer Science",
                        "difficulty": q.get('difficulty', 'medium'),
                        "year": q.get('year', 2024),
                        "marks": q.get('marks', 1),
                        "source": "GitHub Gist"
                    }
                    
                    # Validate question has required fields
                    if question['text'] and len(question['options']) >= 4 and question['correctAnswer']:
                        all_questions.append(question)
                        question_id += 1
        
        print(f"✅ Processed {len(all_questions)} questions")
        
        # Load existing questions
        existing_questions = []
        try:
            with open('gate_format_complete.json', 'r', encoding='utf-8') as f:
                existing_data = json.load(f)
                existing_questions = existing_data.get('questions', [])
                print(f"📚 Found {len(existing_questions)} existing questions")
        except FileNotFoundError:
            print("📝 No existing questions file found, creating new one")
        
        # Combine questions (avoid duplicates based on text)
        existing_texts = {q['text'] for q in existing_questions}
        new_questions = [q for q in all_questions if q['text'] not in existing_texts]
        
        combined_questions = existing_questions + new_questions
        
        print(f"➕ Added {len(new_questions)} new questions")
        print(f"📊 Total questions: {len(combined_questions)}")
        
        # Calculate metadata
        sections = {}
        for q in combined_questions:
            section = q.get('section', 'Core Computer Science')
            sections[section] = sections.get(section, 0) + 1
        
        # Create output structure
        output = {
            "questions": combined_questions,
            "metadata": {
                "totalQuestions": len(combined_questions),
                "totalMarks": sum(q.get('marks', 1) for q in combined_questions),
                "sections": {
                    section: {
                        "questions": count,
                        "marks": sum(q.get('marks', 1) for q in combined_questions if q.get('section') == section)
                    }
                    for section, count in sections.items()
                },
                "lastUpdated": datetime.now().isoformat(),
                "sources": ["GATE Format Questions", "GitHub Gist"]
            }
        }
        
        # Save to file
        with open('gate_format_complete.json', 'w', encoding='utf-8') as f:
            json.dump(output, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Saved to gate_format_complete.json")
        print(f"\n📊 Summary:")
        print(f"   Total Questions: {output['metadata']['totalQuestions']}")
        print(f"   Total Marks: {output['metadata']['totalMarks']}")
        print(f"   Sections:")
        for section, data in output['metadata']['sections'].items():
            print(f"      {section}: {data['questions']} questions, {data['marks']} marks")
        
        return output
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Error fetching from Gist: {e}")
        print("💡 Tip: Check your internet connection and the Gist URL")
        return None
    except json.JSONDecodeError as e:
        print(f"❌ Error parsing JSON: {e}")
        return None
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return None

if __name__ == "__main__":
    print("=" * 60)
    print("  GATE CSE Questions - GitHub Gist Importer")
    print("=" * 60)
    print()
    
    result = fetch_gist_questions()
    
    if result:
        print("\n✅ Successfully imported questions from GitHub Gist!")
        print("🔄 Restart the server to load the new questions")
    else:
        print("\n❌ Failed to import questions")
        print("📝 Using existing questions database")
