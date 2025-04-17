const { sequelize, Form, Dish, Alcohol } = require('../models')

async function seed() {
  await sequelize.sync({ force: true })

  const dishMap = {}
  for (const name of ['Мясо', 'Рыба']) {
    const [dish] = await Dish.findOrCreate({ where: { name } })
    dishMap[name] = dish
  }

  const alcoholNames = [
    'Водка',
    'Виски',
    'Настойка (сл./п.сл)',
    'Игристое',
    'Вино красное п/сл',
    'Вино белое сухое',
    'Без алкоголя' // ✅ новое
  ]

  const alcoholMap = {}
  for (const name of alcoholNames) {
    const [drink] = await Alcohol.findOrCreate({ where: { name } })
    alcoholMap[name] = drink
  }

  const normalizeAlcohol = (raw) => {
    return raw.map(name => {
      switch (name) {
        case 'Вино':
          return 'Вино красное п/сл'
        case 'Шампанское':
          return 'Игристое'
        case 'Коньяк':
        case 'Пиво':
          return null // исключаем устаревшие
        default:
          return name
      }
    }).filter(Boolean)
  }

  const guests = [
    {
      firstName: 'Иван',
      lastName: 'Петров',
      comment: 'Буду ближе к 7 вечера',
      dish: 'Мясо',
      alcohol: ['Вино', 'Пиво']
    },
    {
      firstName: 'Анна',
      lastName: 'Сидорова',
      comment: 'Я за рулём',
      dish: 'Рыба',
      alcohol: []
    },
    {
      firstName: 'Дмитрий',
      lastName: 'Иванов',
      comment: '',
      dish: 'Мясо',
      alcohol: ['Виски']
    },
    {
      firstName: 'Ольга',
      lastName: 'Кузнецова',
      comment: 'Люблю шампанское!',
      dish: 'Рыба',
      alcohol: ['Шампанское', 'Вино']
    },
    {
      firstName: 'Максим',
      lastName: 'Смирнов',
      comment: '',
      dish: 'Мясо',
      alcohol: ['Пиво']
    },
    {
      firstName: 'Елена',
      lastName: 'Миронова',
      comment: 'Я с мужем',
      dish: 'Рыба',
      alcohol: ['Вино']
    },
    {
      firstName: 'Сергей',
      lastName: 'Фёдоров',
      comment: '',
      dish: 'Мясо',
      alcohol: ['Коньяк']
    },
    {
      firstName: 'Наталья',
      lastName: 'Романова',
      comment: '',
      dish: 'Рыба',
      alcohol: ['Вино']
    },
    {
      firstName: 'Александр',
      lastName: 'Белов',
      comment: 'Приду один',
      dish: 'Мясо',
      alcohol: ['Виски', 'Пиво']
    },
    {
      firstName: 'Мария',
      lastName: 'Лебедева',
      comment: '',
      dish: 'Рыба',
      alcohol: ['Шампанское']
    },
    {
      firstName: 'Роман',
      lastName: 'Григорьев',
      comment: '',
      dish: 'Мясо',
      alcohol: ['Пиво']
    },
    {
      firstName: 'Юлия',
      lastName: 'Кириллова',
      comment: 'Без алкоголя, спасибо!',
      dish: 'Рыба',
      alcohol: []
    },
    {
      firstName: 'Павел',
      lastName: 'Макаров',
      comment: '',
      dish: 'Мясо',
      alcohol: ['Вино']
    },
    {
      firstName: 'Алиса',
      lastName: 'Васильева',
      comment: '',
      dish: 'Рыба',
      alcohol: ['Шампанское']
    },
    {
      firstName: 'Константин',
      lastName: 'Зуев',
      comment: 'Буду с женой',
      dish: 'Мясо',
      alcohol: ['Пиво', 'Коньяк']
    },
    {
      firstName: 'Ирина',
      lastName: 'Тихонова',
      comment: '',
      dish: 'Рыба',
      alcohol: ['Вино']
    },
    {
      firstName: 'Виктор',
      lastName: 'Шестаков',
      comment: '',
      dish: 'Мясо',
      alcohol: []
    },
    {
      firstName: 'Татьяна',
      lastName: 'Калинина',
      comment: 'Можно я возьму +1?',
      dish: 'Рыба',
      alcohol: ['Шампанское']
    }
  ]

  for (const guest of guests) {
    const form = await Form.create({
      firstName: guest.firstName,
      lastName: guest.lastName,
      comment: guest.comment,
      DishId: dishMap[guest.dish].id
    })

    const alcoholIds = normalizeAlcohol(guest.alcohol).map(name => alcoholMap[name].id)
    await form.setAlcohols(alcoholIds)
  }

  console.log('✅ Сиды загружены')
  process.exit()
}

seed().catch(err => {
  console.error('❌ Ошибка при сидировании:', err)
  process.exit(1)
})
