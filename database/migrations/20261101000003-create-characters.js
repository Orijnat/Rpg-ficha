'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('characters', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      campaign_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'campaigns', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      job: {
        type: Sequelize.STRING(60),
        allowNull: false,
        defaultValue: 'Aventureiro',
      },
      level: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      xp: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      hp: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 10,
      },
      hp_max: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 10,
      },
      pe: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      pe_max: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      bp: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      attributes: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {},
      },
      skills: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {},
      },
      currencies: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: { latina: 0, ouro: 0, prata: 0, cobre: 0 },
      },
      bank_password_hash: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      room_notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      appearance: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      inventory: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: [],
      },
      contracts: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: [],
      },
      bank_slots: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: [],
      },
      abilities: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: [],
      },
      last_modified_by: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      last_modified_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    await queryInterface.addIndex('characters', ['user_id'], { name: 'characters_user_id_idx' });
    await queryInterface.addIndex('characters', ['campaign_id'], { name: 'characters_campaign_id_idx' });
    await queryInterface.addIndex('characters', ['deleted_at'], { name: 'characters_deleted_at_idx' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('characters');
  },
};
