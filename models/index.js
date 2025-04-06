const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../database');

const Form = sequelize.define('Form', {
  firstName: DataTypes.STRING,
  lastName: DataTypes.STRING,
  comment: DataTypes.TEXT,
});

const Dish = sequelize.define('Dish', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  }
});

const Alcohol = sequelize.define('Alcohol', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  }
});

Form.belongsTo(Dish);
Dish.hasMany(Form);

Form.belongsToMany(Alcohol, { through: 'FormAlcohol', as: 'Alcohols' })
Alcohol.belongsToMany(Form, { through: 'FormAlcohol', as: 'Forms' })

module.exports = {
  sequelize,
  Form,
  Dish,
  Alcohol,
};