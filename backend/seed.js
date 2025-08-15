import seedDatabase from "./seeders/seed.js";
import sequelize from "./config/database.js";

const runSeeder = async () => {
  try {
    await seedDatabase();
    await sequelize.close();
    console.log("Database connection closed");
    process.exit(0);
  } catch (error) {
    console.error("Error running seeder:", error);
    process.exit(1);
  }
};

runSeeder();
