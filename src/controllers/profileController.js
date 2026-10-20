const User = require("../models/user");
const cloudinary = require("../config/cloudinary");
const { Readable } = require("stream");

const uploadToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: "profile-photos",
                resource_type: "image",
                transformation: [
                    {
                        width: 400,
                        height: 400,
                        crop: "fill",
                        gravity: "face",
                    },
                ],
            },
            (error, result) => {
                if (error) return reject(error);
                if (!result) {
                    return reject(new Error("Image upload failed."));
                }

                resolve(result);
            }
        );

        Readable.from(buffer).pipe(stream);
    });
};

const uploadProfilePhoto = async (req, res) => {
    let uploadedImage;

    try {
        if (!req.file) {
            return res.status(400).json({
                message: "Please select a profile photo.",
            });
        }

        // Only update the authenticated user's profile
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                message: "User not found.",
            });
        }

        uploadedImage = await uploadToCloudinary(req.file.buffer);

        const previousPublicId = user.profilePhoto?.publicId;

        user.profilePhoto = {
            url: uploadedImage.secure_url,
            publicId: uploadedImage.public_id,
        };

        await user.save();

        // Delete the previous image only after saving the new image.
        if (previousPublicId) {
            try {
                await cloudinary.uploader.destroy(previousPublicId);
            } catch (deleteError) {
                console.error("Old profile photo cleanup failed:", deleteError);
            }
        }

        return res.status(200).json({
            message: "Profile photo updated successfully.",
            profilePhoto: user.profilePhoto,
        });
    } catch (error) {
        // If upload succeeded but saving failed, avoid leaving an orphaned image.
        if (uploadedImage?.public_id) {
            try {
                await cloudinary.uploader.destroy(uploadedImage.public_id);
            } catch (cleanupError) {
                console.error("Image cleanup failed:", cleanupError);
            }
        }

        console.error("Profile photo upload failed:", error);

        return res.status(500).json({
            message: "Failed to update profile photo.",
        });
    }
};

module.exports = { uploadProfilePhoto };