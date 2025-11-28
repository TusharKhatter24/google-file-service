# Google File Search Stores Manager

A React application for managing Google File Search Stores using the Gemini API. This app allows you to create, delete, and manage file search stores, as well as upload files to them.

## Features

- ✅ Create new File Search Stores
- ✅ List all File Search Stores
- ✅ Delete File Search Stores
- ✅ View store details (document counts, size, etc.)
- ✅ Upload files to stores
- ✅ Real-time upload status tracking
- ✅ Modern, responsive UI

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Google Gemini API key ([Get one here](https://ai.google.dev/))

## Setup

1. **Clone or navigate to the project directory:**
   ```bash
   cd google-file-server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure your API key:**
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Edit `.env` and add your Google API key:
     ```
     VITE_GOOGLE_API_KEY=your_actual_api_key_here
     ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   The app will automatically open at `http://localhost:3000`

## Usage

### Creating a File Store

1. Click the "Create New Store" button
2. Enter a display name for your store
3. Click "Create"

### Managing Files

1. Click "View" on any store card
2. Drag and drop a file or click to select one
3. Optionally provide a display name
4. Click "Upload File"
5. Wait for the upload to complete (the app will poll for status)

### Deleting a Store

1. Click "Delete" on any store card
2. Confirm the deletion
3. Note: This will delete all documents in the store

## API Endpoints Used

This app uses the following Google Gemini API endpoints:

- `POST /v1beta/fileSearchStores` - Create a store
- `GET /v1beta/fileSearchStores` - List stores
- `GET /v1beta/{name}` - Get store details
- `DELETE /v1beta/{name}` - Delete a store
- `POST /upload/v1beta/{name}:uploadToFileSearchStore` - Upload a file
- `GET /v1beta/{operationName}` - Check upload status

## Project Structure

```
google-file-server/
├── src/
│   ├── components/
│   │   ├── FileStoreList.jsx    # Main list view
│   │   └── FileStoreDetail.jsx  # Store detail and upload view
│   ├── services/
│   │   └── fileStoreService.js   # API service functions
│   ├── App.jsx                   # Main app component
│   ├── App.css                   # Global styles
│   ├── main.jsx                  # Entry point
│   └── config.js                 # API configuration
├── package.json
├── vite.config.js
└── README.md
```

## Notes

- The Google File Search API doesn't provide endpoints to list or delete individual documents within a store. You can only view aggregate statistics (counts, size).
- File uploads are asynchronous operations. The app polls for completion status.
- Store deletion requires confirmation and will delete all associated documents.

## Troubleshooting

**API Key Issues:**
- Make sure your `.env` file is in the root directory
- Ensure the variable name is `VITE_GOOGLE_API_KEY` (Vite requires the `VITE_` prefix)
- Restart the dev server after changing `.env`

**Upload Issues:**
- Check file size limits (Google API may have limits)
- Ensure your API key has the necessary permissions
- Check the browser console for detailed error messages

## License

MIT

