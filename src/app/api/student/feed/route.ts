// import { NextRequest, NextResponse } from 'next/server';
// import { getToken } from 'next-auth/jwt';
// import connectDB from '@/lib/db';
// import Video from '@/models/Video';
// import User from '@/models/User';
// import mongoose from 'mongoose';

// export const revalidate = 0; // always fresh for personalized feed

// export async function GET(req: NextRequest) {
//   try {
//     await connectDB();

//     const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET! });
//     const { searchParams } = req.nextUrl;

//     const search  = searchParams.get('search')?.trim()  ?? '';
//     const subject = searchParams.get('subject')         ?? 'all';
//     const classF  = searchParams.get('class')           ?? 'all';
//     const board   = searchParams.get('board')           ?? 'all';
//     const feed    = searchParams.get('feed')            ?? 'all';    // 'following' | 'all'
//     const page    = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
//     const limit   = 12;
//     const skip    = (page - 1) * limit;

//     // Get student profile for class/board/following info
//     let student: any = null;
//     let followingIds: mongoose.Types.ObjectId[] = [];

//     if (token?.mongoId) {
//       student = await User.findById(token.mongoId)
//         .select('class board following')
//         .lean() as any;
//       followingIds = (student?.following ?? []).map(
//         (id: string) => new mongoose.Types.ObjectId(id)
//       );
//     }

//     // ── Build match filter ──────────────────────────────────
//     const match: any = { status: 'active' };

//     // Search — title, subject, teacher name (via lookup later)
//     if (search) {
//       match.$or = [
//         { title:   { $regex: search, $options: 'i' } },
//         { subject: { $regex: search, $options: 'i' } },
//         { tags:    { $regex: search, $options: 'i' } },
//       ];
//     }

//     if (subject !== 'all') match.subject = subject;
//     if (classF  !== 'all') match.class   = classF;
//     if (board   !== 'all') match.board   = board;

//     // Following feed filter
//     if (feed === 'following' && followingIds.length > 0) {
//       match.teacherId = { $in: followingIds };
//     }

//     // ── Score-based sort for recommendation ────────────────
//     // Priority: followed teacher > same class > same board > views
//     const pipeline: any[] = [
//       { $match: match },
//       {
//         $lookup: {
//           from:         'users',
//           localField:   'teacherId',
//           foreignField: '_id',
//           as:           'teacher',
//         },
//       },
//       { $unwind: { path: '$teacher', preserveNullAndEmpty: false } },
//       { $match: { 'teacher.teacherStatus': 'approved' } },
//     ];

//     // Search by teacher name too
//     if (search) {
//       pipeline.push({
//         $match: {
//           $or: [
//             { title:        { $regex: search, $options: 'i' } },
//             { subject:      { $regex: search, $options: 'i' } },
//             { tags:         { $regex: search, $options: 'i' } },
//             { 'teacher.name': { $regex: search, $options: 'i' } },
//           ],
//         },
//       });
//     }

//     // Add recommendation score
//     pipeline.push({
//       $addFields: {
//         isFollowed:   { $in: ['$teacherId', followingIds.length ? followingIds : []] },
//         sameClass:    student?.class ? { $eq: ['$class', student.class] }   : false,
//         sameBoard:    student?.board ? { $eq: ['$board', student.board] }   : false,
//         likeCount:    { $size: { $ifNull: ['$likes', []] } },
//         recScore: {
//           $add: [
//             { $multiply: [{ $cond: [{ $in: ['$teacherId', followingIds.length ? followingIds : []] }, 1, 0] }, 100] },
//             { $multiply: [{ $cond: [{ $eq: ['$class', student?.class ?? ''] }, 1, 0] }, 50] },
//             { $multiply: [{ $cond: [{ $eq: ['$board', student?.board ?? ''] }, 1, 0] }, 30] },
//             { $multiply: [{ $ifNull: ['$views', 0] }, 0.001] },
//             { $multiply: [{ $size: { $ifNull: ['$likes', []] } }, 0.5] },
//           ],
//         },
//       },
//     });

//     // Count total for pagination
//     const countPipeline = [...pipeline, { $count: 'total' }];
//     const [countResult] = await Video.aggregate(countPipeline);
//     const total = countResult?.total ?? 0;

//     // Final sort + paginate
//     pipeline.push(
//       { $sort: { recScore: -1, createdAt: -1 } },
//       { $skip: skip },
//       { $limit: limit },
//       {
//         $project: {
//           _id:        1,
//           title:      1,
//           subject:    1,
//           class:      1,
//           board:      1,
//           views:      1,
//           likeCount:  1,
//           rating:     1,
//           thumbnail:  1,
//           videoUrl:   1,
//           duration:   1,
//           createdAt:  1,
//           isFollowed: 1,
//           sameClass:  1,
//           recScore:   1,
//           teacher: {
//             _id:            '$teacher._id',
//             name:           '$teacher.name',
//             image:          '$teacher.image',
//             followersCount: '$teacher.followersCount',
//             subjects:       '$teacher.subjects',
//           },
//         },
//       }
//     );

//     const videos = await Video.aggregate(pipeline);

//     // Suggestions for search bar (teacher names + subjects matching query)
//     let suggestions: { type: string; label: string; value: string }[] = [];
//     if (search && search.length >= 2) {
//       const [teacherSugg, subjectSugg] = await Promise.all([
//         User.find({
//           role: 'teacher',
//           teacherStatus: 'approved',
//           name: { $regex: search, $options: 'i' },
//         }).select('name subjects').limit(5).lean() as any,
//         Video.distinct('subject', {
//           status: 'active',
//           subject: { $regex: search, $options: 'i' },
//         }),
//       ]);

//       suggestions = [
//         ...teacherSugg.map((t: any) => ({ type: 'teacher', label: t.name, value: t.name })),
//         ...subjectSugg.slice(0, 4).map((s: string) => ({ type: 'subject', label: s, value: s })),
//       ];
//     }

//     return NextResponse.json({
//       videos: videos.map(v => ({
//         id:           v._id.toString(),
//         title:        v.title,
//         subject:      v.subject,
//         class:        v.class,
//         board:        v.board,
//         views:        v.views ?? 0,
//         likeCount:    v.likeCount ?? 0,
//         rating:       v.rating ?? 0,
//         thumbnail:    v.thumbnail ?? null,
//         videoUrl:     v.videoUrl ?? null,
//         duration:     v.duration ?? null,
//         createdAt:    v.createdAt,
//         isFollowed:   v.isFollowed ?? false,
//         sameClass:    v.sameClass  ?? false,
//         teacher: {
//           id:             v.teacher._id.toString(),
//           name:           v.teacher.name,
//           image:          v.teacher.image ?? null,
//           followersCount: v.teacher.followersCount ?? 0,
//         },
//       })),
//       suggestions,
//       pagination: {
//         page,
//         limit,
//         total,
//         totalPages: Math.ceil(total / limit),
//         hasMore:    page * limit < total,
//       },
//       meta: {
//         studentClass: student?.class ?? null,
//         studentBoard: student?.board ?? null,
//         followingCount: followingIds.length,
//         feed,
//         search,
//       },
//     });
//   } catch (err) {
//     console.error('[STUDENT_FEED]', err);
//     return NextResponse.json({ error: 'Failed.' }, { status: 500 });
//   }
// }

import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({ message: 'Not implemented' }, { status: 501 });
}
