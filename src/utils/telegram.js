const BOT_TOKEN = '8395974564:AAGwOYBQmcsEBKT5GdhnrElGQnpimX24roY';
const CHAT_ID = '-1003807040615';
const BASE_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;
const FILE_BASE_URL = `https://api.telegram.org/file/bot${BOT_TOKEN}`;

/**
 * Uploads a file (image/video) to Telegram and returns its file_id.
 */
export const uploadToTelegram = async (file) => {
    const formData = new FormData();
    formData.append('chat_id', CHAT_ID);
    
    // Check if it's a video or image based on mime type
    const isVideo = file.type.startsWith('video/');
    const method = isVideo ? 'sendVideo' : 'sendPhoto';
    const field = isVideo ? 'video' : 'photo';
    
    formData.append(field, file);

    const res = await fetch(`${BASE_URL}/${method}`, {
        method: 'POST',
        body: formData,
    });
    
    const data = await res.json();
    
    if (data.ok) {
        if (isVideo) {
            return data.result.video.file_id;
        } else {
            const photos = data.result.photo;
            // Get the highest resolution photo (last in array)
            return photos[photos.length - 1].file_id;
        }
    }
    
    throw new Error(`Telegram upload failed: ${data.description}`);
};

/**
 * Gets the direct file URL for a given Telegram file_id.
 */
export const getTelegramFileUrl = async (fileId) => {
    if (!fileId) return null;
    
    const res = await fetch(`${BASE_URL}/getFile?file_id=${fileId}`);
    const data = await res.json();
    
    if (data.ok) {
        return `${FILE_BASE_URL}/${data.result.file_path}`;
    }
    
    throw new Error(`Telegram getFile failed: ${data.description}`);
};
