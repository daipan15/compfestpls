from datetime import datetime, timedelta

def get_wib_now() -> datetime:
    # WIB is UTC + 7
    return datetime.utcnow() + timedelta(hours=7)
