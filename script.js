// 1. Importa as ferramentas do Firebase direto da nuvem do Google
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 2. A SUA CHAVE DE ACESSO (O Firebase vai te dar isso quando você criar a conta)
const firebaseConfig = {
  apiKey: "AIzaSyBfuKycMMMslcYPeW8oKBp38OIUOGn2wgg",
  authDomain: "chat-source-859ac.firebaseapp.com",
  projectId: "chat-source-859ac",
  storageBucket: "chat-source-859ac.firebasestorage.app",
  messagingSenderId: "272858044463",
  appId: "1:272858044463:web:e7d34989a7c8a1aaf04eda",
  measurementId: "G-03KW2ER6Z6"
};

// 3. Inicia o Firebase e o Banco de Dados (Firestore)
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ... (mantenha os passos 1, 2 e 3 do código anterior intactos com suas chaves) ...

// 4. Pega os elementos do HTML que vamos manipular
const inputMensagem = document.getElementById("mensagem-input");
const btnEnviar = document.getElementById("enviar-btn");
const telaMensagens = document.getElementById("mensagens-tela");

// NOVO: Gerar ou recuperar um "ID de usuário" para este computador
// Ele salva no navegador para não mudar se você atualizar a página
let meuId = localStorage.getItem("meuUsuarioID");
if (!meuId) {
  meuId = Math.random().toString(36).substring(2, 15); // Gera um ID aleatório
  localStorage.setItem("meuUsuarioID", meuId);
}

// 5. FUNÇÃO PARA ENVIAR MENSAGEM
async function enviarMensagem() {
  const texto = inputMensagem.value;
  if (texto.trim() === "") return; // Não envia se estiver vazio

  // LIMPA A CAIXA DE TEXTO IMEDIATAMENTE AQUI (resolve o seu problema)
  inputMensagem.value = ""; 

  try {
    // Salva no banco de dados
    await addDoc(collection(db, "sala_principal"), {
      texto: texto,
      autor: meuId, // <--- NOVO: Enviamos o nosso ID junto com a mensagem
      dataHora: serverTimestamp() 
    });
  } catch (erro) {
    console.error("Erro ao enviar a mensagem: ", erro);
    alert("Erro ao enviar. Verifique o console.");
  }
}

// 6. Configura o botão e a tecla "Enter" para enviarem a mensagem
btnEnviar.addEventListener("click", enviarMensagem);
inputMensagem.addEventListener("keypress", (e) => {
  if (e.key === "Enter") enviarMensagem();
});

// 7. FUNÇÃO PARA OUVIR MENSAGENS EM TEMPO REAL
const q = query(collection(db, "sala_principal"), orderBy("dataHora", "asc"));

onSnapshot(q, (snapshot) => {
  telaMensagens.innerHTML = ""; // Limpa a tela antes de desenhar as novas
  
  snapshot.forEach((doc) => {
    const dados = doc.data();
    
    const div = document.createElement("div");
    
    // NOVO: Verifica quem é o autor da mensagem para alinhar corretamente
    if (dados.autor === meuId) {
      // Se fui eu que enviei (mesmo ID)
      div.className = "mensagem minha-mensagem";
    } else {
      // Se foi outra pessoa
      div.className = "mensagem outra-mensagem";
    }
    
    div.textContent = dados.texto;
    telaMensagens.appendChild(div);
  });
  
  // Faz a barra de rolagem descer automaticamente
  telaMensagens.scrollTop = telaMensagens.scrollHeight;
});