'use server'

import { Storage } from '@google-cloud/storage';

// Initialize Google Cloud Storage client
// Make sure to set up authentication via:
// 1. Service account key file (GOOGLE_APPLICATION_CREDENTIALS env variable)
// 2. Or use Application Default Credentials
const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  // If using key file, specify it here:
  // keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

export async function uploadToGCS(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    
    if (!file) {
      return { success: false, error: 'No file provided' };
    }

    // Validate file size (optional, adjust as needed)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return { success: false, error: 'File size exceeds 10MB limit' };
    }

    const bucketName = process.env.GCS_BUCKET_NAME;
    
    if (!bucketName) {
      return { success: false, error: 'GCS bucket name not configured' };
    }

    const bucket = storage.bucket(bucketName);
    
    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name}`;
    const blob = bucket.file(fileName);

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload file to GCS
    await blob.save(buffer, {
      metadata: {
        contentType: file.type,
      },
    });

    // Make file publicly accessible
    try {
      await blob.makePublic();
    } catch (publicError) {
      console.error('Failed to make file public:', publicError);
      // File uploaded but not public - return signed URL instead
      const [signedUrl] = await blob.getSignedUrl({
        action: 'read',
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      
      return {
        success: true,
        url: signedUrl,
        fileName: fileName,
        message: 'File uploaded successfully (using signed URL)',
      };
    }

    // Generate public URL
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;

    return {
      success: true,
      url: publicUrl,
      fileName: fileName,   
      message: 'File uploaded successfully',
    };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}
