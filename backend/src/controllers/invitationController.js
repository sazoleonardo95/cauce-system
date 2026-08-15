const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const prisma = require('../config/database');
const { sendInvitationEmail } = require('../config/email');

const getInvitations = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;

    const invitations = await prisma.invitation.findMany({
      where: { companyId },
      include: {
        invitedBy: { select: { firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(invitations);
  } catch (error) {
    next(error);
  }
};

const createInvitation = async (req, res, next) => {
  try {
    const { email, role } = req.body;
    const companyId = req.user.companyId;
    const invitedById = req.user.id;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser && existingUser.companyId === companyId) {
      return res.status(409).json({ error: 'El usuario ya pertenece a esta empresa' });
    }

    const pendingInvitation = await prisma.invitation.findFirst({
      where: { email, companyId, status: 'PENDING' },
    });
    if (pendingInvitation) {
      return res.status(409).json({ error: 'Ya existe una invitacion pendiente para este email' });
    }

    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = await prisma.invitation.create({
      data: {
        email,
        role,
        token,
        expiresAt,
        companyId,
        invitedById,
      },
      include: {
        invitedBy: { select: { firstName: true, lastName: true } },
      },
    });

    const company = await prisma.company.findUnique({ where: { id: companyId } });
    const invitedByName = `${req.user.firstName} ${req.user.lastName}`;
    const inviteUrl = `${process.env.FRONTEND_URL}/accept-invite?token=${token}`;

    await sendInvitationEmail(email, company.name, invitedByName, inviteUrl);

    res.status(201).json({ message: 'Invitacion enviada', invitation });
  } catch (error) {
    next(error);
  }
};

const acceptInvitation = async (req, res, next) => {
  try {
    const { token, password, firstName, lastName, phone } = req.body;

    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: { company: true },
    });

    if (!invitation) {
      return res.status(404).json({ error: 'Invitacion no encontrada' });
    }

    if (invitation.status !== 'PENDING') {
      return res.status(400).json({ error: 'La invitacion ya fue procesada' });
    }

    if (new Date() > invitation.expiresAt) {
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: 'EXPIRED' },
      });
      return res.status(400).json({ error: 'La invitacion ha expirado' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email: invitation.email } });
    if (existingUser) {
      return res.status(409).json({ error: 'Ya existe una cuenta con este email' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email: invitation.email,
        password: hashedPassword,
        firstName: firstName || invitation.email.split('@')[0],
        lastName: lastName || '',
        phone,
        role: invitation.role,
        companyId: invitation.companyId,
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

    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: 'ACCEPTED', acceptedAt: new Date() },
    });

    const { generateTokens } = require('../middleware/auth');
    const tokens = generateTokens(user.id);

    res.status(201).json({
      message: 'Invitacion aceptada. Bienvenido!',
      user,
      company: invitation.company,
      ...tokens,
    });
  } catch (error) {
    next(error);
  }
};

const cancelInvitation = async (req, res, next) => {
  try {
    const invitation = await prisma.invitation.findFirst({
      where: { id: req.params.id, companyId: req.user.companyId },
    });

    if (!invitation) {
      return res.status(404).json({ error: 'Invitacion no encontrada' });
    }

    await prisma.invitation.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED' },
    });

    res.json({ message: 'Invitacion cancelada' });
  } catch (error) {
    next(error);
  }
};

const resendInvitation = async (req, res, next) => {
  try {
    const invitation = await prisma.invitation.findFirst({
      where: { id: req.params.id, companyId: req.user.companyId },
      include: { company: true },
    });

    if (!invitation) {
      return res.status(404).json({ error: 'Invitacion no encontrada' });
    }

    const newToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.invitation.update({
      where: { id: req.params.id },
      data: { token: newToken, expiresAt, status: 'PENDING' },
    });

    const invitedByName = `${req.user.firstName} ${req.user.lastName}`;
    const inviteUrl = `${process.env.FRONTEND_URL}/accept-invite?token=${newToken}`;
    await sendInvitationEmail(invitation.email, invitation.company.name, invitedByName, inviteUrl);

    res.json({ message: 'Invitacion reenviada' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getInvitations, createInvitation, acceptInvitation, cancelInvitation, resendInvitation };
