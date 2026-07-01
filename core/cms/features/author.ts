export function enrichAuthor(post: any, user: any) {
  return {
    ...post,
    author_name: user.name,
    author_avatar: user.avatar
  }
}
