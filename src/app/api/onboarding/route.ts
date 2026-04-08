
// import { NextRequest, NextResponse } from 'next/server';
// import { getToken } from 'next-auth/jwt';
// import connectDB from '@/lib/db';
// import User from '@/models/User';
// import Teacher from '@/models/Teacher';

// export async function POST(req: NextRequest) {
//   try {
//     const token = await getToken({
//       req,
//       secret: process.env.NEXTAUTH_SECRET!,
//     });

//     if (!token?.email) {
//       return NextResponse.json({ error: 'Unauthorized. Please sign in again.' }, { status: 401 });
//     }

//     const body = await req.json();
//     const { role } = body;

//     if (!['student', 'teacher'].includes(role)) {
//       return NextResponse.json({ error: 'Invalid role.' }, { status: 400 });
//     }

//     await connectDB();

//     const user = await User.findOne({ email: token.email.toLowerCase() });

//     if (!user) {
//       return NextResponse.json({ error: 'User not found.' }, { status: 404 });
//     }

//     if (user.onboardingCompleted) {
//       return NextResponse.json({ error: 'Onboarding already completed.' }, { status: 400 });
//     }

//     if (role === 'student') {
//       const { name, studentClass, studentBoard, school, city, state, bio } = body;

//       if (!name?.trim() || !studentClass || !studentBoard) {
//         return NextResponse.json(
//           { error: 'Name, class, and board are required.' },
//           { status: 400 }
//         );
//       }

//       await User.updateOne(
//         { _id: user._id },
//         {
//           $set: {
//             name:                name.trim(),
//             role:                'student',
//             studentClass,
//             studentBoard,
//             school:              school?.trim()  ?? '',
//             city:                city?.trim()    ?? '',
//             state:               state?.trim()   ?? '',
//             bio:                 bio?.trim()     ?? '',
//             onboardingCompleted: true,
//           },
//         }
//       );

//       return NextResponse.json({ success: true, role: 'student' });
//     }

//     if (role === 'teacher') {
//       const {
//         name, bio, phone, city, state,
//         subjects, classes, boards,
//         qualifications, yearsOfExperience,
//       } = body;

//       if (!name?.trim() || !subjects?.length || !classes?.length || !boards?.length) {
//         return NextResponse.json(
//           { error: 'Name, subjects, classes, and boards are required.' },
//           { status: 400 }
//         );
//       }

//       // ✅ Read referral code from body first, fallback to cookie
//       const refCode = body.usedReferralCode?.trim() || req.cookies.get('referral_code')?.value || null;
//       console.log('[ONBOARDING] refCode from body:', body.usedReferralCode, '| final refCode:', refCode);

//       await User.updateOne(
//         { _id: user._id },
//         {
//           $set: {
//             name:                name.trim(),
//             role:                'teacher',
//             teacherStatus:       'pending',
//             bio:                 bio?.trim()            ?? '',
//             phone:               phone?.trim()          ?? '',
//             city:                city?.trim()            ?? '',
//             state:               state?.trim()           ?? '',
//             subjects,
//             classes,
//             boards,
//             qualifications:      qualifications?.trim() ?? '',
//             yearsOfExperience:   Number(yearsOfExperience) || 0,
//             onboardingCompleted: true,
//           },
//         }
//       );

//       await Teacher.findOneAndUpdate(
//         { userId: String(user._id) },
//         {
//           $setOnInsert: {
//             userId: String(user._id),
//             email:  user.email,
//           },
//           $set: {
//             name:              name.trim(),
//             bio:               bio?.trim()            ?? '',
//             city:              city?.trim()            ?? '',
//             state:             state?.trim()           ?? '',
//             subjects,
//             classes,
//             boards,
//             yearsOfExperience: Number(yearsOfExperience) || 0,
//             teacherStatus:     'pending',
//             // ✅ Always update usedReferralCode — not just on insert
//             ...(refCode ? { usedReferralCode: refCode } : {}),
//           },
//         },
//         { upsert: true, new: true }
//       );

//       return NextResponse.json({ success: true, role: 'teacher', teacherStatus: 'pending' });
//     }
//   } catch (err) {
//     console.error('[ONBOARDING_ERROR]', err);
//     return NextResponse.json(
//       { error: 'Something went wrong. Please try again.' },
//       { status: 500 }
//     );
//   }
// }



import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Teacher from '@/models/Teacher';
import Referral from '@/models/Referral';

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET!,
    });

    if (!token?.email) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in again.' }, { status: 401 });
    }

    const body = await req.json();
    const { role } = body;

    if (!['student', 'teacher'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role.' }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email: token.email.toLowerCase() });

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    if (user.onboardingCompleted) {
      return NextResponse.json({ error: 'Onboarding already completed.' }, { status: 400 });
    }

    if (role === 'student') {
      const { name, studentClass, studentBoard, school, city, state, bio } = body;

      if (!name?.trim() || !studentClass || !studentBoard) {
        return NextResponse.json(
          { error: 'Name, class, and board are required.' },
          { status: 400 }
        );
      }

      await User.updateOne(
        { _id: user._id },
        {
          $set: {
            name:                name.trim(),
            role:                'student',
            studentClass,
            studentBoard,
            school:              school?.trim()  ?? '',
            city:                city?.trim()    ?? '',
            state:               state?.trim()   ?? '',
            bio:                 bio?.trim()     ?? '',
            onboardingCompleted: true,
          },
        }
      );

      return NextResponse.json({ success: true, role: 'student' });
    }

    if (role === 'teacher') {
      const {
        name, bio, phone, city, state,
        subjects, classes, boards,
        qualifications, yearsOfExperience,
      } = body;

      if (!name?.trim() || !subjects?.length || !classes?.length || !boards?.length) {
        return NextResponse.json(
          { error: 'Name, subjects, classes, and boards are required.' },
          { status: 400 }
        );
      }

      // ✅ Read referral code from body first, fallback to cookie
      const refCode = body.usedReferralCode?.trim() || req.cookies.get('referral_code')?.value || null;
      console.log('[ONBOARDING] refCode from body:', body.usedReferralCode, '| final refCode:', refCode);

      await User.updateOne(
        { _id: user._id },
        {
          $set: {
            name:                name.trim(),
            role:                'teacher',
            teacherStatus:       'pending',
            bio:                 bio?.trim()            ?? '',
            phone:               phone?.trim()          ?? '',
            city:                city?.trim()            ?? '',
            state:               state?.trim()           ?? '',
            subjects,
            classes,
            boards,
            qualifications:      qualifications?.trim() ?? '',
            yearsOfExperience:   Number(yearsOfExperience) || 0,
            onboardingCompleted: true,
          },
        }
      );

      await Teacher.findOneAndUpdate(
        { userId: String(user._id) },
        {
          $setOnInsert: {
            userId: String(user._id),
            email:  user.email,
          },
          $set: {
            name:              name.trim(),
            bio:               bio?.trim()            ?? '',
            city:              city?.trim()            ?? '',
            state:             state?.trim()           ?? '',
            subjects,
            classes,
            boards,
            yearsOfExperience: Number(yearsOfExperience) || 0,
            teacherStatus:     'pending',
            // ✅ Always update usedReferralCode — not just on insert
            ...(refCode ? { usedReferralCode: refCode } : {}),
          },
        },
        { upsert: true, returnDocument: 'after' }
      );

      // ── Award referral points immediately on registration ──
      if (refCode) {
        try {
          const alreadyCredited = await Referral.findOne({
            referredUserId: String(user._id),
            status:         'credited',
          });

          if (!alreadyCredited) {
            const referrer = await Teacher.findOne({ referralCode: refCode });

            if (referrer) {
              referrer.referralPoints = (referrer.referralPoints ?? 0) + 50;
              await referrer.save();

              await Referral.create({
                referrerId:     referrer.userId,
                referredUserId: String(user._id),
                code:           refCode,
                status:         'credited',
                pointsAwarded:  50,
              });

              console.log(`[ONBOARDING] ✅ Referral credited: 50pts to ${referrer.userId}`);
            } else {
              console.log(`[ONBOARDING] ⚠️ No teacher found with referralCode: ${refCode}`);
            }
          }
        } catch (refErr) {
          console.error('[ONBOARDING] Referral credit failed:', refErr);
          // Don't block onboarding if referral fails
        }
      }

      return NextResponse.json({ success: true, role: 'teacher', teacherStatus: 'pending' });
    }
  } catch (err) {
    console.error('[ONBOARDING_ERROR]', err);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}