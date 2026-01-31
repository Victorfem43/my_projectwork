const express = require('express');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// KYC document upload: memory storage, 5MB max, images and PDF
const kycUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /^image\/(jpeg|jpg|png|gif|webp)$|^application\/pdf$/;
    if (allowed.test(file.mimetype)) cb(null, true);
    else cb(new Error('Only images (JPEG, PNG, GIF, WebP) and PDF are allowed'));
  }
});

// @route   GET /api/users/me
// @desc    Get current user profile
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        kycStatus: user.kycStatus,
        kycSubmittedAt: user.kycSubmittedAt,
        kycFullName: user.kycFullName,
        kycDateOfBirth: user.kycDateOfBirth,
        kycAddress: user.kycAddress,
        kycIdType: user.kycIdType,
        kycIdNumber: user.kycIdNumber,
        kycDocumentUrl: user.kycDocumentUrl ? true : false,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/users/update
// @desc    Update user profile
// @access  Private
router.put('/update', protect, [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const fieldsToUpdate = {};
    if (req.body.name) fieldsToUpdate.name = req.body.name;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/users/kyc
// @desc    Submit KYC for verification (multipart: document file + fields)
// @access  Private
router.post('/kyc', protect, kycUpload.single('document'), [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('dateOfBirth').notEmpty().withMessage('Date of birth is required'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('idType').trim().notEmpty().withMessage('ID type is required'),
  body('idNumber').trim().notEmpty().withMessage('ID number is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (user.kycStatus === 'approved') {
      return res.status(400).json({ success: false, message: 'Your account is already verified' });
    }

    const dateOfBirth = new Date(req.body.dateOfBirth);
    if (isNaN(dateOfBirth.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid date of birth' });
    }

    let documentUrl = req.body.documentUrl || null;
    if (req.file && req.file.buffer) {
      const cloudinary = require('cloudinary').v2;
      const hasConfig = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET;
      if (hasConfig) {
        try {
          cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
          });
          const b64 = req.file.buffer.toString('base64');
          const dataUri = `data:${req.file.mimetype};base64,${b64}`;
          const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload(dataUri, { folder: 'kyc', resource_type: 'auto' }, (err, res) => (err ? reject(err) : resolve(res)));
          });
          documentUrl = result.secure_url;
        } catch (uploadErr) {
          console.error('KYC document Cloudinary upload error:', uploadErr.message);
          return res.status(500).json({ success: false, message: 'Document upload failed. Please try again.' });
        }
      }
      // If Cloudinary not configured, KYC still saves without document
    }

    user.kycFullName = req.body.fullName.trim();
    user.kycDateOfBirth = dateOfBirth;
    user.kycAddress = req.body.address.trim();
    user.kycIdType = req.body.idType.trim();
    user.kycIdNumber = req.body.idNumber.trim();
    if (documentUrl) user.kycDocumentUrl = documentUrl;
    user.kycStatus = 'pending';
    user.kycSubmittedAt = new Date();
    await user.save({ validateBeforeSave: true });

    res.json({
      success: true,
      message: 'KYC submitted successfully. We will review your verification shortly.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        kycStatus: user.kycStatus,
        kycSubmittedAt: user.kycSubmittedAt
      }
    });
  } catch (error) {
    if (error.message && error.message.includes('Only images')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'Document must be 5MB or less' });
    }
    res.status(500).json({ success: false, message: error.message || 'Failed to submit KYC' });
  }
});

module.exports = router;
