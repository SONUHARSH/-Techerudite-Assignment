
import { Model, DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';
import sequelize from '../config/database.js';

class User extends Model {
  // Define the model fields
}

User.init({
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  sequelize,
  modelName: 'User',
  hooks: {
    beforeCreate: async (user) => {
      user.password = await bcrypt.hash(user.password, 10);
    },
  },
});

export default User;
