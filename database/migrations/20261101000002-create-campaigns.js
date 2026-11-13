'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('campaigns', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        allowNull: false,
      },
      mestre_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
      nome: {
        type: Sequelize.STRING(120),
        allowNull: false,
      },
      descricao: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      cenario: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      estado: {
        type: Sequelize.STRING(30),
        allowNull: false,
        defaultValue: 'planejamento',
      },
      codigo_convite: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
      },
      banner_url: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      dados_extras: {
        type: Sequelize.JSONB,
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

    await queryInterface.addIndex('campaigns', ['mestre_id'], { name: 'campaigns_mestre_id_idx' });
    await queryInterface.addIndex('campaigns', ['codigo_convite'], { name: 'campaigns_codigo_convite_idx' });
    await queryInterface.addIndex('campaigns', ['estado'], { name: 'campaigns_estado_idx' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('campaigns');
  },
};
