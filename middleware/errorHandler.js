// Middleware untuk menangani error secara global dan menampilkan detailnya
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    
    // Menampilkan pesan error spesifik ke browser untuk debugging
    res.status(500).send(`
        <h1>Terjadi Kesalahan pada Server (500)</h1>
        <p><strong>Pesan Error:</strong> ${err.message}</p>
        <pre>${err.stack}</pre>
        <br>
        <a href="/">Kembali ke Beranda</a>
    `);
};

module.exports = errorHandler;