/**
 * ARQUITETURA PROFISSIONAL EM ARQUIVO ÚNICO (VERSÃO CORRIGIDA E ROBUSTA)
 * ---------------------------------------------------------------------
 * 1. ApiService: Módulo responsável por buscar dados da API, com cache.
 * 2. Store: Gerenciador de estado centralizado. A UI reage a ele.
 * 3. Componentes (Classes): Classes que controlam partes da UI.
 * 4. App: Ponto de entrada que inicializa a aplicação.
 */

// =================================================================================
// 1. MÓDULO DE SERVIÇO DA API (com Cache)
// =================================================================================
const apiService = {
  BASE_URL: 'https://api.github.com/users',
  cache: new Map(),

  async fetchUser(username) {
    if (this.cache.has(username)) {
      console.log(`Servindo "${username}" do cache.`);
      return this.cache.get(username);
    }

    const response = await fetch(`${this.BASE_URL}/${username}`);

    if (response.status === 404) {
      throw new Error(`Usuário "${username}" não foi encontrado.`);
    }
    if (response.status === 403) {
      throw new Error('Limite de requisições da API do GitHub atingido. Tente mais tarde.');
    }
    if (!response.ok) {
      throw new Error('Ocorreu um erro inesperado na busca.');
    }

    const userData = await response.json();
    this.cache.set(username, userData);
    console.log(`Buscado da API e salvo no cache: "${username}".`);
    return userData;
  },
};

// =================================================================================
// 2. STORE - GERENCIADOR DE ESTADO REATIVO
// =================================================================================
class Store {
  constructor(initialState) {
    this.state = initialState;
    this.subscribers = [];
  }

  subscribe(callback) {
    this.subscribers.push(callback);
    callback(this.state);
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.subscribers.forEach((callback) => callback(this.state));
  }
}

const store = new Store({
  isLoading: false,
  user: null,
  error: null,
});

// =================================================================================
// 3. COMPONENTES (definidos como Classes)
// =================================================================================

/**
 * Componente do Formulário de Busca (VERSÃO CORRIGIDA)
 * Não cria mais o HTML, apenas controla os elementos existentes.
 */
class SearchFormComponent {
  constructor() {
    // Busca os elementos que já existem no DOM
    this.form = document.getElementById('search-form');
    this.input = document.getElementById('search-input');
    this.button = document.getElementById('search-button');

    // Se algum elemento não for encontrado, lança um erro para debug fácil.
    if (!this.form || !this.input || !this.button) {
        throw new Error('Elementos do formulário de busca não encontrados no DOM.');
    }

    this.attachEvents();
  }

  async handleSearch(event) {
    event.preventDefault();
    const username = this.input.value.trim();
    if (!username) return;

    store.setState({ isLoading: true, error: null, user: null });

    try {
      const user = await apiService.fetchUser(username);
      store.setState({ user, isLoading: false });
    } catch (error) {
      store.setState({ error: error.message, isLoading: false });
    }
  }

  attachEvents() {
    this.form.addEventListener('submit', this.handleSearch.bind(this));
    
    store.subscribe(({ isLoading }) => {
      this.button.disabled = isLoading;
      this.button.innerHTML = isLoading ? `<div class="spinner"></div>` : 'Buscar';
    });
  }
}

/**
 * Componente do Perfil do Usuário (sem alterações, já estava correto)
 */
class UserProfileComponent {
  constructor(selector) {
    this.parentElement = document.querySelector(selector);
    this.template = document.getElementById('user-card-template');

    if (!this.parentElement || !this.template) {
        throw new Error('Elementos do perfil do usuário ou template não encontrados no DOM.');
    }
    
    store.subscribe(this.render.bind(this));
  }

  render(state) {
    if (state.isLoading) {
      this.parentElement.innerHTML = `<div class="status">Carregando...</div>`;
      return;
    }

    if (state.error) {
      this.parentElement.innerHTML = `<div class="status error">${state.error}</div>`;
      return;
    }

    if (state.user) {
      const { user } = state;
      const cardClone = document.importNode(this.template.content, true);
      
      cardClone.querySelector('.user-avatar a').href = user.html_url;
      cardClone.querySelector('img').src = user.avatar_url;
      cardClone.querySelector('img').alt = `Avatar de ${user.name || user.login}`;
      cardClone.querySelector('.user-name').textContent = user.name || 'Nome não disponível';
      cardClone.querySelector('.user-login').textContent = `@${user.login}`;
      cardClone.querySelector('.user-bio').textContent = user.bio || 'Este usuário não possui uma bio.';
      cardClone.querySelector('.user-followers').textContent = user.followers;
      cardClone.querySelector('.user-following').textContent = user.following;
      cardClone.querySelector('.user-repos').textContent = user.public_repos;
      cardClone.querySelector('.user-location').textContent = user.location ? `📍 ${user.location}` : '';
      
      this.parentElement.innerHTML = '';
      this.parentElement.appendChild(cardClone);
      return;
    }

    this.parentElement.innerHTML = `<div class="status">Digite um nome de usuário para começar.</div>`;
  }
}

// =================================================================================
// 4. INICIALIZAÇÃO DA APLICAÇÃO
// =================================================================================
// O 'defer' no script HTML garante que o DOM está pronto, mas por segurança, 
// é bom manter o listener.
document.addEventListener('DOMContentLoaded', () => {
  try {
    new SearchFormComponent(); // Não precisa mais de seletor, pois busca por ID.
    new UserProfileComponent('#profile-container');
  } catch(error) {
    console.error("Erro ao inicializar a aplicação:", error);
    document.body.innerHTML = "<h1 style='color: red; text-align: center;'>Erro crítico na aplicação. Verifique o console.</h1>"
  }
});