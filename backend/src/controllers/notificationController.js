const prisma = require('../config/database');

const getNotifications = async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: req.user.id, isRead: false },
    });

    res.json({ notifications, unreadCount });
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const notification = await prisma.notification.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notificacion no encontrada' });
    }

    const updated = await prisma.notification.update({
      where: { id: req.params.id },
      data: { isRead: true },
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true },
    });

    res.json({ message: 'Todas las notificaciones marcadas como leidas' });
  } catch (error) {
    next(error);
  }
};

const registerToken = async (req, res, next) => {
  try {
    const { token, platform } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token requerido' });
    }

    const existing = await prisma.deviceToken.findUnique({ where: { token } });

    if (existing) {
      const updated = await prisma.deviceToken.update({
        where: { token },
        data: { isActive: true, userId: req.user.id, platform: platform || existing.platform },
      });
      return res.json({ message: 'Token actualizado', deviceToken: updated });
    }

    const deviceToken = await prisma.deviceToken.create({
      data: {
        token,
        platform: platform || 'android',
        userId: req.user.id,
      },
    });

    res.status(201).json({ message: 'Token registrado', deviceToken });
  } catch (error) {
    next(error);
  }
};

module.exports = { getNotifications, markAsRead, markAllAsRead, registerToken };
