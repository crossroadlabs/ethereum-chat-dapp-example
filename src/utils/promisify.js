export default (func) => {
  return (...args) => {
    return new Promise((resolve, reject) => {
      let newArgs = args.concat([(...results) => {
        if (results[0]) {
          reject(results[0])
        } else {
          resolve(results.slice(1))
        }
      }])
      func(...newArgs)
    })
  }
}