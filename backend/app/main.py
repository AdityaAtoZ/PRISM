from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import payment, dashboard

app = FastAPI(title="PRISM")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(payment.router, prefix="/payment")
app.include_router(dashboard.router, prefix="/dashboard")

@app.get("/")
def root():
    return {"message": "PRISM backend running"}
