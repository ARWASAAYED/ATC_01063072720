const Speaker = require('../models/Speaker');
const { validationResult } = require('express-validator');

//   Get all speakers

exports.getSpeakers = async (req, res) => {
  try {
   
    const reqQuery = { ...req.query };

   
    const removeFields = ['select', 'sort', 'page', 'limit'];

    
    removeFields.forEach(param => delete reqQuery[param]);

    
    let queryStr = JSON.stringify(reqQuery);

    
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  
    let query = Speaker.find(JSON.parse(queryStr)).populate({
      path: 'events',
      select: 'title startDate'
    });

    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('name');
    }


    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Speaker.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);


    const speakers = await query;


    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: speakers.length,
      pagination,
      data: speakers
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

//   Get single speaker

exports.getSpeaker = async (req, res) => {
  try {
    const speaker = await Speaker.findById(req.params.id).populate({
      path: 'events',
      select: 'title description startDate endDate venue'
    });

    if (!speaker) {
      return res.status(404).json({
        success: false,
        message: `No speaker found with the id of ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      data: speaker
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

//     Create new speaker
exports.createSpeaker = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    console.log('Creating speaker with body:', req.body);
    if (req.file) {
      console.log('Uploaded file:', req.file);
      req.body.profileImage = `/Uploads/${req.file.filename}`;
      console.log('Image uploaded:', req.body.profileImage);
    }

    if (req.body.expertise) {
      req.body.expertise = JSON.parse(req.body.expertise);
      console.log('Parsed expertise:', req.body.expertise);
    }

    if (req.body.socialMedia) {
      req.body.socialMedia = JSON.parse(req.body.socialMedia);
      console.log('Parsed socialMedia:', req.body.socialMedia);
    }

    const speakerData = {
      name: req.body.name,
      company: req.body.company,
      position: req.body.position,
      bio: req.body.bio,
      expertise: req.body.expertise,
      profileImage: req.body.profileImage || 'default-speaker.jpg',
      socialMedia: req.body.socialMedia || {},
      createdBy: req.user.id,
    };

    console.log('Speaker data:', speakerData);
    const speaker = await Speaker.create(speakerData);
    console.log('Speaker created:', speaker._id);

    res.status(201).json({
      success: true,
      data: speaker,
    });
  } catch (err) {
    console.error('Error creating speaker:', err);
    res.status(400).json({ success: false, message: err.message });
  }
};

//   Update speaker

exports.updateSpeaker = async (req, res) => {
  try {
    let speaker = await Speaker.findById(req.params.id);

    if (!speaker) {
      return res.status(404).json({
        success: false,
        message: `No speaker found with the id of ${req.params.id}`
      });
    }

    speaker = await Speaker.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: speaker
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

//  Delete speaker

exports.deleteSpeaker = async (req, res) => {
  try {
    const speaker = await Speaker.findById(req.params.id);

    if (!speaker) {
      return res.status(404).json({
        success: false,
        message: `No speaker found with the id of ${req.params.id}`
      });
    }

    await speaker.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
