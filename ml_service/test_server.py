from flask import Flask

app = Flask(__name__)

@app.route('/health')
def health():
    return {'status': 'healthy'}

if __name__ == '__main__':
    print('Starting Flask server on port 8000...')
    app.run(host='0.0.0.0', port=8000, debug=True)
