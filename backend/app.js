const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

const db = require('./database');  // Importando a configuração do banco de dados

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/uploads/'); // Defina o caminho para a pasta de upload
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`); // Define o nome do arquivo de forma única
  }
});

const app = express();
app.use(bodyParser.json());


// Função de validação de campos obrigatórios
function validateUserInput(user) {
  const { profile, name, document, full_address, email, password } = user;
  if (!profile || !name || !document || !full_address || !email || !password) {
    return 'All fields are required: profile, name, document, full_address, email, password.';
  }
  return null;
}

// Rota de cadastro de usuário com validação e retorno completo
app.post('/register', (req, res) => {
  const { profile, name, document, full_address, email, password } = req.body;
  
  // Validação dos dados de entrada
  const validationError = validateUserInput(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  // Verifica se o e-mail ou documento já estão em uso
  db.get('SELECT * FROM users WHERE email = ? OR document = ?', [email, document], (err, existingUser) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (existingUser) {
      return res.status(400).json({ error: 'Email or document already in use' });
    }

    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    db.run(
      'INSERT INTO users (profile, name, document, full_address, email, password, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [profile, name, document, full_address, email, password, createdAt, updatedAt],
      function (err) {
        if (err) {
          return res.status(400).json({ error: err.message });
        }

        // Retorna o usuário criado
        db.get('SELECT * FROM users WHERE id = ?', [this.lastID], (err, user) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          res.status(201).json(user);
        });
      }
    );
  });
});

// Rota de login (sem criptografia de senha e retornando nome e perfil)
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  db.get('SELECT * FROM users WHERE email = ? AND password = ? AND status = 1', [email, password], (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.json({ name: user.name, profile: user.profile });
  });
});

// Rota de listagem de usuários
app.get('/users', (req, res) => {
  db.all('SELECT * FROM users', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Rota para ativar/desativar usuário
app.patch('/users/:id/toggle-status', (req, res) => {
  const { id } = req.params;
  const updatedAt = new Date().toISOString();

  db.run('UPDATE users SET status = NOT status, updatedAt = ? WHERE id = ?', [updatedAt, id], function (err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    // Verifica se o usuário foi encontrado
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    // Retorna o usuário atualizado
    db.get('SELECT * FROM users WHERE id = ?', [id], (err, user) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(user);
    });
  });
});

// Rota para excluir o usuário
app.delete('/users/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM users WHERE id = ?', [id], function (err) {
    if (err) {
      return res.status(400).json({ error: 'Não foi possível excluir o usuário.' });
    }

    // Verifica se algum usuário foi excluído
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    res.status(200).json({ message: 'Usuário excluído com sucesso.' });
  });
});

// Rota para ativar/desativar usuário
/* app.patch('/users/:id/toggle-status', (req, res) => {
  const { id } = req.params;
  const updatedAt = new Date().toISOString();
  db.run('UPDATE users SET status = NOT status, updatedAt = ? WHERE id = ?', [updatedAt, id], function (err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    // Retorna o usuário atualizado
    db.get('SELECT * FROM users WHERE id = ?', [id], (err, user) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(user);
    });
  });
}); */

// Rota de listagem de produtos com imagem, descrição e query params para buscar por nome de produto ou nome da filial
app.get('/products', (req, res) => {
  const queryParam = req.query.query || '';  // Query params chamado 'query'

  db.all(`
    SELECT products.name AS product_name, products.quantity, products.image_url, products.description, 
           branches.name AS branch_name, branches.location, branches.latitude, branches.longitude
    FROM products
    INNER JOIN branches ON products.branch_id = branches.id
    WHERE products.name LIKE ? OR branches.name LIKE ?
  `, [`%${queryParam}%`, `%${queryParam}%`], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Rota para listar as opções de filiais
app.get('/branches/options', (req, res) => {
  db.all('SELECT id, name FROM branches', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar as opções de filiais' });
    }
    res.json(rows); // Retorna apenas id e nome das filiais
  });
});

// Rota para listar as opções de produtos
app.get('/products/options', (req, res) => {
  db.all('SELECT id, name, quantity AS quantityAvailable FROM products', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar as opções de produtos' });
    }
    res.json(rows); // Retorna id, nome e quantidade disponível dos produtos
  });
});

// Rota para obter a quantidade disponível de um produto em uma filial específica
app.get('/products/:productId/branches/:branchId/quantity', (req, res) => {
  const { productId, branchId } = req.params;

  db.get('SELECT quantity FROM products WHERE id = ? AND branch_id = ?', [productId, branchId], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar a quantidade do produto na filial' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Produto ou filial não encontrados' });
    }
    res.json({ quantity: row.quantity });
  });
});

// Rota para deletar uma movimentação
app.delete('/movements/:id', (req, res) => {
  const { id } = req.params;

  // Deletar a movimentação do banco de dados
  db.run('DELETE FROM movements WHERE id = ?', [id], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Erro ao deletar a movimentação.' });
    }

    // Verifica se a movimentação foi deletada
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Movimentação não encontrada.' });
    }

    // Deletar o histórico associado à movimentação
    db.run('DELETE FROM movement_history WHERE movement_id = ?', [id], function (err) {
      if (err) {
        return res.status(500).json({ error: 'Erro ao deletar o histórico da movimentação.' });
      }

      res.status(200).json({ message: 'Movimentação deletada com sucesso.' });
    });
  });
});


// Rota para cadastro de movimentações
app.post('/movements', (req, res) => {
  const { originBranchId, destinationBranchId, productId, quantity } = req.body;
  const createdAt = new Date().toISOString();
  const updatedAt = createdAt;


  // Verificar se há estoque suficiente no produto da filial de origem
  db.get('SELECT quantity FROM products WHERE id = ? AND branch_id = ?', [productId, originBranchId], (err, product) => {
    if (err || !product) {
      return res.status(400).json({ error: 'Produto não encontrado na filial de origem' });
    }
    if (product.quantity < quantity) {
      return res.status(400).json({ error: 'Estoque insuficiente para essa movimentação' });
    }

    // Subtrair a quantidade do produto na filial de origem
    const newQuantity = product.quantity - quantity;
    db.run('UPDATE products SET quantity = ? WHERE id = ? AND branch_id = ?', [newQuantity, productId, originBranchId], (err) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao atualizar a quantidade de produto na filial de origem' });
      }

      // Inserir a movimentação
      db.run(`
        INSERT INTO movements (origin_branch_id, destination_branch_id, product_id, quantity, status, createdAt, updatedAt) 
        VALUES (?, ?, ?, ?, 'created', ?, ?)`,
        [originBranchId, destinationBranchId, productId, quantity, createdAt, updatedAt],
        function (err) {
          if (err) {
            return res.status(500).json({ error: 'Erro ao criar a movimentação' });
          }

          const movementId = this.lastID;

          // Atualizar o histórico de movimentação
          db.run(`
            INSERT INTO movement_history (movement_id, status, timestamp)
            VALUES (?, 'created', datetime('now'))
          `, [movementId], (err) => {
            if (err) {
              return res.status(500).json({ error: 'Erro ao criar o histórico de movimentação' });
            }

            // Retorna a movimentação criada
            db.get('SELECT * FROM movements WHERE id = ?', [movementId], (err, movement) => {
              if (err) {
                return res.status(500).json({ error: 'Erro ao buscar a movimentação criada' });
              }
              res.status(201).json(movement);
            });
          });
        });
    });
  });
});

app.use('/uploads', express.static('/uploads'));


// Rota para listar todas as movimentações
// Rota para listar todas as movimentações com detalhes de origem, destino, e histórico
app.get('/movements', (req, res) => {
  // Buscar todas as movimentações
  db.all(`
    SELECT movements.id AS movement_id, products.name AS product_name, products.image_url, movements.quantity, movements.status, 
           branches_origin.name AS origin_name, branches_origin.latitude AS origin_latitude, branches_origin.longitude AS origin_longitude,
           branches_destination.name AS destination_name, branches_destination.latitude AS destination_latitude, branches_destination.longitude AS destination_longitude, 
           movements.createdAt
    FROM movements
    INNER JOIN products ON movements.product_id = products.id
    INNER JOIN branches AS branches_origin ON movements.origin_branch_id = branches_origin.id
    INNER JOIN branches AS branches_destination ON movements.destination_branch_id = branches_destination.id
  `, (err, movements) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar as movimentações' });
    }

    // Rota para buscar os detalhes de uma movimentação específica
app.get('/movements/:id', (req, res) => {
  const { id } = req.params;

  db.get(`
    SELECT movements.id AS movement_id, products.name AS product_name, products.image_url, movements.quantity, movements.status, 
           branches_origin.name AS origin_name, branches_origin.latitude AS origin_latitude, branches_origin.longitude AS origin_longitude,
           branches_destination.name AS destination_name, branches_destination.latitude AS destination_latitude, branches_destination.longitude AS destination_longitude, 
           movements.createdAt
    FROM movements
    INNER JOIN products ON movements.product_id = products.id
    INNER JOIN branches AS branches_origin ON movements.origin_branch_id = branches_origin.id
    INNER JOIN branches AS branches_destination ON movements.destination_branch_id = branches_destination.id
    WHERE movements.id = ?
  `, [id], (err, movement) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar os detalhes da movimentação' });
    }

    if (!movement) {
      return res.status(404).json({ error: 'Movimentação não encontrada' });
    }

    // Buscar o histórico da movimentação
    db.all('SELECT id, status AS descricao, file, timestamp FROM movement_history WHERE movement_id = ?', [id], (err, history) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao buscar o histórico da movimentação' });
      }

      const movementData = {
        id: movement.movement_id,
        produto: {
          nome: movement.product_name,
          imagem: movement.image_url
        },
        quantidade: movement.quantity,
        status: movement.status,
        origem: {
          nome: movement.origin_name,
          latitude: movement.origin_latitude,
          longitude: movement.origin_longitude
        },
        destino: {
          nome: movement.destination_name,
          latitude: movement.destination_latitude,
          longitude: movement.destination_longitude
        },
        dataCriacao: movement.createdAt,
        historico: history.map(h => ({
          id: h.id,
          descricao: h.descricao,
          data: h.timestamp,
          file: `${req.protocol}://${req.get('host')}/` + h.file
        }))
      };

      res.status(200).json(movementData);
    });
  });
});


    if (movements.length === 0) {
      return res.status(200).json([]);
    }

    // Para cada movimentação, buscar o histórico correspondente
    const movementsWithHistory = [];

    movements.forEach((movement, index) => {
      db.all('SELECT id, status AS descricao, file, timestamp FROM movement_history WHERE movement_id = ?', [movement.movement_id], (err, history) => {
        if (err) {
          return res.status(500).json({ error: 'Erro ao buscar o histórico de uma movimentação' });
        }

        // Montar a resposta para cada movimentação
        const movementData = {
          id: movement.movement_id,
          produto: {
            nome: movement.product_name,
            imagem: movement.image_url
          },
          quantidade: movement.quantity,
          status: movement.status,
          origem: {
            nome: movement.origin_name,
            latitude: movement.origin_latitude,
            longitude: movement.origin_longitude
          },
          destino: {
            nome: movement.destination_name,
            latitude: movement.destination_latitude,
            longitude: movement.destination_longitude
          },
          dataCriacao: movement.createdAt,
          historico: history.map(h => ({
            id: h.id,
            descricao: h.descricao,
            data: h.timestamp,
            file: `${req.protocol}://${req.get('host')}\/` +h.file
          }))
        };

        movementsWithHistory.push(movementData);

        // Verifica se todas as movimentações foram processadas
        if (movementsWithHistory.length === movements.length) {
          res.status(200).json(movementsWithHistory);
        }
      });
    });
  });
});


const upload = multer({ storage });

// Rota para iniciar a movimentação e salvar o upload da imagem



// Rota para finalizar a movimentação e salvar o upload da imagem
app.put('/movements/:id/start', upload.single('file'), (req, res) => {
  const { id } = req.params;
  const { motorista } = req.body;
  const filePath = req.file ? req.file.path : null;
  const updatedAt = new Date().toISOString();

  if (!filePath || !motorista) {
    return res.status(400).json({ error: 'Imagem ou nome do motorista não fornecido' });
  }

  
  // Atualizar o status da movimentação para "coleta finalizada"
  db.run('UPDATE movements SET status = ?, updatedAt = ? WHERE id = ?', ['coleta finalizada', updatedAt, id], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Erro ao atualizar o status da movimentação' });
    }

    // Adicionar uma mensagem no histórico de que o motorista finalizou a entrega
    const mensagem = `Motorista ${motorista} finalizou a entrega`;
    db.run(`
      INSERT INTO movement_history (movement_id, status, file, timestamp) 
      VALUES (?, ?,  ?, datetime('now'))`,
      [id, mensagem, filePath],
      function (err) {
        if (err) {
          return res.status(500).json({ error: 'Erro ao salvar o histórico da movimentação' });
        }

        // Retornar sucesso com o caminho do arquivo e a mensagem salva
        res.status(200).json({
          message: 'Movimentação atualizada para "coleta finalizada". Histórico atualizado.',
          filePath: filePath
        });
      }
    );
  });
});


// Rota para atualizar o status de uma movimentação
app.patch('/movements/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const updatedAt = new Date().toISOString();

  db.run('UPDATE movements SET status = ?, updatedAt = ? WHERE id = ?', [status, updatedAt, id], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Erro ao atualizar o status da movimentação.' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Movimentação não encontrada.' });
    }

    res.json({ message: 'Status da movimentação atualizado com sucesso.' });
  });
});

app.put('/movements/:id/end', upload.single('file'), (req, res) => {
  const { id } = req.params;
  const { motorista } = req.body;
  const filePath = req.file ? req.file.path : null;
  const updatedAt = new Date().toISOString();
  if (!filePath || !motorista) {
    return res.status(400).json({ error: 'Imagem ou nome do motorista não fornecido' });
  }
  // Atualizar o status da movimentação para "em trânsito"
  db.run('UPDATE movements SET status = ?, updatedAt = ? WHERE id = ?', ['Coleta finalizada', updatedAt, id], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Erro ao atualizar o status da movimentação' });
    }
    // Adicionar uma mensagem no histórico de que o motorista coletou o pacote
    const mensagem = `Motorista ${motorista} entregou o pacote`;
    db.run(`
      INSERT INTO movement_history (movement_id, status, file, timestamp) 
      VALUES (?, ?,  ?, datetime('now'))`,
      [id, mensagem, filePath],
      function (err) {
        if (err) {
          return res.status(500).json({ error: 'Erro ao salvar o histórico da movimentação' });
        }
        // Retornar sucesso com o caminho do arquivo e a mensagem salva
        res.status(200).json({
          message: 'Movimentação atualizada para "coleta finalizada". Histórico atualizado.',
          filePath: filePath
        });
      }
    );
  });
});


app.get('/branches/options', (req, res) => {
  db.all('SELECT * FROM branches', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});
app.get('/products/options', (req, res) => {
  const queryParam = req.query.query || '';  // Query params chamado 'query'
  db.all(`
        SELECT  
          products.quantity,
          products.name as product_name,
           branches.name AS branch_name,
           products.id as product_id,
           branches.id as branch_id
    FROM products
    INNER JOIN branches ON products.branch_id = branches.id
    WHERE products.name LIKE ? OR branches.name LIKE ?
  `, [`%${queryParam}%`, `%${queryParam}%`], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});


// Porta do servidor
app.listen(3000, () => {
  console.log('Server running on port 3000');
});
