document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const body = document.body;
    const icon = themeToggleBtn.querySelector('i'); // Seleciona o elemento <i> dentro do botão

    // Função para aplicar o tema e atualizar o ícone
    function applyTheme(theme) {
        if (theme === 'dark') {
            body.classList.add('dark-mode');
            icon.classList.remove('fa-sun'); // Remove ícone de sol
            icon.classList.add('fa-moon');   // Adiciona ícone de lua
            themeToggleBtn.setAttribute('aria-label', 'Alternar para tema claro');
        } else {
            body.classList.remove('dark-mode');
            icon.classList.remove('fa-moon');  // Remove ícone de lua
            icon.classList.add('fa-sun');      // Adiciona ícone de sol
            themeToggleBtn.setAttribute('aria-label', 'Alternar para tema escuro');
        }
    }

    // 1. Verificar a preferência do usuário no localStorage ao carregar a página
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme) {
        applyTheme(savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        // 2. Se não houver preferência salva, verificar a preferência do sistema operacional
        applyTheme('dark');
    } else {
        // 3. Padrão para light mode se nenhuma preferência for encontrada
        applyTheme('light');
    }

    // Adicionar um ouvinte de evento para o botão de alternar tema
    themeToggleBtn.addEventListener('click', () => {
        if (body.classList.contains('dark-mode')) {
            applyTheme('light');
            localStorage.setItem('theme', 'light');
        } else {
            applyTheme('dark');
            localStorage.setItem('theme', 'dark');
        }
    });

    // Opcional: Ouve mudanças na preferência do sistema operacional
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
        // Apenas ajusta o tema se o usuário não tiver definido uma preferência manual
        if (localStorage.getItem('theme') === null) {
            if (event.matches) {
                applyTheme('dark');
            } else {
                applyTheme('light');
            }
        }
    });
});