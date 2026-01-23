import { supabase } from './supabaseClient'

/**
 * Creates a CRUD entity wrapper for Supabase tables
 * @param {string} tableName - The name of the Supabase table
 * @returns {Object} Entity with CRUD methods
 */
export const createEntity = (tableName) => ({
  /**
   * List all records from the table
   * @param {string} orderBy - Column to order by (can be prefixed with '-' for descending)
   * @returns {Promise<Array>} Array of records
   */
  async list(orderBy = 'created_at') {
    // Handle descending order (e.g., '-created_date' -> order by 'created_date' DESC)
    const isDescending = orderBy.startsWith('-')
    const column = isDescending ? orderBy.substring(1) : orderBy

    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order(column, { ascending: !isDescending })

    if (error) throw error
    return data || []
  },

  /**
   * Get a single record by ID
   * @param {string} id - Record ID
   * @returns {Promise<Object>} Single record
   */
  async get(id) {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  /**
   * Create a new record
   * @param {Object} data - Record data
   * @returns {Promise<Object>} Created record
   */
  async create(data) {
    const { data: result, error } = await supabase
      .from(tableName)
      .insert(data)
      .select()
      .single()

    if (error) throw error
    return result
  },

  /**
   * Update an existing record
   * @param {string} id - Record ID
   * @param {Object} data - Updated data
   * @returns {Promise<Object>} Updated record
   */
  async update(id, data) {
    const { data: result, error } = await supabase
      .from(tableName)
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return result
  },

  /**
   * Delete a record
   * @param {string} id - Record ID
   * @returns {Promise<void>}
   */
  async delete(id) {
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  /**
   * Filter records by criteria
   * @param {Object} filters - Key-value pairs for filtering
   * @returns {Promise<Array>} Filtered records
   */
  async filter(filters) {
    let query = supabase.from(tableName).select('*')

    for (const [key, value] of Object.entries(filters)) {
      query = query.eq(key, value)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  }
})

// Export all entities used in the app
export const entities = {
  Customer: createEntity('customers'),
  Employee: createEntity('employees'),
  CustomerAssignment: createEntity('customer_assignments'),
  WeeklyReport: createEntity('weekly_reports'),
  Course: createEntity('courses'),
  Module: createEntity('modules'),
  Lesson: createEntity('lessons'),
  Quiz: createEntity('quizzes'),
  UserProgress: createEntity('user_progress'),
  QuizResult: createEntity('quiz_results'),
}

// For backwards compatibility with base44 API
export const base44 = {
  entities
}
