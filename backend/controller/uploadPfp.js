const { cloudinary } = require('../config/database')
const streamifier = require('streamifier')

const uploadPfp = async (req, res) => {
    const { name } = req.body;

    if (!req.file || !name) {
        return res.status(400).json({ message: 'Image file and name are required' });
    }

    try {
        const streamUpload = (reqFileBuffer) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        public_id: name, // sets the image's name in Cloudinary
                        folder: 'uploads', // optional: group images under /uploads/
                        invalidate: true,
                        overwrite: true
                    },
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );
                streamifier.createReadStream(reqFileBuffer).pipe(stream);
            });
        };

        const result = await streamUpload(req.file.buffer);

        res.status(200).json({
            message: 'Image uploaded successfully',
            public_id: result.public_id,
            url: result.secure_url,
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to upload image', error: err.message });
    }
}

module.exports = uploadPfp