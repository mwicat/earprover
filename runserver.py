import jsonapp
from flask import jsonify
import service

app = jsonapp.make_json_app(__name__, static_url_path='')

@app.route('/')
def root():
    return app.send_static_file('index.html')

@app.route('/services')
def hello_world():
    return jsonify(service.parse('xml/fur_elise.xml'))

if __name__ == '__main__':
    app.run(debug=True)