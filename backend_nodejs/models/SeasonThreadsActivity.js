const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const SeasonThreadsActivity = sequelize.define('SeasonThreadsActivity', {
  activity_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  bid: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  tid: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  season_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: -1
  },
  name: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  leader_username: {
    type: DataTypes.STRING(30),
    allowNull: false
  }
}, {
  tableName: 'season_threads_activity',
  timestamps: false
});

module.exports = SeasonThreadsActivity;
