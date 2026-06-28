export function startWorker() {
  if (process.env.NODE_ENV !== 'production') {
    console.log('Worker disabled during development.')
  }

  return null
}

export default startWorker
