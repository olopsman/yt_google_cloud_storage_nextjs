This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

# Google Cloud Storage File Upload Setup

This project includes a file upload feature that uses Next.js server actions to upload files directly to Google Cloud Storage.

## Prerequisites

1. A Google Cloud Platform (GCP) account
2. A GCS bucket created in your project
3. Service account credentials with Storage permissions

## Setup Instructions

### 1. Create a GCS Bucket

```bash
# Using gcloud CLI
gcloud storage buckets create gs://your-bucket-name --location=us-central1
```

Or create one via the [Google Cloud Console](https://console.cloud.google.com/storage).

### 2. Create a Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to IAM & Admin > Service Accounts
3. Click "Create Service Account"
4. Grant it the "Storage Object Creator" role (or "Storage Admin" for full access)
5. Create a JSON key and download it

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

Update the values:

```env
GCP_PROJECT_ID=your-project-id
GCS_BUCKET_NAME=your-bucket-name
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
```

### 4. Install Dependencies

Dependencies have already been installed, but if needed:

```bash
npm install
```

### 5. Run the Development Server

```bash
npm run dev
```

Visit http://localhost:3000 to see the upload form.

## Features

- **Server-side Upload**: Uses Next.js server actions for secure file uploads
- **File Validation**: Includes file size validation (10MB limit by default)
- **Progress Indicator**: Shows loading state during upload
- **Success/Error Messages**: Displays upload status to users
- **Public URL Generation**: Returns the public URL of uploaded files

## File Structure

```
app/
├── actions.ts                    # Server action for GCS upload
├── components/
│   └── FileUploadForm.tsx       # Client-side upload form component
└── page.tsx                     # Main page with upload section
```

## Security Notes

- Never commit your `.env.local` file or service account keys to version control
- Add `.env.local` to `.gitignore`
- Consider using environment variables in your deployment platform (Vercel, etc.)
- Adjust file size limits and file type restrictions as needed
- Consider implementing user authentication before allowing uploads

## Customization

### Change Upload Limits

Edit `app/actions.ts`:

```typescript
const maxSize = 10 * 1024 * 1024; // Change to desired size in bytes
```

### Make Files Public

Uncomment in `app/actions.ts`:

```typescript
await blob.makePublic();
```

### Add File Type Restrictions

In `app/components/FileUploadForm.tsx`:

```tsx
<input
  type="file"
  accept=".jpg,.jpeg,.png,.pdf" // Add allowed extensions
  // ...
/>
```

## Deployment

When deploying to Vercel or other platforms:

1. Add environment variables in your deployment platform
2. For Vercel, you can use the GOOGLE_APPLICATION_CREDENTIALS as a base64-encoded string
3. Ensure your service account has the necessary permissions

## Troubleshooting

- **"GCS bucket name not configured"**: Check your `.env.local` file
- **Authentication errors**: Verify your service account credentials path
- **Permission denied**: Ensure your service account has the correct IAM roles
- **File not appearing**: Check bucket permissions and CORS settings if accessing from browser

## Learn More

- [Google Cloud Storage Documentation](https://cloud.google.com/storage/docs)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [@google-cloud/storage npm package](https://www.npmjs.com/package/@google-cloud/storage)
