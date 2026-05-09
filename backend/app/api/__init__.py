from fastapi import APIRouter

from app.api.v1 import auth, files, notes, projects, search, tags, tasks

router = APIRouter()
router.include_router(auth.router, prefix="/auth", tags=["auth"])
router.include_router(notes.router, prefix="/notes", tags=["notes"])
router.include_router(tasks.router, prefix="/tasks", tags=["tasks"])
router.include_router(projects.router, prefix="/projects", tags=["projects"])
router.include_router(files.router, prefix="/files", tags=["files"])
router.include_router(tags.router, prefix="/tags", tags=["tags"])
router.include_router(search.router, prefix="/search", tags=["search"])
