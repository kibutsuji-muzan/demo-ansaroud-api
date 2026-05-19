// NOTE: In-memory user store for demo purposes only.
// Replace with a database (Postgres/Mongo/etc) in production.

const usersStore = (() => {
  const users = new Map();
  let nextId = 1;
  return {
    create(user) {
      user.id = nextId++;
      users.set(user.id, user);
      return user;
    },
    list() { return Array.from(users.values()); },
    get(id) { return users.get(Number(id)); },
    update(id, patch) {
      const u = users.get(Number(id));
      if (!u) return null;
      Object.assign(u, patch);
      users.set(u.id, u);
      return u;
    },
    del(id) { return users.delete(Number(id)); }
  };
})();

exports.listUsers = async (req, res) => {
  res.json(usersStore.list());
};

exports.getUserById = async (req, res) => {
  const u = usersStore.get(req.params.id);
  if (!u) return res.status(404).json({ message: 'not found' });
  res.json(u);
};

exports.updateUser = async (req, res) => {
  const patched = usersStore.update(req.params.id, req.body);
  if (!patched) return res.status(404).json({ message: 'not found' });
  res.json(patched);
};

exports.deleteUser = async (req, res) => {
  const ok = usersStore.del(req.params.id);
  if (!ok) return res.status(404).json({ message: 'not found' });
  res.status(204).end();
};
