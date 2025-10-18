const { DataTypes } = require("sequelize");
const { sequelize } = require("./db");
const { type } = require("os");
const { timeStamp } = require("console");
const User = sequelize.define(
  "iTi Branches",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    geom: {
      type: DataTypes.GEOMETRY("POINT", 4326),
      allowNull: false,
    },
    Branch: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    X: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    Y: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    Tracks: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
);

// syncDb();
module.exports = User;
