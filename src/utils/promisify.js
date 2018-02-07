export default (func_or_obj, funcName) => {
  return (...args) => {
    return new Promise((resolve, reject) => {
      let newArgs = args.concat([(err, result) => {
        if (err) {
          reject(err)
        } else {
          resolve(result)
        }
      }])
      if (funcName) {
        func_or_obj[funcName](...newArgs)
      } else {
        func_or_obj(...newArgs)
      } 
    })
  }
}