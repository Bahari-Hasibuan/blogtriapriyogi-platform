export const shardDB = {
  shardA: [],
  shardB: [],
  shardC: [],

  route(id: string) {
    if (id < "3") return "shardA"
    if (id < "7") return "shardB"
    return "shardC"
  }
}
