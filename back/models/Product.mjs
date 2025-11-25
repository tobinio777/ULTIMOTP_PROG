import { sequelize } from '../config/db.mjs'
import { DataTypes, Model } from 'sequelize'
import { User } from './User.mjs' 

export class Product extends Model { }

Product.init(
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: 'Ya existe un producto con ese nombre. Por favor, elige otro nombre.'
      },
      index: true
    },
    price: {
      type: DataTypes.DECIMAL(10, 2), 
      allowNull: false,
      validate: {
        min: {
          args: [0], 
          msg: 'El precio no puede ser un valor negativo.'
        }
      }
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: {
          msg: 'La cantidad (stock) debe ser un número entero.'
        },
        min: {
          args: [1],
          msg: 'La cantidad (stock) mínima es 1.'
        }
      }
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true, 
      references: {
        model: 'users',
        key: 'id'
      }
    },
    lastUpdatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  },
  {
    sequelize, 
    modelName: 'Product', 
    tableName: 'products'
  }
)

Product.belongsTo(User, { foreignKey: 'userId', as: 'creator' })
User.hasMany(Product, { foreignKey: 'userId', as: 'products' })

Product.belongsTo(User, { foreignKey: 'lastUpdatedBy', as: 'updater' })
User.hasMany(Product, { foreignKey: 'lastUpdatedBy', as: 'updatedProducts' })