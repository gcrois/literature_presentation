# basic flask app

from flask import Flask, render_template, request, redirect, url_for

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/keypress', methods=['POST'])
def keypress():
    print(request.form['key'])
    return f"I'm the backend server and I'm here to say, your key ({request.form['key']}) was delivered successfully!"

app.run(debug=True, host='0.0.0.0')