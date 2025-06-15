const { Sequelize, DataTypes } = require('sequelize')
const sequelize = require('../database')

const Form = sequelize.define('Form', {
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  }
})

module.exports = {
  sequelize,
  Form
}
