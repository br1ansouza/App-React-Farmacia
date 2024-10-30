const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Banco de dados persistente em arquivo SQLite
const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'), (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err.message);
  } else {
    console.log('Conectado ao banco de dados SQLite.');
  }
});

// Ativa a integridade referencial (chaves estrangeiras)
db.run("PRAGMA foreign_keys = ON", (err) => {
  if (err) {
    console.error('Erro ao ativar chaves estrangeiras:', err.message);
  } else {
    console.log('Chaves estrangeiras ativadas.');
  }
});

db.serialize(() => {
  // Criação da tabela de usuários
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      profile TEXT,
      name TEXT,
      document TEXT,
      full_address TEXT,
      email TEXT UNIQUE,
      password TEXT,
      status BOOLEAN DEFAULT 1,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Verifica se já existe um usuário com o email "admin@gmail.com"
  db.get("SELECT COUNT(*) AS count FROM users WHERE email = ?", ['admin@gmail.com'], (err, row) => {
    if (err) {
      console.error(err.message);
    } else if (row.count === 0) {
      // Se não existir, insere o novo usuário
      const insertUsers = db.prepare(`
        INSERT INTO users (profile, name, document, full_address, email, password) 
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      insertUsers.run('admin', 'ADMINISTRADOR', '999-999-999-01', 'MATRIZ UMBRELLA', 'admin@gmail.com', '123456');
      insertUsers.finalize();
    } else {
      console.log('Usuário já inserido no banco de dados.');
    }
  });

  // Criação da tabela de produtos com imagem e descrição
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      quantity INTEGER,
      branch_id INTEGER,
      image_url TEXT,
      description TEXT,
      FOREIGN KEY (branch_id) REFERENCES branches(id)
    )
  `);

  // Criação da tabela de filiais com latitude e longitude
  db.run(`
    CREATE TABLE IF NOT EXISTS branches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      location TEXT,
      latitude REAL,
      longitude REAL
    )
  `);

  // Verifica se já existem filiais no banco de dados
  db.get("SELECT COUNT(*) AS count FROM branches", (err, row) => {
    if (err) {
      console.error(err.message);
    } else if (row.count === 0) {
      // Se não existir nenhuma filial, insere os dados predefinidos
      const insertBranches = db.prepare(`
        INSERT INTO branches (name, location, latitude, longitude) 
        VALUES (?, ?, ?, ?)
      `);

      insertBranches.run('Farmácia Saúde SP', 'São Paulo', -23.55052, -46.633308);
      insertBranches.run('Farmácia Bem-Estar CE', 'Fortaleza, Ceará', -3.71722, -38.54337);
      insertBranches.run('Farmácia Vida SC', 'Florianópolis, Santa Catarina', -27.595377, -48.54805);

      insertBranches.finalize();
    } else {
      console.log('Filiais já inseridas no banco de dados.');
    }
  });

  // Verifica se já existem produtos no banco de dados
  db.get("SELECT COUNT(*) AS count FROM products", (err, row) => {
    if (err) {
      console.error(err.message);
    } else if (row.count === 0) {
      const insertProducts = db.prepare(`
        INSERT INTO products (name, quantity, branch_id, image_url, description) 
        VALUES (?, ?, ?, ?, ?)
      `);

      const imageUrl = 'https://drogariasp.vteximg.com.br/arquivos/ids/759950-1000-1000/10227---paracetamol-750mg-20-comprimidos-generico-1.jpg?v=637980224448970000';

      insertProducts.run('Paracetamol', 100, 1, imageUrl, 'Analgésico e antipirético indicado para alívio da dor e febre.');
      insertProducts.run('Ibuprofeno', 50, 1, imageUrl, 'Anti-inflamatório e analgésico utilizado para tratar dor e febre.');
      insertProducts.run('Amoxicilina', 30, 1, imageUrl, 'Antibiótico usado para tratar uma variedade de infecções bacterianas.');
      insertProducts.run('Vitamina C', 200, 2, imageUrl, 'Suplemento vitamínico para fortalecer o sistema imunológico.');
      insertProducts.run('Dipirona', 150, 2, imageUrl, 'Analgésico e antitérmico para o alívio da dor e febre.');
      insertProducts.run('Antigripal', 75, 2, imageUrl, 'Medicamento indicado para o tratamento dos sintomas da gripe.');
      insertProducts.run('Aspirina', 120, 3, imageUrl, 'Analgésico e antipirético indicado para o alívio da dor e febre.');
      insertProducts.run('Omeprazol', 90, 3, imageUrl, 'Medicamento utilizado para tratar problemas gastrointestinais, como refluxo.');
      insertProducts.run('Cloridrato de Metformina', 60, 3, imageUrl, 'Medicamento indicado para o tratamento da diabetes tipo 2.');
      insertProducts.run('Losartana', 80, 1, imageUrl, 'Medicamento usado para tratar hipertensão e proteger os rins.');

      insertProducts.finalize();
    } else {
      console.log('Produtos já inseridos no banco de dados.');
    }
  });

  // Criação da tabela de movimentações
  db.run(`
    CREATE TABLE IF NOT EXISTS movements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      origin_branch_id INTEGER,
      destination_branch_id INTEGER,
      product_id INTEGER,
      quantity INTEGER,
      status TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (origin_branch_id) REFERENCES branches(id),
      FOREIGN KEY (destination_branch_id) REFERENCES branches(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  // Criação da tabela de histórico de movimentações
  db.run(`
    CREATE TABLE IF NOT EXISTS movement_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      movement_id INTEGER,
      status TEXT,
      file TEXT DEFAULT NULL,
      timestamp DATETIME,
      FOREIGN KEY (movement_id) REFERENCES movements(id)
    )
  `);

  // Log para confirmar que as tabelas foram criadas
  console.log('Tabelas criadas ou verificadas com sucesso.');
});

module.exports = db;
