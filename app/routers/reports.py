from fastapi import APIRouter, HTTPException

from ..deps import AdminRequired, DbSession, UserRequired
from ..models import Property, Report, User
from ..schemas import ReportIn, ReportOut, ReportStatusIn

router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.post("", response_model=ReportOut, status_code=201)
def create_report(data: ReportIn, db: DbSession, user: UserRequired):
    if data.target_user_id is not None and not db.get(User, data.target_user_id):
        raise HTTPException(404, "Target user not found.")
    if data.property_id is not None and not db.get(Property, data.property_id):
        raise HTTPException(404, "Property not found.")
    report = Report(
        reporter_id=user.id,
        target_user_id=data.target_user_id,
        property_id=data.property_id,
        category=data.category.strip(),
        details=data.details.strip(),
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


@router.get("/mine", response_model=list[ReportOut])
def my_reports(db: DbSession, user: UserRequired):
    return (
        db.query(Report)
        .filter(Report.reporter_id == user.id)
        .order_by(Report.created_at.desc())
        .all()
    )


@router.get("", response_model=list[ReportOut])
def all_reports(db: DbSession, user: AdminRequired, status: str = ""):
    query = db.query(Report)
    if status:
        query = query.filter(Report.status == status)
    return query.order_by(Report.created_at.desc()).all()


@router.patch("/{report_id}", response_model=ReportOut)
def update_report(report_id: int, data: ReportStatusIn, db: DbSession, user: AdminRequired):
    report = db.get(Report, report_id)
    if not report:
        raise HTTPException(404, "Report not found.")
    report.status = data.status
    db.commit()
    db.refresh(report)
    return report