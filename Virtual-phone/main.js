const display = document.getElementById('display');

function adicionar(valor) {
  display.textContent += valor;
}

function limpar() {
  display.textContent = '';
}

function ligar() {
  const numero = display.textContent.trim();
  if (numero.length === 0) {
    alert("Digite um número para ligar.");
  } else {
    alert(`Ligando para ${numero}...`);
  }
}
