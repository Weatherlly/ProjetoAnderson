const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Ler dados dos arquivos JSON
function readJSON(filename) {
  try {
    const data = fs.readFileSync(filename, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { users: [], checklists: [], feedbacks: [] };
  }
}

function writeJSON(filename, data) {
  fs.writeFileSync(filename, JSON.stringify(data, null, 2));
}

// Rotas de autenticação
app.post('/api/login', (req, res) => {
  const { userName } = req.body;
  const users = readJSON('user.json').users;
  
  const user = users.find(u => u.name === userName);
  if (user) {
    res.json({ success: true, user });
  } else {
    res.json({ success: false, message: 'Usuário não encontrado' });
  }
});

// Rotas para checklists
app.get('/api/checklists', (req, res) => {
  const checklists = readJSON('checklists.json');
  res.json(checklists);
});

app.post('/api/checklists', (req, res) => {
  const newChecklist = req.body;
  const checklists = readJSON('checklists.json');
  
  checklists.push({
    id: Date.now(),
    ...newChecklist,
    date: new Date().toISOString(),
    completed: false
  });
  
  writeJSON('checklists.json', checklists);
  res.json({ success: true, message: 'Checklist criado com sucesso' });
});

// Rota para atualizar status do checklist
app.put('/api/checklists/:id/status', (req, res) => {
  try {
    const checklistId = parseInt(req.params.id);
    const { completed, completedDate } = req.body;
    
    const checklists = readJSON('checklists.json');
    const checklistIndex = checklists.findIndex(c => c.id === checklistId);
    
    if (checklistIndex === -1) {
      return res.status(404).json({ error: 'Checklist não encontrado' });
    }
    
    // Atualizar status
    checklists[checklistIndex].completed = completed;
    if (completedDate) {
      checklists[checklistIndex].completedDate = completedDate;
    }
    
    writeJSON('checklists.json', checklists);
    
    res.json({ 
      success: true, 
      message: `Checklist ${completed ? 'concluído' : 'reaberto'} com sucesso` 
    });
    
  } catch (error) {
    console.error('Erro ao atualizar status do checklist:', error);
    res.status(500).json({ error: 'Erro ao atualizar status do checklist' });
  }
});

// Rota para atualizar item individual do checklist
app.put('/api/checklists/:id/items', (req, res) => {
  try {
    const checklistId = parseInt(req.params.id);
    const { itemIndex, completed } = req.body;
    
    const checklists = readJSON('checklists.json');
    const checklistIndex = checklists.findIndex(c => c.id === checklistId);
    
    if (checklistIndex === -1) {
      return res.status(404).json({ error: 'Checklist não encontrado' });
    }
    
    const checklist = checklists[checklistIndex];
    
    // Inicializar itemsCompleted se não existir
    if (!checklist.itemsCompleted) {
      checklist.itemsCompleted = [];
    }
    
    // Adicionar ou remover item da lista de concluídos
    if (completed) {
      if (!checklist.itemsCompleted.includes(itemIndex)) {
        checklist.itemsCompleted.push(itemIndex);
      }
    } else {
      checklist.itemsCompleted = checklist.itemsCompleted.filter(i => i !== itemIndex);
    }
    
    // Verificar se todos os itens estão concluídos
    const totalItems = checklist.items ? checklist.items.length : 0;
    const completedItems = checklist.itemsCompleted.length;
    const allItemsCompleted = totalItems > 0 && completedItems === totalItems;
    
    // Atualizar status geral do checklist
    checklist.completed = allItemsCompleted;
    if (allItemsCompleted && !checklist.completedDate) {
      checklist.completedDate = new Date().toISOString();
    } else if (!allItemsCompleted) {
      checklist.completedDate = null;
    }
    
    writeJSON('checklists.json', checklists);
    
    res.json({ 
      success: true, 
      message: 'Item atualizado com sucesso',
      progress: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0,
      completed: allItemsCompleted
    });
    
  } catch (error) {
    console.error('Erro ao atualizar item do checklist:', error);
    res.status(500).json({ error: 'Erro ao atualizar item do checklist' });
  }
});

// Rotas para feedbacks
app.get('/api/feedbacks', (req, res) => {
  const feedbacks = readJSON('feedbacks.json');
  res.json(feedbacks);
});

app.post('/api/feedbacks', (req, res) => {
  const newFeedback = req.body;
  const feedbacks = readJSON('feedbacks.json');
  
  feedbacks.push({
    id: Date.now(),
    ...newFeedback,
    date: new Date().toISOString()
  });
  
  writeJSON('feedbacks.json', feedbacks);
  res.json({ success: true, message: 'Feedback enviado com sucesso' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});