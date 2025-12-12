// MongoDB initialization script for Docker
db = db.getSiblingDB('gate_compass');

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['username', 'email', 'password'],
      properties: {
        username: {
          bsonType: 'string',
          minLength: 3,
          maxLength: 30
        },
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        },
        password: {
          bsonType: 'string',
          minLength: 6
        }
      }
    }
  }
});

db.createCollection('questions');
db.createCollection('testattempts');
db.createCollection('studysessions');

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });
db.questions.createIndex({ topic: 1, difficulty: 1, year: 1 });
db.questions.createIndex({ questionId: 1 }, { unique: true });
db.testattempts.createIndex({ userId: 1, createdAt: -1 });
db.studysessions.createIndex({ userId: 1, createdAt: -1 });

print('✅ MongoDB initialized with collections and indexes');