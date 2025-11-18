/* eslint-disable import/no-anonymous-default-export */
export default `
query($preview: Boolean) {
  sectionCollection(limit: 1000, preview: $preview, where: { OR: [{ entryTitle_contains: "all" },{ entryTitle_contains: "a-z" },{ entryTitle_contains: "a-m" },{ entryTitle_contains: "n-z" } ]}) {
    items {
      sys {
        id
      }
      title
      name
    }
  }
}
`;
