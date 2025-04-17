const express = require('express')
const cors = require('cors')
const { sequelize, Form, Dish, Alcohol } = require('./models')
const ExcelJS = require('exceljs')

const app = express()
app.use(cors())
app.use(express.json())

// ✅ Получить всех гостей
app.get('/api/form', async (req, res) => {
  const forms = await Form.findAll({
    include: [
      { model: Dish },
      { model: Alcohol, as: 'Alcohols' }
    ]
  })
  res.json(forms)
})

// ✅ Добавить анкету
app.post('/api/form', async (req, res) => {
  try {
    const { firstName, lastName, comment, dishId, alcoholIds } = req.body

    const form = await Form.create({
      firstName,
      lastName,
      comment,
      DishId: dishId
    })

    if (alcoholIds?.length) {
      await form.setAlcohols(alcoholIds) // 💥 работает теперь
    }

    const result = await Form.findByPk(form.id, {
      include: [
        { model: Dish },
        { model: Alcohol, as: 'Alcohols' }
      ]
    })

    res.status(201).json(result)
  } catch (err) {
    console.error('Ошибка при сохранении:', err)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

// ✅ Горячие блюда
app.get('/api/dishes', async (req, res) => {
  const dishes = await Dish.findAll()
  res.json(dishes)
})

// ✅ Напитки
app.get('/api/alcohols', async (req, res) => {
  const drinks = await Alcohol.findAll()
  res.json(drinks)
})

app.get('/api/export', async (req, res) => {
  try {
    const forms = await Form.findAll({
      include: [
        { model: Dish },
        { model: Alcohol, as: 'Alcohols' }
      ]
    })

    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet('Guests')

    // Заголовки
    sheet.columns = [
      { header: 'Имя', key: 'firstName', width: 20 },
      { header: 'Фамилия', key: 'lastName', width: 20 },
      { header: 'Горячее блюдо', key: 'dish', width: 20 },
      { header: 'Алкоголь', key: 'alcohol', width: 30 },
      { header: 'Комментарий', key: 'comment', width: 40 },
    ]

    // Данные
    forms.forEach(form => {
      sheet.addRow({
        firstName: form.firstName,
        lastName: form.lastName,
        dish: form.Dish?.name || '',
        alcohol: (form.Alcohols || []).map(a => a.name).join(', '),
        comment: form.comment || ''
      })
    })

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', 'attachment; filename=guests.xlsx')

    await workbook.xlsx.write(res)
    res.end()
  } catch (err) {
    console.error('❌ Ошибка экспорта:', err)
    res.status(500).json({ error: 'Ошибка при экспорте' })
  }
})

// 🗑️ Удаление гостя по ID
app.delete('/api/form/:id', async (req, res) => {
  try {
    const id = req.params.id
    const form = await Form.findByPk(id)
    if (!form) {
      return res.status(404).json({ error: 'Гость не найден' })
    }

    await form.setAlcohols([]) // удаляем связи
    await form.destroy()       // удаляем саму запись

    res.status(200).json({ success: true })
  } catch (err) {
    console.error('Ошибка при удалении:', err)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

// 🚀 Запуск
async function start() {
  await sequelize.sync() // База уже создана через сиды
  // await Alcohol.destroy({ where: {} })
  app.listen(3000, () => console.log('🚀 Сервер слушает http://localhost:3000'))
}

start()
