// API Base URL
const API_BASE = 'http://18.212.217.221:3000/api';

// Funções auxiliares da API
async function fetchChecklists() {
    try {
        const response = await fetch(`${API_BASE}/checklists`);
        if (!response.ok) throw new Error('Erro na resposta da API');
        return await response.json();
    } catch (error) {
        console.error('Erro ao buscar checklists:', error);
        return [];
    }
}

async function fetchFeedbacks() {
    try {
        const response = await fetch(`${API_BASE}/feedbacks`);
        if (!response.ok) throw new Error('Erro na resposta da API');
        return await response.json();
    } catch (error) {
        console.error('Erro ao buscar feedbacks:', error);
        return [];
    }
}

// Funções para mostrar conteúdo (agora globais)
window.showDashboard = async function() {
    const contentArea = document.getElementById('contentArea');
    const contentTitle = document.getElementById('contentTitle');
    
    contentTitle.textContent = 'Dashboard';
    
    try {
        const [checklists, feedbacks] = await Promise.all([
            fetchChecklists(),
            fetchFeedbacks()
        ]);

        contentArea.innerHTML = `
            <p>Bem-vindo ao sistema de gestão de checklists e feedbacks.</p>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; margin-top: 20px;">
                <div style="background: #e3f2fd; padding: 15px; border-radius: 8px;">
                    <h3 style="color: #1976d2;">Checklists Ativos</h3>
                    <p style="font-size: 24px; font-weight: bold; margin: 10px 0;">${checklists.length}</p>
                </div>
                <div style="background: #e8f5e9; padding: 15px; border-radius: 8px;">
                    <h3 style="color: #388e3c;">Feedbacks Enviados</h3>
                    <p style="font-size: 24px; font-weight: bold; margin: 10px 0;">${feedbacks.length}</p>
                </div>
            </div>
            <div style="margin-top: 30px;">
                <h3 style="margin-bottom: 15px;">Ações Rápidas</h3>
                <p>Utilize os cartões acima para criar checklists, feedbacks ou visualizar os existentes.</p>
            </div>
        `;
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        contentArea.innerHTML = '<p>Erro ao carregar dados do dashboard.</p>';
    }
};

window.showChecklists = async function() {
    const contentArea = document.getElementById('contentArea');
    const contentTitle = document.getElementById('contentTitle');
    
    contentTitle.textContent = 'Checklists';
    
    try {
        const checklists = await fetchChecklists();
        
        if (checklists.length === 0) {
            contentArea.innerHTML = '<p>Nenhum checklist criado ainda.</p>';
            return;
        }
        
        let html = `
            <table class="table">
                <thead>
                    <tr>
                        <th>Título</th>
                        <th>Atribuído a</th>
                        <th>Data</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        checklists.forEach(checklist => {
            html += `
                <tr>
                    <td>${checklist.title}</td>
                    <td>${checklist.assignee}</td>
                    <td>${new Date(checklist.date).toLocaleDateString()}</td>
                    <td><span class="status-badge ${checklist.completed ? 'status-completed' : 'status-pending'}">${checklist.completed ? 'Concluído' : 'Pendente'}</span></td>
                </tr>
            `;
        });
        
        html += '</tbody></table>';
        contentArea.innerHTML = html;
    } catch (error) {
        console.error('Erro ao carregar checklists:', error);
        contentArea.innerHTML = '<p>Erro ao carregar checklists.</p>';
    }
};

window.showFeedbacks = async function() {
    const contentArea = document.getElementById('contentArea');
    const contentTitle = document.getElementById('contentTitle');
    
    contentTitle.textContent = 'Feedbacks';
    
    try {
        const feedbacks = await fetchFeedbacks();
        
        if (feedbacks.length === 0) {
            contentArea.innerHTML = '<p>Nenhum feedback enviado ainda.</p>';
            return;
        }
        
        let html = `
            <table class="table">
                <thead>
                    <tr>
                        <th>Título</th>
                        <th>Destinatário</th>
                        <th>Data</th>
                        <th>Mensagem</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        feedbacks.forEach(feedback => {
            html += `
                <tr>
                    <td><strong>${feedback.title}</strong></td>
                    <td>${feedback.assignee}</td>
                    <td>${new Date(feedback.date).toLocaleDateString()}</td>
                    <td>${feedback.message.substring(0, 50)}${feedback.message.length > 50 ? '...' : ''}</td>
                </tr>
            `;
        });
        
        html += '</tbody></table>';
        contentArea.innerHTML = html;
    } catch (error) {
        console.error('Erro ao carregar feedbacks:', error);
        contentArea.innerHTML = '<p>Erro ao carregar feedbacks.</p>';
    }
};

// Funções para criar itens (agora globais)
window.handleCreateChecklist = async function(e) {
    e.preventDefault();
    
    const title = document.getElementById('checklistTitle').value;
    const description = document.getElementById('checklistDescription').value;
    const assignee = document.getElementById('checklistAssignee').value;
    
    // Coletar itens do checklist
    const itemInputs = document.querySelectorAll('#checklistItems input[type="text"]');
    const items = Array.from(itemInputs)
        .map(input => input.value.trim())
        .filter(value => value !== '');
    
    if (items.length === 0) {
        alert('Adicione pelo menos um item ao checklist');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/checklists`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title,
                description,
                assignee,
                items
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('Checklist criado com sucesso!');
            document.getElementById('checklistForm').reset();
            document.getElementById('createChecklistModal').classList.add('hidden');
            resetChecklistItems();
            if (window.showDashboard) {
                window.showDashboard();
            }
        } else {
            alert('Erro ao criar checklist');
        }
    } catch (error) {
        console.error('Erro ao criar checklist:', error);
        //alert('Erro de conexão ao criar checklist');
    }
};

window.handleCreateFeedback = async function(e) {
    e.preventDefault();
    
    const title = document.getElementById('feedbackTitle').value;
    const message = document.getElementById('feedbackMessage').value;
    const assignee = document.getElementById('feedbackAssignee').value;
    
    try {
        const response = await fetch(`${API_BASE}/feedbacks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title,
                message,
                assignee
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('Feedback enviado com sucesso!');
            document.getElementById('feedbackForm').reset();
            document.getElementById('createFeedbackModal').classList.add('hidden');
            if (window.showDashboard) {
                window.showDashboard();
            }
        } else {
            alert('Erro ao enviar feedback');
        }
    } catch (error) {
        console.error('Erro ao enviar feedback:', error);
        alert('Erro de conexão ao enviar feedback');
    }
};

function resetChecklistItems() {
    document.getElementById('checklistItems').innerHTML = `
        <div class="checklist-item">
            <input type="text" placeholder="Digite um item">
            <button type="button" class="btn btn-small" onclick="addChecklistItem(this)">+</button>
        </div>
    `;
}

// Função global para adicionar itens ao checklist
window.addChecklistItem = function(button) {
    const checklistItems = document.getElementById('checklistItems');
    const newItem = document.createElement('div');
    newItem.className = 'checklist-item';
    newItem.innerHTML = `
        <input type="text" placeholder="Digite um item">
        <button type="button" class="btn btn-small" onclick="addChecklistItem(this)">+</button>
    `;
    checklistItems.appendChild(newItem);
};

// Inicialização para funcionário (mantida como estava)
document.addEventListener('DOMContentLoaded', function() {
    // Inicialização do dashboard do funcionário
    if (window.location.pathname.includes('funcDash.html')) {
        console.log('Inicializando dashboard do funcionário');
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        console.log('Usuário atual:', currentUser);
        if (!currentUser || currentUser.role !== 'Funcionário') {
            window.location.href = 'login.html';
            return;
        }

        // Configurar informações do usuário
        document.getElementById('userGreeting').textContent = `Olá, ${currentUser.name}`;
        document.getElementById('userAvatar').textContent = currentUser.name.charAt(0);
        
        // Logout
        document.getElementById('logoutBtn').addEventListener('click', function() {
            localStorage.removeItem('currentUser');
            window.location.href = 'login.html';
        });
        
        loadUserItems();
    }
    
    // Mostrar dashboard inicial para o gestor
    if (window.location.pathname.includes('gestorDash.html') && window.showDashboard) {
        window.showDashboard();
    }
});

// Função para carregar itens do funcionário
// No index.js, substitua a função loadUserItems por esta versão corrigida:

async function loadUserItems() {
    const contentArea = document.getElementById('contentArea');
    const contentTitle = document.getElementById('contentTitle');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    contentTitle.textContent = `Meus Itens - ${currentUser.name}`;
    
    try {
        console.log('🔍 Buscando dados do servidor...');
        
        const [checklistsResponse, feedbacksResponse] = await Promise.all([
            fetch(`${API_BASE}/checklists`),
            fetch(`${API_BASE}/feedbacks`)
        ]);

        // Verificar se as respostas são OK
        if (!checklistsResponse.ok || !feedbacksResponse.ok) {
            throw new Error('Erro na resposta do servidor');
        }

        // Converter para JSON
        const checklistsData = await checklistsResponse.json();
        const feedbacksData = await feedbacksResponse.json();

        console.log('📋 Dados recebidos:', {
            checklists: checklistsData,
            feedbacks: feedbacksData
        });

        // CORREÇÃO: Garantir que são arrays
        const checklists = Array.isArray(checklistsData) ? checklistsData : [];
        const feedbacks = Array.isArray(feedbacksData) ? feedbacksData : [];

        console.log('✅ Arrays processados:', {
            checklistsCount: checklists.length,
            feedbacksCount: feedbacks.length
        });

        const userChecklists = checklists.filter(c => c.assignee === currentUser.name);
        const userFeedbacks = feedbacks.filter(f => f.assignee === currentUser.name);

        console.log('👤 Itens do usuário:', {
            userChecklists: userChecklists,
            userFeedbacks: userFeedbacks
        });
        
        let html = '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">';
        
        // Checklists do usuário
        html += `
            <div>
                <h3 style="margin-bottom: 15px; color: #2575fc;">Meus Checklists (${userChecklists.length})</h3>
        `;
        
        if (userChecklists.length === 0) {
            html += '<p style="color: #666; font-style: italic;">Nenhum checklist atribuído a você.</p>';
        } else {
            html += '<div style="display: flex; flex-direction: column; gap: 10px;">';
            userChecklists.forEach(checklist => {
                html += `
                    <div style="background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border-left: 4px solid #2575fc;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <strong style="color: #333;">${checklist.title}</strong>
                            <span class="status-badge ${checklist.completed ? 'status-completed' : 'status-pending'}">
                                ${checklist.completed ? 'Concluído' : 'Pendente'}
                            </span>
                        </div>
                        ${checklist.description ? `<p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">${checklist.description}</p>` : ''}
                        <div style="font-size: 12px; color: #999;">
                            Criado em: ${new Date(checklist.date).toLocaleDateString()}
                        </div>
                        ${checklist.items && checklist.items.length > 0 ? `
                            <div style="margin-top: 10px;">
                                <strong style="font-size: 12px; color: #666;">Itens:</strong>
                                <ul style="margin: 5px 0 0 15px; font-size: 12px; color: #666;">
                                    ${checklist.items.map(item => `<li>${item}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                    </div>
                `;
            });
            html += '</div>';
        }
        
        html += '</div>';
        
        // Feedbacks do usuário
        html += `
            <div>
                <h3 style="margin-bottom: 15px; color: #28a745;">Meus Feedbacks (${userFeedbacks.length})</h3>
        `;
        
        if (userFeedbacks.length === 0) {
            html += '<p style="color: #666; font-style: italic;">Nenhum feedback recebido.</p>';
        } else {
            html += '<div style="display: flex; flex-direction: column; gap: 10px;">';
            userFeedbacks.forEach(feedback => {
                html += `
                    <div style="background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border-left: 4px solid #28a745;">
                        <strong style="color: #333; display: block; margin-bottom: 8px;">${feedback.title}</strong>
                        <p style="margin: 0 0 8px 0; color: #666; font-size: 14px; line-height: 1.4;">${feedback.message}</p>
                        <div style="font-size: 12px; color: #999;">
                            Recebido em: ${new Date(feedback.date).toLocaleDateString()}
                        </div>
                    </div>
                `;
            });
            html += '</div>';
        }
        
        html += '</div></div>';
        contentArea.innerHTML = html;
        
    } catch (error) {
        console.error('Erro ao carregar itens do usuário:', error);
        contentArea.innerHTML = `
            <p>Erro ao carregar seus itens.</p>
            <div style="background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px; margin-top: 10px;">
                <strong>Detalhes do erro:</strong><br>
                ${error.message}
            </div>
        `;
    }

}
