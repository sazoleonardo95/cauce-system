const bcrypt = require('bcryptjs');
const prisma = require('../config/database');
const { generateTokens } = require('../middleware/auth');

const register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, phone, companyName, companySlug } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'El email ya esta registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    let company = null;
    if (companyName && companySlug) {
      const slug = companySlug
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const existingSlug = await prisma.company.findUnique({ where: { slug } });
      if (existingSlug) {
        return res.status(409).json({ error: 'El slug de empresa ya esta en uso' });
      }

      company = await prisma.company.create({
        data: { name: companyName, slug },
      });
    }

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        role: company ? 'ADMIN' : 'SELLER',
        companyId: company?.id,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        companyId: true,
      },
    });

    if (company) {
      await prisma.company.update({
        where: { id: company.id },
        data: { ownerId: user.id },
      });
    }

    const tokens = generateTokens(user.id);

    res.status(201).json({
      message: 'Registro exitoso',
      user,
      ...tokens,
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { company: { select: { id: true, name: true, slug: true, logo: true } } },
    });

    if (!user) {
      return res.status(401).json({ error: 'Credenciales invalidas' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Cuenta desactivada' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales invalidas' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = generateTokens(user.id);

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login exitoso',
      user: userWithoutPassword,
      ...tokens,
    });
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token requerido' });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const tokens = generateTokens(decoded.userId);

    res.json(tokens);
  } catch (error) {
    return res.status(401).json({ error: 'Refresh token invalido' });
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        avatar: true,
        createdAt: true,
        company: {
          select: { id: true, name: true, slug: true, logo: true },
        },
      },
    });
    res.json(user);
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, refreshToken, getProfile };
