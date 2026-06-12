const fs = require('fs');
const path = require('path');
const axios = require('axios');

const getCookieHeaderString = () => {
    try {
        const cookiePath = path.join(__dirname, '../cookies.json');
        const rawData = fs.readFileSync(cookiePath, 'utf8');
        const cookies = JSON.parse(rawData);
        return cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
    } catch (error) {
        throw new Error('Gagal memproses file cookies.json.');
    }
};

const getBaseHeaders = () => {
    return {
        'Cookie': getCookieHeaderString(),
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.pixiv.net/',
        'Accept': 'application/json, text/plain, */*'
    };
};

// Hanya memperbarui fungsi searchPixiv di dalam file models/pixivModel.js
const searchPixiv = async (keyword, page = 1) => {
    const headers = getBaseHeaders();
    const encodedKeyword = encodeURIComponent(keyword);

    // Menambahkan parameter p untuk mendukung pagination halaman berikutnya
    const artworkUrl = `https://www.pixiv.net/ajax/search/artworks/${encodedKeyword}?type=all&p=${page}`;
    const artworkRes = await axios.get(artworkUrl, { headers }).catch(() => ({ data: { body: { illustManga: { data: [] } } } }));
    
    const rawIllusts = artworkRes.data.body?.illustManga?.data || [];
    const artworks = rawIllusts.map(item => ({
        id: item.id,
        title: item.title,
        image_urls: { medium: item.url },
        userId: item.userId,
        userName: item.userName,
        tags: item.tags || [],
        pageCount: item.pageCount || 1
    }));

    return { artworks };
};

const getArtworkPages = async (illustId) => {
    const headers = getBaseHeaders();
    
    const detailUrl = `https://www.pixiv.net/ajax/illust/${illustId}`;
    const detailRes = await axios.get(detailUrl, { headers });
    
    const pagesUrl = `https://www.pixiv.net/ajax/illust/${illustId}/pages`;
    const pagesRes = await axios.get(pagesUrl, { headers });

    const info = detailRes.data.body || {};
    const rawPages = pagesRes.data.body || [];
    const pages = rawPages.map(page => page.urls.regular || page.urls.medium);
    
    // Memproses data tag agar menjadi array string murni
    const tags = info.tags?.tags?.map(t => t.tag) || [];

    return {
        id: illustId,
        title: info.title || 'Untitled',
        author: info.userName || 'Unknown',
        userId: info.userId,
        description: info.description || '',
        tags: tags,
        viewCount: info.viewCount || 0,
        bookmarkCount: info.bookmarkCount || 0,
        pages: pages
    };
};

const getUserProfile = async (userId) => {
    const headers = getBaseHeaders();

    const profileUrl = `https://www.pixiv.net/ajax/user/${userId}`;
    const profileRes = await axios.get(profileUrl, { headers });

    const topIllustsUrl = `https://www.pixiv.net/ajax/user/${userId}/profile/top`;
    const topIllustsRes = await axios.get(topIllustsUrl, { headers });

    const userData = profileRes.data.body || {};
    const topData = topIllustsRes.data.body || {};
    const rawIllustsObj = topData.illusts || {};

    const illusts = Object.values(rawIllustsObj).map(item => ({
        id: item.id,
        title: item.title,
        image_urls: { medium: item.url },
        total_bookmarks: item.bookmarkCount || 0,
        tags: item.tags || [],
        pageCount: item.pageCount || 1
    }));

    const profile = {
        user: {
            name: userData.name || 'User Pixiv',
            profile_image_urls: { medium: userData.imageBig || '' },
            comment: userData.comment || ''
        },
        profile: {
            total_illusts: illusts.length
        }
    };

    return { profile, illusts };
};

module.exports = { searchPixiv, getArtworkPages, getUserProfile };