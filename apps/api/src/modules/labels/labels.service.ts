import { Injectable, Logger } from '@nestjs/common';
import { AccentName } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { CreateLabelDto, UpdateLabelDto } from './labels.dto';
import { AppError } from '../../common/errors/app.error';
import { ErrorCode } from '../../common/errors/error-code.enum';

@Injectable()
export class LabelsService {
  private readonly logger = new Logger(LabelsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(workspaceId: string, dto: CreateLabelDto) {
    const existing = await this.prisma.label.findFirst({
      where: {
        workspaceId,
        name: { equals: dto.name.trim(), mode: 'insensitive' },
      },
    });

    if (existing) {
      throw new AppError(
        ErrorCode.CONFLICT,
        `Label '${dto.name}' already exists in this workspace (case-insensitive duplicate).`,
        409,
      );
    }

    const label = await this.prisma.label.create({
      data: {
        workspaceId,
        name: dto.name.trim(),
        color: (dto.color as AccentName) || AccentName.INDIGO,
      },
    });

    return label;
  }

  async findAll(workspaceId: string) {
    return this.prisma.label.findMany({
      where: { workspaceId },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const label = await this.prisma.label.findUnique({
      where: { id },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
    });

    if (!label) {
      throw new AppError(ErrorCode.LABEL_NOT_FOUND, 'Label not found.', 404);
    }

    return label;
  }

  async update(id: string, dto: UpdateLabelDto) {
    const existing = await this.prisma.label.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new AppError(ErrorCode.LABEL_NOT_FOUND, 'Label not found.', 404);
    }

    if (dto.name && dto.name.trim().toLowerCase() !== existing.name.toLowerCase()) {
      const duplicate = await this.prisma.label.findFirst({
        where: {
          workspaceId: existing.workspaceId,
          name: { equals: dto.name.trim(), mode: 'insensitive' },
          id: { not: id },
        },
      });

      if (duplicate) {
        throw new AppError(
          ErrorCode.CONFLICT,
          `Label '${dto.name}' already exists in this workspace.`,
          409,
        );
      }
    }

    const updated = await this.prisma.label.update({
      where: { id },
      data: {
        ...(dto.name ? { name: dto.name.trim() } : {}),
        ...(dto.color ? { color: dto.color as AccentName } : {}),
      },
    });

    return updated;
  }

  async delete(id: string) {
    const existing = await this.prisma.label.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new AppError(ErrorCode.LABEL_NOT_FOUND, 'Label not found.', 404);
    }

    // Cascade deletes TaskLabel rows in one statement
    await this.prisma.label.delete({
      where: { id },
    });

    return { success: true };
  }
}
