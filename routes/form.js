const express = require('express');
const router = express.Router();
const Form = require('../models/Form');

// POST /api/form — сохранить анкету
router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, hotDish, alcohol, comment } = req.body;

    const form = await Form.create({
      firstName,
      lastName,
      hotDish,
      alcohol,
      comment
    });

    res.json({ message: 'Анкета сохранена', data: form });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при сохранении анкеты' });
  }
});

// GET /api/form — получить все анкеты
router.get('/', async (req, res) => {
  try {
    const forms = await Form.findAll({ order: [['createdAt', 'DESC']] });
    res.json(forms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при получении анкет' });
  }
});

module.exports = router;