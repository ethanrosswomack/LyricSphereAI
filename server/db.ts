// Mock database for development
// In production, this would connect to a real database

// Export a mock database instance
export const db = {
  select: () => ({
    from: () => ({
      where: () => Promise.resolve([]),
      orderBy: () => ({
        limit: () => Promise.resolve([])
      }),
      limit: () => Promise.resolve([])
    })
  }),
  insert: () => ({
    values: () => ({
      returning: () => Promise.resolve([{
        id: Math.floor(Math.random() * 1000),
        createdAt: new Date()
      }])
    })
  }),
  delete: () => ({
    where: () => Promise.resolve()
  }),
  update: () => ({
    set: () => ({
      where: () => ({
        returning: () => Promise.resolve([])
      })
    })
  })
};

export default db;