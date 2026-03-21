import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import connectDB from '@/lib/db';
import User from '@/models/User';

function escapeCsv(val: unknown): string {
  if (val === null || val === undefined) return '';
  const str = Array.isArray(val) ? val.join(' | ') : String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function buildRow(fields: unknown[]): string {
  return fields.map(escapeCsv).join(',');
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const months = ['Jan','Feb','Mar','Apr','May','Jun',
                  'Jul','Aug','Sep','Oct','Nov','Dec'];
  const dd   = String(d.getDate()).padStart(2, '0');
  const mmm  = months[d.getMonth()];
  const yyyy = d.getFullYear();
  return `\t${dd} ${mmm} ${yyyy}`;
}

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET! });
    if (!token || token.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const role = new URL(req.url).searchParams.get('role') ?? 'student';
    await connectDB();

    const users = await User.find({ role })
      .sort({ createdAt: -1 })
      .select('-__v -followers -following')
      .lean() as any[];

    let csv = '';

    if (role === 'student') {
      csv += buildRow([
        'Name', 'Email', 'Class', 'Board', 'School',
        'Points', 'Following Count',
        'Onboarding Complete', 'Joined Date',
      ]) + '\n';

      for (const u of users) {
        csv += buildRow([
          u.name,
          u.email,
          u.studentClass   ?? '',
          u.studentBoard   ?? '',
          u.school         ?? '',
          u.points         ?? 0,
          u.followingCount ?? 0,
          u.onboardingCompleted ? 'Yes' : 'No',
          formatDate(u.createdAt),
        ]) + '\n';
      }

    } else {
      csv += buildRow([
        'Name', 'Email', 'Status', 'Subjects', 'Classes', 'Boards',
        'Qualifications', 'Experience (Years)',
        'Followers', 'Total Views', 'Points',
        'City', 'State', 'Onboarding Complete', 'Joined Date',
      ]) + '\n';

      for (const u of users) {
        csv += buildRow([
          u.name,
          u.email,
          u.teacherStatus        ?? 'pending',
          (u.subjects  ?? []).join(' | '),
          (u.classes   ?? []).join(' | '),
          (u.boards    ?? []).join(' | '),
          u.qualifications       ?? '',
          u.yearsOfExperience    ?? '',
          u.followersCount       ?? 0,
          u.totalViews           ?? 0,
          u.points               ?? 0,
          u.city                 ?? '',
          u.state                ?? '',
          u.onboardingCompleted ? 'Yes' : 'No',
          formatDate(u.createdAt),
        ]) + '\n';
      }
    }

    const filename = `${role}s_${new Date().toISOString().slice(0,10)}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type':        'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (err) {
    console.error('[EXPORT_CSV]', err);
    return NextResponse.json({ error: 'Export failed.' }, { status: 500 });
  }
}
