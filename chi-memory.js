/**
 * Chi Memory System - LanceDB Implementation
 * Memoria vectorial persistente para recuerdo perfecto
 */

const lancedb = require('lancedb');
const fs = require('fs').promises;
const path = require('path');

class ChiMemory {
  constructor(dbPath = './memory/vector-db') {
    this.dbPath = dbPath;
    this.db = null;
    this.table = null;
    this.initialized = false;
  }

  /**
   * Inicializa la base de datos vectorial
   */
  async init() {
    try {
      // Crear directorio si no existe
      await fs.mkdir(this.dbPath, { recursive: true });
      
      // Conectar a LanceDB (embedded, sin servidor)
      this.db = await lancedb.connect(this.dbPath);
      
      // Crear o abrir tabla de memorias
      const tableName = 'chi-memories';
      const tables = await this.db.tableNames();
      
      if (tables.includes(tableName)) {
        this.table = await this.db.openTable(tableName);
      } else {
        // Esquema inicial
        this.table = await this.db.createTable(tableName, [
          {
            id: 'init',
            content: 'Inicialización del sistema de memoria Chi',
            type: 'system',
            timestamp: Date.now(),
            source: 'init',
            vector: new Array(1024).fill(0) // Placeholder para embedding
          }
        ]);
      }
      
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Error inicializando memoria:', error);
      return false;
    }
  }

  /**
   * Almacena una nueva memoria
   */
  async store(content, metadata = {}) {
    if (!this.initialized) await this.init();
    
    const memory = {
      id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content,
      type: metadata.type || 'general',
      timestamp: Date.now(),
      source: metadata.source || 'conversation',
      project: metadata.project || null,
      tags: metadata.tags || [],
      importance: metadata.importance || 5, // 1-10
      vector: await this.generateEmbedding(content)
    };
    
    await this.table.add([memory]);
    return memory.id;
  }

  /**
   * Busca memorias relevantes por similitud semántica
   */
  async search(query, options = {}) {
    if (!this.initialized) await this.init();
    
    const queryVector = await this.generateEmbedding(query);
    const limit = options.limit || 5;
    
    // Búsqueda vectorial
    const results = await this.table
      .search(queryVector)
      .limit(limit)
      .execute();
    
    return results.map(r => ({
      id: r.id,
      content: r.content,
      type: r.type,
      timestamp: r.timestamp,
      source: r.source,
      project: r.project,
      score: r.score, // Similitud
      tags: r.tags
    }));
  }

  /**
   * Recupera memorias por tipo o proyecto
   */
  async retrieveByFilter(filters = {}) {
    if (!this.initialized) await this.init();
    
    let query = this.table;
    
    if (filters.type) {
      query = query.where(`type = '${filters.type}'`);
    }
    if (filters.project) {
      query = query.where(`project = '${filters.project}'`);
    }
    if (filters.tags && filters.tags.length > 0) {
      // LanceDB soporta búsqueda en arrays
      const tagFilter = filters.tags.map(t => `tags LIKE '%${t}%'`).join(' OR ');
      query = query.where(tagFilter);
    }
    
    const results = await query.execute();
    return results;
  }

  /**
   * Genera embedding para contenido
   * TODO: Integrar con BGE-M3 vía API local o servicio
   */
  async generateEmbedding(content) {
    // Placeholder - en producción usar BGE-M3
    // Por ahora generamos vector aleatorio para pruebas
    // En implementación real: llamar a API de embeddings
    const vector = new Array(1024).fill(0).map(() => (Math.random() - 0.5) * 2);
    
    // Normalizar
    const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
    return vector.map(v => v / magnitude);
  }

  /**
   * Consolida memorias relacionadas
   */
  async consolidate() {
    // TODO: Implementar sumarización de memorias antiguas
    // Agrupar memorias similares y crear resúmenes
  }

  /**
   * Exporta memorias a formato legible
   */
  async export(format = 'markdown') {
    if (!this.initialized) await this.init();
    
    const all = await this.table.execute();
    
    if (format === 'markdown') {
      return all.map(m => `## ${m.type} - ${new Date(m.timestamp).toISOString()}\n${m.content}\n`).join('\n---\n');
    }
    
    return all;
  }
}

module.exports = ChiMemory;
