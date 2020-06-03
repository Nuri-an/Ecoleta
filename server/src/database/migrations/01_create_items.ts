import Knex from 'knex';

export async function up(Knex: Knex) {
    //crir tabela
   return Knex.schema.createTable('items', table => {
        table.increments('id').primary();
        table.string('image').notNullable();
        table.string('title').notNullable();
    });
}

export async function down(Knex: Knex) {
    //voltar atras (deletar tabela)
    return Knex.schema.dropTable('items');
}