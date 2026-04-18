/**
 * Normalizes a raw Xtream API category object.
 *
 * Raw fields → normalized:
 *   category_id   → id
 *   category_name → name
 *   parent_id     → parentId
 */
const Category = (raw) => ({
  id:       raw.category_id,
  name:     raw.category_name,
  parentId: raw.parent_id || 0,
});

export default Category;
export {Category};
