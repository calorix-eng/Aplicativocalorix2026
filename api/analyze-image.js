
// api/analyze-image.js
// Esta versão é exclusiva para diagnóstico de infraestrutura

export default async function handler(req, res) {
  // Configura o cabeçalho de saída para JSON imediatamente
  res.setHeader('Content-Type', 'application/json');

  try {
    // Retorno imediato para testar conectividade
    return res.status(200).json({
      status: "ok",
      message: "Servidor Vercel respondendo corretamente",
      timestamp: Date.now(),
      method: req.method
    });
  } catch (error) {
    // Mesmo no erro, o retorno DEVE ser JSON
    return res.status(500).json({
      status: "error",
      message: "Falha crítica no handler de diagnóstico",
      details: error.message
    });
  }
}
