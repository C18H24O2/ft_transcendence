from ..flango import get


@get("/health")
def health(req):
    return {"status": "200"}
