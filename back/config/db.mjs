import { Sequelize } from "sequelize"

export const sequelize = new Sequelize(
  process.env.NAME_DB,
  process.env.USER_DB,
  process.env.PASS_DB,
  {
    host: process.env.HOST_DB,
    port: process.env.PORT_DB,
    dialect: process.env.DIALECT_DB
    // Si usas una base de datos remota (como Render o Heroku con ClearDB)
    // es posible que debas descomentar las opciones de ssl:
    // dialectOptions: {
    //   ssl: {
    //     require: true,
    //     rejectUnauthorized: false
    //   }
    // },
  } // Paréntesis final corregido
)
