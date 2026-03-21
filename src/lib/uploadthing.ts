import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { getToken } from 'next-auth/jwt';

const f = createUploadthing();

export const ourFileRouter = {
  videoUploader: f({
    video: {
      maxFileSize: '512MB',
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      const token = await getToken({
        req:    req as any,
        secret: process.env.NEXTAUTH_SECRET!,
      });

      if (!token || token.role !== 'teacher') {
        throw new Error('Unauthorized');
      }

      if (token.teacherStatus !== 'approved') {
        throw new Error('Teacher account not approved yet.');
      }

      return { teacherEmail: token.email as string };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('[UPLOADTHING] Upload complete for:', metadata.teacherEmail);
      console.log('[UPLOADTHING] File URL:', file.ufsUrl);
      return { uploadedBy: metadata.teacherEmail, url: file.ufsUrl };
    }),

  thumbnailUploader: f({
    image: {
      maxFileSize: '4MB',
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      const token = await getToken({
        req:    req as any,
        secret: process.env.NEXTAUTH_SECRET!,
      });

      if (!token || token.role !== 'teacher') {
        throw new Error('Unauthorized');
      }

      return { teacherEmail: token.email as string };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('[UPLOADTHING] Thumbnail uploaded for:', metadata.teacherEmail);
      return { uploadedBy: metadata.teacherEmail, url: file.ufsUrl };
    }),

} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
