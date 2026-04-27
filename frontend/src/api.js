// Detecta automaticamente o host de onde o browser está acessando.
// Se alguém acessa via IP da rede (ex: 192.168.1.10:5173),
// as chamadas de API também usarão esse IP em vez de localhost.
const API_BASE_URL = `http://${window.location.hostname}:3001`;

export default API_BASE_URL;
