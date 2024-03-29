export default (getConnector, onError = () => {}, settings = {}) => {
  return async function loadMore () {
    try {
      this.status = 'loading-more-in-progress'
      this.skip = this.items.length
      const result = await getConnector(this.params, { filter: this.filter, select: this.select, sort: this.sort, skip: this.skip, limit: this.limit })
      const retVal = JSON.parse(JSON.stringify(result))
      this.items = [...this.items, ...result.items.map(item => {
        return {
          _id: item._id,
          status: settings.metaFirst ? 'loading-in-progress' : 'ready',
          data: item,
          errors: []
        }
      })]
      this.count = result.count
      this.status = 'ready'

      if (settings.metaFirst) {
        result.items.forEach(item => {
          this.getOne(item._id)
        })
      }
      return retVal
    } catch (e) {
      this.status = 'encountered-an-error'
      this.errors.push(e)
      onError(e)
      throw e
    }
  }
}
