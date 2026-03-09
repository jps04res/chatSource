// 1. Importar o Supabase diretamente da internet
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// 2. AS TUAS CHAVES DO SUPABASE (Cola aqui o que copiaste)
const supabaseUrl = 'https://nrjlgfwapzvdrppwbaiz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yamxnZndhcHp2ZHJwcHdiYWl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNjk4MTAsImV4cCI6MjA4ODY0NTgxMH0.Iln3msaeptH0i6c3wS29CVyMucmLnwghhmzJkPKkiX8';

// Inicia a ligação ao banco de dados
const supabase = createClient(supabaseUrl, supabaseKey);

// 3. Obter os elementos do HTML
const inputMensagem = document.getElementById("mensagem-input");
const btnEnviar = document.getElementById("enviar-btn");
const ecraMensagens = document.getElementById("mensagens-tela");

// 4. Gerar ou recuperar um "ID de utilizador" anónimo
let meuId = localStorage.getItem("meuUsuarioID");
if (!meuId) {
  meuId = Math.random().toString(36).substring(2, 15);
  localStorage.setItem("meuUsuarioID", meuId);
}

// Função para desenhar a mensagem no ecrã com as cores certas
function desenharMensagem(dados) {
  const div = document.createElement("div");
  
  // Verifica se a mensagem é tua ou de outra pessoa
  if (dados.autor === meuId) {
    div.className = "mensagem minha-mensagem";
  } else {
    div.className = "mensagem outra-mensagem";
  }
  
  div.textContent = dados.texto;
  ecraMensagens.appendChild(div);
  
  // Faz a barra de rolagem descer automaticamente
  ecraMensagens.scrollTop = ecraMensagens.scrollHeight;
}

// 5. Carregar as mensagens antigas ao abrir o site
async function carregarMensagens() {
  const { data, error } = await supabase
    .from('mensagens')
    .select('*')
    .order('criado_em', { ascending: true });
    
  if (data) {
    ecraMensagens.innerHTML = "";
    data.forEach(desenharMensagem);
  }
}
carregarMensagens();

// 6. FUNÇÃO PARA ENVIAR MENSAGEM
async function enviarMensagem() {
  const texto = inputMensagem.value;
  if (texto.trim() === "") return;

  inputMensagem.value = ""; // Limpa a caixa de texto imediatamente

  // Envia para a tabela 'mensagens' no Supabase
  const { error } = await supabase
    .from('mensagens')
    .insert([{ texto: texto, autor: meuId }]);

  if (error) {
    console.error("Erro ao enviar a mensagem: ", error);
  }
}

// Configura o botão e a tecla "Enter"
btnEnviar.addEventListener("click", enviarMensagem);
inputMensagem.addEventListener("keypress", (e) => {
  if (e.key === "Enter") enviarMensagem();
});

// 7. OUVIR MENSAGENS NOVAS EM TEMPO REAL
supabase
  .channel('chat-publico')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'mensagens' },
    (payload) => {
      // Quando alguém envia uma mensagem nova, desenha no ecrã
      desenharMensagem(payload.new);
    }
  )
  .subscribe();
