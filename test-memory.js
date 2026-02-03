const ChiMemory = require('./chi-memory');

async function testMemory() {
  console.log('🧠 Probando sistema de memoria Chi...\n');
  
  const memory = new ChiMemory('./memory/vector-db-test');
  
  // Inicializar
  console.log('Inicializando base de datos...');
  await memory.init();
  console.log('✅ Base de datos lista\n');
  
  // Almacenar memorias de prueba
  console.log('Almacenando memorias de prueba...');
  
  await memory.store(
    'Bash está construyendo una SaaS llamada Proyecto Puck. Es un CRM para agencias de marketing.',
    { type: 'project', project: 'puck', importance: 9, tags: ['saas', 'crm', 'bash'] }
  );
  
  await memory.store(
    'Chi Evolution es el proyecto de auto-mejora. Objetivo: convertir a Chi en el mejor asistente IA del mundo.',
    { type: 'project', project: 'chi-evolution', importance: 10, tags: ['mejora', 'ai', 'chi'] }
  );
  
  await memory.store(
    'Bash prefiere eficiencia sobre relleno. Quiere trabajar duro e inteligente.',
    { type: 'preference', importance: 8, tags: ['bash', 'estilo', 'trabajo'] }
  );
  
  console.log('✅ Memorias almacenadas\n');
  
  // Buscar
  console.log('Buscando "proyecto puck"...');
  const results = await memory.search('proyecto puck', { limit: 3 });
  console.log('Resultados:', results.length);
  results.forEach(r => console.log(`- ${r.content.substring(0, 100)}... (score: ${r.score})`));
  
  console.log('\n✅ Prueba completada');
}

testMemory().catch(console.error);
