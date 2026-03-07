from waitress import serve
from app import create_app

if __name__ == "__main__":
    app = create_app()
    print("✅  AI Brain running — open http://127.0.0.1:5050")
    serve(app, host="127.0.0.1", port=5050, threads=4)

