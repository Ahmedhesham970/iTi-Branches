const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("ITI-BRANCHES", "postgres", "123", {
  host: "localhost",
  dialect: "postgres",
  port: 5432,
  logging: false,
});

const connectDB = async () => {
  try {
    const auth = await sequelize.authenticate();
    const sync = await sequelize.sync({ alter: false });
    if (!auth || !sync) {
      console.log("✅ Connected to PostgreSQL and synced successfully!");
    } else {
      console.log("❌ Connection to PostgreSQL failed");
    }
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
  }
};

module.exports = { sequelize, connectDB };
