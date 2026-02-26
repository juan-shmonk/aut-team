function requireAuth(req, res, next) {
  const userId = req.header('x-user-id');
  const roleHeader = req.header('x-user-role');
  const role = (roleHeader || '').toLowerCase();

  if (!userId || !role) {
    return res.status(401).json({
      ok: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Missing authentication headers',
        details: [
          { field: 'x-user-id', message: 'Required' },
          { field: 'x-user-role', message: 'Required' }
        ]
      }
    });
  }

  if (!['admin', 'technician'].includes(role)) {
    return res.status(403).json({
      ok: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Invalid role',
        details: [{ field: 'x-user-role', message: 'Allowed: admin, technician' }]
      }
    });
  }

  req.user = { id: userId, role };
  next();
}

module.exports = requireAuth;
