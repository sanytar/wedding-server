const express = require('express')
const ExcelJS = require('exceljs')
const cors = require('cors')
const { sequelize, Form } = require('./models')

const app = express()
app.use(cors())
app.use(express.json())

// ✅ Получить список всех подтверждённых гостей
app.get('/api/form', async (req, res) => {
  try {
    const forms = await Form.findAll({ order: [['createdAt', 'DESC']] })
    res.json(forms)
  } catch (err) {
    console.error('Ошибка при получении:', err)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

// ✅ Добавить подтверждённого гостя
app.post('/api/form', async (req, res) => {
  try {
    const { firstName } = req.body

    if (!firstName || firstName.trim() === '') {
      return res.status(400).json({ error: 'Имя обязательно' })
    }

    const form = await Form.create({ firstName: firstName.trim() })
    res.status(201).json(form)
  } catch (err) {
    console.error('Ошибка при сохранении:', err)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

// ✅ Экспорт в Excel
app.get('/api/export', async (req, res) => {
  try {
    const guests = await Form.findAll({ order: [['createdAt', 'DESC']] })

    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet('Guests')

    sheet.columns = [
      { header: 'Имя', key: 'firstName', width: 30 },
      { header: 'Дата', key: 'createdAt', width: 25 }
    ]

    guests.forEach((guest) => {
      sheet.addRow({
        firstName: guest.firstName,
        createdAt: new Date(guest.createdAt).toLocaleString('ru-RU')
      })
    })

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', 'attachment; filename=guests.xlsx')

    await workbook.xlsx.write(res)
    res.end()
  } catch (err) {
    console.error('Ошибка экспорта:', err)
    res.status(500).json({ error: 'Ошибка при экспорте' })
  }
})

app.delete('/api/form/:id', async (req, res) => {
  try {
    const id = req.params.id
    const form = await Form.findByPk(id)

    if (!form) {
      return res.status(404).json({ error: 'Гость не найден' })
    }

    await form.destroy()
    res.status(200).json({ success: true })
  } catch (err) {
    console.error('Ошибка при удалении:', err)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})


// 🚀 Запуск
async function start() {
  await sequelize.sync()
  app.listen(3000, () => console.log('🚀 Сервер слушает http://localhost:3000'))
}

start()
